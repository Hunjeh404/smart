"use strict";
/* 하늘을 여는 과학자 실험 */


/* ---------- 1-1 풍선 로켓 ---------- */
EX.push({
 id:'rocket',lesson:1,name:'풍선 로켓',size:[800,400],
 ask:'<b>예상해 보기</b> 풍선 입구로 공기가 빠져나가면 풍선은 어느 쪽으로 갈까요? 공기를 많이 넣으면 어떻게 될까요?',
 controls:[{type:'range',key:'air',label:'넣은 공기 양',min:30,max:100,step:5,val:70,fmt:v=>v+'%'},
  {type:'seg',key:'mouth',label:'풍선 입구 방향',opts:[['left','왼쪽'],['right','오른쪽']],val:'left'}],
 buttons:[{label:'손 놓기',act:'go'},{label:'다시 준비',act:'reset',ghost:true}],
 recs:[],M:130,
 reset(s){s.d=0;s.v=0;s.A=s.p.air/100;s.run=false;s.done=false;s.parts=[];s.F=0;s.vmax=0;},
 param(s){if(!s.run)this.reset(s);},
 act(s,a){if(a==='go'&&!s.run&&!s.done)s.run=true;if(a==='reset')this.reset(s);},
 rad(A){return 0.03+0.09*Math.cbrt(A);},            // 풍선 반지름(m)
 X(s){return s.p.mouth==='left'?110+s.d*this.M:690-s.d*this.M;},
 step(s,dt){
  const dir=s.p.mouth==='left'?1:-1;
  if(s.run){
   for(let i=0;i<8;i++){const h=dt/8;
    s.F=s.A>0?0.05:0;                                // 공기가 나오는 동안 미는 힘(N)은 거의 일정
    if(s.A>0)s.A=Math.max(0,s.A-0.55*h);
    const m=0.004+0.006*s.A,r=this.rad(s.A);          // 풍선+빨대 4g, 안에 든 공기 최대 6g
    const drag=0.5*1.2*0.5*Math.PI*r*r*s.v*s.v;       // 공기 저항: 풍선이 클수록, 빠를수록 커짐
    const fric=0.25*m*9.8;                            // 실과 빨대 사이 마찰
    const a=(s.F-drag-((s.v>0.001||s.F>fric)?fric:s.F))/m;
    s.v=Math.max(0,s.v+a*h);s.d+=s.v*h;}
   s.vmax=Math.max(s.vmax,s.v);
   if(s.d>4.75){s.d=4.75;s.v=0;}
   if(s.A>0)for(let i=0;i<3;i++)s.parts.push({x:this.X(s)-dir*(this.rpx(s)+10),y:200+rnd(-4,4),vx:-dir*rnd(150,260),vy:rnd(-30,30),life:0.7});
   if(s.A===0&&s.v<=0.001){s.run=false;s.done=true;this.recs.push({air:s.p.air,d:s.d,v:s.vmax});if(this.recs.length>6)this.recs.shift();}
  }
  s.parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});s.parts=s.parts.filter(p=>p.life>0);
 },
 rpx(s){return 30+42*s.A;},
 draw(s){
  sky('#f6f1ea','#fbf8f3');ctx.fillStyle='#e9dfd1';ctx.fillRect(0,330,W,70);
  const chair=(x,f)=>{ctx.fillStyle='#b98a5a';ctx.fillRect(x-25,250,50,10);ctx.fillRect(x-22,260,7,70);ctx.fillRect(x+15,260,7,70);ctx.fillRect(x+f*18-3,150,7,100);};
  if(!spr('chair',40,250,180,{flip:true})){chair(30,-1);chair(770,1);}else spr('chair',760,250,180);
  line(30,165,770,165,'#6b7a8c',2);
  const dir=s.p.mouth==='left'?1:-1,x0=dir>0?110:690;
  for(let m=0;m<=4.5;m+=0.5){const x=x0+dir*m*this.M;ctx.fillStyle='#9aa8b8';ctx.fillRect(x,322,2,m%1?6:10);if(m%1===0)txt(m+'m',x,345,'#7a8899',12,false,'center');}
  const X=this.X(s),rx=this.rpx(s),ry=18+22*s.A;
  s.parts.forEach(p=>{ctx.globalAlpha=clamp(p.life/0.7,0,1);circle(p.x,p.y,4,'#8fbbe8');ctx.globalAlpha=1;});
  if(!spr('straw',X,165,74,{rot:1.145})){ctx.fillStyle='#ffe08a';rr(X-40,159,80,12,4);ctx.fill();}
  ctx.fillStyle='#cfd8e3';ctx.fillRect(X-22,168,10,36-ry);ctx.fillRect(X+12,168,10,36-ry);
  const nx=X-dir*rx;
  if(s.run&&s.F>0)spr('wind0',nx-dir*36,200+Math.sin(NOW()*30)*2,26+Math.sin(NOW()*25)*3,{flip:dir<0});
  if(s.A<0.05&&(s.run||s.done)&&spr('balloon_flat',X,198,38,{flip:dir>0})){}
  else if(!spr('balloon',X-dir*5,200,2*ry+6,{w:2*rx+18,flip:dir<0})){ctx.fillStyle='#f26b6b';ctx.beginPath();ctx.ellipse(X,200,rx,ry,0,0,7);ctx.fill();}
  if(!s.run&&!s.done){circle(nx-dir*14,200,9,'#f5c9a6');txt('손으로 막고 있어요',nx-dir*14,232,'#5b6b80',12,true,'center');}
  if(s.run&&s.F>0){const L=60;
    arrow(nx-dir*16,258,nx-dir*(16+L),258,'#d9534f',5);txt('작용: 풍선 → 공기',clamp(nx-dir*(16+L/2),90,W-90),282,'#d9534f',13,true,'center');
    arrow(X+dir*(rx+6),258,X+dir*(rx+6+L),258,'#2f7fd1',5);txt('반작용: 공기 → 풍선',clamp(X+dir*(rx+6+L/2),100,W-100),304,'#2f7fd1',13,true,'center');}
  txt(`간 거리 ${s.d.toFixed(2)} m`,W-20,30,'#1d2a3a',16,true,'right','rgba(255,255,255,.8)');
  txt(`빠르기 ${s.v.toFixed(1)} m/s`,W-20,60,'#1d2a3a',14,true,'right','rgba(255,255,255,.8)');
  txt(`남은 공기 ${Math.round(s.A*100)}%`,20,30,'#1d2a3a',14,true,'left','rgba(255,255,255,.8)');
 },
 now(s){const out=s.p.mouth==='left'?'왼쪽':'오른쪽',go=s.p.mouth==='left'?'오른쪽':'왼쪽';
  if(!s.run&&!s.done)return '입구를 손으로 막고 있어요. <b>손 놓기</b>를 눌러 보세요.';
  if(s.run&&s.A>0)return `공기가 <b>${out}</b>으로 뿜어져 나가고, 풍선은 <b>${go}</b>으로 나아가요. 빨간 화살표(작용)와 파란 화살표(반작용)는 <b>길이가 같고 방향이 반대</b>예요.`;
  if(s.run)return '공기가 다 빠졌어요. 이제 미는 힘이 없지만 풍선은 <b>관성</b>으로 조금 더 가다가, 실의 마찰과 공기 저항 때문에 멈춰요.';
  return `공기 ${s.p.air}%를 넣은 풍선이 <b>${s.d.toFixed(2)}m</b> 갔어요(가장 빠를 때 ${s.vmax.toFixed(1)} m/s). 공기 양을 바꿔서 다시 해 보고 기록을 비교해 보세요.`;},
 why:'<ul><li>풍선이 공기를 뒤로 밀면(<b>작용</b>), 공기도 풍선을 앞으로 밀어요(<b>반작용</b>). 뉴턴의 운동 제3법칙이에요.</li><li>두 힘은 크기가 같고 방향이 반대이며, 서로 <b>다른 물체</b>(공기와 풍선)에 작용해요.</li><li>공기가 많으면 더 <b>오래</b> 뿜어져 나와서 더 오래 힘을 받고 더 멀리 가요.</li><li>공기가 다 빠진 뒤에도 조금 더 가는 것은 <b>관성</b> 때문이고, 멈추는 것은 마찰과 공기 저항 때문이에요.</li><li>실과 빨대는 미는 힘이 아니라 <b>길 안내</b>만 해요. 로켓도 바깥 공기가 아니라 자기가 뿜은 기체를 밀어서 나아가요.</li></ul>',
 tryIt:['공기 양만 30%, 50%, 70%, 100%로 바꾸며 거리를 기록해 보세요. 다른 조건은 그대로 두어야 공정한 비교예요.','입구 방향을 바꾸면 풍선이 가는 방향이 어떻게 되나요?','풍선이 가장 빠른 순간은 언제인지 빠르기 숫자를 지켜보세요.'],
 rec(){if(!this.recs.length)return '';return '<table><tr><th>회</th><th>공기 양</th><th>간 거리</th><th>최고 빠르기</th></tr>'+this.recs.map((r,i)=>`<tr><td>${i+1}</td><td>${r.air}%</td><td>${r.d.toFixed(2)} m</td><td>${r.v.toFixed(1)} m/s</td></tr>`).join('')+'</table>';}
});

/* ---------- 1-2 열기구 ---------- */
EX.push({
 id:'balloon',lesson:1,name:'열기구',size:[800,450],
 ask:'<b>예상해 보기</b> 버너 불꽃을 키우면 열기구 안 공기는 어떻게 바뀌고, 열기구는 어떻게 움직일까요?',
 controls:[{type:'range',key:'burn',label:'버너 불꽃',min:0,max:100,step:1,val:0,fmt:v=>v+'%'},
  {type:'seg',key:'ppl',label:'타는 사람',opts:[[1,'1명'],[2,'2명'],[3,'3명']],val:2},
  {type:'seg',key:'out',label:'바깥 기온',opts:[[0,'추운 날 0℃'],[20,'보통 20℃'],[35,'더운 날 35℃']],val:20}],
 buttons:[{label:'처음으로',act:'reset',ghost:true}],
 V:1500, // 풍선 부피(㎥)
 reset(s){s.T=s.p.out;s.alt=0;s.vy=0;s.t=0;s.esc=[];s.mol=[];for(let i=0;i<40;i++)s.mol.push({a:rnd(0,7),r:Math.sqrt(Math.random()),ph:rnd(0,7)});s.out=[];for(let i=0;i<80;i++)s.out.push({x:rnd(0,W),y:rnd(0,400),ph:rnd(0,7)});},
 param(s,k){if(k==='out')s.T=Math.max(s.T,s.p.out);},
 act(s,a){if(a==='reset')this.reset(s);},
 calc(s){const rhoOut=1.2*293/(273+s.p.out),rhoIn=1.2*293/(273+s.T);
  const B=rhoOut*this.V,air=rhoIn*this.V,load=250+75*s.p.ppl;return{B,air,load,Wt:air+load,ratio:rhoIn/rhoOut};},
 step(s,dt){s.t+=dt;const Tt=s.p.out+1.35*s.p.burn;const before=s.T;s.T+=(Tt-s.T)*0.3*dt;
  const{B,Wt}=this.calc(s);
  s.vy+=((B-Wt)/Wt*9.8*70-1.4*s.vy)*dt;s.alt+=s.vy*dt;
  if(s.alt<=0){s.alt=0;if(s.vy<0)s.vy=0;}if(s.alt>170){s.alt=170;if(s.vy>0)s.vy=0;}
  if(s.T>before+0.002&&Math.random()<0.5)s.esc.push({x:rnd(-16,16),y:0,vx:rnd(-30,30),life:1});
  s.esc.forEach(e=>{e.y+=60*dt;e.x+=e.vx*dt;e.life-=dt;});s.esc=s.esc.filter(e=>e.life>0);},
 draw(s){
  sky();ground(410);
  const{B,air,load,Wt,ratio}=this.calc(s);
  const nOut=Math.round(80*293/(273+s.p.out)/1.08),spO=Math.sqrt((273+s.p.out)/293);
  for(let i=0;i<Math.min(80,nOut);i++){const m=s.out[i];circle(m.x+Math.sin(s.t*3*spO+m.ph)*3,m.y+Math.cos(s.t*2.6*spO+m.ph)*3,3.2,'#7aa6d6');}
  const cx=300,cy=410-150-s.alt;
  const pic=spr('hotair',cx,cy+18,264);
  if(!pic){ctx.fillStyle='#ffe2c7';ctx.strokeStyle='#e8772e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy-110);ctx.bezierCurveTo(cx+95,cy-110,cx+105,cy,cx+45,cy+55);ctx.lineTo(cx+22,cy+80);ctx.lineTo(cx-22,cy+80);ctx.lineTo(cx-45,cy+55);ctx.bezierCurveTo(cx-105,cy,cx-95,cy-110,cx,cy-110);ctx.fill();ctx.stroke();}
  const n=Math.round(40*ratio*Math.min(80,nOut)/80*1.05),spd=Math.sqrt((273+s.T)/293);
  for(let i=0;i<Math.min(40,n);i++){const m=s.mol[i];circle(cx+Math.cos(m.a)*m.r*66+Math.sin(s.t*5*spd+m.ph)*6*spd,cy-40+Math.sin(m.a)*m.r*58+Math.cos(s.t*4.3*spd+m.ph)*6*spd,3.4,'#f08a3c');}
  s.esc.forEach(e=>{ctx.globalAlpha=clamp(e.life,0,1);circle(cx+e.x,cy+84+e.y,3.2,'#f08a3c');ctx.globalAlpha=1;});
  if(!pic){ctx.fillStyle='#8d5a2b';rr(cx-22,cy+110,44,30,4);ctx.fill();}
  for(let i=0;i<s.p.ppl;i++)circle(cx-13+i*13,cy+100,7,'#fff','#8a5a3c',1.5);
  const fl=s.p.burn/100;if(fl>0&&pic){const fh=(16+22*fl)*(1+Math.sin(s.t*21)*.07);spr('fire'+(fl<.34?0:fl<.67?1:2),cx,cy+90-fh*.4,fh);}else if(fl>0){ctx.fillStyle='#f2b32c';ctx.beginPath();ctx.moveTo(cx-7,cy+100);ctx.quadraticCurveTo(cx,cy+100-60*fl-8*Math.sin(s.t*20),cx+7,cy+100);ctx.fill();}
  arrow(cx+125,cy-15,cx+125,cy-15-B/26,'#2f7fd1',6);txt('부력',cx+137,cy-15-B/52,'#2f7fd1',15,true);
  arrow(cx+125,cy+15,cx+125,cy+15+Wt/26,'#d9534f',6);txt('무게',cx+137,cy+15+Wt/52,'#d9534f',15,true);
  txt('안쪽 공기',cx,cy-40,'#b85a14',12,true,'center','rgba(255,255,255,.7)');
  // 힘 비교 막대 (kg으로 환산)
  const px=560,py=24,pw=224,ph=300,by=py+ph-44,sc=1/11.5;box(px,py,pw,ph,'rgba(255,255,255,.93)',null,8);
  txt('위로 미는 힘과 무게',px+12,py+18,'#1d2a3a',13,true);
  ctx.fillStyle='#2f7fd1';ctx.fillRect(px+34,by-B*sc,56,B*sc);
  ctx.fillStyle='#8d5a2b';ctx.fillRect(px+134,by-load*sc,56,load*sc);
  ctx.fillStyle='#f08a3c';ctx.fillRect(px+134,by-Wt*sc,56,air*sc);
  line(px+12,by,px+pw-12,by,'#8a97a8',1.5);
  if(FS<1.3){txt('안쪽 공기',px+162,by-load*sc-air*sc/2,'#fff',11,true,'center');txt('기구+사람',px+162,by-load*sc/2,'#fff',11,true,'center');}
  txt('부력',px+62,by+13*FS,'#2f7fd1',13,true,'center');txt('전체 무게',px+162,by+13*FS,'#d9534f',13,true,'center');
  txt(fmtN(B),px+62,by-B*sc-10*FS,'#2f7fd1',13,true,'center');txt(fmtN(Wt),px+162,by-Wt*sc-10*FS,'#d9534f',13,true,'center');
  txt(`안쪽 공기 ${Math.round(s.T)}℃`,20,26,'#b85a14',15,true,'left','rgba(255,255,255,.85)');
  txt(`높이 ${Math.round(s.alt/3)} m`,20,26+30*FS,'#1d2a3a',14,true,'left','rgba(255,255,255,.85)');
 },
 now(s){const{B,Wt}=this.calc(s),d=B-Wt,T=Math.round(s.T);
  if(d>4)return `안쪽 공기가 ${T}℃로 데워지면서 일부가 아래 구멍으로 빠져나갔어요. 전체 무게가 부력보다 <b>가벼워져서 올라가요</b>.`;
  if(d<-4)return s.alt>0.5?`안쪽 공기가 식으면서 바깥 공기가 다시 들어와 무거워졌어요. <b>무게가 부력보다 커서 내려와요</b>.`:`아직 <b>전체 무게가 부력보다 커서</b> 땅에 있어요. 불꽃을 키워 안쪽 공기를 데워 보세요.`+(s.p.out>=35?' 더운 날은 바깥 공기도 듬성듬성해서 부력이 작아요.':'');
  return '<b>부력과 무게가 거의 같아요.</b> 이럴 때 열기구는 높이를 유지해요.';},
 why:'<ol><li><b>부력</b>은 바깥 공기가 열기구를 위로 미는 힘이에요. 열기구가 밀어낸 바깥 공기의 무게만큼 생겨요.</li><li>안쪽 공기를 데우면 분자들이 빠르게 움직이며 멀어지고, 일부가 아래 구멍으로 <b>빠져나가요</b>. 안쪽 공기의 <b>밀도가 작아져요</b>.</li><li>그러면 기구+사람+안쪽 공기를 합친 <b>전체 무게</b>가 줄어요. 부력이 전체 무게보다 크면 위로 올라가요.</li></ol>부력 &gt; 무게 → 상승, 부력 ≈ 무게 → 유지, 부력 &lt; 무게 → 하강<br>흔히 “데우면 부력이 커진다”고 말하는 것은, 안쪽 공기 무게를 뺀 <b>위로 뜨는 힘</b>이 커진다는 뜻이에요.',
 tryIt:['불꽃을 조금씩 키우며, 열기구가 막 떠오르는 순간의 안쪽 온도를 찾아보세요.','사람을 3명 태우면 몇 ℃까지 데워야 뜰까요?','추운 날과 더운 날 중 언제 더 쉽게 뜰까요? 바깥 공기 알갱이의 빽빽함을 비교해 보세요.','떠 있을 때 불꽃을 0%로 줄이면 어떻게 되나요?']
});

/* ---------- 2-1 종이 띄우기 ---------- */
EX.push({
 id:'paper',lesson:2,name:'종이 띄우기',size:[800,420],
 ask:'<b>예상해 보기</b> 아래로 늘어진 종이의 <b>윗면을 따라</b> 바람을 불면 종이는 어떻게 될까요?',
 controls:[{type:'range',key:'str',label:'바람 세기',min:20,max:100,step:5,val:70,fmt:v=>v+'%'}],
 buttons:[{label:'꾹 눌러서 후~ 불기',act:'blow',hold:true}],
 reset(s){s.th=-62;s.blow=false;s.parts=[];s.t=0;},
 act(s,a,on){if(a==='blow')s.blow=on;},
 pts(s){const P=[];let x=170,y=190,a=s.th*Math.PI/180;const n=24,seg=420/n,lift=(s.th+62)/57;
  for(let i=0;i<=n;i++){P.push([x,y]);const droop=(1-lift*0.85)*0.9*(i/n)+0.05;a+=droop*0.06;x+=Math.cos(-a)*seg;y+=Math.sin(-a)*seg*-1;}
  return P;},
 step(s,dt){s.t+=dt;const tgt=s.blow?-62+57*(s.p.str/100):-62;s.th+=(tgt-s.th)*3*dt;
  if(s.blow){for(let i=0;i<2;i++)s.parts.push({u:0,off:rnd(6,26),sp:rnd(.8,1.2)});}
  s.parts.forEach(p=>p.u+=dt*(0.9*s.p.str/100+0.3)*p.sp);s.parts=s.parts.filter(p=>p.u<1.15);},
 draw(s){
  sky('#eaf3fc','#f7fbff');
  // 얼굴
  if(!spr('cat_blow',104,196,170,{flip:true})){circle(120,180,48,'#f5c9a6');}
  const P=this.pts(s);
  // 공기 입자: 종이 위쪽 따라
  s.parts.forEach(p=>{const t=clamp(p.u,0,1)*(P.length-1);const i=Math.min(P.length-2,Math.floor(t)),f=t-i;const x=lerp(P[i][0],P[i+1][0],f),y=lerp(P[i][1],P[i+1][1],f);const nx=P[i+1][1]-P[i][1],ny=-(P[i+1][0]-P[i][0]);const L=Math.hypot(nx,ny)||1;
   ctx.globalAlpha=p.u>1?Math.max(0,(1.15-p.u)/0.15):1;circle(x+nx/L*p.off*-1,y+ny/L*p.off*-1,3,'#2f7fd1');ctx.globalAlpha=1;});
  // 종이
  ctx.strokeStyle='#1f3a5f';ctx.lineWidth=7;ctx.lineJoin='round';ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
  ctx.fillStyle='#f5c9a6';ctx.beginPath();ctx.ellipse(178,196,12,8,0,0,7);ctx.fill();
  const lift=(s.th+62)/57;
  if(s.blow){const m=P[12];txt('빠른 공기 → 압력 낮음',m[0],m[1]-55,'#2f7fd1',15,true,'center','rgba(255,255,255,.85)');
   for(let k=7;k<=19;k+=6){const q=P[k];arrow(q[0],q[1]+70,q[0],q[1]+16,'#d9534f',5);}const q=P[13];txt('아래쪽 압력이 더 높아 위로 밀어요',q[0],q[1]+92,'#d9534f',14,true,'center','rgba(255,255,255,.85)');}
  txt(`종이 높이 변화: ${lift>0.05?'올라옴':'그대로'}`,W-20,28,'#1d2a3a',15,true,'right','rgba(255,255,255,.85)');
 },
 now(s){const lift=(s.th+62)/57;if(!s.blow&&lift<0.05)return '종이가 아래로 늘어져 있어요. <b>버튼을 꾹 누르고</b> 있으면 바람이 나와요.';if(s.blow)return `종이 위로 공기가 빠르게 흘러요. 위쪽 압력이 낮아지고 <b>아래쪽 높은 압력이 종이를 위로 밀어</b> 종이가 올라와요!`;return '바람을 멈추니 압력 차이가 사라져 종이가 다시 내려와요.';},
 tryIt:["바람 세기를 20%와 100%로 바꿔 종이가 올라오는 높이를 비교해 보세요.", "버튼에서 손을 떼면 종이가 어떻게 되나요? 왜 그럴까요?"],
 why:'<ol><li>종이 위쪽 공기가 빠르게 흘러요.</li><li>그 부분의 압력이 상대적으로 낮아져요.</li><li>아래쪽의 더 높은 압력이 종이를 위로 밀어요.</li></ol>공기 흐름이 종이 표면을 따라 휘는 효과도 함께 작용해요. “바람이 들어 올렸다”가 아니라 <b>압력 차이</b>로 설명해요.'
});

/* ---------- 2-2 두 풍선 ---------- */
EX.push({
 id:'two',lesson:2,name:'두 풍선 사이 불기',size:[800,450],
 ask:'<b>예상해 보기</b> 나란히 매달린 두 풍선 사이로 바람을 불면 풍선은 벌어질까요, 가까워질까요?',
 controls:[{type:'range',key:'gap',label:'풍선 사이 간격',min:3,max:15,step:1,val:4,fmt:v=>v+'cm'},
  {type:'range',key:'str',label:'바람 세기',min:20,max:100,step:5,val:80,fmt:v=>v+'%'}],
 buttons:[{label:'꾹 눌러서 후~ 불기',act:'blow',hold:true}],
 reset(s){s.phi=0;s.w=0;s.blow=false;s.parts=[];},
 act(s,a,on){if(a==='blow')s.blow=on;if(a==='blow'&&!on){}},
 geo(s){const R=62,pxcm=7,half=R+s.p.gap*pxcm/2;return{R,half,piv:40,L:270,pxcm};},
 step(s,dt){const g=this.geo(s);const F=s.blow?(s.p.str/100)*0.55/Math.pow(s.p.gap/3,1.6):0;
  const acc=-9*Math.sin(s.phi)-2.2*s.w+F;s.w+=acc*dt;s.phi+=s.w*dt;
  const maxphi=Math.asin(clamp((g.half-g.R)/g.L,0,1));if(s.phi>maxphi){s.phi=maxphi;s.w=-s.w*0.2;}
  if(s.blow)for(let i=0;i<3;i++)s.parts.push({x:400+rnd(-5,5),y:440,vy:-rnd(250,380)*s.p.str/100,life:1});
  s.parts.forEach(p=>{p.y+=p.vy*dt;p.life-=dt;});s.parts=s.parts.filter(p=>p.y>20&&p.life>0);},
 cur(s){const g=this.geo(s);const dx=Math.sin(s.phi)*g.L;return{lx:400-g.half+dx,rx:400+g.half-dx,y:g.piv+Math.cos(s.phi)*g.L,g};},
 draw(s){
  sky('#eef4fb','#f8fbff');ctx.fillStyle='#6b7a8c';ctx.fillRect(150,34,500,8);
  const c=this.cur(s),g=c.g;
  s.parts.forEach(p=>{circle(p.x,p.y,3,'#2f7fd1');});
  ctx.strokeStyle='#6b7a8c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(400-g.half,g.piv);ctx.lineTo(c.lx,c.y-g.R*1.02);ctx.moveTo(400+g.half,g.piv);ctx.lineTo(c.rx,c.y-g.R*1.02);ctx.stroke();
  const bw=g.R*2.06,bh=bw*240/140;
  if(!spr('balloon_r',c.lx,c.y+bh*.2,bh,{w:bw})){ctx.fillStyle='#f26b6b';ctx.beginPath();ctx.ellipse(c.lx,c.y,g.R,g.R*1.15,0,0,7);ctx.fill();}
  if(!spr('balloon_b',c.rx,c.y+bh*.2,bh,{w:bw})){ctx.fillStyle='#6ba6f2';ctx.beginPath();ctx.ellipse(c.rx,c.y,g.R,g.R*1.15,0,0,7);ctx.fill();}
  if(s.blow){const T=NOW();for(let k=0;k<2;k++){const u=(T*1.6+k*.5)%1;spr('wind1',400,410-u*300,40,{rot:-Math.PI/2,a:Math.sin(u*Math.PI)*s.p.str/100});}}
  if(!spr('straw',400,428,56,{rot:-.426})){ctx.fillStyle='#ffe08a';ctx.fillRect(396,415,8,35);}
  const gapcm=Math.max(0,(c.rx-c.lx-2*g.R)/g.pxcm);
  txt(`지금 간격 ${gapcm.toFixed(1)} cm`,W-20,70,'#1d2a3a',15,true,'right','rgba(255,255,255,.85)');
  if(s.blow){const F=(s.p.str/100)/Math.pow(s.p.gap/3,1.6);const L=clamp(25+60*F,25,85);
   arrow(c.lx-g.R-L-10,c.y,c.lx-g.R-6,c.y,'#d9534f',6);arrow(c.rx+g.R+L+10,c.y,c.rx+g.R+6,c.y,'#d9534f',6);
   txt('바깥: 압력 높음',c.lx-g.R-L/2-10,c.y-28,'#d9534f',14,true,'center','rgba(255,255,255,.8)');txt('바깥: 압력 높음',c.rx+g.R+L/2+10,c.y-28,'#d9534f',14,true,'center','rgba(255,255,255,.8)');
   txt('가운데: 빠름 · 압력 낮음',400,395,'#2f7fd1',14,true,'center','rgba(255,255,255,.85)');}
 },
 now(s){const c=this.cur(s);const moved=s.phi>0.01;if(!s.blow&&!moved)return '두 풍선이 나란히 매달려 있어요. 버튼을 꾹 눌러 사이로 바람을 불어 보세요.';
  if(s.blow)return (s.p.gap>9?'간격이 넓어서 빠른 공기가 풍선에 잘 닿지 않아요. 움직임이 작아요. ':'')+'풍선이 <b>안쪽으로 가까워져요!</b> 가운데 압력이 낮아지고 바깥 공기가 풍선을 안쪽으로 밀어요.';
  return '바람을 멈추니 풍선이 원래 자리로 돌아가요.';},
 tryIt:["간격을 3cm, 8cm, 15cm로 바꾸며 풍선이 움직이는 정도를 비교해 보세요.", "바람이 약할 때와 셀 때 풍선 사이 간격 숫자가 어떻게 달라지나요?"],
 why:'<ul><li>풍선 사이로 공기가 빠르게 지나가면 가운데 압력이 낮아져요.</li><li>바깥쪽 공기 압력은 더 높아요.</li><li>바깥 공기가 두 풍선을 안쪽으로 밀어요.</li></ul>간격은 <b>3~5cm</b>가 알맞아요. 너무 멀면 효과가 약해요. 빨대는 정가운데를 향하게 해요.'
});

/* ---------- 2-3 깔때기와 탁구공 ---------- */
EX.push({
 id:'funnel',lesson:2,name:'깔때기와 탁구공',size:[800,450],
 ask:'<b>예상해 보기</b> 위를 향한 깔때기에 탁구공을 올리고 아래에서 세게 불면, 탁구공이 날아갈까요?',
 controls:[{type:'range',key:'str',label:'바람 세기',min:20,max:100,step:5,val:80,fmt:v=>v+'%'}],
 buttons:[{label:'꾹 눌러서 후~ 불기',act:'blow',hold:true}],
 reset(s){s.blow=false;s.parts=[];s.lift=0;s.t=0;s.held=0;},
 act(s,a,on){if(a==='blow')s.blow=on;},
 step(s,dt){s.t+=dt;const tgt=s.blow?3+4*s.p.str/100:0;s.lift+=(tgt-s.lift)*8*dt;if(s.blow)s.held+=dt;
  if(s.blow)for(let i=0;i<4;i++)s.parts.push({u:0,side:Math.random()<.5?-1:1,sp:rnd(.8,1.2)*(0.5+s.p.str/100),j:rnd(-4,4)});
  s.parts.forEach(p=>p.u+=dt*p.sp*0.9);s.parts=s.parts.filter(p=>p.u<1);},
 path(u,side){ // 관 → 공 옆 → 깔때기 벽을 따라 바깥
  const cx=400;if(u<0.3){return[cx+side*6,440-u/0.3*170];}
  if(u<0.55){const t=(u-0.3)/0.25;const a=lerp(Math.PI/2,Math.PI*0.05,t);return[cx+side*(Math.cos(a)*62+4),205+Math.sin(a)*62*0.9+50-50*t];}
  const t=(u-0.55)/0.45;return[cx+side*(66+t*190),205-t*150];},
 draw(s){
  sky('#eef4fb','#f8fbff');
  const cx=400;
  ctx.strokeStyle='#5b6b80';ctx.lineWidth=10;ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(cx-230,40);ctx.lineTo(cx-18,268);ctx.lineTo(cx-18,450);ctx.moveTo(cx+230,40);ctx.lineTo(cx+18,268);ctx.lineTo(cx+18,450);ctx.stroke();
  s.parts.forEach(p=>{const q=this.path(p.u,p.side);circle(q[0]+p.j*0.3,q[1],3,'#2f7fd1');});
  const by=205-s.lift+(s.blow?Math.sin(s.t*40)*1.2:0);
  if(!spr('pingpong',cx,by,118))circle(cx,by,58,'#fff','#e8772e',4);
  if(s.blow){arrow(cx,60,cx,by-66,'#d9534f',7);txt('바깥(위): 압력 높음 → 공을 눌러요',cx+14,70,'#d9534f',15,true,'left','rgba(255,255,255,.85)');
   txt('안쪽: 빠름 · 압력 낮음',cx+80,265,'#2f7fd1',14,true,'left','rgba(255,255,255,.85)');}
  txt('넓은 입구가 위로',20,28,'#5b6b80',13,true,'left','rgba(255,255,255,.8)');
 },
 now(s){if(!s.blow&&s.held===0)return '탁구공이 깔때기에 가볍게 놓여 있어요. 버튼을 꾹 눌러 세게 불어 보세요.';if(s.blow)return '세게 불어도 탁구공이 <b>날아가지 않고 깔때기에 붙어 있어요!</b> 바람을 더 세게 해도 마찬가지예요.';return '바람을 멈추니 공이 다시 가만히 놓였어요.';},
 tryIt:["바람을 가장 세게 하면 공이 날아갈까요? 예상하고 확인해 보세요.", "공이 붙어 있는 까닭을 “속도 → 압력 → 미는 힘” 순서로 말해 보세요."],
 why:'<ol><li>공기 속도 증가: 공과 깔때기 벽 사이를 빠르게 지나가요.</li><li>깔때기 안쪽 압력 감소</li><li>바깥쪽(위쪽)의 높은 압력이 공을 안으로 밀어요.</li><li>탁구공 밀착!</li></ol>'
});

/* ---------- 2-4 받음각과 실속 ---------- */
EX.push({
 id:'aoa',lesson:2,name:'받음각과 실속',size:[800,450],
 ask:'<b>예상해 보기</b> 날개를 많이 세울수록 양력이 계속 커질까요?',
 controls:[{type:'range',key:'aoa',label:'받음각 (날개를 세운 각도)',min:-4,max:24,step:1,val:5,fmt:v=>v+'°'}],
 buttons:[],
 reset(s){s.t=0;s.ps=[];for(let i=0;i<150;i++){s.ps.push({x:rnd(0,W),y0:lerp(60,390,(i%30)/29)+rnd(-4,4),sd:rnd(0,7)});}},
 act(){},
 CD(a){return 0.04+0.0011*a*a+(a>14?0.05*(a-14):0);},
 CL(a){if(a<=14)return 0.1*(a+2);return Math.max(0.75,1.6-(a-14)*0.12);},
 geom(s){const a=s.p.aoa*Math.PI/180,cx=400,cy=225,c=230;return{a,cx,cy,c};},
 step(s,dt){s.t+=dt;const{a,cx,cy,c}=this.geom(s);const cl=this.CL(s.p.aoa),stall=s.p.aoa>14;
  s.ps.forEach(p=>{const d=p.y0-cy;const w=Math.exp(-Math.abs(d)/75);const near=Math.exp(-Math.pow((p.x-cx)/(c*0.7),2));
   let f=d<0?1+0.55*cl*w*near:1-0.25*cl*w*near;
   if(stall&&d<0&&Math.abs(d)<90&&p.x>cx-c*0.1)f*=0.45;
   p.x+=160*f*dt;if(p.x>W+10){p.x=-10;}});},
 py(s,p){ // 입자 y
  const{a,cx,cy,c}=this.geom(s);const d=p.y0-cy;const w=Math.exp(-Math.abs(d)/70);
  const xl=cx-c/2*Math.cos(a),xr=cx+c/2*Math.cos(a);
  const yLE=cy+c/2*Math.sin(a),yTE=cy-c/2*Math.sin(a);
  const cl=this.CL(s.p.aoa),stall=s.p.aoa>14;
  const up=d<0;
  const sfun=x=>{const u=(x-xl)/(xr-xl);const base=lerp(yLE,yTE,u);return up?base-30*Math.sqrt(Math.max(u,0))*(1-u)*1.6-3:base+5*u*(1-u)+3;};
  let R;const x=p.x;const dw=Math.min(0.5,0.22*cl)*(stall?0.5:1);
  if(x<xl){const t=clamp((x-(xl-110))/110,0,1);const tt=t*t*(3-2*t);R=lerp(cy,yLE+(up?-4:4),tt);}
  else if(x<=xr){R=sfun(x);if(stall&&up){const sx=xl+(xr-xl)*0.15;if(x>sx)R=Math.min(sfun(sx),sfun(x));}}
  else{R=yTE+(up?-3:3)+(x-xr)*dw;}
  let y=p.y0+(R-cy)*w;
  if(stall&&up&&x>xl+(xr-xl)*0.15&&Math.abs(d)<100){const k=Math.exp(-Math.abs(d)/50);y+=(Math.sin(s.t*7+p.sd+x*0.05)*16-10)*k;}
  return y;},
 draw(s){
  sky('#e9f2fb','#f6faff');
  const{a,cx,cy,c}=this.geom(s);const cl=this.CL(s.p.aoa),stall=s.p.aoa>14;
  s.ps.forEach(p=>{const y=this.py(s,p);const d=p.y0-cy;const fast=d<0&&Math.abs(d)<100;ctx.fillStyle=stall&&fast&&p.x>cx?'#d9534f':'#2f7fd1';ctx.globalAlpha=.75;ctx.fillRect(p.x-6,y-1.3,12,2.6);ctx.globalAlpha=1;});
  // 날개
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-a);ctx.fillStyle='#1f3a5f';ctx.beginPath();
  ctx.moveTo(-c/2,0);ctx.bezierCurveTo(-c/2+10,-30,-c*0.1,-36,c*0.15,-26);ctx.bezierCurveTo(c*0.35,-18,c*0.45,-6,c/2,0);ctx.bezierCurveTo(c*0.2,4,-c*0.2,6,-c/2,0);ctx.fill();ctx.restore();
  // 양력 화살표
  arrow(cx,cy-20,cx,cy-20-cl*95,'#f2b32c',9);txt('양력',cx+14,cy-30-cl*95,'#b88500',16,true);
  const cd=this.CD(s.p.aoa);arrow(cx+c/2+14,cy+10,cx+c/2+14+cd*150,cy+10,'#e8772e',8);txt('항력',cx+c/2+18,cy+34,'#b85a14',15,true);
  if(stall)txt('실속! 흐름이 날개에서 떨어져요',cx,cy+115,'#d9534f',16,true,'center','rgba(255,255,255,.9)');
  // 그래프
  const gx=W-210,gy=20,gw=190,gh=110;ctx.fillStyle='rgba(255,255,255,.92)';rr(gx,gy,gw,gh,10);ctx.fill();
  txt('받음각에 따른 양력',gx+10,gy+14,'#1d2a3a',12,true);
  const X=a=>gx+16+(a+4)/28*(gw-28),Y=v=>gy+gh-14-v/1.7*(gh-36);
  ctx.strokeStyle='#cbd6e2';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx+14,Y(0));ctx.lineTo(gx+gw-10,Y(0));ctx.stroke();
  ctx.strokeStyle='#2f7fd1';ctx.lineWidth=2.5;ctx.beginPath();for(let k=-4;k<=24;k+=0.5){const yy=Y(Math.max(0,this.CL(k)));k===-4?ctx.moveTo(X(k),yy):ctx.lineTo(X(k),yy);}ctx.stroke();
  circle(X(s.p.aoa),Y(Math.max(0,cl)),6,stall?'#d9534f':'#f2b32c','#fff',2);
  txt('14°',X(14),gy+gh-6,'#7a8899',10,false,'center');
  txt('위: 빠름·압력 낮음',30,40,'#2f7fd1',13,true,'left','rgba(255,255,255,.85)');
 },
 now(s){const v=s.p.aoa;if(v<=0)return '날개가 거의 수평이에요. 양력이 <b>작아요</b>.';if(v<=10)return `받음각 ${v}°. 날개가 공기를 아래로 꺾어 보내며 <b>양력이 커져요</b>.`;if(v<=14)return `받음각 ${v}°. 양력이 <b>가장 큰 구간</b>이에요. 더 세우면 어떻게 될까요?`;return `받음각 ${v}°. 너무 세워서 공기 흐름이 날개 윗면에서 떨어져 나갔어요. <b>양력이 갑자기 줄어드는 실속</b>이에요!`;},
 tryIt:["받음각을 0°에서 1°씩 올리며 양력이 가장 큰 각도를 찾아보세요.", "14°를 넘기면 양력과 항력 화살표가 각각 어떻게 변하나요?", "받음각이 음수(-)일 때 양력은 어떻게 되나요?"],
 why:'<ul><li>날개를 기울인 각도를 <b>받음각</b>이라고 해요.</li><li>조금 키우면 공기를 더 많이 아래로 꺾어 양력이 커져요.</li><li>너무 세우면 흐름이 표면에서 떨어져 양력이 갑자기 줄어요(<b>실속</b>).</li><li>받음각을 키우면 공기가 뒤로 잡아끄는 <b>항력</b>도 함께 커지고, 실속 뒤에는 더 크게 늘어요.</li></ul>그래서 날개를 세울수록 무조건 잘 뜨는 것은 아니에요. 양력은 압력 차이로도, 공기를 아래로 꺾는 작용·반작용으로도 설명할 수 있어요.'
});

/* ---------- 공통 활공 모델 (종이비행기·링 비행기) ---------- */
function glideRun(P){
  let x=0,y=P.h0,vx=P.v0*Math.cos(P.a0),vy=P.v0*Math.sin(P.a0),th=P.a0+P.atrim*0.5,q=0,t=0,psi=0,X=0,Y=0,maxh=y;
  const dt=0.002,out=[{t:0,x,y,th,X,Y}];
  while(y>0&&t<12){
    const V=Math.hypot(vx,vy),g=Math.atan2(vy,vx);let a=th-g;while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;
    let cl=P.kL*a;const as=0.35;if(Math.abs(a)>as)cl=P.kL*as*Math.sign(a)*Math.max(0.25,1-(Math.abs(a)-as)*2.2);
    const L=cl*V*V,D=(P.kD0+P.kDi*a*a)*V*V;
    vx+=(-L*Math.sin(g)-D*Math.cos(g))*dt;vy+=(L*Math.cos(g)-D*Math.sin(g)-9.8)*dt;x+=vx*dt;y+=vy*dt;
    q+=(-P.kS*(a-P.atrim)*(V*V/25+0.3)-P.damp*q)*dt;th+=q*dt;
    psi+=P.turn*dt*(V/P.v0);const vh=Math.abs(vx);X+=Math.cos(psi)*vh*dt;Y+=Math.sin(psi)*vh*dt;
    t+=dt;maxh=Math.max(maxh,y);
    if(t-out[out.length-1].t>=0.016)out.push({t,x,y:Math.max(0,y),th,X,Y});
  }
  out.push({t,x,y:0,th,X,Y});
  return{t,dist:x,maxh,straight:Math.hypot(X,Y),pts:out};
}

/* ---------- 3 종이비행기 ---------- */
const PTYPES={flat:{name:'평면형',kL:1.9,kD0:0.035,kDi:1.0,v0:8,a0:0.05,base:0.13,turn:0},
 glider:{name:'글라이더형',kL:5.0,kD0:0.09,kDi:2.2,v0:5,a0:0.0,base:0.15,turn:0},
 boom:{name:'부메랑형',kL:3.2,kD0:0.06,kDi:1.6,v0:6.5,a0:0.08,base:0.15,turn:3.1}};
const PCG={front:{n:'너무 앞',kS:60,d:-0.12},good:{n:'알맞음',kS:30,d:0},back:{n:'너무 뒤',kS:6,d:0.22}};
const PEL={down:{n:'아래로',d:-0.1},flat:{n:'평평',d:0},up:{n:'위로',d:0.1}};
const PRU={left:{n:'왼쪽',d:0.45},center:{n:'가운데',d:0},right:{n:'오른쪽',d:-0.45}};
EX.push({
 id:'plane',lesson:3,name:'종이비행기 비교',size:[800,560],
 ask:'<b>예상해 보기</b> 어떤 비행기가 멀리 갈까요? 오래 떠 있을까요? 무게 중심이나 꼬리를 바꾸면 어떻게 될까요? <b>한 번에 한 조건만</b> 바꿔 보세요.',
 controls:[{type:'seg',key:'type',label:'비행기 종류',opts:[['flat','평면형'],['glider','글라이더형'],['boom','부메랑형']],val:'flat'},
  {type:'seg',key:'cg',label:'무게 중심 (클립 위치)',opts:[['front','너무 앞'],['good','알맞음'],['back','너무 뒤']],val:'good'},
  {type:'seg',key:'el',label:'양쪽 날개 뒤쪽',opts:[['down','아래로'],['flat','평평'],['up','위로']],val:'flat'},
  {type:'seg',key:'ru',label:'몸통 뒤쪽 접기',opts:[['left','왼쪽'],['center','가운데'],['right','오른쪽']],val:'center'}],
 buttons:[{label:'던지기',act:'throw'},{label:'기록 지우기',act:'clear',ghost:true}],
 recs:[],
 reset(s){s.run=null;s.trails=s.trails||[];s.k=0;},
 act(s,a){if(a==='clear'){this.recs=[];s.trails=[];s.run=null;}
  if(a==='throw'&&(!s.run||s.k>=s.run.pts.length-1)){const T=PTYPES[s.p.type],C=PCG[s.p.cg];const vr=rnd(0.94,1.06);
   const r=glideRun({...T,v0:T.v0*vr,a0:T.a0+rnd(-0.03,0.03),h0:1.6,kS:C.kS,atrim:T.base+C.d+PEL[s.p.el].d,damp:6,turn:T.turn+PRU[s.p.ru].d});
   r.cfg={...s.p};s.run=r;s.k=0;s.tt=0;}},
 step(s,dt){if(!s.run)return;s.tt+=dt*0.75;while(s.k<s.run.pts.length-1&&s.run.pts[s.k+1].t<=s.tt)s.k++;
  if(s.k>=s.run.pts.length-1&&!s.run.saved){s.run.saved=true;const r=s.run;this.recs.push({c:r.cfg,d:r.dist,t:r.t,st:r.straight,mh:r.maxh});if(this.recs.length>9)this.recs.shift();s.trails.push(r);if(s.trails.length>3)s.trails.shift();}},
 pic(t){return spr({flat:'plane_wide',glider:'plane_glide2',boom:'boomerang'}[t],0,-2,t==='boom'?16:20,{flip:true});},
 draw(s){
  // 위: 옆에서 본 모습 (0~300), 아래: 위에서 본 모습
  const SX=x=>112+x*45,SY=y=>270-y*55;
  sky('#e5f2ea','#f6fbf7');ctx.fillStyle='#cfe3c4';ctx.fillRect(0,270,W,30);
  txt('옆에서 본 모습 (날아간 길이와 높이)',14,20,'#1d2a3a',14,true,'left','rgba(255,255,255,.85)');
  for(let m=0;m<=15;m+=5){txt(m+'m',SX(m),288,'#5b7a63',11,false,'center');}
  handCat(SX(0),SY(1.6),270);
  // 아래 패널
  ctx.fillStyle='#eef6ff';ctx.fillRect(0,300,W,260);ctx.fillStyle='#d6e0eb';ctx.fillRect(0,300,W,2);
  txt('위에서 본 모습 (어느 쪽으로 날아갔나)',14,318,'#1d2a3a',14,true,'left','rgba(255,255,255,.85)');
  const TX=X=>120+X*40,TY=Y=>440-Y*40;
  ctx.strokeStyle='#c9d6e5';ctx.setLineDash([4,4]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(TX(0),TY(0));ctx.lineTo(W-10,TY(0));ctx.stroke();ctx.setLineDash([]);
  circle(TX(0),TY(0),7,'#1d2a3a');txt('출발',TX(0),TY(0)+18,'#1d2a3a',11,true,'center');
  for(const m of [5,10,15]){circle(TX(0),TY(0),m*40,null,'rgba(120,140,160,.18)',1);}
  const drawTrail=(r,alpha,k)=>{const n=k??r.pts.length-1;ctx.globalAlpha=alpha;
   ctx.strokeStyle='#2e9e6b';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=n;i++){const p=r.pts[i];i?ctx.lineTo(SX(p.x),SY(p.y)):ctx.moveTo(SX(p.x),SY(p.y));}ctx.stroke();
   ctx.strokeStyle='#2f7fd1';ctx.beginPath();for(let i=0;i<=n;i++){const p=r.pts[i];i?ctx.lineTo(TX(p.X),TY(p.Y)):ctx.moveTo(TX(p.X),TY(p.Y));}ctx.stroke();ctx.globalAlpha=1;};
  (s.trails||[]).forEach(r=>{if(r!==s.run)drawTrail(r,0.25);});
  if(s.run){drawTrail(s.run,1,s.k);const p=s.run.pts[s.k],pp=s.run.pts[Math.max(0,s.k-1)];
   ctx.save();ctx.translate(SX(p.x),SY(p.y));ctx.rotate(-p.th);if(!this.pic(s.run.cfg.type)&&!spr({flat:'plane_wide',glider:'plane_glide2',boom:'boomerang'}[s.run.cfg.type],0,-2,s.run.cfg.type==='boom'?16:20,{flip:true})){ctx.fillStyle='#2e9e6b';ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(-14,-9);ctx.lineTo(-9,0);ctx.lineTo(-14,4);ctx.closePath();ctx.fill();}ctx.restore();
   const hd=Math.atan2(-(p.Y-pp.Y),p.X-pp.X||1e-6);ctx.save();ctx.translate(TX(p.X),TY(p.Y));ctx.rotate(s.k?hd:0);this.topShape(s.run.cfg.type);ctx.restore();
   txt(`${(s.run.pts[s.k].t).toFixed(1)}초`,W-16,20,'#1d2a3a',15,true,'right','rgba(255,255,255,.85)');}
  else{ctx.save();ctx.translate(TX(0)+14,TY(0));this.topShape(s.p.type);ctx.restore();}
  if(!s.run||s.k>=s.run.pts.length-1){ctx.save();ctx.translate(SX(0),SY(1.6));ctx.rotate(-PTYPES[s.p.type].a0);this.pic(s.p.type);ctx.restore();}
 },
 topShape(t){ctx.fillStyle='#cfe9dc';ctx.strokeStyle='#2e9e6b';ctx.lineWidth=2;ctx.beginPath();
  if(t==='flat'){ctx.moveTo(18,0);ctx.lineTo(-14,-9);ctx.lineTo(-10,0);ctx.lineTo(-14,9);}
  else if(t==='glider'){ctx.moveTo(14,0);ctx.lineTo(4,-6);ctx.lineTo(-12,-22);ctx.lineTo(-16,-22);ctx.lineTo(-12,0);ctx.lineTo(-16,22);ctx.lineTo(-12,22);ctx.lineTo(4,6);}
  else{ctx.moveTo(14,0);ctx.lineTo(-6,-18);ctx.lineTo(-14,-20);ctx.lineTo(-10,0);ctx.lineTo(-14,20);ctx.lineTo(-6,18);}
  ctx.closePath();ctx.fill();ctx.stroke();},
 now(s){if(!s.run)return '조건을 고르고 <b>던지기</b>를 눌러요. 같은 조건으로 <b>세 번씩</b> 던져 비교하면 우연을 줄일 수 있어요. (던질 때마다 힘이 조금씩 달라져요)';
  const r=s.run,c=r.cfg;if(s.k<r.pts.length-1)return `${PTYPES[c.type].name}이 날아가는 중…`;
  let m=`${PTYPES[c.type].name}: <b>${c.type==='boom'?'출발점에서 '+r.straight.toFixed(1)+'m 떨어진 곳':r.straight.toFixed(1)+'m'}</b>에 착지, <b>${r.t.toFixed(1)}초</b> 동안 날았어요. `;
  if(c.cg==='front')m+='앞이 너무 무거워 <b>기수가 숙여져 빨리 떨어졌어요.</b> ';
  if(c.cg==='back')m+='뒤가 무거워 <b>기수가 들리고 위아래로 흔들렸어요.</b> ';
  if(c.el==='up'&&c.cg==='good')m+='날개 뒤쪽을 올려 <b>잠깐 올라갔다가</b> 속도가 줄었어요. ';
  if(c.el==='down'&&c.cg==='good')m+='날개 뒤쪽을 내려 <b>빠르게 내려왔어요.</b> ';
  if(c.ru!=='center')m+=`몸통 뒤쪽을 ${PRU[c.ru].n}으로 접어 <b>${PRU[c.ru].n}으로 선회</b>했어요. `;
  if(c.type==='boom')m+='부메랑형은 한쪽으로 <b>돌아서 출발점 쪽으로</b> 되돌아와요.';
  return m;},
 tryIt:["비행기 종류만 바꾸고 각각 세 번씩 던져 평균을 비교해 보세요.", "평면형에서 무게 중심만 “너무 앞 / 알맞음 / 너무 뒤”로 바꿔 보세요.", "날개 뒤쪽을 위로 접으면 처음에 올라가는데, 왜 멀리 못 갈까요?", "몸통 뒤쪽을 왼쪽·오른쪽으로 접고 위에서 본 모습을 확인해 보세요."],
 why:'<ul><li>던지는 순간 손이 처음 속도를 주고, 그 뒤엔 <b>양력·중력·항력</b>만 작용해요.</li><li>평면형: 곧고 멀리 / 글라이더형: 넓은 날개로 천천히 오래 / 부메랑형: 회전하며 되돌아옴</li><li>무게 중심: 너무 앞 → 곤두박질, 너무 뒤 → 실속·흔들림</li><li>날개 뒤쪽 위로 → 상승, 아래로 → 하강 / 몸통 뒤쪽 접은 쪽으로 선회</li></ul>',
 rec(){if(!this.recs.length)return '';return '<table><tr><th>종류</th><th>무게중심</th><th>날개뒤/몸통뒤</th><th>거리</th><th>시간</th></tr>'+this.recs.map(r=>`<tr><td>${PTYPES[r.c.type].name}</td><td>${PCG[r.c.cg].n}</td><td>${PEL[r.c.el].n}/${PRU[r.c.ru].n}</td><td>${r.st.toFixed(1)}m</td><td>${r.t.toFixed(1)}초</td></tr>`).join('')+'</table>';}
});

/* ---------- 4-1 마그누스 효과 ---------- */
EX.push({
 id:'magnus',lesson:4,name:'마그누스 효과',size:[800,460],
 ask:'<b>예상해 보기</b> 회전하는 공과 회전하지 않는 공을 똑같이 던지면 같은 길로 날아갈까요?',
 controls:[{type:'range',key:'spin',label:'회전 (← 위회전 · 아래회전 →)',min:-100,max:100,step:10,val:60,fmt:v=>v===0?'회전 없음':v<0?'위회전 '+(-v):'아래회전 '+v},
  {type:'range',key:'spd',label:'던지는 빠르기',min:40,max:100,step:10,val:70,fmt:v=>v+'%'}],
 buttons:[{label:'던지기',act:'throw'}],
 reset(s){s.ball=null;s.ghost=null;s.trail=[];s.gtrail=[];s.t=0;s.rot=0;s.fp=[];for(let i=0;i<70;i++)s.fp.push({x:rnd(-110,110),d:(i%14-6.5)*9,sp:rnd(.9,1.1)});},
 act(s,a){if(a==='throw'){const v=260+260*s.p.spd/100;s.ball={x:30,y:250,vx:v,vy:-20};s.ghost={x:30,y:250,vx:v,vy:-20};s.trail=[];s.gtrail=[];}},
 step(s,dt){s.t+=dt;s.rot-=dt*s.p.spin/100*8;
  const upd=(b,k,tr)=>{if(!b||b.done)return;for(let i=0;i<4;i++){const h=dt/4,w=k*s.p.spin/100*0.47,V=Math.hypot(b.vx,b.vy),c=0.0006;
     const ax=w*b.vy-c*V*b.vx, ay=-w*b.vx-c*V*b.vy+392;   // 마그누스 힘(속도에 수직) + 공기 저항 + 중력
     b.vx+=ax*h;b.vy+=ay*h;b.x+=b.vx*h;b.y+=b.vy*h;}
   tr.push([b.x,b.y]);if(b.y>420||b.x>W+20){b.done=true;}};
  upd(s.ball,1,s.trail);upd(s.ghost,0,s.gtrail);
  s.fp.forEach(p=>{const top=p.d<0;const f=1+(top?1:-1)*0.6*s.p.spin/100;p.x-=dt*90*Math.max(0.25,f)*p.sp;if(p.x<-110)p.x=110;});},
 draw(s){
  sky('#efeafb','#f9f7fe');ground(420,'#d9e9cf');
  txt('공이 날아가는 방향 →',20,24,'#5b6b80',13,true,'left','rgba(255,255,255,.8)');
  ctx.setLineDash([6,6]);ctx.strokeStyle='#9aa5b1';ctx.lineWidth=2;ctx.beginPath();s.gtrail.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#7a52c7';ctx.lineWidth=3;ctx.beginPath();s.trail.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();
  if(s.ghost&&!s.ghost.done)circle(s.ghost.x,s.ghost.y,10,'#cfd6de');
  if(s.ball){if(!spr('pingpong',s.ball.x,s.ball.y,28))circle(s.ball.x,s.ball.y,12,'#fff','#7a52c7',3);const r=s.rot;ctx.strokeStyle='#7a52c7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.ball.x+Math.cos(r)*12,s.ball.y+Math.sin(r)*12);ctx.lineTo(s.ball.x-Math.cos(r)*12,s.ball.y-Math.sin(r)*12);ctx.stroke();}
  if(s.gtrail.length)txt('회전 없는 공',Math.min(W-70,s.gtrail[s.gtrail.length-1][0]),Math.min(405,s.gtrail[s.gtrail.length-1][1]+20),'#7a8899',12,true,'center');
  // 확대 그림
  const ix=W-200,iy=150,R=34;ctx.fillStyle='rgba(255,255,255,.95)';rr(ix-130,iy-115,260,240,14);ctx.fill();
  txt('확대: 공 주변 공기 (공 기준)',ix,iy-98,'#1d2a3a',12,true,'center');
  ctx.save();ctx.beginPath();ctx.rect(ix-125,iy-85,250,205);ctx.clip();
  s.fp.forEach(p=>{const ex=Math.exp(-Math.pow(p.x/(1.3*R),2));const y=Math.sign(p.d||1)*Math.sqrt(p.d*p.d+R*R*1.15*ex);ctx.fillStyle=p.d<0?'#7a52c7':'#a58be0';ctx.fillRect(ix+p.x-5,iy+y-1.2,10,2.4);});
  ctx.restore();
  circle(ix,iy,R,'#fff','#1d2a3a',2.5);
  if(s.p.spin!==0){const back=s.p.spin>0;ctx.strokeStyle='#e8772e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(ix,iy,R+9,-2.5,-0.65);ctx.stroke();
   const ea=back?-2.5:-0.65, tx=ix+Math.cos(ea)*(R+9), ty=iy+Math.sin(ea)*(R+9), tg=ea+(back?-Math.PI/2:Math.PI/2);
   arrow(tx-Math.cos(tg)*8,ty-Math.sin(tg)*8,tx+Math.cos(tg)*4,ty+Math.sin(tg)*4,'#e8772e',3);
   const k=Math.abs(s.p.spin)/100, sx=ix+R+34;
   if(back){arrow(sx,iy+10,sx,iy+10-30-40*k,'#f2b32c',6);txt('힘',sx+8,iy-25-20*k,'#b88500',12,true);}
   else{arrow(sx,iy-10,sx,iy-10+30+40*k,'#f2b32c',6);txt('힘',sx+8,iy+25+20*k,'#b88500',12,true);}}
  txt(s.p.spin>0?'위: 빠름·압력 낮음':s.p.spin<0?'위: 느림·압력 높음':'위아래 비슷',ix,iy-70,'#7a52c7',12,true,'center');
  txt(s.p.spin>0?'아래: 느림·압력 높음':s.p.spin<0?'아래: 빠름·압력 낮음':'',ix,iy+108,'#7a52c7',12,true,'center');
 },
 now(s){const v=s.p.spin;if(!s.ball)return '회전을 정하고 <b>던지기</b>를 눌러요. 회색 점선은 회전 없는 공이 가는 길이에요.';
  if(v===0)return '회전이 없으면 위아래 공기 흐름이 비슷해서 옆 힘이 거의 없어요. 회색 공과 같은 길로 가요.';
  return v>0?`<b>아래회전</b> 공은 위쪽 공기가 빨라져 압력이 낮아지고, <b>위로 뜨는 힘</b>을 받아 회전 없는 공보다 <b>멀리</b> 날아가요.`:`<b>위회전</b> 공은 아래쪽 공기가 빨라져 압력이 낮아지고, <b>아래로 휘는 힘</b>을 받아 <b>빨리 떨어져요</b>. 탁구의 드라이브와 같아요.`;},
 tryIt:["회전을 0으로 놓고 던진 뒤, 아래회전 100과 위회전 100을 차례로 던져 비교해 보세요.", "같은 회전에서 던지는 빠르기만 바꾸면 휘는 정도가 어떻게 되나요?", "확대 그림에서 위쪽과 아래쪽 공기 줄무늬의 빠르기를 비교해 보세요."],
 why:'<ol><li>공이 날아가면 공 주변으로 공기가 흘러요.</li><li>공이 회전하면 표면이 가까운 공기를 끌고 가서, 한쪽 흐름은 빨라지고 다른 쪽은 느려져요.</li><li>압력 분포가 비대칭이 되어 <b>옆 방향의 힘</b>이 생겨요.</li></ol>마그누스 힘은 공이 날아가는 방향에 <b>수직</b>으로 작용하고, 더 빨리 회전할수록, 더 빨리 날아갈수록 커져요. 축구 바나나킥, 야구 변화구, 탁구 회전도 같은 원리예요.'
});

/* ---------- 4-2 텀블윙 ---------- */
EX.push({
 id:'tumble',lesson:4,name:'텀블윙',size:[800,420],
 ask:'<b>예상해 보기</b> 판지를 들고 걸어가면 텀블윙이 떠 있을까요? 너무 느리거나 너무 빠르면 어떻게 될까요?',
 controls:[{type:'range',key:'spd',label:'걷는 빠르기',min:0.2,max:2.0,step:0.1,val:0.7,fmt:v=>v.toFixed(1)+' m/s'}],
 buttons:[{label:'출발',act:'go'},{label:'다시',act:'reset',ghost:true}],
 recs:[],
 reset(s){s.S={xb:0.5,x:1.15,y:1.5,vx:0,vy:0,t:0,w:0};s.run=false;s.res=null;s.spin=0;s.pf=[];},
 act(s,a){if(a==='go'&&!s.run&&!s.res)s.run=true;if(a==='reset')this.reset(s);},
 phys(S,s,dt){S.xb+=s*dt;const topx=S.xb+0.25,topy=1.65,boty=0.55;const yc=clamp(S.y,boty,topy);const bx=S.xb+(yc-boty)/(topy-boty)*0.25;const dx=S.x-bx,dy=S.y-topy;let w=0,u=0;
  if(dx>-0.05&&dx<0.8&&S.y>boty&&dy<0.9){const fx=Math.max(0,1-dx/0.8);const fy=dy<0?0.35+0.65*Math.max(0,1+dy/1.1):Math.max(0,1-dy/0.9);w=1.9*s*fx*fy;u=s*(1.6-1.5*(dx/0.8))*(dy<0?Math.max(0.5,fy):1);}
  S.vx+=(u-S.vx)*2.2*dt;S.vy+=((w-0.45)-S.vy)*3*dt;S.x+=S.vx*dt;S.y+=S.vy*dt;S.t+=dt;S.w=w;
  const bx2=S.xb+(clamp(S.y,boty,topy)-boty)/(topy-boty)*0.25;if(S.y>boty-0.05&&S.y<topy+0.04&&S.x<bx2+0.07)return'hit';if(S.y<=0.03)return'ground';if(S.x>9.6)return'goal';return null;},
 step(s,dt){if(s.run){for(let i=0;i<5;i++){const r=this.phys(s.S,s.p.spd,dt/5);if(r){s.run=false;s.res=r;this.recs.push({v:s.p.spd,t:s.S.t,r});if(this.recs.length>6)this.recs.shift();break;}}
  s.spin+=dt*(2+6*Math.hypot(s.S.vx,s.S.vy));
  if(s.S.w>0.1&&Math.random()<0.7)s.pf.push({x:s.S.xb+rnd(0.05,0.6),y:rnd(0.7,1.6),life:0.8});}
  s.pf.forEach(p=>{p.y+=dt*1.2*s.p.spd;p.x+=dt*s.p.spd*0.8;p.life-=dt;});s.pf=s.pf.filter(p=>p.life>0);},
 draw(s){
  const SX=x=>x*80+10,SY=y=>380-y*140;sky('#e9f0fb','#f7faff');ground(380,'#dcd3c4');
  ctx.fillStyle='#a3d39c';ctx.fillRect(SX(9.6),360,8,20);txt('도착',SX(9.6)+4,350,'#2e7d32',12,true,'center');
  const S=s.S;
  s.pf.forEach(p=>{ctx.globalAlpha=clamp(p.life/0.8,0,1)*0.8;arrow(SX(p.x),SY(p.y)+10,SX(p.x),SY(p.y)-6,'#2f7fd1',2);ctx.globalAlpha=1;});
  // 사람 + 판지
  person(SX(S.xb-0.45),380,1.1,'cat_point');

  ctx.strokeStyle='#b98a5a';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(SX(S.xb),SY(0.55));ctx.lineTo(SX(S.xb+0.25),SY(1.65));ctx.stroke();
  // 텀블윙
  const ta=((s.spin%Math.PI)+Math.PI)%Math.PI,tf=Math.round(ta/Math.PI*5)%5;if(sprK('tw'+tf,SX(S.x),SY(S.y),56/240)){}else{ctx.save();ctx.translate(SX(S.x),SY(S.y));const sq=Math.cos(s.spin);ctx.fillStyle='#f5efdf';ctx.strokeStyle='#8a7d5c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,26,Math.max(3,Math.abs(sq)*12),0,0,7);ctx.fill();ctx.stroke();ctx.restore();}
  if(!s.res){ctx.strokeStyle='#3b2a7a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(SX(S.x),SY(S.y),20,-2.6,-0.5,true);ctx.stroke();}
  txt(`${S.t.toFixed(1)}초`,W-16,24,'#1d2a3a',15,true,'right','rgba(255,255,255,.85)');
  if(s.res){const m={ground:'바닥에 떨어졌어요',hit:'판지에 부딪혔어요!',goal:'끝까지 날았어요!'}[s.res];txt(m,W/2,60,s.res==='goal'?'#2e7d32':'#d9534f',22,true,'center','rgba(255,255,255,.9)');}
 },
 now(s){const v=s.p.spd;if(!s.run&&!s.res)return '판지 앞에 텀블윙을 들고 있어요. 빠르기를 정하고 <b>출발</b>을 눌러요.';
  if(s.run)return s.S.w>0.45?'판지를 따라 올라가는 공기가 텀블윙을 <b>떠받치고 있어요</b>. 텀블윙이 빙글빙글 돌며 떠 있어요.':'올라가는 공기가 약해서 텀블윙이 조금씩 내려가요.';
  return {ground:'걷는 속도가 너무 느려서 <b>올라가는 공기가 텀블윙을 떠받칠 만큼 세지 않았어요.</b>',hit:'너무 빨리 걸어서 텀블윙이 바람을 타기 전에 <b>판지가 텀블윙을 쳤어요.</b> 처음엔 천천히!',goal:`<b>성공!</b> ${s.S.t.toFixed(1)}초 동안 떠 있었어요. 일정한 속도로 천천히 걸으면 오래 날 수 있어요.`}[s.res];},
 tryIt:["걷는 빠르기를 0.3, 0.7, 1.4 m/s로 바꿔 결과를 비교해 보세요.", "텀블윙이 끝까지 날 수 있는 가장 느린 빠르기와 가장 빠른 빠르기를 찾아보세요."],
 why:'<ul><li>판지를 따라 위로 올라가는 공기(상승 기류)가 날개를 떠받쳐요.</li><li>회전과 넓은 면이 만드는 <b>공기 저항</b>이 떨어지는 속도를 늦춰요.</li></ul>판지는 수직에 가깝게, <b>일정한 속도로 천천히</b> 걸어요. 판지로 텀블윙을 치지 않아요.',
 rec(){if(!this.recs.length)return '';return '<table><tr><th>걷는 빠르기</th><th>결과</th><th>시간</th></tr>'+this.recs.map(r=>`<tr><td>${r.v.toFixed(1)} m/s</td><td>${{ground:'떨어짐',hit:'부딪힘',goal:'성공'}[r.r]}</td><td>${r.t.toFixed(1)}초</td></tr>`).join('')+'</table>';}
});

/* ---------- 4-3 링 비행기 ---------- */
const RW={light:{n:'얇게',kS:7,at:0.32,damp:5},good:{n:'알맞게',kS:30,at:0.12,damp:5},heavy:{n:'너무 무겁게',kS:70,at:0.0,damp:5}};
EX.push({
 id:'ring',lesson:4,name:'링 비행기',size:[800,400],
 ask:'<b>예상해 보기</b> 앞테두리를 두껍게(무겁게) 만드는 까닭은 뭘까요? 거꾸로 날리면 어떻게 될까요?',
 controls:[{type:'seg',key:'wt',label:'앞테두리 접기',opts:[['light','얇게'],['good','알맞게'],['heavy','너무 무겁게']],val:'good'},
  {type:'seg',key:'dir',label:'날리는 방향',opts:[['fwd','두꺼운 쪽이 앞'],['rev','두꺼운 쪽이 뒤']],val:'fwd'}],
 buttons:[{label:'날리기',act:'throw'},{label:'기록 지우기',act:'clear',ghost:true}],
 recs:[],
 reset(s){s.run=null;s.k=0;s.trails=s.trails||[];},
 act(s,a){if(a==='clear'){this.recs=[];s.trails=[];s.run=null;}
  if(a==='throw'&&(!s.run||s.k>=s.run.pts.length-1)){const w=RW[s.p.wt];let P={kL:3.0,kD0:0.06,kDi:1.4,v0:5.5*rnd(.95,1.05),a0:0.03+rnd(-.02,.02),h0:1.4,turn:0,kS:w.kS,atrim:w.at,damp:w.damp};
   if(s.p.dir==='rev')P={...P,kS:-40,atrim:0.3,damp:2};const r=glideRun(P);r.cfg={...s.p};s.run=r;s.k=0;s.tt=0;}},
 step(s,dt){if(!s.run)return;s.tt+=dt*0.75;while(s.k<s.run.pts.length-1&&s.run.pts[s.k+1].t<=s.tt)s.k++;
  if(s.k>=s.run.pts.length-1&&!s.run.saved){s.run.saved=true;const r=s.run;this.recs.push({c:r.cfg,d:r.dist,t:r.t});if(this.recs.length>6)this.recs.shift();s.trails.push(r);if(s.trails.length>3)s.trails.shift();}},
 draw(s){const SX=x=>140+x*54,SY=y=>350-y*80;sky('#efeafb','#faf8fe');ground(350,'#d9e9cf');
  for(let m=0;m<=12;m+=2)txt(m+'m',SX(m),368,'#5b7a63',11,false,'center');
  handCat(SX(0),SY(1.4),350);
  const tr=(r,al,n)=>{n=n??r.pts.length-1;ctx.globalAlpha=al;ctx.strokeStyle='#7a52c7';ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=n;i++){const p=r.pts[i];i?ctx.lineTo(SX(p.x),SY(p.y)):ctx.moveTo(SX(p.x),SY(p.y));}ctx.stroke();ctx.globalAlpha=1;};
  s.trails.forEach(r=>{if(r!==s.run)tr(r,0.25);});
  const drawRing=(x,y,th,rev)=>{if(spr('ringplane',x,y,46,{rot:-th,flip:!rev}))return;ctx.save();ctx.translate(x,y);ctx.rotate(-th);
   const f=rev?-1:1;ctx.strokeStyle='#9b85d6';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-f*16,0,7,20,0,0,7);ctx.stroke();
   ctx.strokeStyle='#7a52c7';ctx.beginPath();ctx.moveTo(-16,-20);ctx.lineTo(16,-20);ctx.moveTo(-16,20);ctx.lineTo(16,20);ctx.stroke();
   ctx.strokeStyle='#3b2a7a';ctx.lineWidth=s.p.wt==='light'?3:s.p.wt==='good'?6:9;ctx.beginPath();ctx.ellipse(f*16,0,7,20,0,0,7);ctx.stroke();ctx.restore();};
  if(s.run){tr(s.run,1,s.k);const p=s.run.pts[s.k];drawRing(SX(p.x),SY(p.y),p.th,s.run.cfg.dir==='rev');txt(`${p.t.toFixed(1)}초`,W-16,24,'#1d2a3a',15,true,'right','rgba(255,255,255,.85)');}
  if(!s.run||s.k>=s.run.pts.length-1)drawRing(SX(0),SY(1.4),0,s.p.dir==='rev');
  txt('진하고 두꺼운 테두리 = 무거운 쪽',16,24,'#3b2a7a',13,true,'left','rgba(255,255,255,.85)');
 },
 now(s){if(!s.run)return '앞테두리와 방향을 고르고 <b>날리기</b>를 눌러요.';const r=s.run,c=r.cfg;if(s.k<r.pts.length-1)return '날아가는 중…';
  let m=`<b>${r.dist.toFixed(1)}m</b>, <b>${r.t.toFixed(1)}초</b> 날았어요. `;
  if(c.dir==='rev')return m+'무거운 쪽이 뒤에 있으니 기수가 들려 <b>뒤집히며 금방 떨어졌어요.</b> 두꺼운 테두리가 앞이에요!';
  return m+{light:'앞쪽이 가벼워 <b>기수가 들리고 위아래로 흔들렸어요.</b>',good:'무게 중심이 앞에 있어 <b>덜 흔들리고 곧게</b> 날아갔어요.',heavy:'앞이 너무 무거워 <b>기수가 숙여져 빨리 떨어졌어요.</b>'}[c.wt];},
 tryIt:["앞테두리를 “얇게 / 알맞게 / 너무 무겁게”로 바꾸며 날아가는 모양을 비교해 보세요.", "두꺼운 쪽을 뒤로 해서 날리면 어떻게 되나요? 무게 중심으로 설명해 보세요."],
 why:'<ol><li>살짝 기울어진 고리 면이 안팎의 공기를 아래로 돌려보내 위쪽 힘을 만들어요.</li><li>두꺼운 앞테두리가 <b>무게 중심을 앞</b>에 두어 기수가 지나치게 들리는 걸 막아요.</li><li>원형 대칭이라 좌우로 구르는 흔들림이 작아요.</li></ol>',
 rec(){if(!this.recs.length)return '';return '<table><tr><th>앞테두리</th><th>방향</th><th>거리</th><th>시간</th></tr>'+this.recs.map(r=>`<tr><td>${RW[r.c.wt].n}</td><td>${r.c.dir==='fwd'?'두꺼운 쪽 앞':'두꺼운 쪽 뒤'}</td><td>${r.d.toFixed(1)}m</td><td>${r.t.toFixed(1)}초</td></tr>`).join('')+'</table>';}
});

/* ---------- 5 달걀 착륙선 ---------- */
EX.push({
 id:'egg',lesson:5,name:'달걀 착륙선',size:[800,480],
 ask:'<b>예상해 보기</b> 어떤 보호 방법을 쓰면 떨어진 달걀이 깨지지 않을까요? 높이를 바꾸면 어떻게 될까요?',
 controls:[{type:'chk',label:'보호 방법 고르기',opts:[['para','낙하산'],['cush','푹신한 재료'],['legs','빨대 다리·바깥틀']],val:{para:false,cush:false,legs:false},key:'prot'},
  {type:'seg',key:'floor',label:'바닥',opts:[['hard','딱딱한 시멘트'],['mat','푹신한 매트']],val:'hard'},
  {type:'seg',key:'h',label:'떨어뜨리는 높이',opts:[[0.5,'0.5m'],[1,'1m'],[1.5,'1.5m']],val:1}],
 buttons:[{label:'떨어뜨리기',act:'drop'},{label:'다시',act:'reset',ghost:true}],
 recs:[],
 reset(s){s.y=s.p.h;s.v=0;s.ph='ready';s.res=null;s.sq=0;s.t=0;},
 param(s){if(s.ph!=='fall')this.reset(s);},
 act(s,a){if(a==='drop'&&s.ph==='ready'){s.ph='fall';s.cfg={...s.p.prot,floor:s.p.floor,h:s.p.h};}if(a==='reset')this.reset(s);},
 calc(c,v){let d=c.floor==='mat'?0.05:0.002;if(c.cush)d+=0.025;if(c.legs)d+=0.015;const spread=(c.cush||c.floor==='mat')?1:1.5;const G=v*v/(2*d)/9.8*spread;const ms=2*d/v*1000;return{d,G,ms};},
 step(s,dt){if(s.ph==='fall'){const k=s.cfg.para?3.0:0.02;for(let i=0;i<10;i++){const h=dt/10;s.v+=(9.8-k*s.v*s.v)*h;s.y-=s.v*h;}s.t+=dt;
   if(s.y<=0){s.y=0;const r=this.calc(s.cfg,s.v);s.res={...r,v:s.v,egg:r.G<25?0:r.G<60?1:2,lander:s.cfg.legs?(r.G<40?1:2):(r.G<60?0:1)};s.ph='impact';s.it=0;
    this.recs.push({c:s.cfg,...s.res});if(this.recs.length>6)this.recs.shift();}}
  else if(s.ph==='impact'){s.it+=dt;s.sq=Math.min(1,s.it/0.5);if(s.it>0.6)s.ph='done';}else if(s.ph==='done')s.it+=dt;},
 draw(s){const SY=y=>400-y*170,hh=s.p.h;sky('#fdf0ef','#fff9f8');
  const c=s.ph==='ready'?{...s.p.prot,floor:s.p.floor}:s.cfg;
  if(c.floor==='mat'){ctx.fillStyle='#b9b0a4';ctx.fillRect(0,414,W,66);ctx.fillStyle='#9fd2a8';rr((FS>1.3?230:400)-200,386,400,28,8);ctx.fill();}
  else{ctx.fillStyle='#b9b0a4';ctx.fillRect(0,400,W,80);}
  const floorY=c.floor==='mat'?386:400;
  // 1m 자
  const rx0=FS>1.3?40:110;ctx.fillStyle='#e3a008';ctx.fillRect(rx0,SY(1.5),6,255);for(let i=0;i<=15;i++){ctx.fillRect(rx0+6,SY(i/10),i%5?8:14,2);}for(const m of [0.5,1,1.5])txt(m+'m',rx0+24,SY(m),'#a07400',m===hh?15:12,true);line(rx0+6,SY(hh),FS>1.3?150:300,SY(hh),'#e3a008',1.5,[5,5]);txt('0',rx0+16,SY(0)-6,'#a07400',12,true);
  const off=floorY-400;const by=SY(s.y)+off;const cx=FS>1.3?230:400;
  // 착륙선
  const legs=c.legs,crush=s.res&&legs?s.sq*(s.res.G>40?1:0.5):0;const legH=legs?34*(1-crush*0.6):0;
  const boxB=by-legH, boxT=boxB-80;
  if(c.para&&s.ph!=='done'&&s.ph!=='impact'){if(!spr('chute',cx,boxT-52,118)){ctx.fillStyle='#7fb3e8';ctx.beginPath();ctx.moveTo(cx-80,boxT-40);ctx.quadraticCurveTo(cx,boxT-105,cx+80,boxT-40);ctx.closePath();ctx.fill();}}
  else if(c.para){ctx.fillStyle='#7fb3e8';ctx.beginPath();ctx.ellipse(cx+110,floorY-6,80,8,0,0,7);ctx.fill();}
  if(legs){ctx.strokeStyle='#e3b23c';ctx.lineWidth=5;ctx.beginPath();for(const dx of [-34,-12,12,34]){ctx.moveTo(cx+dx*0.9,boxB);ctx.lineTo(cx+dx*1.25+(crush?dx*0.4*crush:0),by);}ctx.stroke();}
  ctx.fillStyle='#fff';ctx.strokeStyle='#9aa5b1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx-40,boxT);ctx.lineTo(cx+40,boxT);ctx.lineTo(cx+32,boxB);ctx.lineTo(cx-32,boxB);ctx.closePath();ctx.fill();ctx.stroke();
  if(c.cush){ctx.fillStyle='#f7d58b';for(const [dx,dy] of [[-24,-66],[24,-66],[-26,-12],[26,-12],[0,-8],[-28,-40],[28,-40]])circle(cx+dx,boxB+dy,9,'#f7d58b');}
  const eggSq=s.res?s.sq*(s.res.egg===2?1:0.3):0;const ey=boxB-40+(c.cush?0:8)+eggSq*10;
  const brk=s.res&&s.sq>0.6&&s.res.egg>=1;
  if(brk)spr(s.res.egg===2?'egg_broken':'egg_crack',cx,ey-(s.res.egg===2?4:0),s.res.egg===2?50:44);
  else if(!spr('egg',cx,ey,44*(1-eggSq*0.4),{w:34*(1+eggSq*0.4)})){ctx.fillStyle='#fff8e7';ctx.strokeStyle='#c9a46a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,ey,16,21,0,0,7);ctx.fill();ctx.stroke();}
  if(s.ph==='impact'||(s.ph==='done'&&s.it<1.2)){puff('dust',cx,floorY-14,130,(s.it||0)/.7);if(s.res&&s.res.G>=25)spr('impact',cx+58,floorY-40,46,{a:clamp(1-(s.it||0)/.9,0,1),rot:(s.it||0)*2});}
  if(s.res&&s.sq>0.6&&!IMG.egg_crack.naturalWidth){if(s.res.egg>=1){ctx.strokeStyle='#8a5a2b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-8,ey-12);ctx.lineTo(cx-2,ey-4);ctx.lineTo(cx-7,ey+3);ctx.lineTo(cx+2,ey+10);ctx.stroke();}
   if(s.res.egg===2){circle(cx+30,floorY-4,0,null);ctx.fillStyle='#f2b32c';ctx.beginPath();ctx.ellipse(cx,boxB-6,22,6,0,0,7);ctx.fill();}}
  // 계기판
  const k=FS,bw=254*k,x0=W-16-bw,X=v=>x0+14*k+v*k,Yb=v=>16+v*k;ctx.fillStyle='rgba(255,255,255,.93)';rr(x0,16,bw,166*k,12);ctx.fill();
  const v=s.res?s.res.v:s.v;txt(`떨어지는 빠르기  ${v.toFixed(1)} m/s`,X(0),Yb(22),'#1d2a3a',14,true);
  if(s.res){txt(`멈추는 시간  ${(s.res.ms/1000).toFixed(3)}초`,X(0),Yb(48),'#1d2a3a',13,true);
   txt('달걀이 받은 충격',X(0),Yb(76),'#5b6b80',12,true);const g=s.res.G;const f=clamp(Math.log10(g+1)/Math.log10(800),0,1);const bwid=226*k;
   ctx.fillStyle='#2e9e6b';ctx.fillRect(X(0),Yb(88),bwid*0.48,14*k);ctx.fillStyle='#e3a008';ctx.fillRect(X(0)+bwid*0.48,Yb(88),bwid*0.14,14*k);ctx.fillStyle='#d9534f';ctx.fillRect(X(0)+bwid*0.62,Yb(88),bwid*0.38,14*k);
   ctx.fillStyle='#1d2a3a';ctx.beginPath();ctx.moveTo(X(0)+bwid*f,Yb(86));ctx.lineTo(X(0)+bwid*f-6*k,Yb(78));ctx.lineTo(X(0)+bwid*f+6*k,Yb(78));ctx.fill();
   txt('안전',X(0),Yb(114),'#2e9e6b',11,true);txt('금',X(0)+bwid*0.5,Yb(114),'#a07400',11,true);txt('깨짐',X(0)+bwid*0.66,Yb(114),'#d9534f',11,true);
   const lab=['깨지지 않음','금이 감','깨짐'][s.res.egg];txt(`결과: 달걀 ${lab}`,X(0),Yb(144),['#2e9e6b','#a07400','#d9534f'][s.res.egg],15,true);}
 },
 now(s){if(s.ph==='ready')return '보호 방법(한두 가지)과 바닥을 고르고 <b>떨어뜨리기</b>를 눌러요.';if(s.ph==='fall')return '떨어지는 중…'+(s.cfg.para?' 낙하산이 공기를 받아 <b>천천히</b> 내려와요.':' 점점 <b>빨라져요</b>.');
  const r=s.res,c=s.cfg;const L=['깨지지 않았어요','금이 갔어요','깨졌어요'][r.egg];
  let m=`달걀이 <b>${L}</b>. `;
  m+=c.para?'낙하산 덕분에 천천히 떨어졌고, ':'빠르게 떨어졌고, ';
  m+=(c.cush||c.floor==='mat'||c.legs)?`눌리는 재료가 멈추는 시간을 <b>${(r.ms/1000).toFixed(3)}초</b>로 늘려 충격을 줄였어요.`:`딱딱한 바닥에서 <b>${(r.ms/1000).toFixed(3)}초</b> 만에 멈춰 큰 힘을 받았어요.`;
  if(!c.cush&&c.floor!=='mat')m+=' 감싸는 재료가 없어 힘이 한 곳에 몰렸어요.';
  return m;},
 tryIt:["보호 방법 없이 시멘트와 매트에 각각 떨어뜨려 “멈추는 시간”을 비교해 보세요.", "보호 방법을 하나씩만 골라 어떤 것이 가장 효과가 큰지 찾아보세요.", "높이를 1.5m로 올려도 달걀을 지키는 조합을 찾아보세요."],
 why:'<ul><li><b>천천히 떨어지기</b>: 낙하산이 공기를 받아 속도를 줄여요. (달에는 공기가 거의 없어 낙하산이 잘 안 돼요)</li><li><b>부드럽게 멈추기</b>: 푹신한 재료·매트·빨대 다리가 눌리며 멈추는 시간과 거리를 늘려요.</li><li><b>넓게 받치기</b>: 넓게 감싸면 힘이 나뉘어 한 부분이 받는 압력이 작아져요.</li></ul>높은 곳에서 떨어질수록 바닥에 닿는 순간의 빠르기가 커져서 충격도 커져요. 같은 빠르기라면 <b>멈추는 시간이 길수록</b> 달걀이 받는 힘이 작아요.',
 rec(){if(!this.recs.length)return '';const nm=c=>[c.para&&'낙하산',c.cush&&'쿠션',c.legs&&'다리'].filter(Boolean).join('+')||'없음';return '<table><tr><th>높이</th><th>보호</th><th>바닥</th><th>달걀</th></tr>'+this.recs.map(r=>`<tr><td>${r.c.h}m</td><td>${nm(r.c)}</td><td>${r.c.floor==='mat'?'매트':'시멘트'}</td><td><span class="tag ${['good','mid','bad'][r.egg]}">${['안 깨짐','금','깨짐'][r.egg]}</span></td></tr>`).join('')+'</table>';}
});

EX.forEach(e=>{if(!e.course)e.course='sci';});
