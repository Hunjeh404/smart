"use strict";
/* 지구온난화와 빙하 실험 */
const CC={ink:'#4a3a2e',sub:'#8a7566',blue:'#3f8fd0',red:'#e2636a',green:'#2fa084',gold:'#b8801a',purple:'#8a68c8',line:'#ecdccb',water:'rgba(120,180,230,.45)'};
/* 여러 줄 글: 공백 단위로 줄을 나눠요. 그린 줄 수를 돌려줘요 */
function wrapTxt(s,x,y,w,size=13,col=CC.ink,bold=false,lh=1.45,align='left'){
  const out=[];String(s).split('\n').forEach(par=>{let cur='';par.split(' ').forEach(word=>{const t=cur?cur+' '+word:word;if(tw(t,size,bold)>w&&cur){out.push(cur);cur=word;}else cur=t;});out.push(cur);});
  out.forEach((l,i)=>txt(l,x,y+i*size*FS*lh,col,size,bold,align));return out.length;}
function ccard(x,y,w,h,title){box(x,y,w,h,'#fff',CC.line,10);if(title)txt(title,x+12,y+17*Math.min(FS,1.3),CC.sub,12,true);}
const fmtMin=sec=>{const m=sec/60;return m<1?Math.round(sec)+'초':m<60?Math.round(m)+'분':Math.floor(m/60)+'시간 '+Math.round(m%60)+'분';};

/* ---------- 얼음 녹는 모형 ----------
   녹는 빠르기(g/초) = 얼음이 받는 열(W) ÷ 녹는 데 필요한 열 334 J/g
   받는 열 = 열이 드나드는 정도 × 겉넓이 × 온도 차 (+ 전구 빛)  */
const ICE_G={small:5,mid:10,big:20};
function iceSide(m){return Math.cbrt(Math.max(m,0)/0.92);}            // 정육면체 한 변(cm)
function meltPower(m,o){const s=iceSide(m);let A=5*s*s,h=o.water?0.03:0.001,dT=(o.T??25);
  if(o.crush)A*=3;if(o.salt){dT+=8;h*=1.3;}
  let P=h*A*dT;if(o.lamp)P+=0.2*s*s*Math.pow(30/(o.d||30),2);return P;}
function meltTime(m,o){let t=0;const dt=5;while(m>0.02&&t<36000){m-=meltPower(m,o)/334*dt;t+=dt;}return t;}
/* 얼음 그림: (x,y)는 바닥 가운데, m0는 처음 무게 */
function drawIce(x,y,m,m0,h10=46,o={}){if(m<=0.02)return;const f=m/m0,h=h10*Math.cbrt(m/10);
  const n=o.crush?'ice_crushed':o.salt&&f>.25?'ice_salt':'ice'+(f>.75?0:f>.5?1:f>.25?2:f>.1?3:4);
  const hh=o.crush?h*0.9:h;if(!spr(n,x,y-hh/2,hh)){box(x-h/2,y-h,h,h,'#e3f2fc','#9cc3e0',h*.2,2);}}
function drawPuddle(x,y,ml,maxW=150){if(ml<0.3)return;const n=ml<5?'puddle0':ml<14?'puddle1':'puddle2',im=IMG[n];
  const w=Math.min(maxW,26+Math.sqrt(ml)*16);if(!(im&&im.naturalWidth&&sprK(n,x,y,w/im.naturalWidth))){ctx.fillStyle=CC.water;ctx.beginPath();ctx.ellipse(x,y,w/2,w/7,0,0,7);ctx.fill();}}

/* ================= 1차시 ================= */
EX.push({course:'ice',id:'fair',lesson:1,name:'공정한 실험인가요',size:[800,440],
 ask:'<b>예상해 보기</b> 온도가 높으면 얼음이 더 빨리 녹는지 알아보려고 해요. 한쪽 접시에만 열전구를 켰을 때, <b>나머지 조건</b>은 어떻게 해야 믿을 수 있는 실험이 될까요?',
 controls:[{type:'seg',key:'lL',label:'왼쪽 접시 열전구',opts:[[0,'끔'],[1,'켬']],val:0},{type:'seg',key:'lR',label:'오른쪽 접시 열전구',opts:[[0,'끔'],[1,'켬']],val:1},
  {type:'seg',key:'sL',label:'왼쪽 얼음 크기',opts:[['small','작게'],['mid','보통'],['big','크게']],val:'mid'},{type:'seg',key:'sR',label:'오른쪽 얼음 크기',opts:[['small','작게'],['mid','보통'],['big','크게']],val:'mid'},
  {type:'seg',key:'nL',label:'왼쪽 얼음 개수',opts:[[1,'1개'],[2,'2개'],[3,'3개']],val:2},{type:'seg',key:'nR',label:'오른쪽 얼음 개수',opts:[[1,'1개'],[2,'2개'],[3,'3개']],val:2}],
 buttons:[{label:'녹이기 시작',act:'go'},{label:'강의 영상 속 실험',act:'video',ghost:true},{label:'처음으로',act:'reset',ghost:true}],
 recs:[],
 diffs(s){const p=s.p,d=[];if(p.lL!==p.lR)d.push('열전구');if(p.sL!==p.sR)d.push('얼음 크기');if(p.nL!==p.nR)d.push('얼음 개수');return d;},
 side(s,k){const p=s.p,m0=ICE_G[p['s'+k]],n=p['n'+k],o={lamp:!!p['l'+k]};return{m0,n,o,tEnd:meltTime(m0,o)};},
 reset(s){s.run=false;s.t=0;s.done=false;s.m={L:[],R:[]};['L','R'].forEach(k=>{const d=this.side(s,k);s.m[k]=Array(d.n).fill(d.m0);});s.first=null;s.speed=1;},
 param(s){this.reset(s);},
 act(s,a){if(a==='reset'){this.reset(s);return;}
  if(a==='video'){Object.assign(s.p,{lL:0,lR:1,sL:'small',sR:'big',nL:2,nR:2});buildControls();this.reset(s);a='go';}
  if(a==='go'){if(s.done||s.run)this.reset(s);const tL=this.side(s,'L').tEnd,tR=this.side(s,'R').tEnd;s.speed=Math.max(tL,tR)/9;s.run=true;}},
 step(s,dt){if(!s.run)return;const T=dt*s.speed;s.t+=T;
  ['L','R'].forEach(k=>{const d=this.side(s,k);s.m[k]=s.m[k].map(m=>{for(let i=0;i<4;i++)m=Math.max(0,m-meltPower(m,d.o)/334*T/4);return m;});
   if(!s.first&&s.m[k].every(m=>m<=0.02)){s.first=k;s.tFirst=s.t;sfx('success');}});
  if(s.m.L.every(m=>m<=0.02)&&s.m.R.every(m=>m<=0.02)){s.run=false;s.done=true;const d=this.diffs(s);this.recs.push({p:{...s.p},first:s.first,t:s.tFirst,d});if(this.recs.length>6)this.recs.shift();}},
 draw(s){paper('#f4f9fd');const d=this.diffs(s);
  [['L',200],['R',600]].forEach(([k,cx])=>{const p=s.p,on=!!p['l'+k],side=this.side(s,k);
   if(on){const g=ctx.createRadialGradient(cx,250,10,cx,250,170);g.addColorStop(0,'rgba(255,190,90,.28)');g.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=g;ctx.fillRect(cx-200,60,400,330);}
   spr(on?'lamp_on':'lamp_off',cx+70,120,150,{flip:true});
   spr('plate',cx,330,70,{w:250});
   const melted=s.m[k].reduce((a,m)=>a+side.m0-m,0);drawPuddle(cx,328,melted,210);
   const n=s.m[k].length,gap=62;s.m[k].forEach((m,i)=>drawIce(cx+(i-(n-1)/2)*gap,330,m,side.m0,46));
   txt(k==='L'?'왼쪽':'오른쪽',cx,388,CC.sub,13,true,'center');
   txt(`${on?'열전구 켬':'열전구 끔'} · ${{small:'작은',mid:'보통',big:'큰'}[p['s'+k]]} 얼음 ${p['n'+k]}개`,cx,410,CC.ink,13,true,'center');
   if(s.first===k)txt('먼저 다 녹았어요!',cx,190,CC.red,16,true,'center','rgba(255,255,255,.9)');});
  line(400,40,400,420,'#d8e3ee',2,[6,6]);
  const msg=d.length===0?'두 접시의 조건이 모두 같아요. 비교할 것이 없어요':d.length===1?`다른 조건은 '${d[0]}' 하나뿐이에요. 공정한 비교예요`:`다른 조건이 ${d.length}가지예요: ${d.join(', ')}`;
  txt(msg,400,22,d.length===1?CC.green:d.length?CC.red:CC.sub,15,true,'center','rgba(255,255,255,.92)');
  if(s.run||s.done)txt('지난 시간 '+fmtMin(s.t),790,52,CC.ink,13,true,'right','rgba(255,255,255,.85)');},
 now(s){const d=this.diffs(s);
  if(s.done){const who=s.first==='L'?'왼쪽':'오른쪽';
   if(d.length===1)return `${who} 얼음이 먼저 다 녹았어요. 다른 조건이 <b>${d[0]}</b> 하나뿐이라 결과의 원인을 <b>${d[0]}</b>(이)라고 말할 수 있어요.`;
   if(d.length>1)return `${who} 얼음이 먼저 녹았지만 <b>${d.join('과 ')}</b>이(가) 함께 달라서 무엇 때문인지 알 수 없어요. 변인 통제가 안 된 실험이에요.`;
   return '두 접시 조건이 같아서 거의 같이 녹았어요. 무엇이 영향을 주는지 알아보려면 한 가지만 바꿔 보세요.';}
  if(s.run)return '얼음이 녹고 있어요. 실제로는 몇십 분 걸리는 일을 빠르게 보여 줘요.';
  return d.length===1?'조건을 한 가지만 다르게 했어요. <b>녹이기 시작</b>을 눌러 보세요.':d.length>1?'지금은 여러 조건이 달라요. 이대로 실험하면 어떻게 될까요?':'두 접시 조건이 같아요. 무엇을 다르게 해 볼까요?';},
 rec(s){if(!this.recs.length)return '';return '<table><tr><th>왼쪽</th><th>오른쪽</th><th>먼저 녹음</th><th>공정?</th></tr>'+this.recs.map(r=>{const f=k=>`${r.p['l'+k]?'전구':'—'} ${({small:'작',mid:'보',big:'큰'})[r.p['s'+k]]}${r.p['n'+k]}`;return `<tr><td>${f('L')}</td><td>${f('R')}</td><td>${r.first==='L'?'왼쪽':'오른쪽'}</td><td>${r.d.length===1?'○':'✕'}</td></tr>`;}).join('')+'</table>';},
 why:`<p><b>변인 통제</b>는 한 가지 이유가 결과에 영향을 주는지 알아보려고, 그 한 가지만 다르게 하고 나머지는 모두 똑같이 맞추는 거예요.</p>
<ul><li><b>조작 변인</b>: 일부러 다르게 하는 조건 (여기서는 열전구, 곧 온도)</li><li><b>통제 변인</b>: 똑같이 맞추는 조건 (얼음 크기, 개수, 접시, 시간)</li><li><b>종속 변인</b>: 실험으로 얻는 결과 (얼음이 녹는 빠르기)</li></ul>
<p>강의 영상 속 실험은 열전구를 켠 쪽 얼음이 <b>더 컸어요</b>. 결과가 어떻게 나오든, 온도 때문인지 크기 때문인지 알 수 없어요. 조건이 여러 가지 다르면 무엇이 결과를 바꿨는지 알기 어렵기 때문에, 믿을 수 있는 결과를 얻으려면 변인 통제를 꼭 해야 해요.</p>`,
 tryIt:['<b>강의 영상 속 실험</b>을 누르고, 결과를 믿을 수 있는지 이야기해 보세요.','얼음 크기만 다르게 하고 전구는 양쪽 다 끄면 무엇을 알아볼 수 있을까요?','열전구를 켠 쪽에 작은 얼음을 두면, 결과가 더 헷갈리게 될까요?']});

const METHODS={room:{name:'그냥 두기',o:{},pic:'plate'},warm:{name:'따뜻한 물',o:{water:true,T:40},pic:'bowl_warm'},hot:{name:'뜨거운 물',o:{water:true,T:80},pic:'bowl_hot'},
 salt:{name:'소금 뿌리기',o:{salt:true},pic:'plate'},crush:{name:'잘게 부수기',o:{crush:true},pic:'plate'},lamp:{name:'열전구 쬐기',o:{lamp:true},pic:'plate'}};
const MKEYS=Object.keys(METHODS);
EX.push({course:'ice',id:'race',lesson:1,name:'얼음 빨리 녹이기 대회',size:[800,440],
 ask:'<b>예상해 보기</b> 같은 크기 얼음을 여러 방법으로 녹여요. 어떤 방법이 가장 빠를지 <b>가설</b>을 먼저 골라 보세요.',
 controls:[{type:'chk',key:'pick',label:'비교할 방법 (2개 이상)',opts:MKEYS.map(k=>[k,METHODS[k].name]),val:{room:1,hot:1,salt:1,crush:1},wide:true},
  {type:'seg',key:'guess',label:'나의 가설: 가장 빨리 녹일 방법은',opts:MKEYS.map(k=>[k,METHODS[k].name]),val:'salt',wide:true}],
 buttons:[{label:'시작',act:'go'},{label:'다시',act:'reset',ghost:true}],
 keys(s){return MKEYS.filter(k=>s.p.pick[k]);},
 reset(s){s.run=false;s.done=false;s.t=0;const K=this.keys(s);s.m={};s.tEnd={};K.forEach(k=>{s.m[k]=10;s.tEnd[k]=meltTime(10,METHODS[k].o);});s.fin=[];s.speed=1;},
 param(s){this.reset(s);},
 act(s,a){if(a==='reset')return this.reset(s);if(a==='go'){const K=this.keys(s);if(K.length<2){s.warn=true;return;}s.warn=false;this.reset(s);s.speed=Math.max(...K.map(k=>s.tEnd[k]))/10;s.run=true;}},
 step(s,dt){if(!s.run)return;const T=dt*s.speed;s.t+=T;
  this.keys(s).forEach(k=>{if(s.m[k]<=0.02)return;let m=s.m[k];for(let i=0;i<6;i++)m=Math.max(0,m-meltPower(m,METHODS[k].o)/334*T/6);s.m[k]=m;
   if(m<=0.02){s.fin.push(k);sfx(s.fin.length===1?'ding-correct':'pop',{volume:.7});}});
  if(this.keys(s).every(k=>s.m[k]<=0.02)){s.run=false;s.done=true;}},
 draw(s){paper('#f4f9fd');const K=this.keys(s),n=Math.max(K.length,1),cw=Math.min(190,760/n),x0=400-cw*n/2;
  if(!K.length){txt('비교할 방법을 2개 이상 골라 주세요',400,220,CC.sub,15,true,'center');return;}
  K.forEach((k,i)=>{const M=METHODS[k],cx=x0+cw*(i+.5),m=s.m[k]??10,water=M.o.water;
   box(cx-cw/2+6,40,cw-12,370,i%2?'#fff':'#fbfdff',CC.line,12);
   txt(M.name,cx,64,CC.ink,14,true,'center');
   if(k==='lamp')spr('lamp_on',cx+18,124,92,{flip:true});
   if(water){spr(M.pic,cx,270,Math.min(110,cw*.75*0.62),{w:Math.min(170,cw*.82)});drawIce(cx,262+Math.sin(NOW()*2+i)*2,m,10,44,M.o);}
   else{spr('plate',cx,280,40,{w:Math.min(160,cw*.8)});drawPuddle(cx,279,10-m,cw*.8);drawIce(cx,280,m,10,44,M.o);}
   const r=s.fin.indexOf(k);
   if(r>=0){txt((r+1)+'등',cx,330,r===0?CC.red:CC.ink,20,true,'center');txt(fmtMin(s.tEnd[k]),cx,358,CC.sub,13,true,'center');}
   else if(s.run)txt(Math.round(m/10*100)+'% 남음',cx,340,CC.sub,12,true,'center');
   if(s.p.guess===k)txt('나의 가설',cx,392,CC.purple,12,true,'center','#f2ecfb');});
  if(s.run||s.done)txt('지난 시간 '+fmtMin(s.t),790,20,CC.ink,13,true,'right');},
 now(s){if(s.warn)return '방법을 <b>2개 이상</b> 골라야 비교할 수 있어요.';
  if(s.done){const w=s.fin[0],ok=w===s.p.guess,inc=s.p.pick[s.p.guess];return `가장 빨리 녹인 방법은 <b>${METHODS[w].name}</b>(${fmtMin(s.tEnd[w])})이에요. `+(inc?(ok?'가설이 맞았어요!':'가설과 달랐어요. 가설은 틀려도 괜찮아요. 새 가설을 세워 다시 실험하면 돼요.'):'가설로 고른 방법을 비교 목록에 넣지 않았어요.');}
  if(s.run)return '모든 얼음은 크기(10g)와 처음 온도가 같아요. 녹이는 <b>방법</b>만 달라요.';
  return '비교할 방법과 나의 가설을 고르고 <b>시작</b>을 눌러요.';},
 why:`<p>강의에서 세운 <b>실험 계획서</b>의 순서예요.</p><ol><li><b>탐구 주제</b>: 얼음을 빨리 녹이는 방법</li><li><b>탐구 동기</b>: 누가 시켜서가 아니라, 내가 왜 궁금한지 (얼음이 빨리 녹는 까닭을 알면 빙하가 녹는 것을 막는 방법을 생각하는 데 도움이 될 것 같아서)</li><li><b>가설</b>: 결론을 미리 예측해서 '~할 것이다'로 써요</li><li><b>준비물</b>: 크기가 같은 얼음, 뜨거운 물, 소금, 망치 등</li><li><b>변인 통제</b>: 조작 변인은 녹이는 방법, 통제 변인은 그 밖의 모든 것, 종속 변인은 녹는 빠르기</li><li><b>실험 과정</b>은 줄글 말고 1, 2, 3 번호로</li><li><b>기대 효과</b>: 이 결과가 어디에 도움이 될까</li></ol>
<p>물은 공기보다 열을 훨씬 잘 전해서 물에 담그면 빨리 녹아요. 잘게 부수면 열을 받는 겉넓이가 넓어지고, 소금은 얼음이 녹는 온도를 낮춰 줘요.</p>`,
 tryIt:['뜨거운 물과 따뜻한 물 중 어느 것이 얼마나 더 빠를까요?','소금 뿌리기와 잘게 부수기를 비교해 보세요.','가설이 틀렸다면, 새 가설을 세우고 다시 실험해 보세요.']});

const VSETS={temp:{title:'온도에 따라 얼음이 녹는 빠르기',cards:[['온도','m'],['얼음 크기','c'],['얼음 개수','c'],['접시 종류','c'],['관찰하는 시간','c'],['얼음이 녹는 빠르기','d']]},
 co2:{title:'병 속 기체에 따라 얼음이 녹는 양',cards:[['병 속 기체 종류','m'],['병 크기','c'],['얼음 크기와 개수','c'],['열전구와의 거리','c'],['두는 시간','c'],['녹은 물의 양','d']]},
 way:{title:'얼음을 녹이는 방법',cards:[['얼음을 녹이는 방법','m'],['얼음 크기','c'],['실험하는 장소','c'],['처음 얼음 온도','c'],['그릇 크기','c'],['다 녹는 데 걸린 시간','d']]}};
const VNAME={m:'조작 변인',c:'통제 변인',d:'종속 변인'},VCOL={m:CC.red,c:CC.blue,d:CC.green};
EX.push({course:'ice',id:'vars',lesson:1,name:'변인 분류하기',size:[800,440],
 ask:'<b>생각해 보기</b> 실험 속 조건 카드를 눌러 <b>조작 변인</b>, <b>통제 변인</b>, <b>종속 변인</b>으로 나눠 보세요. 누를 때마다 바뀌어요.',
 controls:[{type:'seg',key:'set',label:'실험',opts:[['temp','온도와 얼음'],['co2','이산화탄소와 얼음'],['way','얼음 녹이는 방법']],val:'temp',wide:true}],
 buttons:[{label:'채점하기',act:'check'},{label:'다시 섞기',act:'reset',ghost:true}],
 reset(s){const C=VSETS[s.p.set].cards.map((c,i)=>({t:c[0],a:c[1],v:null,i}));for(let i=C.length-1;i>0;i--){const j=rint(i+1);[C[i],C[j]]=[C[j],C[i]];}s.cards=C;s.checked=false;s.age=9;s.hit=-1;},
 param(s){this.reset(s);},
 geo(i){const col=i%2,row=Math.floor(i/2);return{x:30+col*250,y:80+row*112,w:236,h:96};},
 click(s,x,y){s.cards.forEach((c,i)=>{const g=this.geo(i);if(x>=g.x&&x<=g.x+g.w&&y>=g.y&&y<=g.y+g.h){c.v={null:'m',m:'c',c:'d',d:null}[c.v];s.checked=false;s.hit=i;s.age=0;sfx('select-soft');}});},
 act(s,a){if(a==='reset')return this.reset(s);if(a==='check'){s.checked=true;s.age=0;const ok=s.cards.every(c=>c.v===c.a);sfx(ok?'puzzle-solved':'buzzer-wrong');}},
 step(s,dt){s.age+=dt;},
 draw(s){paper();txt('실험: '+VSETS[s.p.set].title,30,34,CC.ink,16,true);
  s.cards.forEach((c,i)=>{const g=this.geo(i),pop=s.hit===i?Math.max(0,1-s.age/.25)*4:0,col=c.v?VCOL[c.v]:'#c9b8a8';
   const shake=s.checked&&c.v!==c.a?Math.sin(s.age*40)*Math.max(0,1-s.age/.5)*5:0;
   box(g.x-pop+shake,g.y-pop,g.w+pop*2,g.h+pop*2,c.v?VCOL[c.v]+'1a':'#fff',col,12,c.v?3:2);
   txt(c.t,g.x+g.w/2+shake,g.y+36,CC.ink,15,true,'center');
   txt(c.v?VNAME[c.v]:'눌러서 고르기',g.x+g.w/2+shake,g.y+68,c.v?col:CC.sub,13,true,'center');
   if(s.checked){const ok=c.v===c.a;circle(g.x+g.w-16,g.y+16,11,ok?CC.green:CC.red);txt(ok?'○':'✕',g.x+g.w-16,g.y+17,'#fff',12,true,'center');}});
  ccard(540,80,236,320,'무엇일까요?');
  [['m','일부러 다르게 하는 조건 (딱 하나)'],['c','똑같이 맞추는 조건 (나머지 모두)'],['d','실험으로 얻는 결과']].forEach(([k,d],i)=>{const y=130+i*92,cnt=s.cards.filter(c=>c.v===k).length;
   box(556,y-22,204,74,VCOL[k]+'14',VCOL[k],10,2);txt(VNAME[k]+'  '+cnt+'장',570,y-2,VCOL[k],14,true);wrapTxt(d,570,y+24,180,11,CC.ink,true);});},
 now(s){const n=s.cards.filter(c=>c.v).length;if(s.checked){const ok=s.cards.filter(c=>c.v===c.a).length;return ok===s.cards.length?'모두 맞았어요! 조작 변인은 <b>하나</b>, 결과(종속 변인)도 하나, 나머지는 모두 통제 변인이에요.':`${s.cards.length}장 중 <b>${ok}장</b> 맞았어요. ✕ 카드를 다시 눌러 바꿔 보세요.`;}
  return n<s.cards.length?`카드를 눌러 분류해요. (${n}/${s.cards.length}장)`:'다 골랐어요. <b>채점하기</b>를 눌러 보세요.';},
 why:`<ul><li><b>조작 변인</b>: 실험에서 다르게 해야 하는 단 한 가지 조건</li><li><b>통제 변인</b>: 조작 변인 말고 같게 유지해야 하는 모든 조건</li><li><b>독립 변인</b>: 조작 변인과 통제 변인을 통틀어 부르는 말</li><li><b>종속 변인</b>: 실험을 해서 얻는 데이터, 곧 실험의 결과값</li></ul><p>질문을 이렇게 바꿔 보면 쉬워요. "무엇을 바꿨나요?"는 조작 변인, "무엇을 쟀나요?"는 종속 변인, "무엇을 똑같이 맞췄나요?"는 통제 변인이에요.</p>`,
 tryIt:['세 가지 실험을 모두 해 보세요. 조작 변인은 늘 몇 개였나요?','통제 변인을 하나 더 찾아 말해 보세요. (예: 실험하는 방의 온도)']});

/* ================= 2차시 ================= */
EX.push({course:'ice',id:'collect',lesson:2,name:'이산화탄소 모으기',size:[800,440],
 ask:'<b>예상해 보기</b> 탄산수 속 기체를 병에 옮겨 담아요. 병에 <b>물을 가득 채워 거꾸로 세워 두면</b> 무엇이 좋을까요? 모은 기체에 촛불을 넣으면 어떻게 될까요?',
 controls:[{type:'seg',key:'prep',label:'기체를 받을 병',opts:[['water','물을 가득 채워 거꾸로'],['air','그냥 빈 병 (공기)']],val:'water',wide:true}],
 buttons:[{label:'꾹 눌러서 탄산수 흔들기',act:'shake',hold:true},{label:'촛불 넣어 보기',act:'test'},{label:'처음으로',act:'reset',ghost:true}],
 reset(s){s.left=1;s.sent=0;s.shake=false;s.bub=[];s.test=null;s.age=0;},
 param(s){this.reset(s);},
 co2(s){return s.p.prep==='water'?(s.sent>0?1:0):1-Math.exp(-s.sent/0.9);},
 act(s,a,on){if(a==='reset')return this.reset(s);if(a==='shake'){s.shake=on;if(on)s.test=null;sfxLoop('bub','rain-loop',on,{volume:.35,rate:1.6});}
  if(a==='test'){s.test={t:0,out:this.co2(s)>0.24};}},
 step(s,dt){s.age+=dt;if(s.shake&&s.left>0){const f=0.16*s.left*dt;s.left=Math.max(0,s.left-f/1.25);s.sent+=f;if(Math.random()<0.6)s.bub.push({u:0,o:Math.random()});}
  s.bub.forEach(b=>b.u+=dt*1.1);s.bub=s.bub.filter(b=>b.u<1);if(s.test){const was=s.test.t;s.test.t+=dt;if(s.test.out&&was<1.2&&s.test.t>=1.2)sfx('pop-down');}},
 draw(s){sky('#eef6fd','#fbfdff');const W2=s.p.prep==='water',g=Math.min(1,s.sent),wob=s.shake?Math.sin(NOW()*30)*.12:0;
  ctx.fillStyle='#e7dccd';ctx.fillRect(0,380,800,60);
  // 탄산수 병
  spr('soda',120,280,190,{rot:wob});txt('탄산수',120,404,CC.ink,13,true,'center');
  // 고무관(곡선)
  const tx=W2?520:560,ty=W2?330:170;ctx.strokeStyle='#e79aa6';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(130,178);ctx.bezierCurveTo(200,60,420,60,tx,ty);ctx.stroke();
  ctx.strokeStyle='#f6c3cb';ctx.lineWidth=5;ctx.stroke();
  s.bub.forEach(b=>{const u=b.u,x=Math.pow(1-u,3)*130+3*Math.pow(1-u,2)*u*200+3*(1-u)*u*u*420+u*u*u*tx,y=Math.pow(1-u,3)*178+3*Math.pow(1-u,2)*u*60+3*(1-u)*u*u*60+u*u*u*ty;circle(x,y,3.5,'rgba(255,255,255,.9)','#9cc3e0',1.2);});
  if(W2){// 수조와 거꾸로 세운 병
   spr('trough',560,330,150,{w:340});ctx.fillStyle='rgba(120,180,230,.35)';ctx.fillRect(408,300,304,70);
   const bx=560,top=150,bot=340,bh=bot-top;ctx.save();ctx.translate(bx,(top+bot)/2);ctx.scale(1,-1);spr('bottle',0,0,bh,{w:110});ctx.restore();
   const wl=top+bh*g;ctx.fillStyle='rgba(110,170,225,.5)';ctx.fillRect(bx-48,wl,96,bot-wl-6);
   if(g>0.02)txt(`모인 기체 ${Math.round(g*100)}%`,bx,top-16,CC.blue,13,true,'center','rgba(255,255,255,.9)');
   if(s.sent>1)for(let i=0;i<3;i++){const u=(NOW()*0.8+i/3)%1;circle(bx+60+Math.sin(u*9)*4,bot-u*40,4,'rgba(255,255,255,.9)','#9cc3e0',1.2);}}
  else{spr('bottle',560,280,190,{w:120});txt('기체가 얼마나 모였는지 보이지 않아요',560,160,CC.sub,12,true,'center','rgba(255,255,255,.9)');}
  // 탄산수에 남은 기체
  box(40,40,160,16,'#eef3f8',null,8);ctx.fillStyle='#9cc9f0';ctx.fillRect(40,40,160*s.left,16);txt('탄산수에 남은 기체',40,70,CC.sub,11,true);
  // 촛불 시험
  if(s.test){const t=s.test.t,x=700,y=Math.min(290,120+t*200),ff=s.test.out?(t<0.9?0:t<1.05?1:t<1.2?2:3):0;
   line(x,40,x,y-40,'#8a7566',2);spr('flame'+ff,x,y,ff===3?60:ff===2?52:ff===1?58:68);
   if(t>1.4)txt(s.test.out?'불이 꺼졌어요!':'불이 계속 타요',x,y+48,s.test.out?CC.red:CC.green,14,true,'center','rgba(255,255,255,.9)');}},
 now(s){const c=this.co2(s),W2=s.p.prep==='water';
  if(s.test&&s.test.t>1.4)return s.test.out?`병 속 기체에 넣은 촛불이 꺼졌어요. 이산화탄소는 <b>불을 끄는 성질</b>이 있어서, 모인 기체가 이산화탄소라는 걸 확인할 수 있어요.${W2?'':' (빈 병은 공기와 섞였지만 이산화탄소가 많이 들어갔어요)'}`:(s.sent<0.05?'아직 기체를 모으지 않았어요. 병 속은 '+(W2?'물':'공기')+'이에요.':'불이 꺼지지 않았어요. 이산화탄소가 아직 충분히 모이지 않았어요. 더 흔들어 보세요.');
  if(s.shake)return W2?'병 안의 물이 밀려 나가고 그 자리에 기체가 차요. 얼마나 모였는지 눈으로 보여요.':'기체가 병으로 들어가고 있어요. 그런데 얼마나 모였는지 보이나요?';
  return W2?'병에 물을 가득 채워 거꾸로 세웠어요. <b>탄산수 흔들기</b>를 꾹 눌러 보세요.':'빈 병으로 해 보면 무엇이 불편한지 살펴보세요.';},
 why:`<p>탄산수나 탄산음료에 녹아 있는 기체는 <b>이산화탄소</b>예요. 탄산수 병 입구에 긴 고무풍선을 씌우고 다른 쪽 끝을 병에 넣은 뒤 탄산수를 흔들면, 이산화탄소가 빠져나와 병으로 옮겨 가요.</p>
<p>그냥 넣으면 얼마나 모였는지 보이지 않아서, 강의에서는 수조에 물을 담고 병에 물을 가득 채워 거꾸로 세운 다음 기체를 넣었어요. 기체가 들어온 만큼 <b>물이 밀려 나가서</b> 모인 양이 눈에 보여요.</p>
<p>이산화탄소를 모으는 다른 방법도 있어요. <b>드라이아이스</b>는 이산화탄소를 얼린 것이라 통에 넣고 녹이면 이산화탄소가 가득 차요. <b>초에 불을 붙이고 병을 씌우면</b> 불이 산소를 쓰고 이산화탄소와 물을 내놓아요.</p>`,
 tryIt:['기체를 조금만 모았을 때와 가득 모았을 때 촛불이 어떻게 다른지 보세요.','빈 병으로도 해 보고, 물을 채운 병과 무엇이 다른지 말해 보세요.']});

EX.push({course:'ice',id:'candle',lesson:2,name:'촛불 덮기와 불이 타는 조건',size:[800,440],
 ask:'<b>예상해 보기</b> 촛불에 유리병을 씌우면 어떻게 될까요? 큰 병과 작은 병 중 어느 쪽에서 더 오래 탈까요?',
 controls:[{type:'seg',key:'jar',label:'씌울 병',opts:[['s','작은 병 (0.3L)'],['l','큰 병 (1.2L)']],val:'s'},{type:'seg',key:'wick',label:'초의 심지',opts:[[1,'있음'],[0,'없음 (탈 물질 없음)']],val:1}],
 buttons:[{label:'불 붙이기',act:'fire'},{label:'병 씌우기 / 벗기기',act:'cover'},{label:'처음으로',act:'reset',ghost:true}],
 reset(s){s.o=0.21;s.c=0.0004;s.lit=false;s.cov=false;s.cy=0;s.t=0;s.outT=-9;s.match=-9;s.burnT=0;s.msg='';s.last=null;},
 param(s){this.reset(s);},
 act(s,a){if(a==='reset')return this.reset(s);
  if(a==='fire'){s.match=s.t;if(!s.p.wick){s.msg='nowick';sfx('deny');return;}if(s.cov&&s.o<0.165){s.msg='noox';sfx('deny');return;}s.lit=true;s.burnT=0;s.msg='';sfx('ignite');}
  if(a==='cover'){s.cov=!s.cov;if(s.cov)s.burnT=0;}},
 step(s,dt){s.t+=dt;s.cy+=((s.cov?1:0)-s.cy)*Math.min(1,dt*6);const V=s.p.jar==='s'?0.3:1.2,sealed=s.cov&&s.cy>0.9;
  if(s.lit){const ff=clamp((s.o-0.16)/0.05,0,1);if(sealed){const r=0.0055/V*Math.max(ff,.15);s.o-=r*dt;s.c+=0.7*r*dt;s.burnT+=dt;}
   if(s.o<=0.16){s.lit=false;s.outT=s.t;s.last={V,t:s.burnT};sfx('pop-down');}}
  if(!sealed){s.o+=(0.21-s.o)*Math.min(1,dt*1.5);s.c+=(0.0004-s.c)*Math.min(1,dt*1.5);}},
 draw(s){paper('#f6f2fb');const V=s.p.jar==='s',cx=260,base=360;ctx.fillStyle='#e9dfd2';ctx.fillRect(0,base+8,800,80);
  const ff=clamp((s.o-0.16)/0.05,0,1),fr=s.lit?(ff>.7?0:ff>.4?1:2):3;
  if(fr===3&&s.t-s.outT>2.5){ctx.save();ctx.beginPath();ctx.rect(cx-80,base-58,160,100);ctx.clip();spr('flame3',cx,base-40,80);ctx.restore();}
  else spr('flame'+fr,cx,base-(fr===0?58:fr===1?48:fr===2?45:40),fr===0?120:fr===1?100:fr===2?92:80);
  if(!s.p.wick){box(cx-6,base-72,12,14,'#f7f0e4',null,3);}
  // 성냥
  const mt=s.t-s.match;if(mt>=0&&mt<0.9)spr('match',cx+40-mt*20,base-110+mt*30,70,{rot:-0.6});
  // 유리 덮개
  const jh=V?190:290,jw=V?170:250,y=lerp(base-jh/2-200,base-jh/2+4,s.cy);spr('bell_jar',cx,y,jh,{w:jw,a:.5});
  // 기체 막대
  ccard(470,30,310,220,'병 속 공기');
  const bar=(lab,v,max,col,y,str)=>{txt(lab,490,y,CC.ink,13,true);box(490,y+12,200,16,'#f1ebe3',null,8);ctx.fillStyle=col;ctx.fillRect(490,y+12,200*clamp(v/max,0,1),16);txt(str,700,y+20,col,13,true);};
  bar('산소',s.o,0.21,CC.blue,72,(s.o*100).toFixed(1)+'%');bar('이산화탄소',s.c,0.04,CC.red,132,(s.c*100).toFixed(1)+'%');
  txt('산소가 약 16%보다 줄면 촛불이 꺼져요',490,196,CC.sub,11,true);
  if(s.cov&&s.lit)txt('타는 시간 '+s.burnT.toFixed(1)+'초',490,226,CC.ink,13,true);else if(s.last)txt(`지난번: ${s.last.V===0.3?'작은':'큰'} 병에서 ${s.last.t.toFixed(1)}초`,490,226,CC.ink,13,true);
  // 불의 세 조건
  ccard(470,264,310,150,'불이 타려면');const ox=625,oy=352,R=52,pts=[[ox,oy-R],[ox-R*1.1,oy+R*.6],[ox+R*1.1,oy+R*.6]];
  ctx.strokeStyle=CC.line;ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.stroke();
  const has=[!!s.p.wick,s.o>0.16,s.lit||mt<0.9&&mt>=0];[['탈 물질',0],['산소',1],['높은 온도',2]].forEach(([t,i])=>{const p=pts[i];txt(t,p[0]+(i===1?-6:i===2?6:0),p[1]+(i===0?-4:14),has[i]?CC.red:'#b9aa9c',13,true,i===1?'right':i===2?'left':'center','rgba(255,255,255,.9)');});},
 now(s){if(s.msg==='nowick')return '불이 붙지 않아요. <b>탈 물질</b>(심지)이 없으면 산소가 있어도 불이 붙을 수 없어요.';
  if(s.msg==='noox')return '병 속 산소가 모자라서 불이 붙지 않아요. 병을 벗겨 새 공기를 넣어 주세요.';
  if(s.lit&&s.cov)return '병 안에서 불이 산소를 쓰고 있어요. 산소는 줄고 <b>이산화탄소와 물</b>이 생겨요.';
  if(s.last&&!s.lit)return `불이 꺼졌어요. 병 속 산소를 다 써서예요. ${s.last.V===0.3?'작은':'큰'} 병에서 ${s.last.t.toFixed(1)}초 탔어요. 병 속에는 이제 이산화탄소가 많아요.`;
  if(s.lit)return '불이 타고 있어요. <b>병 씌우기</b>를 눌러 보세요.';
  return '<b>불 붙이기</b>를 눌러 초에 불을 붙여요.';},
 rec(s){return '';},
 why:`<p>불이 타려면 세 가지가 모두 있어야 해요.</p><ul><li><b>산소</b>: 불이 계속 탈 수 있게 해 줘요</li><li><b>탈 물질</b>: 없으면 산소가 있어도 불이 붙지 않아요</li><li><b>불이 붙을 수 있는 높은 온도</b></li></ul>
<p>촛불에 병을 씌우면 바깥 공기가 들어오지 못해 병 속 산소만 쓸 수 있어요. 산소를 다 쓰면 불은 저절로 꺼져요. 이때 불은 산소를 쓰는 대신 <b>이산화탄소와 물</b>을 내놓아요. 그래서 이 방법으로도 이산화탄소를 모을 수 있어요.</p><p>병이 크면 그 안의 산소가 많아서 더 오래 타요. (불이 위험할 수 있으니 실제 실험은 어른과 함께 해요.)</p>`,
 tryIt:['작은 병과 큰 병에서 타는 시간을 재서 비교해 보세요.','심지를 없애고 불을 붙여 보세요. 세 조건 중 무엇이 빠졌나요?','불이 꺼진 뒤 바로 다시 불을 붙이면 어떻게 될까요?']});

EX.push({course:'ice',id:'co2ice',lesson:2,name:'이산화탄소 병과 공기 병',size:[800,460],
 ask:'<b>예상해 보기</b> 일반 공기가 든 병과 이산화탄소가 든 병에 같은 얼음을 넣고 열전구를 비춰요. 어느 병의 얼음이 더 많이 녹을까요?',
 controls:[{type:'seg',key:'dL',label:'공기 병과 전구 거리',opts:[[25,'25cm'],[30,'30cm'],[35,'35cm']],val:30},{type:'seg',key:'dR',label:'이산화탄소 병과 전구 거리',opts:[[25,'25cm'],[30,'30cm'],[35,'35cm']],val:30},
  {type:'seg',key:'min',label:'두는 시간',opts:[[10,'10분'],[20,'20분'],[30,'30분']],val:20}],
 buttons:[{label:'실험하기',act:'go'},{label:'기록 지우기',act:'clear',ghost:true}],
 recs:[],
 melt(gas,d,min){const k=(gas==='co2'?0.066:0.0399)*(0.3+0.7*Math.pow(30/d,2));return 60*(1-Math.exp(-k*min));},
 reset(s){s.run=false;s.u=0;s.res=null;},
 param(s){this.reset(s);},
 act(s,a){if(a==='clear'){this.recs=[];return this.reset(s);}if(a==='go'&&!s.run){const n=()=>1+rnd(-.04,.04);s.res={a:this.melt('air',s.p.dL,s.p.min)*n(),c:this.melt('co2',s.p.dR,s.p.min)*n(),p:{...s.p}};s.run=true;s.u=0;}},
 step(s,dt){if(!s.run)return;s.u=Math.min(1,s.u+dt/4);if(s.u>=1){s.run=false;this.recs.push(s.res);if(this.recs.length>5)this.recs.shift();sfx('timer-done');}},
 draw(s){paper('#f8f5ef');const r=s.res,u=r?s.u:0,fair=s.p.dL===s.p.dR;
  [['air',150,'일반 공기',s.p.dL,r?r.a:0],['co2',390,'이산화탄소',s.p.dR,r?r.c:0]].forEach(([g,cx,name,d,ml])=>{const melted=ml*u,base=330,lampY=base-150-(d-30)*4;
   const glow=ctx.createRadialGradient(cx,base-60,10,cx,base-60,140);glow.addColorStop(0,'rgba(255,190,90,.25)');glow.addColorStop(1,'rgba(255,190,90,0)');ctx.fillStyle=glow;ctx.fillRect(cx-150,60,300,300);
   spr('lamp_on',cx+46,lampY-30,120,{flip:true});txt(d+'cm',cx+100,lampY+30,CC.sub,11,true,'center');
   spr('bottle',cx,base-80,170,{w:110,a:.9});if(g==='co2'){ctx.fillStyle='rgba(226,99,106,.08)';rr(cx-48,base-150,96,148,30);ctx.fill();}
   const wl=melted/60*55;ctx.fillStyle='rgba(110,170,225,.5)';ctx.fillRect(cx-46,base-6-wl,92,wl);
   for(let i=0;i<4;i++){const m=15-melted/4;drawIce(cx-24+(i%2)*48,base-8-wl-Math.floor(i/2)*26,Math.max(0,m),15,28);}
   txt(name,cx,base+24,g==='co2'?CC.red:CC.blue,14,true,'center');
   // 눈금 실린더
   const qx=cx+90,qy=base+60;if(r&&u>=1){spr('cylinder',qx,qy-70,140,{w:56});const h=ml/60*100;ctx.fillStyle='rgba(110,170,225,.6)';ctx.fillRect(qx-12,qy-14-h,24,h);txt(ml.toFixed(1)+'mL',qx,qy+12,CC.ink,13,true,'center');}});
  if(!fair)txt('전구 거리가 달라요! 통제 변인이 하나 더 달라졌어요',270,40,CC.red,13,true,'center','rgba(255,255,255,.9)');
  if(s.run)txt(Math.round(s.p.min*u)+'분 지남',270,40+(fair?0:26),CC.ink,13,true,'center','rgba(255,255,255,.9)');
  // 표
  ccard(560,24,224,410,'녹은 물의 양 (mL)');txt('회',584,64,CC.sub,12,true,'center');txt('공기',650,64,CC.blue,12,true,'center');txt('CO₂',728,64,CC.red,12,true,'center');
  this.recs.forEach((q,i)=>{const y=96+i*36,ok=q.p.dL===q.p.dR;txt((i+1)+'차',584,y,CC.ink,13,true,'center');txt(q.a.toFixed(1),650,y,CC.ink,13,false,'center');txt(q.c.toFixed(1),728,y,CC.ink,13,false,'center');if(!ok)txt('!',770,y,CC.red,13,true,'center');});
  if(this.recs.length){const A=this.recs.reduce((a,q)=>a+q.a,0)/this.recs.length,C=this.recs.reduce((a,q)=>a+q.c,0)/this.recs.length,y=96+this.recs.length*36+8;line(574,y-18,770,y-18,CC.line,1.5);
   txt('평균',584,y,CC.ink,13,true,'center');txt(A.toFixed(1),650,y,CC.blue,14,true,'center');txt(C.toFixed(1),728,y,CC.red,14,true,'center');}
  else txt('실험하기를 누르면 기록돼요',672,110,CC.sub,12,true,'center');
  if(this.recs.length<3)txt(`실험은 3번 이상! (지금 ${this.recs.length}번)`,672,410,CC.purple,12,true,'center');},
 now(s){if(s.run)return '두 병을 같은 시간 동안 열전구 아래 두고 있어요.';
  if(s.res){const d=s.res.c-s.res.a;return `이산화탄소 병의 얼음이 <b>${Math.abs(d).toFixed(1)}mL ${d>0?'더':'덜'}</b> 녹았어요.`+(s.res.p.dL!==s.res.p.dR?' 그런데 전구 거리가 달라서, 이 차이가 기체 때문인지 거리 때문인지 알 수 없어요.':(this.recs.length<3?' 우연일 수도 있으니 3번 이상 해 보세요.':' 여러 번 해도 결과가 같다면 믿을 만해요.'));}
  return '조건을 고르고 <b>실험하기</b>를 눌러요.';},
 why:`<p>강의의 실험 계획이에요.</p><ul><li><b>가설</b>: 이산화탄소는 얼음이 녹는 속도를 더 빠르게 할 것이다</li><li><b>조작 변인</b>: 병 속 기체 (이산화탄소 / 일반 공기)</li><li><b>통제 변인</b>: 병 크기, 얼음 크기와 개수, 두는 시간, 전구와의 거리 등 기체 말고 모든 것</li><li><b>종속 변인</b>: 얼음이 녹은 물의 양 (눈금 실린더로 재요)</li></ul>
<p>강의 실험에서는 공기 병이 33~34mL, 이산화탄소 병이 40mL를 훌쩍 넘었어요. 이산화탄소는 열을 붙잡아 두는 <b>온실가스</b>라서 병 속 온도가 더 올라가요. 지구에서도 이산화탄소가 늘면 지구 온도가 올라가고 빙하가 녹아요.</p>
<p>실험은 한 번만 하면 오류나 우연 때문일 수 있어서 <b>3번 이상</b> 해야 해요. 강의에서는 전구와 두 병 사이 거리를 정확히 맞추지 못한 점을 아쉬운 점(제언)으로 적었어요.</p>`,
 tryIt:['같은 조건으로 3번 실험해서 평균을 비교해 보세요.','이산화탄소 병만 전구에서 멀리(35cm) 두면 결과가 어떻게 바뀌나요?','두는 시간을 바꾸면 차이가 커질까요, 작아질까요?']});

/* ================= 3차시 ================= */
const RSEC=[['motive','I. 연구 동기 및 목적'],['hyp','II. 가설 설정'],['method','III. 연구 방법'],['result','IV. 연구 결과'],['concl','V. 결론 및 제언'],['ref','VI. 참고 문헌']];
const RCARDS=[['motive','얼음이 빨리 녹는 까닭을 알면 북극 빙하가 녹는 것을 막는 방법을 생각하는 데 도움이 될 것 같았다.'],
 ['hyp','이산화탄소가 든 병의 얼음이 일반 공기가 든 병의 얼음보다 더 빨리 녹을 것이다.'],
 ['method','1. 탄산수로 이산화탄소를 모은다 2. 두 병에 같은 얼음을 4개씩 넣는다 3. 열전구 아래 같은 시간 둔다 4. 녹은 물을 잰다'],
 ['result','table'],
 ['concl','이산화탄소 병의 얼음이 더 많이 녹았다. 다음에는 전구와 병 사이 거리도 똑같이 맞추고 싶다.'],
 ['ref','탄소중립 정책포털, 검색어: 지구온난화, 인터넷 주소, 찾아본 날짜'],
 ['trash','선생님이 하라고 해서 이 실험을 하게 되었다.']];
EX.push({course:'ice',id:'report',lesson:3,name:'보고서 조각 맞추기',size:[800,620],sizeM:[400,1190],
 ask:'<b>생각해 보기</b> 오른쪽 문장 조각을 하나 누르고, 왼쪽 보고서에서 알맞은 칸을 눌러 넣어 보세요. 보고서에 쓰면 안 되는 문장은 휴지통으로!',
 controls:[],
 buttons:[{label:'채점하기',act:'check'},{label:'처음부터',act:'reset',ghost:true}],
 reset(s){const C=RCARDS.map((c,i)=>({a:c[0],t:c[1],i,at:null}));for(let i=C.length-1;i>0;i--){const j=rint(i+1);[C[i],C[j]]=[C[j],C[i]];}s.cards=C;s.sel=-1;s.checked=false;s.age=9;},
 slotGeo(k){const m=W<600,i=k==='trash'?6:RSEC.findIndex(r=>r[0]===k);return m?{x:10,y:44+i*82,w:380,h:74}:k==='trash'?{x:28,y:534,w:400,h:72}:{x:28,y:48+i*80,w:400,h:72};},
 cardGeo(i){return W<600?{x:10,y:640+i*78,w:380,h:70}:{x:452,y:20+i*84,w:328,h:78};},
 click(s,x,y){const inR=(g)=>x>=g.x&&x<=g.x+g.w&&y>=g.y&&y<=g.y+g.h;
  for(let i=0;i<s.cards.length;i++){const c=s.cards[i];if(c.at===null&&inR(this.cardGeo(i))){s.sel=s.sel===i?-1:i;sfx('drag-start');return;}}
  const keys=[...RSEC.map(r=>r[0]),'trash'];for(const k of keys){if(inR(this.slotGeo(k))){const placed=s.cards.find(c=>c.at===k);
    if(s.sel>=0){if(placed)placed.at=null;s.cards[s.sel].at=k;s.sel=-1;s.checked=false;sfx('drop');}else if(placed){placed.at=null;s.checked=false;sfx('pop-down');}return;}}},
 act(s,a){if(a==='reset')return this.reset(s);if(a==='check'){s.checked=true;s.age=0;sfx(s.cards.every(c=>c.at===c.a)?'puzzle-solved':'buzzer-wrong');}},
 step(s,dt){s.age+=dt;},
 cardBody(c,x,y,w,size){if(c.t==='table'){const cols=[x+40,x+130,x+230],rows=[['','공기 병','이산화탄소 병'],['1차','33mL','44mL'],['2차','34mL','43mL'],['3차','32mL','45mL']];
   rows.forEach((r,i)=>r.forEach((v,j)=>txt(v,cols[j],y+i*size*FS*1.3,i===0||j===0?CC.sub:CC.ink,size,i===0||j===0,'center')));return;}
  wrapTxt(c.t,x,y,w,size,CC.ink,false,1.35);},
 draw(s){paper('#fffdf9');const m=W<600;txt('실험 보고서',m?200:228,24,CC.ink,17,true,'center');if(m)txt('문장 조각 (하나 눌러 고른 뒤 위 칸을 눌러요)',10,622,CC.sub,12,true);
  RSEC.forEach(([k,t])=>{const g=this.slotGeo(k),c=s.cards.find(c=>c.at===k);box(g.x,g.y,g.w,g.h,c?'#fff':'#fbf6ee',s.sel>=0?CC.purple:CC.line,10,s.sel>=0?2:1.5);
   txt(t,g.x+10,g.y+13,CC.sub,11.5,true);if(c){this.cardBody(c,g.x+12,g.y+30,g.w-24,11);if(s.checked){const ok=c.at===c.a;circle(g.x+g.w-14,g.y+14,10,ok?CC.green:CC.red);txt(ok?'○':'✕',g.x+g.w-14,g.y+15,'#fff',11,true,'center');}}
   else txt('여기를 눌러 넣기',g.x+g.w/2,g.y+38,'#c9b8a8',11,true,'center');});
  {const g=this.slotGeo('trash'),c=s.cards.find(c=>c.at==='trash');box(g.x,g.y,g.w,g.h,'#f4f0ea','#c9b8a8',10,1.5);txt('휴지통 (보고서에 쓰면 안 되는 문장)',g.x+10,g.y+12,CC.sub,11,true);
   if(c){wrapTxt(c.t,g.x+12,g.y+32,g.w-24,11,'#9a8a7c');if(s.checked){const ok=c.a==='trash';circle(g.x+g.w-14,g.y+14,10,ok?CC.green:CC.red);txt(ok?'○':'✕',g.x+g.w-14,g.y+15,'#fff',11,true,'center');}}}
  s.cards.forEach((c,i)=>{const g=this.cardGeo(i);if(c.at!==null){box(g.x,g.y,g.w,g.h,'#f6f1ea',null,10);txt('넣었어요',g.x+g.w/2,g.y+g.h/2,'#c9b8a8',12,true,'center');return;}
   const on=s.sel===i;box(g.x,g.y-(on?3:0),g.w,g.h,on?'#f2ecfb':'#fffbe8',on?CC.purple:'#e5d49a',10,on?3:1.5);this.cardBody(c,g.x+12,g.y+16-(on?3:0),g.w-24,11.5);});},
 now(s){if(s.checked){const ok=s.cards.filter(c=>c.at===c.a).length;return ok===s.cards.length?'보고서가 완성됐어요! 연구 동기와 가설, 방법은 <b>실험 계획서</b>에서, 결과와 결론은 <b>실험 결과</b>에서 가져와요.':`${s.cards.length}개 중 <b>${ok}개</b> 맞았어요. ✕ 칸을 눌러 빼고 다시 넣어 보세요.`;}
  return s.sel>=0?'이제 왼쪽 보고서에서 알맞은 칸을 눌러요.':'오른쪽 문장 조각을 하나 눌러 고르세요.';},
 why:`<p>실험은 하는 것만큼 <b>결과를 잘 정리하는 것</b>도 중요해요. 강의에서는 한글 프로그램(또는 웹에서 쓰는 한컴독스)으로 보고서를 만들었어요.</p>
<ul><li><b>연구 동기 및 목적</b>: 실험 계획서의 탐구 동기와 기대 효과를 바탕으로 써요. 첫 줄은 들여쓰기</li><li><b>가설 설정</b>, <b>연구 방법</b>: 실험 계획서의 가설과 실험 과정을 옮겨요. 번호 아래 항목은 안으로 들여 써요</li><li><b>연구 결과</b>: 줄글보다 <b>표</b>로 정리하면 한눈에 보여요 (1차, 2차, 3차를 한 표에)</li><li><b>결론 및 제언</b>: 결과로 알게 된 사실(결론)과 아쉬웠던 점, 다음에 해 보고 싶은 것(제언)</li><li><b>이론적 배경</b>: 내 머릿속 생각이 아니라 <b>검색해서 찾은</b> 배경 지식을 내 말로 정리해요</li><li><b>참고 문헌</b>: 찾아본 사이트 이름, 검색어, 인터넷 주소, 찾아본 날짜를 적어요</li></ul>
<p>제목은 이 실험이 무엇에 대한 실험이었는지가 드러나게 써요. 쓰는 중간중간 꼭 <b>저장</b>하세요!</p>`,
 tryIt:['연구 결과를 줄글로 쓴 것과 표로 쓴 것 중 어느 쪽이 보기 쉬운지 이야기해 보세요.','내가 한 실험으로 결론 및 제언을 한 문장씩 써 보세요.']});

/* ================= 4차시 ================= */
const RB={cols:5,rows:4,start:[0,3,1],goal:[2,1],walls:[[4,3],[3,0]]};   // 방향: 0 위,1 오른쪽,2 아래,3 왼쪽
const DIRV=[[0,-1],[1,0],[0,1],[-1,0]];
const RPROG={seq:{name:'순차 구조',code:[['F'],['F'],['F'],['L'],['F'],['F'],['L'],['F']]},
 rep:{name:'반복 구조',code:[['F'],['R2',[['F'],['F'],['L']]],['F']]},
 cond:{name:'조건 구조',code:[['UNTIL',[['IF']]]]}};
EX.push({course:'ice',id:'robot',lesson:4,name:'로봇 길 찾기',size:[800,440],
 ask:'<b>생각해 보기</b> 로봇을 깃발까지 보내요. 같은 길도 <b>순차·반복·조건 구조</b>로 다르게 짤 수 있어요. 어느 코드가 가장 짧을까요?',
 controls:[{type:'seg',key:'mode',label:'코드',opts:[['mine','내가 짜기'],['seq','순차 구조'],['rep','반복 구조'],['cond','조건 구조']],val:'mine',wide:true}],
 buttons:[{label:'앞으로 한 칸',act:'F'},{label:'왼쪽으로 돌기',act:'L'},{label:'오른쪽으로 돌기',act:'R'},{label:'실행',act:'run'},{label:'블록 지우기',act:'clear',ghost:true}],
 reset(s){s.mine=s.mine||[];s.pos=[...RB.start];s.ang=s.pos[2]*90;s.run=null;s.res=null;s.hl=-1;s.dx=s.pos[0];s.dy=s.pos[1];},
 param(s){this.reset(s);},
 wall(x,y){return x<0||y<0||x>=RB.cols||y>=RB.rows||RB.walls.some(w=>w[0]===x&&w[1]===y);},
 /* 코드를 한 동작씩 펼쳐요: [동작, 강조할 블록 번호] */
 expand(code){const out=[];let idx=0;const walk=(c)=>c.forEach(b=>{const me=idx++;if(b[0]==='R2'){const st=idx;for(let k=0;k<2;k++){idx=st;walk(b[1]);}}else if(b[0]==='UNTIL'){out.push(['UNTIL',me]);idx++;}else out.push([b[0],me]);});walk(code);return out;},
 count(code){let n=0;const w=c=>c.forEach(b=>{n++;if(b[0]==='R2')w(b[1]);if(b[0]==='UNTIL')n+=3;});w(code);return n;},
 code(s){return s.p.mode==='mine'?s.mine.map(a=>[a]):RPROG[s.p.mode].code;},
 act(s,a){if('FLR'.includes(a)&&a.length===1){if(s.p.mode!=='mine'){s.p.mode='mine';buildControls();}if(s.mine.length<16)s.mine.push(a);this.reset(s);return;}
  if(a==='clear'){s.mine=[];return this.reset(s);}
  if(a==='run'){this.reset(s);s.run={q:this.expand(this.code(s)),k:0,t:0};s.cond=s.p.mode==='cond';}},
 step(s,dt){s.dx+=(s.pos[0]-s.dx)*Math.min(1,dt*10);s.dy+=(s.pos[1]-s.dy)*Math.min(1,dt*10);s.ang+=(s.pos[2]*90-s.ang)*Math.min(1,dt*10);
  const R=s.run;if(!R)return;R.t+=dt;if(R.t<0.42)return;R.t=0;
  let op,hl;if(s.cond){if(s.pos[0]===RB.goal[0]&&s.pos[1]===RB.goal[1]){s.run=null;s.res='goal';s.hl=-1;sfx('level-complete');return;}
   const [vx,vy]=DIRV[s.pos[2]];op=this.wall(s.pos[0]+vx,s.pos[1]+vy)?'L':'F';hl=1;R.k++;if(R.k>40){s.run=null;s.res='lost';return;}}
  else{if(R.k>=R.q.length){s.run=null;const g=s.pos[0]===RB.goal[0]&&s.pos[1]===RB.goal[1];s.res=g?'goal':'short';sfx(g?'level-complete':'cancel');s.hl=-1;return;}[op,hl]=R.q[R.k++];}
  s.hl=hl;if(op==='L'){s.pos[2]=(s.pos[2]+3)%4;s.ang-=0;sfx('select-soft');}else if(op==='R'){s.pos[2]=(s.pos[2]+1)%4;sfx('select-soft');}
  else if(op==='F'){const [vx,vy]=DIRV[s.pos[2]],nx=s.pos[0]+vx,ny=s.pos[1]+vy;if(this.wall(nx,ny)){s.run=null;s.res='bump';sfx('bonk');return;}s.pos[0]=nx;s.pos[1]=ny;sfx('step-retro',{volume:.8});}},
 draw(s){paper('#f5f9f2');const C=72,ox=24,oy=60;txt('위에서 본 모습',ox,34,CC.sub,12,true);
  for(let y=0;y<RB.rows;y++)for(let x=0;x<RB.cols;x++){box(ox+x*C+2,oy+y*C+2,C-4,C-4,(x+y)%2?'#eaf2e3':'#f2f7ec',null,8);}
  RB.walls.forEach(([x,y])=>{if(!spr('crate',ox+x*C+C/2,oy+y*C+C/2,C-8))box(ox+x*C+6,oy+y*C+6,C-12,C-12,'#d9a86c','#8a5a3c',6,2);});
  spr('goal_flag',ox+RB.goal[0]*C+C/2,oy+RB.goal[1]*C+C/2-4,C-10);
  const rx=ox+s.dx*C+C/2,ry=oy+s.dy*C+C/2;if(!spr('robot_top',rx,ry,C-14,{rot:s.ang*Math.PI/180}))circle(rx,ry,C/3,'#fff','#8a5a3c',2);
  if(s.res==='bump')txt('쿵! 벽에 부딪혔어요',ox+C*2.5,oy+C*4+22,CC.red,14,true,'center');
  if(s.res==='goal')txt('도착!',ox+C*2.5,oy+C*4+22,CC.green,16,true,'center');
  if(s.res==='short')txt('깃발에 닿지 못했어요',ox+C*2.5,oy+C*4+22,CC.red,14,true,'center');
  // 코드 블록
  const bx=420;ccard(bx,16,364,408,(s.p.mode==='mine'?'내 코드':RPROG[s.p.mode].name)+'  ·  블록 '+this.count(this.code(s))+'개');
  let y=56,idx=0;const blk=(label,depth,col)=>{const me=idx++,on=me===s.hl,x=bx+16+depth*24,w=330-depth*24;box(x,y,w,30,on?col:col+'22',col,8,on?2.5:1.5);txt(label,x+12,y+15,on?'#fff':CC.ink,12.5,true);y+=36;return me;};
  txt('시작하기 버튼을 클릭했을 때',bx+16,y+8,CC.gold,12,true);y+=26;
  const name={F:'앞으로 한 칸 가기',L:'왼쪽으로 90도 돌기',R:'오른쪽으로 90도 돌기'};
  const walk=(c,d)=>c.forEach(b=>{if(b[0]==='R2'){blk('2번 반복하기',d,CC.gold);walk(b[1],d+1);}else if(b[0]==='UNTIL'){blk('깃발에 닿을 때까지 반복하기',d,CC.gold);blk('만약 앞에 벽이 있다면: 왼쪽으로 돌기 / 아니면: 앞으로 한 칸',d+1,CC.purple);}else blk(name[b[0]],d,CC.blue);});
  const code=this.code(s);if(!code.length)txt('아래 버튼으로 블록을 쌓아요',bx+182,140,CC.sub,13,true,'center');walk(code,0);},
 now(s){const n=this.count(this.code(s));
  if(s.res==='goal')return `도착했어요! <b>${s.p.mode==='mine'?'내 코드':RPROG[s.p.mode].name}</b>는 블록 ${n}개로 갔어요.`+(s.p.mode==='seq'?' 반복되는 부분을 묶으면 더 짧아져요.':s.p.mode==='cond'?' "만약"을 쓰니 가장 짧아졌어요.':'');
  if(s.res==='bump')return '벽에 부딪혔어요. 어디서 방향을 바꿔야 할까요?';if(s.res==='short')return '명령이 끝났지만 깃발에 닿지 못했어요. 블록을 더 쌓아 보세요.';
  if(s.run)return '코드를 위에서부터 차례대로 실행하고 있어요.';
  return s.p.mode==='mine'?'버튼으로 블록을 쌓고 <b>실행</b>을 눌러요. (로봇은 지금 오른쪽을 보고 있어요)':'완성된 코드를 보고 <b>실행</b>을 눌러 보세요.';},
 why:`<p><b>코딩</b>은 컴퓨터가 알아듣는 말로 명령을 입력하는 거예요. 컴퓨터는 전기가 들어오는지(1) 안 들어오는지(0)만 알아서, 사람이 쓰기 쉬운 <b>프로그래밍 언어</b>와 블록을 끼워 맞추는 <b>블록 코딩</b>(엔트리, 스크래치, 엠블록)이 만들어졌어요.</p>
<ul><li><b>순차 구조</b>: 처음부터 차례대로 하나씩 실행해요 (블록 8개)</li><li><b>반복 구조</b>: 되풀이되는 부분을 묶어 반복해요 (블록 6개)</li><li><b>조건 구조</b>: "만약 ~라면"으로 상황에 따라 하나를 골라요 (블록 4개)</li></ul><p>같은 동작도 여러 가지 코드로 짤 수 있어서 코딩에는 하나의 정답이 없어요. 세 구조를 알맞게 섞으면 더 효율적인 코드가 돼요.</p>`,
 tryIt:['내가 짜기로 깃발까지 가는 코드를 만들어 보세요. 블록이 몇 개 필요했나요?','순차 구조와 반복 구조를 실행해 보고, 로봇의 움직임이 같은지 비교해 보세요.','조건 구조에서 로봇이 벽 앞에서 어떻게 판단하는지 살펴보세요.']});

EX.push({course:'ice',id:'flyxy',lesson:4,name:'데카르트의 파리와 좌표',size:[800,460],
 ask:'<b>생각해 보기</b> 천장의 파리 위치를 수로 나타낼 수 있을까요? 기준점에서 <b>오른쪽으로 몇 칸(x)</b>, <b>위로 몇 칸(y)</b>인지 맞혀 보세요.',
 controls:[{type:'seg',key:'mode',label:'놀이',opts:[['fly','파리 좌표 맞히기'],['move','고양이 이동하기 (엔트리 좌표)']],val:'fly',wide:true},
  {type:'range',key:'x',label:'x',min:0,max:8,step:1,val:0},{type:'range',key:'y',label:'y',min:0,max:6,step:1,val:0},
  {type:'range',key:'ex',label:'엔트리 x',min:-220,max:220,step:10,val:100},{type:'range',key:'ey',label:'엔트리 y',min:-120,max:120,step:10,val:-40},
  {type:'seg',key:'how',label:'이동 블록',opts:[['now','x, y 위치로 이동하기'],['two','2초 동안 x, y 위치로 이동하기']],val:'two',wide:true}],
 buttons:[{label:'확인 / 이동하기',act:'go'},{label:'파리 날리기',act:'fly'}],
 reset(s){s.fly=s.fly||[3,4];s.fp=s.fp||[3,4];s.res=null;s.age=9;s.cat=s.cat||[-200,-80];s.cp=[...s.cat];s.mv=null;},
 param(s,k){s.res=null;},
 act(s,a){if(a==='fly'){let n;do{n=[rint(9),rint(7)];}while(n[0]===s.fly[0]&&n[1]===s.fly[1]);s.fly=n;s.res=null;s.age=0;sfx('bee-buzz',{volume:.6});if(s.p.mode!=='fly'){s.p.mode='fly';buildControls();}return;}
  if(a==='go'){if(s.p.mode==='fly'){s.res=s.p.x===s.fly[0]&&s.p.y===s.fly[1]?'ok':'no';s.age=0;sfx(s.res==='ok'?'ding-correct':'buzzer-wrong');}
   else{const to=[s.p.ex,s.p.ey];if(s.p.how==='now'){s.cat=to;s.cp=[...to];sfx('teleport',{volume:.6});}else{s.mv={from:[...s.cp],to,t:0};s.cat=to;}}}},
 step(s,dt){s.age+=dt;const f=s.fp;f[0]+=(s.fly[0]-f[0])*Math.min(1,dt*3);f[1]+=(s.fly[1]-f[1])*Math.min(1,dt*3);
  if(s.mv){s.mv.t+=dt/2;const u=Math.min(1,s.mv.t);s.cp=[lerp(s.mv.from[0],s.mv.to[0],u),lerp(s.mv.from[1],s.mv.to[1],u)];if(Math.floor(s.mv.t*8)!==s.mv.k){s.mv.k=Math.floor(s.mv.t*8);sfx('step-wood',{volume:.5});}if(u>=1)s.mv=null;}},
 draw(s){if(s.p.mode==='fly'){paper('#fbf7f0');const C=46,ox=70,oy=380;
   for(let i=0;i<=8;i++){line(ox+i*C,oy,ox+i*C,oy-6*C,'#e2d6c6',1.5);txt(i,ox+i*C,oy+16,CC.sub,12,true,'center');}
   for(let j=0;j<=6;j++){line(ox,oy-j*C,ox+8*C,oy-j*C,'#e2d6c6',1.5);txt(j,ox-16,oy-j*C,CC.sub,12,true,'center');}
   arrow(ox,oy,ox+8*C+26,oy,CC.blue,3,'x',ox+8*C+34,oy,'left');arrow(ox,oy,ox,oy-6*C-26,CC.red,3,'y',ox,oy-6*C-38,'center');circle(ox,oy,5,CC.ink);txt('기준점 0',ox+6,oy+34,CC.ink,12,true);
   const fx=ox+s.fp[0]*C,fy=oy-s.fp[1]*C,buzz=s.age<1?Math.sin(s.age*60)*3:0;spr('fly',fx+buzz,fy,40,{rot:Math.sin(NOW()*3)*.15});
   const gx=ox+s.p.x*C,gy=oy-s.p.y*C;line(ox,gy,gx,gy,CC.blue+'99',2,[5,5]);line(gx,oy,gx,gy,CC.red+'99',2,[5,5]);circle(gx,gy,9,null,CC.purple,3);
   ccard(500,40,284,200,'나의 답');txt(`(x: ${s.p.x}, y: ${s.p.y})`,642,104,CC.purple,22,true,'center');
   if(s.res)txt(s.res==='ok'?'정답이에요!':'다시 세어 보세요',642,158,s.res==='ok'?CC.green:CC.red,18,true,'center');
   if(s.res==='ok')txt(`파리는 x ${s.fly[0]}, y ${s.fly[1]}에 있어요`,642,196,CC.ink,13,true,'center');}
  else{paper('#eef6fb');const X=v=>40+(v+240)/480*440,Y=v=>230-v/135*190*0.98;box(40,40,440,380,'#fff',CC.line,10);
   line(X(0),40,X(0),420,'#cfdbe6',1.5);line(40,Y(0),480,Y(0),'#cfdbe6',1.5);txt('(0, 0)',X(0)+6,Y(0)+12,CC.sub,11,true);
   [[-240,'−240'],[240,'240']].forEach(([v,t])=>txt(t,X(v),Y(0)-10,CC.sub,10,true,v<0?'left':'right'));[[135,'135'],[-135,'−135']].forEach(([v,t])=>txt(t,X(0)+6,Y(v)+(v>0?12:-10),CC.sub,10,true));
   circle(X(s.p.ex),Y(s.p.ey),8,null,CC.purple,3);txt(`(${s.p.ex}, ${s.p.ey})`,X(s.p.ex)+12,Y(s.p.ey)-14,CC.purple,12,true);
   const walking=!!s.mv,bob=walking?Math.abs(Math.sin(NOW()*14))*6:0,flip=walking&&s.mv.to[0]<s.mv.from[0];spr('cat_point',X(s.cp[0]),Y(s.cp[1])-34-bob,80,{flip});
   ccard(500,40,284,200,'블록');const t=s.p.how==='now'?`x: ${s.p.ex} y: ${s.p.ey} 위치로 이동하기`:`2초 동안 x: ${s.p.ex} y: ${s.p.ey} 위치로 이동하기`;box(516,80,252,64,'#e8f3fd',CC.blue,10,2);wrapTxt(t,530,102,228,13,CC.ink,true);
   txt(`고양이 위치 x: ${Math.round(s.cp[0])}  y: ${Math.round(s.cp[1])}`,516,196,CC.ink,13,true);}},
 now(s){if(s.p.mode==='fly'){if(s.res==='ok')return '맞혔어요! 이렇게 위치를 (x, y) 두 수로 나타낸 것이 <b>좌표</b>예요. <b>파리 날리기</b>로 다시 해 봐요.';if(s.res==='no')return `아쉬워요. 기준점에서 오른쪽으로 몇 칸, 위로 몇 칸인지 세어 보세요.`;return 'x와 y 막대를 움직여 보라색 동그라미를 파리 위에 맞추고 <b>확인</b>을 눌러요.';}
  return '엔트리 무대는 가운데가 (0, 0)이고 x는 −240~240, y는 −135~135예요. 숫자를 바꾸고 <b>이동하기</b>를 눌러요.';},
 why:`<p><b>좌표</b>는 어떤 물체의 위치를 수로 나타낸 값이에요. 데카르트가 침대에 누워 바둑판 무늬 천장에 붙은 파리를 보다가, 기준점을 잡고 가로를 x축, 세로를 y축으로 하면 파리 위치를 수로 나타낼 수 있겠다고 생각한 데서 시작됐어요.</p>
<p>파리가 기준점에서 오른쪽으로 3칸, 위로 4칸에 있으면 x는 3, y는 4예요.</p><p>엔트리에서는 오브젝트 아래에 x, y 좌표가 나와요. <b>x, y 위치로 이동하기</b>는 순간 이동하고, <b>2초 동안 x, y 위치로 이동하기</b>는 2초에 걸쳐 걸어가요. 장면이 시작될 때 처음 위치를 정해 두면 늘 같은 자리에서 시작해요.</p>`,
 tryIt:['파리를 날리고 좌표를 5번 연속 맞혀 보세요.','엔트리 좌표에서 고양이를 무대 네 귀퉁이로 보내 보세요. 각 좌표는 얼마일까요?','x만 바꾸면 고양이는 어느 쪽으로 움직이나요? y만 바꾸면요?']});

/* ================= 5차시 ================= */
const QZ=[['tr_pet','페트병','plastic'],['tr_glass','유리병','glass'],['tr_paper','신문지','paper'],['tr_can','음료 캔','can'],['tr_milk','우유팩','paper'],['tr_box','배달 음식 용기 (씻어서)','plastic']];
const BINS={plastic:['플라스틱','bin_blue'],glass:['유리','bin_green'],paper:['종이','bin_yellow'],can:['캔','bin_gray']};
EX.push({course:'ice',id:'quiz',lesson:5,name:'분리수거 도사의 퀴즈',size:[800,460],
 ask:'<b>생각해 보기</b> 다람쥐 도사가 문제를 내요. 내가 고른 답은 <b>대답</b>이라는 통(변수)에 들어가고, 코드가 정답인지 판단해요.',
 controls:[],
 buttons:[{label:'플라스틱',act:'plastic'},{label:'유리',act:'glass'},{label:'종이',act:'paper'},{label:'캔',act:'can'},{label:'다음 문제',act:'next',ghost:true}],
 reset(s){s.q=s.q??0;s.ans='';s.res=null;s.age=9;s.tries=0;s.score=s.score||0;s.step=1;},
 act(s,a){if(a==='next'){s.q=(s.q+1)%QZ.length;s.ans='';s.res=null;s.tries=0;s.step=1;return;}
  if(BINS[a]){if(s.res==='ok')return;s.ans=BINS[a][0];s.age=0;s.tries++;const ok=a===QZ[s.q][2];s.res=ok?'ok':'no';if(ok&&s.tries===1)s.score++;sfx(ok?'ding-correct':'buzzer-wrong');}},
 step(s,dt){s.age+=dt;},
 draw(s){paper('#f2f8ee');const Q=QZ[s.q];ctx.fillStyle='#dfecd3';ctx.fillRect(0,330,470,130);
  spr('squirrel',90,250,170);spr(s.res==='ok'?'cat_clap':s.res==='no'?'cat_sad':'cat_think',380,262,150,{flip:true});
  box(30,26,420,64,'#fff',CC.line,14,1.5);txt('분리수거 도사',44,42,CC.gold,12,true);
  const say=s.res==='ok'?'정답이야!':s.res==='no'?'틀렸어. 다시 풀어 보게.':`${Q[1]}은(는) 어디에 분리수거해야 할까?`;wrapTxt(say,44,66,390,15,s.res==='ok'?CC.green:s.res==='no'?CC.red:CC.ink,true);
  const bob=Math.sin(NOW()*2)*3;spr(Q[0],235,250+bob,90);
  Object.entries(BINS).forEach(([k,[name,pic]],i)=>{const x=60+i*105,on=s.res==='ok'&&k===Q[2];spr(pic,x,392,on?78:66);txt(name,x,440,on?CC.green:CC.ink,12,true,'center');});
  // 코드와 변수
  ccard(484,16,300,428,'이 장면의 코드');box(500,52,268,44,'#fff6df',CC.gold,10,2);txt('대답',514,74,CC.gold,13,true);box(560,62,196,24,'#fff',CC.line,6);txt(s.ans||'(비어 있음)',658,74,s.ans?CC.ink:CC.sub,13,true,'center');
  const hl=s.age<0.6&&s.res?(s.age<.3?1:2):(s.res==='ok'?3:s.res==='no'?4:1);
  const B=[[0,'"정답"이 될 때까지 반복하기',CC.gold],[1,`"${Q[1]}은(는) 어디에?" 묻고 대답 기다리기`,CC.blue],[1,`만일 대답 = ${BINS[Q[2]][0]} (이)라면`,CC.purple],[2,'"정답이야!" 말하기',CC.green],[1,'아니면',CC.purple],[2,'"틀렸어. 다시 풀어 보게." 말하기',CC.red]];
  const map=[0,1,2,3,5];let y=116;B.forEach(([d,t,col],i)=>{const on=(map[hl]===i)||(i===0&&s.res!=='ok');const x=500+d*18,w=268-d*18;box(x,y,w,40,on&&i!==0?col:col+'22',col,8,1.5);wrapTxt(t,x+10,y+14,w-16,11,on&&i!==0?'#fff':CC.ink,true,1.25);y+=48;});
  txt(`맞힌 문제 ${s.score}개 · 이번 문제 ${s.tries}번째`,500,420,CC.sub,12,true);},
 now(s){if(s.res==='ok')return `정답이에요! 대답 통에 <b>${s.ans}</b>이(가) 들어가서 "만일" 조건이 참이 됐어요. 그래서 반복이 끝났어요. <b>다음 문제</b>를 눌러요.`;
  if(s.res==='no')return `대답 통에 <b>${s.ans}</b>이(가) 들어갔는데 정답과 달라서 "아니면" 쪽으로 갔어요. 정답이 될 때까지 <b>반복</b>해서 다시 물어봐요.`;
  return '아래 버튼에서 알맞은 분리수거함을 골라요.';},
 why:`<p>이야기를 보는 사람과 <b>주고받으며</b>(상호 작용) 진행되게 하려면 세 가지가 필요해요.</p>
<ul><li><b>묻고 대답 기다리기</b>: 사용자에게 질문하고 답을 입력받아요</li><li><b>변수</b>: 변할 수 있는 값을 담아 두는 이름 붙은 통이에요. 사람마다 대답이 달라질 수 있으니 "대답"이라는 통에 담아요</li><li><b>만일 ~라면 / 아니면</b>(조건 구조): 대답이 정답과 같은지 판단해 다른 말을 해요</li></ul>
<p>그냥 순서대로만 실행하면 틀렸을 때 다시 묻지 않고 끝나 버려요. 그래서 <b>"정답이 될 때까지 반복하기"</b>로 감싸서, 맞힐 때까지 다시 묻게 했어요.</p>
<p>블록 코딩으로 이야기를 만드는 순서는 <b>주제 정하기 → 스토리보드 짜기 → 코딩 → 실행해서 확인 → 고치기</b>를 되풀이하는 거예요. 장면이 여러 개면 마지막 동작 뒤에 "다음 장면 시작하기"를 꼭 넣어요.</p>`,
 tryIt:['일부러 틀린 답을 골라 보세요. 코드의 어느 부분이 실행되나요?','우유팩과 배달 음식 용기는 어디에 버려야 할까요? 왜 씻어서 버릴까요?','나만의 분리수거 문제를 하나 만들어 보세요.']});

const IDEAS=[['shade','태양 빛 가리개',5,1,1],['tree','나무 심기',3,5,4],['bike','자전거 타기',3,4,5],['solar','태양광 패널',4,3,2],['plug','안 쓰는 플러그 뽑기',2,5,5],['bag','장바구니 쓰기',2,5,5]];
EX.push({course:'ice',id:'matrix',lesson:5,name:'의사 결정 매트릭스',size:[800,460],
 ask:'<b>생각해 보기</b> 지구온난화를 막는 아이디어 중 이야기 주제로 무엇을 고를까요? 기준마다 점수를 매겨 <b>가장 높은 아이디어</b>를 찾아요.',
 controls:[{type:'seg',key:'idea',label:'점수를 바꿀 아이디어',opts:IDEAS.map(i=>[i[0],i[1]]),val:'shade',wide:true},
  {type:'range',key:'e',label:'지구온난화를 막는 데 도움이 되나요',min:1,max:5,step:1,val:5,fmt:v=>'★'.repeat(v)},
  {type:'range',key:'f',label:'실제로 할 수 있나요',min:1,max:5,step:1,val:1,fmt:v=>'★'.repeat(v)},
  {type:'range',key:'c',label:'돈이 적게 드나요',min:1,max:5,step:1,val:1,fmt:v=>'★'.repeat(v)}],
 buttons:[{label:'처음 점수로',act:'reset',ghost:true}],
 reset(s){s.sc={};IDEAS.forEach(i=>s.sc[i[0]]=[i[2],i[3],i[4]]);this.load(s);s.age=9;},
 load(s){const v=s.sc[s.p.idea];s.p.e=v[0];s.p.f=v[1];s.p.c=v[2];},
 param(s,k){if(k==='idea'){this.load(s);buildControls();}else{s.sc[s.p.idea]=[s.p.e,s.p.f,s.p.c];s.age=0;}},
 act(s,a){if(a==='reset'){this.reset(s);buildControls();}},
 step(s,dt){s.age+=dt;},
 draw(s){paper('#fbf8f2');const T=IDEAS.map(i=>({k:i[0],n:i[1],v:s.sc[i[0]],t:s.sc[i[0]].reduce((a,b)=>a+b,0)}));const best=Math.max(...T.map(t=>t.t));
  txt('아이디어',30,30,CC.sub,12,true);['도움','할 수 있나','비용'].forEach((h,j)=>txt(h,370+j*90,30,CC.sub,12,true,'center'));txt('합계',690,30,CC.sub,12,true,'center');
  T.forEach((r,i)=>{const y=50+i*66,on=r.k===s.p.idea,top=r.t===best;box(20,y,760,58,on?'#f2ecfb':top?'#fff6df':'#fff',on?CC.purple:top?'#e5c46a':CC.line,12,on?2.5:1.5);
   spr('idea_'+r.k,52,y+29,52);txt(r.n,92,y+29,CC.ink,14,true);
   r.v.forEach((v,j)=>{for(let k=0;k<5;k++){const x=370+j*90+(k-2)*15;if(k<v){if(!spr('score_star',x,y+29,15))txt('★',x,y+29,CC.gold,12,true,'center');}else circle(x,y+29,3,'#e6dccf');}});
   const pop=on&&s.age<.3?1+(.3-s.age):1;txt(r.t,690,y+29,top?CC.red:CC.ink,18*pop,true,'center');if(top)txt('1등',745,y+29,CC.red,13,true,'center');});},
 now(s){const T=IDEAS.map(i=>[i[1],s.sc[i[0]].reduce((a,b)=>a+b,0)]).sort((a,b)=>b[1]-a[1]);
  return `지금 가장 점수가 높은 아이디어는 <b>${T[0][0]}</b>(${T[0][1]}점)이에요. 태양 빛을 가리면 온난화는 막겠지만 실현 가능성이 낮고 비용도 많이 들어요.`;},
 why:`<p>이야기 주제를 떠올릴 때는 먼저 <b>브레인스토밍</b>을 해요. 떠오르는 생각을 최대한 많이 적고, 좋은지 나쁜지 판단은 잠깐 미뤄 둬요.</p>
<p>그다음 <b>의사 결정 매트릭스</b>로 하나를 골라요. "지구온난화를 막는 데 도움이 되나?", "실현할 수 있나?", "비용은 얼마나 드나?" 같은 질문(기준)을 세우고 아이디어마다 점수를 매겨 가장 높은 것을 고르는 방법이에요.</p>
<p>강의에서 본 작은 실천도 효과가 있어요. 냉난방 온도를 1도 조절하면 1년에 이산화탄소 약 110kg, 쓰레기를 10% 줄이면 약 18kg, 집안 플러그의 절반만 뽑아도 약 78kg을 줄일 수 있어요.</p>`,
 tryIt:['내 생각대로 점수를 다시 매겨 보세요. 1등이 바뀌나요?','기준을 하나 더 만든다면 무엇이 좋을까요? (예: 친구들과 함께 할 수 있나)','1등 아이디어로 이야기의 첫 장면을 상상해 보세요.']});
