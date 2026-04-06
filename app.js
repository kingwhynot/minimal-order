// ===== 注册 Service Worker =====
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js');
}

// ===== 数据层 =====
var K='mo_v2';
var W=[
  '你没办法控制六个月后的结果，但你能控制今天这一个小时做什么。',
  '焦虑的杀伤力90%来自模糊。写出来，从黑雾变成清单。',
  '不要把「还在焦虑」当作「还没准备好」的信号。',
  '今天只需要做好一件事。做完了，今天就合格。',
  '连续完成的天数，就是你给自己的证据：我没有失控。',
  '具体的恐惧通常只有3-5条。感觉100条是因为循环播放。',
  '系统不需要完美。先用起来，坚持两周再说。',
  '每一个转变轨道的人，都是一边崩一边走的。',
  '有人在混乱中每天挪一步，有人等焦虑消失等了一年。',
  '翻翻之前的记录——你走出了比你以为的更远的路。'
];

function gd(){
  try{var r=localStorage.getItem(K);return r?JSON.parse(r):{days:{},pool:[]}}
  catch(e){return {days:{},pool:[]}}
}
function sd(d){localStorage.setItem(K,JSON.stringify(d))}

function tk(){
  var d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function ed(){
  var d=gd(),k=tk();
  if(!d.days[k]){
    d.days[k]={task:'',completed:false,dumps:[],night:{done:'',insight:'',tomorrow:''},inherited:false};
    sd(d);
  }
  return d;
}

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function fc(k){
  var d=new Date(k+'T00:00:00');
  var w=['日','一','二','三','四','五','六'];
  return (d.getMonth()+1)+'月'+d.getDate()+'日 周'+w[d.getDay()];
}

function toast(m){
  var t=document.getElementById('tt');
  t.textContent=m;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show')},2000);
}

function dk(offset){
  var d=new Date();
  d.setDate(d.getDate()+offset);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

// ===== 继承昨日计划 =====
function tryInherit(){
  var d=ed(),day=d.days[tk()];
  if(day.task||day.inherited)return;
  var yd=d.days[dk(-1)];
  if(yd&&yd.night&&yd.night.tomorrow){
    day.task=yd.night.tomorrow;
    day.inherited=true;
    sd(d);
  }
}

// ===== 渲染 =====
function renderAll(){
  tryInherit();
  rGreet();rStats();rToday();rHist();rRev();rPool();rPat();
}

function rGreet(){
  var h=new Date().getHours();
  var g=h<6?'夜深了，早点休息':h<9?'早上好':h<12?'上午好':h<14?'中午好':h<18?'下午好':h<22?'晚上好':'夜深了';
  document.getElementById('gH').textContent=g;
  document.getElementById('gD').textContent=fc(tk());
  document.getElementById('gW').textContent=W[Math.floor(Date.now()/864e5)%W.length];
}

function rStats(){
  var d=gd(),streak=0,cur=new Date();
  for(var i=0;i<365;i++){
    var k=cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0')+'-'+String(cur.getDate()).padStart(2,'0');
    if(d.days[k]&&d.days[k].completed){streak++;cur.setDate(cur.getDate()-1);}
    else break;
  }
  document.getElementById('sS').textContent=streak;
  var now=new Date(),wd=now.getDay()||7,wk=0;
  for(var j=1;j<=7;j++){
    var dd=new Date(now);dd.setDate(now.getDate()-wd+j);
    var k2=dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')+'-'+String(dd.getDate()).padStart(2,'0');
    if(d.days[k2]&&d.days[k2].completed)wk++;
  }
  document.getElementById('sW').textContent=wk+'/7';
}

function rToday(){
  var d=ed(),day=d.days[tk()];
  document.getElementById('iT').value=day.task||'';
  document.getElementById('inhBox').innerHTML=day.inherited?'<div class="inh">📌 已从昨晚计划自动继承</div>':'';
  var btn=document.getElementById('bC');
  if(day.completed){btn.classList.add('done');btn.textContent='✅ 已完成！你今天没白过';}
  else{btn.classList.remove('done');btn.textContent='点击标记完成';}

  var dl=document.getElementById('dL');
  if(!day.dumps||!day.dumps.length){dl.innerHTML='';}
  else{
    var h='';
    for(var i=0;i<day.dumps.length;i++){
      var item=day.dumps[i];
      h+='<div class="di"><div class="dit">'+esc(item.text)+'</div><div class="dtg">';
      h+='<span class="dt'+(item.canAct===true?' ac':'')+'" onclick="setDA('+i+',true)">能行动</span>';
      h+='<span class="dt'+(item.canAct===false?' an':'')+'" onclick="setDA('+i+',false)">不能行动</span>';
      if(item.canAct===true) h+='<span class="dt at" onclick="toTmr('+i+')">→ 明天唯一题</span>';
      h+='</div>';
      if(item.canAct===false) h+='<div class="dn">已记录。此刻放下，它不影响你今天的行动。</div>';
      h+='</div>';
    }
    dl.innerHTML=h;
  }

  document.getElementById('n1').value=(day.night&&day.night.done)||'';
  document.getElementById('n2').value=(day.night&&day.night.insight)||'';
  document.getElementById('n3').value=(day.night&&day.night.tomorrow)||'';
}

function rHist(){
  var d=gd(),keys=Object.keys(d.days).sort().reverse();
  var box=document.getElementById('hB');
  if(!keys.length){box.innerHTML='<div class="emp">还没有记录。从今天开始。</div>';return;}
  var h='';
  for(var i=0;i<keys.length;i++){
    var k=keys[i],day=d.days[k];
    var st=day.completed?'d':(k===tk()?'p':'m');
    var stx=st==='d'?'已完成':st==='p'?'进行中':'未完成';
    h+='<div class="hi"><div class="hh"><span class="hd">'+fc(k)+'</span><span class="hs '+st+'">'+stx+'</span></div>';
    h+='<div style="font-size:14px;color:var(--s)">🎯 '+esc(day.task||'未填写')+'</div>';
    if(day.night&&day.night.insight) h+='<div style="font-size:13px;color:var(--m);font-style:italic;margin-top:4px">💡 '+esc(day.night.insight)+'</div>';
    if(day.dumps&&day.dumps.length) h+='<div style="font-size:12px;color:var(--m);margin-top:4px">🔥 卸载 '+day.dumps.length+' 次</div>';
    h+='</div>';
  }
  box.innerHTML=h;
}

function rRev(){
  var d=gd(),now=new Date(),wd=now.getDay()||7;
  var comp=0,dumps=0,insights=[],tasks=[];
  for(var i=1;i<=7;i++){
    var dd=new Date(now);dd.setDate(now.getDate()-wd+i);
    var k=dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0')+'-'+String(dd.getDate()).padStart(2,'0');
    var day=d.days[k];
    if(!day)continue;
    if(day.completed)comp++;
    dumps+=(day.dumps?day.dumps.length:0);
    if(day.night&&day.night.insight)insights.push(day.night.insight);
    if(day.task&&day.completed)tasks.push(day.task);
  }
  var v=comp>=5?'🟢 状态良好':comp>=3?'🟡 在推进，别断链':'🔴 门槛可能太高，试试拆更小';
  var h='<div class="cd" style="background:var(--yb);border-color:#e8d8a8">';
  h+='<div class="ct"><div class="ic ic4">📋</div>本周回顾</div>';
  h+='<div class="rs"><div class="rv"><div class="rn">'+comp+'</div><div class="rl">完成天数</div></div>';
  h+='<div class="rv"><div class="rn">'+dumps+'</div><div class="rl">焦虑卸载</div></div>';
  h+='<div class="rv"><div class="rn">'+insights.length+'</div><div class="rl">收获记录</div></div></div>';
  h+='<div style="font-size:14px;font-weight:600;margin-bottom:10px">'+v+'</div>';
  if(tasks.length){
    h+='<div style="margin-bottom:12px"><div style="font-size:13px;font-weight:600;color:var(--s);margin-bottom:6px">✅ 本周做到了：</div>';
    for(var j=0;j<tasks.length;j++) h+='<div style="font-size:14px;padding:4px 0;border-bottom:1px solid var(--l)">• '+esc(tasks[j])+'</div>';
    h+='</div>';
  }
  if(insights.length){
    h+='<div><div style="font-size:13px;font-weight:600;color:var(--s);margin-bottom:6px">💡 本周觉察：</div>';
    for(var m=0;m<insights.length;m++) h+='<div style="font-size:14px;padding:6px 0;border-bottom:1px solid var(--l)">'+esc(insights[m])+'</div>';
    h+='</div>';
  }
  if(!insights.length&&!tasks.length) h+='<div class="emp">本周还没有记录</div>';
  h+='</div>';
  document.getElementById('rB').innerHTML=h;
}

function rPool(){
  var d=gd(),box=document.getElementById('pL');
  if(!d.pool||!d.pool.length){box.innerHTML='<div class="emp">还没有需求记录</div>';return;}
  var h='';
  for(var i=d.pool.length-1;i>=0;i--){
    h+='<div class="pi"><div class="pid">'+esc(d.pool[i].date)+'</div><div>'+esc(d.pool[i].text)+'</div></div>';
  }
  box.innerHTML=h;
}

function rPat(){
  var d=gd(),box=document.getElementById('ptB'),all=[];
  var keys=Object.keys(d.days);
  for(var i=0;i<keys.length;i++){
    var day=d.days[keys[i]];
    if(day.dumps){for(var j=0;j<day.dumps.length;j++) all.push(day.dumps[j].text);}
  }
  if(!all.length){box.innerHTML='<div class="emp">还没有焦虑记录</div>';return;}
  var freq={};
  for(var m=0;m<all.length;m++){var t=all[m].trim();if(t.length>=2)freq[t]=(freq[t]||0)+1;}
  var sorted=Object.entries(freq).sort(function(a,b){return b[1]-a[1]}).slice(0,10);
  if(!sorted.length){box.innerHTML='<div class="emp">数据还不够</div>';return;}
  var h='';
  for(var n=0;n<sorted.length;n++){
    h+='<div class="pa"><span>'+esc(sorted[n][0])+'</span><span class="pc">'+sorted[n][1]+'次</span></div>';
  }
  box.innerHTML=h;
}

// ===== 全局函数 =====
window.setDA=function(i,v){var d=ed();d.days[tk()].dumps[i].canAct=v;sd(d);renderAll();};
window.toTmr=function(i){
  var d=ed(),text=d.days[tk()].dumps[i].text;
  document.getElementById('n3').value=text;
  d.days[tk()].night.tomorrow=text;sd(d);
  toast('已设为明天唯一题');renderAll();
};

// ===== 事件绑定 =====
document.getElementById('iT').addEventListener('input',function(){
  var d=ed();d.days[tk()].task=this.value;sd(d);
});

document.getElementById('bC').addEventListener('click',function(){
  var d=ed(),day=d.days[tk()];
  day.completed=!day.completed;sd(d);renderAll();
  if(day.completed)toast('🎉 今日唯一题已完成！');
});

document.getElementById('bD').addEventListener('click',function(){
  var input=document.getElementById('iD'),text=input.value.trim();
  if(!text)return;
  var d=ed();
  if(!d.days[tk()].dumps)d.days[tk()].dumps=[];
  d.days[tk()].dumps.push({text:text,canAct:null});
  sd(d);input.value='';renderAll();
  toast('已卸载，它不在脑子里循环了');
});

document.getElementById('bN').addEventListener('click',function(){
  var d=ed();
  d.days[tk()].night={
    done:document.getElementById('n1').value,
    insight:document.getElementById('n2').value,
    tomorrow:document.getElementById('n3').value
  };
  sd(d);toast('睡前记录已保存');renderAll();
});

document.getElementById('bP').addEventListener('click',function(){
  var input=document.getElementById('iP'),text=input.value.trim();
  if(!text)return;
  var d=gd();d.pool.push({date:fc(tk()),text:text});
  sd(d);input.value='';renderAll();toast('已记录到需求池');
});

// 导航
var nbs=document.querySelectorAll('.nb');
for(var i=0;i<nbs.length;i++){
  nbs[i].addEventListener('click',function(){
    for(var j=0;j<nbs.length;j++)nbs[j].classList.remove('on');
    var pages=document.querySelectorAll('.page');
    for(var k=0;k<pages.length;k++)pages[k].classList.remove('on');
    this.classList.add('on');
    document.getElementById('p-'+this.dataset.p).classList.add('on');
    window.scrollTo(0,0);
  });
}

// 导出
document.getElementById('bEx').addEventListener('click',function(){
  var d=gd();
  var blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='minimal-order-'+tk()+'.json';
  a.click();toast('数据已导出');
});

// 导入
document.getElementById('bIm').addEventListener('click',function(){
  document.getElementById('fI').click();
});
document.getElementById('fI').addEventListener('change',function(e){
  var file=e.target.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(evt){
    try{
      var d=JSON.parse(evt.target.result);
      if(d.days){localStorage.setItem(K,JSON.stringify(d));toast('导入成功');renderAll();}
      else{toast('文件格式不正确');}
    }catch(err){toast('导入失败');}
  };
  reader.readAsText(file);
});

// 清空
document.getElementById('bCl').addEventListener('click',function(){
  if(confirm('确定清空全部数据？不可恢复。')){
    localStorage.removeItem(K);toast('已清空');renderAll();
  }
});

// ===== 启动 =====
renderAll();