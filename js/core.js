"use strict";
/* ================== 강의·차시 ================== */
const COURSES=[
 {id:'sci',name:'하늘을 여는 과학자',lessons:[
  {n:1,name:'1차시 비행과 로켓',c:'#e2636a',l:'#ffeef0'},
  {n:2,name:'2차시 베르누이와 양력',c:'#3f8fd0',l:'#e8f3fd'},
  {n:3,name:'3차시 종이비행기',c:'#2fa084',l:'#e6f6f1'},
  {n:4,name:'4차시 특별한 비행체',c:'#8a68c8',l:'#f2ecfb'}, /* unslop-ignore: 학습노트 4차시 색 */
  {n:5,name:'5차시 달걀 착륙선',c:'#cf8a1c',l:'#fff4dd'}]},
 {id:'math',name:'게임 속 확률',lessons:[
  {n:1,name:'1차시 확률이란',c:'#e2636a',l:'#ffeef0'},
  {n:2,name:'2차시 새로운 정보',c:'#3f8fd0',l:'#e8f3fd'},
  {n:3,name:'3차시 많이 해 보기',c:'#2fa084',l:'#e6f6f1'},
  {n:4,name:'4차시 기대값',c:'#8a68c8',l:'#f2ecfb'}, /* unslop-ignore: 학습노트 4차시 색 */
  {n:5,name:'5차시 게임 설계',c:'#cf8a1c',l:'#fff4dd'}]}];
const EX=[];

/* ================== 공통 도구 ================== */
const $=id=>document.getElementById(id);
const cv=$('cv'), ctx=cv.getContext('2d');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=n=>Math.floor(Math.random()*n);
const fmtN=n=>Math.round(n).toLocaleString('ko-KR');
const FONT='"Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif';
let W=800,H=450,FS=1;
function fitCanvas(){
  const r=cv.clientWidth||W; FS=r<520?1.7:r<700?1.25:1; const dpr=Math.min(window.devicePixelRatio||1,2.5);
  cv.width=Math.round(r*dpr); cv.height=Math.round(r*H/W*dpr);
  ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);
}
function arrow(x1,y1,x2,y2,col,w=4,label,lx,ly,align){
  const a=Math.atan2(y2-y1,x2-x1), len=Math.hypot(x2-x1,y2-y1); if(len<2) return;
  const hl=Math.min(w*3.2,len*.6);
  ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=w; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-Math.cos(a)*hl*.8,y2-Math.sin(a)*hl*.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-Math.cos(a-.45)*hl,y2-Math.sin(a-.45)*hl); ctx.lineTo(x2-Math.cos(a+.45)*hl,y2-Math.sin(a+.45)*hl); ctx.closePath(); ctx.fill();
  if(label) txt(label,lx??x2,ly??y2-10,col,14,true,align);
}
function txt(s,x,y,col='#1d2a3a',size=14,bold=false,align='left',bg){
  size*=FS;
  ctx.font=`${bold?'900':'500'} ${size}px ${FONT}`;
  ctx.textAlign=align; ctx.textBaseline='middle';
  if(bg){const m=ctx.measureText(s).width;const x0=align==='center'?x-m/2:align==='right'?x-m:x;ctx.fillStyle=bg;rr(x0-5,y-size*.7,m+10,size*1.4,6);ctx.fill();}
  ctx.fillStyle=col; ctx.fillText(s,x,y);
}
function tw(s,size=14,bold=false){ctx.font=`${bold?'900':'500'} ${size*FS}px ${FONT}`;return ctx.measureText(s).width;}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h);}
function box(x,y,w,h,fill='#fff',stroke,r=8,lw=1.5){rr(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function line(x1,y1,x2,y2,col='#9aa8b8',w=1.5,dash){ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
function circle(x,y,r,fill,stroke,lw=2){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function sky(top='#cfe6fb',bot='#f4f9ff'){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
function paper(col='#fdf8f1'){ctx.fillStyle=col;ctx.fillRect(0,0,W,H);}
function ground(y,col='#cfe3c4'){ctx.fillStyle=col;ctx.fillRect(0,y,W,H-y);}
function person(x,y,s=1,pose='cat_throw'){ // y: 발 위치
  if(spr(pose,x,y-62*s,124*s))return;circle(x,y-110*s,14*s,'#fff','#8a5a3c');}
/* 일러스트 조각 */
const IMG={};
['bag','balloon','box_open','bubble','candy_po','candy_ps','candy_ro','candy_rs','car','cat_blow','cat_happy','cat_hello','cat_point','cat_sad','cat_surprise','cat_think','cat_throw','chair','chute','cloud_big','cloud_long','cloud_small','coin_h','coin_t','coupon','coupons','door','door_open','egg','funnel','gift','goat','hotair','jar','lander','pingpong','plane_flat','plane_glider','ring','rocket','slip','sparkle','star','thought']
 .forEach(n=>{const i=new Image();i.src='img/'+n+'.png';IMG[n]=i;});
function spr(n,x,y,h,o={}){const im=IMG[n];if(!im||!im.complete||!im.naturalWidth)return false;const w=(o.w!=null?o.w:h*im.naturalWidth/im.naturalHeight);
  ctx.save();ctx.translate(x,y);if(o.rot)ctx.rotate(o.rot);ctx.scale((o.flip?-1:1)*(o.sx??1),o.sy??1);if(o.a!=null)ctx.globalAlpha*=o.a;ctx.drawImage(im,-w/2,-h/2,w,h);ctx.restore();return true;}
/* 던져진 물건이 떨어져 통통 튀는 움직임: age(초), i(순서) → {dy,fl,rot,done} */
function tumble(age,i=0,dur=0.5){const t=clamp((age-i*0.01)/dur,0,1),q=1-t;return{t,dy:-q*q*110-Math.abs(Math.sin(t*Math.PI*2.5))*q*26,fl:Math.cos(q*Math.PI*3),rot:q*5,done:t>=1};}
const easeTo=(arr,target,dt,k=9)=>{for(let i=0;i<target.length;i++){if(arr[i]==null)arr[i]=0;arr[i]+=(target[i]-arr[i])*Math.min(1,dt*k);}return arr;};
/* 분수: 캔버스용 / HTML용 */
function frac(n,d,x,y,size=16,col='#1d2a3a',align='center'){
  const a=String(n),b=String(d),w=Math.max(tw(a,size,true),tw(b,size,true))+6;
  const cx=align==='center'?x:align==='left'?x+w/2:x-w/2, g=size*FS*0.62;
  txt(a,cx,y-g,col,size,true,'center');txt(b,cx,y+g,col,size,true,'center');
  ctx.fillStyle=col;ctx.fillRect(cx-w/2,y-1,w,2);return w;
}
const fr=(n,d)=>`<span class="fr"><i>${n}</i><i>${d}</i></span>`;
const pct=v=>(v*100).toFixed(1)+'%';
/* 동전·주사위 그림 */
function drawCoin(x,y,r,head,fl=1){const sy=Math.max(.12,Math.abs(fl));
  if(r>=6&&spr(head?'coin_h':'coin_t',x,y,2*r,{sy}))return;
  ctx.save();ctx.translate(x,y);ctx.scale(1,sy);circle(0,0,r,head?'#f6c94a':'#cfd0dc',head?'#b98a2b':'#8f8a99',Math.max(1,r*.14));ctx.restore();}
const PIPS={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
const DIECOL={4:'#e6f6f1',6:'#fffaf2',8:'#e8f3fd',10:'#ffeef0',12:'#f2ecfb',16:'#fff4dd'};
function drawDie(x,y,s,n,faces=6,hl,rot=0){ctx.save();ctx.translate(x,y);if(rot)ctx.rotate(rot);
  box(-s/2,-s/2,s,s,DIECOL[faces]||'#fffaf2',hl||'#8a5a3c',s*.22,Math.max(1.2,s*.06));
  if(faces===6){PIPS[n].forEach(([a,b])=>circle(a*s*.26,b*s*.26,s*.09,n===1?'#e2636a':'#6b4a36'));}
  else if(s>=9){ctx.font=`900 ${s*.56}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#6b4a36';ctx.fillText(n,0,s*.04);}
  ctx.restore();}
/* 막대그래프: vals(비율 0~1), expect(기대 비율 배열 또는 값) */
function barChart(x,y,w,h,o){
  const n=o.vals.length, max=o.max||Math.max(0.0001,...o.vals,...(o.expect||[0]))*1.18, bw=w/n;
  line(x,y+h,x+w,y+h,'#8a97a8',1.5);
  for(let i=0;i<n;i++){const v=o.vals[i],bh=h*clamp(v/max,0,1),bx=x+i*bw+bw*.14,ww=bw*.72;
    ctx.fillStyle=(o.cols&&o.cols[i])||o.col||'#7fb2ea';ctx.fillRect(bx,y+h-bh,ww,bh);
    if(o.expect){const e=o.expect[i],ey=y+h-h*clamp(e/max,0,1);line(bx-bw*.1,ey,bx+ww+bw*.1,ey,'#d9534f',2.5);}
    if(o.labels&&(n<=13||i%2===0))txt(o.labels[i],bx+ww/2,y+h+11*FS,'#1d2a3a',n>10?10:12,true,'center');
    if(o.tops&&bw>=34*FS)txt(o.tops[i],bx+ww/2,y+h-bh-9*FS,'#33506f',n>8?9.5:11,true,'center');}
}
/* 꺾은선: 여러 줄, x는 0~1로 미리 환산 */
function plotLines(x,y,w,h,series,ymin,ymax){
  series.forEach(sr=>{if(sr.pts.length<1)return;ctx.strokeStyle=sr.col;ctx.lineWidth=sr.w||2;ctx.globalAlpha=sr.a||1;ctx.beginPath();
    sr.pts.forEach((p,i)=>{const px=x+p[0]*w,py=y+h-clamp((p[1]-ymin)/(ymax-ymin),0,1)*h;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.globalAlpha=1;});
}

/* ================== 화면 구성 ================== */
let curCourse=null, curLesson=1, cur=null, st=null, last=0, lastNow='', lastRec='';
function setCourse(id,keep){curCourse=COURSES.find(c=>c.id===id);[...$('courses').children].forEach(b=>b.classList.toggle('on',b.dataset.id===id));
  const box=$('lessons');box.innerHTML='';curCourse.lessons.forEach(L=>{const b=document.createElement('button');b.textContent=L.name;b.dataset.n=L.n;b.onclick=()=>setLesson(L.n);box.appendChild(b);});
  if(!keep)setLesson(1);}
function setLesson(n,keep){curLesson=n;const L=curCourse.lessons[n-1];document.documentElement.style.setProperty('--c',L.c);document.documentElement.style.setProperty('--l',L.l);
  [...$('lessons').children].forEach(b=>b.classList.toggle('on',+b.dataset.n===n));
  const list=EX.filter(e=>e.course===curCourse.id&&e.lesson===n);$('chips').innerHTML='';
  list.forEach(e=>{const b=document.createElement('button');b.textContent=e.name;b.onclick=()=>setEx(e);b.dataset.id=e.id;$('chips').appendChild(b);});
  if(!keep&&list[0])setEx(list[0]);}
function setEx(e){cur=e;[W,H]=e.size;[...$('chips').children].forEach(b=>b.classList.toggle('on',b.dataset.id===e.id));
  $('exTitle').textContent=e.name;$('exLesson').textContent=curCourse.name+' · '+curCourse.lessons[e.lesson-1].name;$('exAsk').innerHTML=e.ask;
  st={p:{}};e.controls.forEach(c=>st.p[c.key]=typeof c.val==='object'?{...c.val}:c.val);
  buildControls();e.reset(st);$('why').innerHTML=e.why;
  const t=e.tryIt||[];$('tryH').style.display=t.length?'':'none';$('try').innerHTML=t.length?'<ul>'+t.map(x=>`<li>${x}</li>`).join('')+'</ul>':'';
  fitCanvas();updatePanel(true);try{history.replaceState(null,'','#'+e.id);}catch(_){}}
function changed(key){if(cur.param)cur.param(st,key);}
function buildControls(){const boxEl=$('controls');boxEl.innerHTML='';
  cur.controls.forEach(c=>{const d=document.createElement('div');d.className='ctl';if(c.wide)d.style.flexBasis='100%';
   if(c.type==='range'){const V=c.vals;const idx=V?V.indexOf(st.p[c.key]):0;
     d.innerHTML=`<label>${c.label}<em></em></label><input type="range" min="${V?0:c.min}" max="${V?V.length-1:c.max}" step="${V?1:c.step}" value="${V?idx:st.p[c.key]}">`;
     const inp=d.querySelector('input'),em=d.querySelector('em');const show=()=>em.textContent=c.fmt?c.fmt(st.p[c.key]):st.p[c.key];show();
     inp.oninput=()=>{st.p[c.key]=V?V[+inp.value]:parseFloat(inp.value);show();changed(c.key);};}
   else if(c.type==='seg'){d.innerHTML=`<label>${c.label}</label><div class="seg"></div>`;const sg=d.querySelector('.seg');
     c.opts.forEach(([v,t])=>{const b=document.createElement('button');b.textContent=t;b.classList.toggle('on',st.p[c.key]===v);
       b.onclick=()=>{st.p[c.key]=v;[...sg.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');changed(c.key);};sg.appendChild(b);});}
   else if(c.type==='chk'){d.innerHTML=`<label>${c.label}</label><div class="chk"></div>`;const ck=d.querySelector('.chk');
     c.opts.forEach(([v,t])=>{const b=document.createElement('button');b.textContent=t;b.classList.toggle('on',!!st.p[c.key][v]);
       b.onclick=()=>{st.p[c.key][v]=!st.p[c.key][v];b.classList.toggle('on');changed(c.key);};ck.appendChild(b);});}
   boxEl.appendChild(d);});
  const bb=$('btns');bb.innerHTML='';
  cur.buttons.forEach(b=>{const el=document.createElement('button');el.className='btn'+(b.ghost?' ghost':'')+(b.hold?' hold':'');el.textContent=b.label;
   if(b.hold){const on=e=>{e.preventDefault();el.classList.add('active');cur.act(st,b.act,true);try{el.setPointerCapture(e.pointerId)}catch(_){}};const off=()=>{el.classList.remove('active');cur.act(st,b.act,false);};
     el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('contextmenu',e=>e.preventDefault());}
   else el.onclick=()=>cur.act(st,b.act);bb.appendChild(el);});}
function updatePanel(force){const md='img/cat_'+((typeof MOOD!=='undefined'&&MOOD[cur.id]&&MOOD[cur.id](st))||'point')+'.png',mi=$('mascot');if(mi&&mi.getAttribute('src')!==md)mi.setAttribute('src',md);const n=cur.now(st);if(force||n!==lastNow){$('now').innerHTML=n;lastNow=n;}const r=cur.rec?cur.rec(st):'';if(force||r!==lastRec){$('rec').innerHTML=r?'<h3>나의 기록</h3>'+r:'';lastRec=r;}}
function loop(ts){const dt=Math.min(0.033,(ts-last)/1000||0);last=ts;if(cur){cur.step(st,dt);ctx.save();cur.draw(st);ctx.restore();updatePanel();}requestAnimationFrame(loop);}
function goto(e){if(!curCourse||e.course!==curCourse.id)setCourse(e.course,true);setLesson(e.lesson,true);setEx(e);}
function boot(){
  COURSES.forEach(c=>{const b=document.createElement('button');b.innerHTML=`<img src="img/icon_${c.id}.png" alt=""><span>${c.name}</span>`;b.dataset.id=c.id;b.onclick=()=>setCourse(c.id);$('courses').appendChild(b);});
  window.addEventListener('resize',fitCanvas);
  cv.addEventListener('click',e=>{if(!cur||!cur.click)return;const r=cv.getBoundingClientRect();cur.click(st,(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H);});
  document.addEventListener('keydown',e=>{if(e.code==='Space'&&cur&&cur.buttons.some(b=>b.hold)){e.preventDefault();if(!e.repeat)cur.act(st,'blow',true);}});
  document.addEventListener('keyup',e=>{if(e.code==='Space'&&cur&&cur.buttons.some(b=>b.hold))cur.act(st,'blow',false);});
  const find=()=>EX.find(e=>'#'+e.id===location.hash);
  const s0=find();if(s0)goto(s0);else setCourse('sci');
  window.addEventListener('hashchange',()=>{const e=find();if(e&&e!==cur)goto(e);});
  requestAnimationFrame(loop);
}
