"use strict";
/* 게임 속 확률 실험 */
const MC={ink:'#1d2a3a',sub:'#5b6b80',blue:'#2f7fd1',red:'#d9534f',green:'#2e9e6b',gold:'#b88500',bar:'#7fb2ea',line:'#d6e0eb'};
const big=v=>v>=10000?fmtN(v/10000)+'만':fmtN(v);
const comb=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);};
function card(x,y,w,h,title){box(x,y,w,h,'#fff',MC.line,10);if(title)txt(title,x+12,y+17*Math.min(FS,1.3),MC.sub,12,true);}
function hbar(x,y,w,h,v,exp,col){box(x,y,w,h,'#e9eef4',null,4);ctx.fillStyle=col;ctx.fillRect(x,y,w*clamp(v,0,1),h);if(exp!=null){const ex=x+w*exp;line(ex,y-5,ex,y+h+5,MC.red,3);}}
function evDraw(num,den,x,y,size=16,align='center'){
  if(num===0){txt('0 (본전)',x,y,MC.green,size,true,align);return;}
  const col=num<0?MC.red:MC.blue,sg=num<0?'−':'+',w=tw(sg,size,true);
  if(align==='center'){txt(sg,x-w-4,y,col,size,true,'center');frac(Math.abs(num),den,x+w/2,y,size,col);}
  else{txt(sg,x,y,col,size,true,'left');frac(Math.abs(num),den,x+w+4,y,size,col,'left');}
}
const evHtml=(num,den)=>num===0?'<b style="color:#2e9e6b">0 (본전)</b>':`<b style="color:${num<0?'#d9534f':'#2f7fd1'}">${num<0?'−':'+'}${fr(Math.abs(num),den)}</b>`;
function star(x,y,r,fill){ctx.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr2=k%2?r*.5:r*1.15;ctx.lineTo(x+rr2*Math.cos(a),y+rr2*Math.sin(a));}ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
/* 쿠폰 변화 그래프: hist=[[판수,순이익]], ev=한 판의 기대값 */
function histChart(x,y,w,h,hist,n,ev,ylabel){
  card(x,y,w,h,ylabel);const gx=x+44*Math.min(FS,1.3),gy=y+34,gw=w-(gx-x)-14,gh=h-64;
  const end=hist.length?hist[hist.length-1][1]:0,exp=n*ev;let lo=Math.min(0,exp,end),hi=Math.max(0,exp,end);
  hist.forEach(p=>{lo=Math.min(lo,p[1]);hi=Math.max(hi,p[1]);});if(hi-lo<4){hi+=2;lo-=2;}const pad=(hi-lo)*.1;lo-=pad;hi+=pad;
  const Y=v=>gy+gh-(v-lo)/(hi-lo)*gh,X=k=>gx+(n?k/n:0)*gw;
  line(gx,Y(0),gx+gw,Y(0),'#8a97a8',1.5);txt('0',gx-6,Y(0),MC.sub,11,true,'right');
  if(n){line(X(0),Y(0),X(n),Y(exp),MC.red,2.5,[6,5]);
    ctx.strokeStyle=MC.blue;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(X(0),Y(0));hist.forEach(p=>ctx.lineTo(X(p[0]),Y(p[1])));ctx.stroke();
    txt((end>0?'+':'')+fmtN(end),gx+gw,clamp(Y(end)-11*FS,gy,gy+gh),MC.blue,12,true,'right');}
  txt(n?`${fmtN(n)}판`:'아직 한 판도 안 했어요',gx+gw,y+h-14,MC.sub,11,true,'right');
  line(gx,y+h-14,gx+22,y+h-14,MC.blue,2.5);txt('실제',gx+27,y+h-14,MC.blue,11,true);
  const ox=gx+27+tw('실제',11,true)+12;line(ox,y+h-14,ox+22,y+h-14,MC.red,2.5,[6,5]);txt('계산(기대값)',ox+27,y+h-14,MC.red,11,true);
}
function pushHist(s){s.hist.push([s.n,s.net]);if(s.hist.length>700)s.hist=s.hist.filter((_,i)=>i%2===1||i===s.hist.length-1);}

/* ===================== 1차시 ===================== */
EX.push({course:'math',id:'toss',lesson:1,name:'동전·주사위 던지기',size:[800,480],
 ask:'<b>예상해 보기</b> 동전 10개를 던지면 앞면이 꼭 5개 나올까요? 100만 개를 던지면 어떻게 될까요?',
 controls:[{type:'seg',key:'kind',label:'무엇을 던질까',opts:[['coin','동전'],['die','주사위']],val:'coin'},
  {type:'seg',key:'faces',label:'주사위 면 수 (주사위일 때)',opts:[4,6,8,10,12,16].map(f=>[f,f+'면']),val:6},
  {type:'range',key:'n',label:'한 번에 던질 개수',vals:[1,2,3,5,10,30,100,1000,10000,100000,1000000],val:10,fmt:v=>big(v)+'개',wide:true}],
 buttons:[{label:'던지기',act:'go'},{label:'기록 지우기',act:'clear',ghost:true}],
 K(s){return s.p.kind==='coin'?2:s.p.faces;},
 reset(s){s.cnt=new Array(this.K(s)).fill(0);s.total=0;s.queue=0;s.per=0;s.round=0;s.rounds=0;s.timer=0;s.sample=[];s.age=1;},
 param(s,k){if(k!=='n')this.reset(s);},
 act(s,a){if(a==='clear')this.reset(s);
  if(a==='go'&&s.queue===0){const n=s.p.n;s.rounds=n>30?10:1;s.per=n/s.rounds;s.queue=s.rounds;s.round=0;s.timer=0;}},
 throwOnce(s){const K=this.K(s),n=s.per,c=new Array(K).fill(0),cap=Math.min(n,60);s.sample=[];
  for(let i=0;i<n;i++){const v=rint(K);c[v]++;if(i<cap)s.sample.push(v);}
  for(let i=0;i<K;i++)s.cnt[i]+=c[i];s.total+=n;s.round++;s.queue--;s.age=0;},
 step(s,dt){s.age+=dt;if(s.queue>0){s.timer-=dt;if(s.timer<=0){this.throwOnce(s);s.timer=0.45;}}},
 dev(s){const K=this.K(s);let d=0;s.cnt.forEach(c=>d=Math.max(d,Math.abs(c/s.total-1/K)));return d;},
 draw(s){paper();const K=this.K(s),coin=s.p.kind==='coin',mob=FS>1.3;
  const tx=16,ty=16,tW=372,tH=300;box(tx,ty,tW,tH,'#fdf6e9','#e2d3b5',10);
  const m=s.sample.length;
  if(!m)txt('던지기를 눌러 보세요',tx+tW/2,ty+tH/2,MC.sub,15,true,'center');
  else{const cols=Math.ceil(Math.sqrt(m*(tW-20)/(tH-60))),rows=Math.ceil(m/cols),cell=Math.min((tW-20)/cols,(tH-60)/rows),sz=Math.min(cell*.8,72),pop=clamp(s.age/0.18,0,1);
   const ox=tx+(tW-cols*cell)/2+cell/2,oy=ty+26+((tH-60)-rows*cell)/2+cell/2;
   s.sample.forEach((v,i)=>{const x=ox+(i%cols)*cell,y=oy+Math.floor(i/cols)*cell,z=sz*(0.6+0.4*pop);coin?drawCoin(x,y,z/2,v===0):drawDie(x,y,z,v+1,K);});
   txt(s.per>m?`이번에 던진 ${fmtN(s.per)}개 중 ${m}개만 보여 줘요`:`이번에 던진 ${m}개`,tx+tW/2,ty+tH-15,MC.sub,12,true,'center');}
  if(s.rounds>1&&s.round>0)txt(`${s.round} / ${s.rounds}회째 자동으로 던지는 중`.replace(s.queue?'':' 자동으로 던지는 중',''),tx+12,ty+16,MC.red,12,true);
  const gx=404,gy=16,gw=380,gh=300;card(gx,gy,gw,gh,'지금까지 나온 비율');
  if(!mob){line(gx+gw-112,gy+17,gx+gw-90,gy+17,MC.red,2.5);txt('계산한 확률',gx+gw-84,gy+17,MC.red,11,true);}
  const labels=coin?['앞면','뒷면']:Array.from({length:K},(_,i)=>i+1),vals=s.cnt.map(c=>s.total?c/s.total:0);
  barChart(gx+20,gy+62,gw-40,gh-100,{vals,expect:new Array(K).fill(1/K),labels,max:Math.max(1.7/K,...vals)*1.08,cols:coin?['#f6c94a','#aab4bf']:null,tops:s.total&&K<=6?s.cnt.map(c=>fmtN(c)):null});
  card(16,332,768,132);
  txt('지금까지 던진 개수',32,356,MC.sub,12,true);txt(fmtN(s.total)+'개',32,356+34*Math.min(FS,1.4),MC.ink,mob?18:26,true);
  const x2=mob?420:300;txt('계산한 확률',x2,356,MC.sub,12,true);frac(1,K,x2+20,356+44*Math.min(FS,1.3),mob?15:20,MC.red);
  if(!mob){txt(coin?'(앞면·뒷면 2가지 중 1가지)':`(${K}가지 눈 중 1가지)`,x2+52,400,MC.sub,12,false);}
  if(s.total&&!mob){txt('계산과 가장 크게 다른 막대의 차이',540,356,MC.sub,12,true);const d=this.dev(s)*100;txt(d.toFixed(d<1?2:1)+'%p',540,392,d<1?MC.green:MC.gold,26,true);
   txt(d<1?'거의 딱 맞아요':d<5?'꽤 가까워요':'아직 들쭉날쭉해요',540,430,MC.sub,12,true);}
 },
 now(s){const K=this.K(s),coin=s.p.kind==='coin';if(!s.total)return '무엇을 몇 개 던질지 고르고 <b>던지기</b>를 눌러요. 30개보다 많으면 10번에 나누어 자동으로 던져요.';
  const d=this.dev(s)*100;let m=coin?`앞면 <b>${fmtN(s.cnt[0])}개</b>(${pct(s.cnt[0]/s.total)}), 뒷면 <b>${fmtN(s.cnt[1])}개</b>(${pct(s.cnt[1]/s.total)})가 나왔어요. `:`${K}면 주사위를 모두 <b>${fmtN(s.total)}개</b> 던졌어요. 각 눈이 나올 확률은 ${fr(1,K)}(${pct(1/K)})이에요. `;
  m+=s.total<50?'던진 개수가 적으면 계산한 확률과 <b>많이 다를 수 있어요</b>. 더 던져 보세요.':d<1?'많이 던졌더니 막대가 빨간 선(계산한 확률)에 <b>거의 딱 붙었어요</b>.':'막대가 빨간 선에 점점 가까워지고 있어요. 더 많이 던지면 어떻게 될까요?';return m;},
 why:'<ul><li><b>확률</b>은 어떤 일이 일어날 가능성을 수로 나타낸 것이에요. 확률 = 특정 경우의 수 ÷ 전체 경우의 수.</li><li>동전은 앞·뒤 2가지가 똑같이 나올 수 있어서 앞면의 확률이 '+fr(1,2)+'이에요. 6면 주사위는 각 눈이 '+fr(1,6)+', 12면 주사위는 '+fr(1,12)+'이에요. 이렇게 계산으로 구하는 확률을 <b>수학적 확률</b>이라고 해요.</li><li>확률이 '+fr(1,2)+'이라고 해서 10개 중 꼭 5개가 나오는 건 아니에요. 적게 던지면 들쭉날쭉하고, <b>많이 던질수록</b> 계산한 확률에 가까워져요.</li><li>모든 막대의 비율을 더하면 항상 1(100%)이에요. 모든 경우 중 하나는 반드시 일어나니까요.</li></ul>',
 tryIt:['동전 10개를 여러 번 던져 앞면 개수가 매번 어떻게 달라지는지 보세요.','개수를 100개 → 1만 개 → 100만 개로 늘리며 “가장 큰 차이” 숫자를 비교해 보세요.','주사위를 4면, 8면, 16면으로 바꾸면 빨간 선의 높이가 어떻게 달라지나요?','기록을 지우고 주사위를 딱 6개만 던져 보세요. 1부터 6까지 하나씩 나오나요?'],
 rec(s){if(!s||!s.total)return '';const K=this.K(s),coin=s.p.kind==='coin';return '<table><tr><th>결과</th><th>나온 수</th><th>비율</th><th>계산</th></tr>'+s.cnt.map((c,i)=>`<tr><td>${coin?['앞면','뒷면'][i]:i+1}</td><td>${fmtN(c)}</td><td>${pct(c/s.total)}</td><td>${pct(1/K)}</td></tr>`).join('')+'</table>';}
});

EX.push({course:'math',id:'group',lesson:1,name:'묶어서 던지기',size:[800,480],
 ask:'<b>예상해 보기</b> 동전 2개를 던지면 “앞면 1개”와 “앞면 2개” 중 무엇이 더 잘 나올까요? 주사위 2개 눈의 합은 몇이 가장 잘 나올까요?',
 controls:[{type:'seg',key:'what',label:'한 번에 던지는 것',opts:[['c2','동전 2개'],['c3','동전 3개'],['c4','동전 4개'],['d2','주사위 2개']],val:'c2'},
  {type:'seg',key:'faces',label:'주사위 면 수 (주사위일 때)',opts:[[4,'4면'],[6,'6면'],[8,'8면']],val:6},
  {type:'range',key:'n',label:'던질 횟수',vals:[1,10,100,1000,10000,100000],val:1,fmt:v=>big(v)+'번',wide:true}],
 buttons:[{label:'던지기',act:'go'},{label:'기록 지우기',act:'clear',ghost:true}],
 cfg(s){const w=s.p.what;if(w==='d2'){const f=s.p.faces,ways=[];for(let t=2;t<=2*f;t++)ways.push(f-Math.abs(f+1-t));return{dice:true,f,k:2,ways,total:f*f,label:i=>''+(i+2),unit:'합 '};}
  const k=+w[1],ways=[];for(let i=0;i<=k;i++)ways.push(comb(k,i));return{dice:false,k,ways,total:1<<k,label:i=>i+'개',unit:'앞면 '};},
 reset(s){const c=this.cfg(s);s.cnt=new Array(c.ways.length).fill(0);s.total=0;s.last=null;s.age=1;},
 param(s,k){if(k!=='n')this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);const c=this.cfg(s);let last;
  for(let i=0;i<s.p.n;i++){if(c.dice){const d1=rint(c.f)+1,d2=rint(c.f)+1;s.cnt[d1+d2-2]++;last=[d1,d2];}
   else{let h=0;last=[];for(let j=0;j<c.k;j++){const v=Math.random()<.5;last.push(v);if(v)h++;}s.cnt[h]++;}}
  s.total+=s.p.n;s.last=last;s.age=0;},
 step(s,dt){s.age+=dt;},
 out(s,c){return !s.last?-1:c.dice?s.last[0]+s.last[1]-2:s.last.filter(Boolean).length;},
 draw(s){paper();const c=this.cfg(s),lo=this.out(s,c),mob=FS>1.3;
  card(16,16,372,448,`일어날 수 있는 모든 경우: ${c.total}가지`);
  if(c.dice){const f=c.f,cell=Math.min(40,300/f),ox=16+(372-cell*(f+1))/2+cell,oy=118;
   txt('방금 나온 눈',34,66,MC.sub,12,true);if(s.last){drawDie(160,64,40,s.last[0],f);drawDie(210,64,40,s.last[1],f);txt('합 '+(lo+2),245,64,MC.red,17,true);}
   for(let i=1;i<=f;i++){txt(i,ox+(i-.5)*cell,oy-12,MC.sub,11,true,'center');txt(i,ox-12,oy+(i-.5)*cell,MC.sub,11,true,'center');}
   for(let a=1;a<=f;a++)for(let b=1;b<=f;b++){const t=a+b,x=ox+(b-1)*cell,y=oy+(a-1)*cell,hit=s.last&&s.last[0]===a&&s.last[1]===b,same=lo>=0&&t===lo+2;
     ctx.fillStyle=hit?'#f9b8b2':same?'#ffe5e2':'#fff';ctx.fillRect(x,y,cell,cell);ctx.strokeStyle='#c9d6e5';ctx.lineWidth=1;ctx.strokeRect(x,y,cell,cell);
     ctx.font=`${same?900:500} ${cell*.42}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=same?MC.red:MC.ink;ctx.fillText(t,x+cell/2,y+cell/2+1);}
   if(!mob)txt('세로: 첫째 주사위 · 가로: 둘째 주사위 · 칸 속 숫자: 두 눈의 합',202,oy+f*cell+20,MC.sub,11,false,'center');
  }else{const k=c.k,colW=340/(k+1),r=Math.min(11,(colW-12)/(2*k)-1);
   txt('방금 던진 결과',34,66,MC.sub,12,true);if(s.last){s.last.forEach((v,j)=>drawCoin(170+j*42,64,17,v));txt('앞면 '+lo+'개',170+k*42,64,MC.red,15,true);}
   for(let h=0;h<=k;h++){const cx=32+colW*(h+.5);txt('앞면 '+h+'개',cx,112,h===lo?MC.red:MC.sub,mob?9:12,true,'center');let row=0;
     for(let mask=0;mask<(1<<k);mask++){const bits=[];let cnt=0;for(let j=0;j<k;j++){const v=!!(mask>>(k-1-j)&1);bits.push(v);if(v)cnt++;}if(cnt!==h)continue;
       const y=140+row*(2*r+14),hit=s.last&&bits.every((v,j)=>v===s.last[j]);
       box(cx-k*(r+1)-4,y-r-4,2*k*(r+1)+8,2*r+8,hit?'#ffe5e2':'#f6f8fb',hit?MC.red:null,6,2.5);
       bits.forEach((v,j)=>drawCoin(cx-(k-1)*(r+1)+j*2*(r+1),y,r,v));row++;}
     txt(c.ways[h]+'가지',cx,140+row*(2*r+14)+4,MC.ink,mob?9:12,true,'center');}
   if(!mob)txt('순서가 다르면 다른 경우로 세요: (앞, 뒤)와 (뒤, 앞)',202,444,MC.sub,11,false,'center');}
  card(404,16,380,448,'계산한 확률(빨간 선)과 실험 결과(막대)');
  const vals=s.cnt.map(v=>s.total?v/s.total:0),exp=c.ways.map(w=>w/c.total);
  barChart(424,70,340,300,{vals,expect:exp,labels:c.ways.map((_,i)=>c.label(i)),max:Math.max(...exp,...vals)*1.15,cols:c.ways.map((_,i)=>i===lo?'#f08a80':MC.bar),tops:c.ways.length<=7?c.ways.map(w=>w+'/'+c.total):null});
  txt(c.unit.trim()+(c.dice?'':' 개수'),594,400,MC.sub,12,true,'center');
  txt(s.total?`${fmtN(s.total)}번 던졌어요`:'던지기를 눌러 보세요',594,436,MC.ink,14,true,'center');
 },
 now(s){const c=this.cfg(s);if(!s.total)return '무엇을 던질지 고르고 <b>던지기</b>를 눌러요. 왼쪽은 일어날 수 있는 모든 경우, 오른쪽은 계산한 확률과 실험 결과예요.';
  const best=c.ways.indexOf(Math.max(...c.ways));let top=0;s.cnt.forEach((v,i)=>{if(v>s.cnt[top])top=i;});
  return `방금 결과는 <b>${c.unit}${c.label(this.out(s,c))}</b>. 지금까지 ${fmtN(s.total)}번 중 가장 많이 나온 것은 <b>${c.unit}${c.label(top)}</b>(${pct(s.cnt[top]/s.total)})이에요. 계산으로는 ${c.unit}${c.label(best)}이(가) ${fr(c.ways[best],c.total)}로 가장 잘 나와요.`+(s.total<30?' 횟수를 늘려 보세요.':'');},
 why:'<ul><li>여러 개를 함께 던질 때는 <b>일어날 수 있는 모든 경우</b>를 빠짐없이 세어야 해요. 동전 2개는 2×2=4가지, 동전 3개는 8가지, 주사위 2개는 6×6=36가지예요.</li><li><b>순서가 다르면 다른 경우</b>예요. (앞, 뒤)와 (뒤, 앞), (1, 5)와 (5, 1)은 따로 세요.</li><li>동전 2개에서 “모두 앞면”은 1가지('+fr(1,4)+'), “앞면 1개”는 2가지('+fr(2,4)+')라서 두 배 잘 나와요.</li><li>주사위 2개의 합은 가운데 수(6면이면 7)가 '+fr(6,36)+'로 가장 잘 나오고, 2와 12는 '+fr(1,36)+'로 가장 드물어요.</li><li>모든 경우의 수를 더하면 전체 경우의 수가 되고, 확률을 모두 더하면 분자와 분모가 같아져요.</li></ul>',
 tryIt:['동전 2개를 한 번씩 20번 던지며 어떤 경우가 색칠되는지 보세요.','동전 3개로 바꾸고 1만 번 던져 표(1, 3, 3, 1가지)와 막대 높이를 비교해 보세요.','주사위 2개에서 합이 7인 칸은 몇 개인가요? 8면 주사위 2개라면 가장 잘 나오는 합은 몇일까요?'],
 rec(s){if(!s||!s.total)return '';const c=this.cfg(s);return '<table><tr><th>결과</th><th>경우의 수</th><th>확률</th><th>나온 횟수</th><th>비율</th></tr>'+c.ways.map((w,i)=>`<tr><td>${c.unit}${c.label(i)}</td><td>${w}</td><td>${fr(w,c.total)}</td><td>${fmtN(s.cnt[i])}</td><td>${pct(s.cnt[i]/s.total)}</td></tr>`).join('')+'</table>';}
});

/* ===================== 2차시 ===================== */
EX.push({course:'math',id:'hint',lesson:2,name:'힌트를 들으면',size:[800,440],
 ask:'<b>예상해 보기</b> 친구가 굴린 주사위가 2일 확률은 얼마일까요? 친구가 “짝수야!”라고 알려 주면 확률이 달라질까요?',
 controls:[{type:'seg',key:'faces',label:'주사위 면 수',opts:[4,6,8,10,12].map(f=>[f,f+'면']),val:6},
  {type:'seg',key:'hint',label:'친구의 힌트',opts:[['none','힌트 없음'],['even','짝수야'],['odd','홀수야'],['big','절반보다 커'],['small','절반 이하야']],val:'none'}],
 buttons:[{label:'1번 굴리기',act:'r1'},{label:'1000번 굴리기',act:'r1000'},{label:'기록 지우기',act:'clear',ghost:true}],
 ok(s,v){const h=s.p.hint,f=s.p.faces;return h==='none'||(h==='even'&&v%2===0)||(h==='odd'&&v%2===1)||(h==='big'&&v>f/2)||(h==='small'&&v<=f/2);},
 reset(s){if(!s.tg)s.tg=2;s.tg=Math.min(s.tg,s.p.faces);s.n=0;s.m=0;s.k=0;s.last=0;},
 param(s){this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);const t=a==='r1'?1:1000;for(let i=0;i<t;i++){const v=rint(s.p.faces)+1;s.n++;s.last=v;if(this.ok(s,v)){s.m++;if(v===s.tg)s.k++;}}},
 step(){},
 geo(s){const f=s.p.faces,sz=Math.min(74,740/f-12),gap=(768-f*sz)/(f+1);return{f,sz,x:i=>16+gap+(i-1)*(sz+gap)+sz/2,y:96};},
 click(s,x,y){const g=this.geo(s);for(let i=1;i<=g.f;i++)if(Math.abs(x-g.x(i))<g.sz/2+6&&Math.abs(y-g.y)<g.sz/2+14){s.tg=i;s.n=s.m=s.k=0;s.last=0;}},
 left(s){const a=[];for(let v=1;v<=s.p.faces;v++)if(this.ok(s,v))a.push(v);return a;},
 draw(s){paper();const g=this.geo(s),L=this.left(s),mob=FS>1.3,hn={none:'힌트 없음',even:'“짝수야!”',odd:'“홀수야!”',big:'“절반보다 큰 수야!”',small:'“절반 이하인 수야!”'}[s.p.hint];
  card(16,16,768,160,`친구의 힌트: ${hn}  ·  맞히려는 수는 주사위를 눌러서 골라요`);
  for(let i=1;i<=g.f;i++){const x=g.x(i),ok=this.ok(s,i);ctx.globalAlpha=ok?1:.3;drawDie(x,g.y,g.sz,i,g.f,i===s.last?MC.gold:null);ctx.globalAlpha=1;
   if(!ok)line(x-g.sz*.55,g.y-g.sz*.55,x+g.sz*.55,g.y+g.sz*.55,MC.red,4);
   if(i===s.tg){circle(x,g.y,g.sz*.72,null,MC.blue,3.5);if(!mob)txt('맞히려는 수',x,g.y+g.sz*.72+14,MC.blue,11,true,'center');}}
  const hit=L.includes(s.tg)?1:0;
  card(16,188,378,236,'계산으로 구한 확률');
  txt(`남은 경우 ${L.length}가지 중`,36,238,MC.ink,15,true);txt(`${s.tg}이(가) 나오는 경우 ${hit}가지`,36,238+26*FS,MC.ink,15,true);
  frac(hit,L.length,300,262,mob?22:34,MC.red);
  if(!mob){txt(s.p.hint==='none'?'힌트가 없으면 모든 눈이 남아 있어요.':hit?`힌트 없을 때 1/${g.f} → 지금 1/${L.length}`:'힌트 때문에 이 수는 나올 수 없어요.',36,330,MC.sub,13,true);
   txt('바뀐 것은 주사위가 아니라 내가 아는 정보예요.',36,356,MC.sub,12,false);}
  card(406,188,378,236,'직접 굴려서 확인');
  txt(`굴린 횟수 ${fmtN(s.n)}번`,426,232,MC.ink,14,true);
  txt(s.p.hint==='none'?'':`힌트와 맞는 경우 ${fmtN(s.m)}번만 세요`,426,232+24*FS,MC.sub,12,true);
  hbar(426,300,338,26,s.m?s.k/s.m:0,L.length?hit/L.length:0,MC.bar);
  txt(s.m?`그중 ${s.tg}: ${fmtN(s.k)}번 (${pct(s.k/s.m)})`:'굴리기를 눌러 보세요',426,350,MC.blue,14,true);
  if(s.last&&!mob)txt(`방금 나온 눈: ${s.last}`+(this.ok(s,s.last)?'':' (힌트와 달라서 세지 않아요)'),426,392,MC.gold,13,true);
 },
 now(s){const L=this.left(s),f=s.p.faces,hit=L.includes(s.tg);if(s.p.hint==='none')return `힌트가 없으면 ${f}가지가 모두 가능해요. ${s.tg}일 확률은 ${fr(1,f)}이에요. 힌트를 골라 보세요.`;
  if(!hit)return `힌트 때문에 ${s.tg}은(는) <b>나올 수 없는 수</b>가 됐어요. 확률은 0이에요.`;
  return `힌트를 듣고 나니 따져야 할 전체 경우가 ${f}가지에서 <b>${L.length}가지</b>로 줄었어요. ${s.tg}일 확률이 ${fr(1,f)}에서 <b>${fr(1,L.length)}</b>로 커졌어요.`+(s.m>=200?` 실제로 굴려 보니 ${pct(s.k/s.m)}로 계산과 비슷해요.`:'');},
 why:'<ul><li>새로운 사실을 알게 되면 <b>따져야 할 전체 경우의 수가 줄어들</b> 수 있어요.</li><li>“짝수야”라는 말을 들으면 1, 3, 5는 더 생각할 필요가 없어요. 남은 2, 4, 6 세 가지 중 하나이므로 2일 확률은 '+fr(1,6)+'에서 '+fr(1,3)+'로 커져요.</li><li>주사위는 이미 굴려져 숫자가 정해져 있어요. 바뀐 것은 주사위가 아니라 <b>내가 아는 정보</b>예요.</li><li>실험에서는 힌트와 맞지 않는 굴림은 빼고, 힌트와 맞는 굴림 중에서만 비율을 세요.</li></ul>',
 tryIt:['힌트 없음 → 짝수야 순서로 바꾸며 2의 확률이 어떻게 변하는지 보세요.','맞히려는 수를 3으로 바꾸고 “짝수야” 힌트를 들으면 확률은 얼마가 되나요?','12면 주사위에서 “절반보다 커” 힌트는 전체 경우를 몇 가지로 줄이나요?']
});

EX.push({course:'math',id:'candy',lesson:2,name:'사탕 뽑기',size:[800,440],
 ask:'<b>예상해 보기</b> 눈을 감고 사탕을 뽑아요. 맛은 모르지만 모양은 손으로 알 수 있어요. 포도맛을 먹으려면 어떤 모양을 골라야 유리할까요?',
 controls:[{type:'range',key:'so',label:'딸기맛 동그라미',min:0,max:6,step:1,val:4,fmt:v=>v+'개'},{type:'range',key:'ss',label:'딸기맛 별',min:0,max:6,step:1,val:2,fmt:v=>v+'개'},
  {type:'range',key:'go',label:'포도맛 동그라미',min:0,max:6,step:1,val:1,fmt:v=>v+'개'},{type:'range',key:'gs',label:'포도맛 별',min:0,max:6,step:1,val:3,fmt:v=>v+'개'},
  {type:'seg',key:'pick',label:'손으로 만져서 고르는 모양',opts:[['any','아무거나'],['o','동그라미만'],['s','별만']],val:'any',wide:true}],
 buttons:[{label:'1개 뽑기',act:'p1'},{label:'100번 뽑기',act:'p100'},{label:'기록 지우기',act:'clear',ghost:true}],
 list(s){const a=[];const add=(n,sh,fl)=>{for(let i=0;i<n;i++)a.push({sh,fl});};add(s.p.so,'o','s');add(s.p.ss,'s','s');add(s.p.go,'o','g');add(s.p.gs,'s','g');return a;},
 elig(s){return this.list(s).map((c,i)=>({...c,i})).filter(c=>s.p.pick==='any'||c.sh===s.p.pick);},
 reset(s){s.n=0;s.g=0;s.last=-1;},
 param(s){this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);const E=this.elig(s);if(!E.length)return;const t=a==='p1'?1:100;for(let i=0;i<t;i++){const c=E[rint(E.length)];s.n++;if(c.fl==='g')s.g++;s.last=c.i;}},
 step(){},
 draw(s){paper();const A=this.list(s),E=this.elig(s),ge=E.filter(c=>c.fl==='g').length,mob=FS>1.3;
  card(16,16,340,408,'유리병 (뽑은 사탕은 다시 넣어요)');
  box(46,56,280,320,'#f4f8fc','#b9c7d8',26,3);
  const cols=5,cell=50;A.forEach((c,i)=>{const x=86+(i%cols)*cell,y=100+Math.floor(i/cols)*58,ok=s.p.pick==='any'||c.sh===s.p.pick,col=c.fl==='s'?'#ef5b6b':'#8a5cc7';
    ctx.globalAlpha=ok?1:.2;c.sh==='o'?circle(x,y,17,col):star(x,y,17,col);ctx.globalAlpha=1;if(i===s.last)circle(x,y,26,null,MC.gold,3.5);});
  if(!A.length)txt('사탕이 없어요',186,220,MC.sub,14,true,'center');
  txt('빨강 = 딸기맛 · 보라 = 포도맛',186,400,MC.sub,11,true,'center');
  card(368,16,416,190,'표로 정리하기');
  const tx=[470,580,690],ty=[70,104,138,172];txt('동그라미',tx[1],ty[0],MC.sub,12,true,'center');txt('별',tx[2],ty[0],MC.sub,12,true,'center');
  [['딸기맛',s.p.so,s.p.ss],['포도맛',s.p.go,s.p.gs],['합계',s.p.so+s.p.go,s.p.ss+s.p.gs]].forEach((r,i)=>{txt(r[0],tx[0]-60,ty[i+1],i===1?'#8a5cc7':MC.ink,13,true);
    [1,2].forEach(j=>{const on=s.p.pick==='any'||(s.p.pick==='o')===(j===1);txt(r[j]+'개',tx[j],ty[i+1],on?(i===1?'#8a5cc7':MC.ink):'#b6c0cc',14,i===1||on,'center');});});
  card(368,218,416,206,'포도맛일 확률');
  const pn={any:'아무거나 뽑을 때',o:'동그라미를 골랐을 때',s:'별을 골랐을 때'}[s.p.pick];
  txt(pn,388,262,MC.ink,14,true);if(!mob)txt(`고를 수 있는 사탕 ${E.length}개 중 포도맛 ${ge}개`,388,286,MC.sub,12,true);
  if(E.length)frac(ge,E.length,mob?700:710,270,mob?20:30,MC.red);
  hbar(388,330,376,24,s.n?s.g/s.n:0,E.length?ge/E.length:0,'#a98be0');
  txt(s.n?`${fmtN(s.n)}번 뽑아서 포도맛 ${fmtN(s.g)}번 (${pct(s.g/s.n)})`:E.length?'뽑기를 눌러 확인해 보세요':'이 모양의 사탕이 없어요',388,384,MC.blue,13,true);
 },
 now(s){const A=this.list(s),E=this.elig(s),g=A.filter(c=>c.fl==='g').length,ge=E.filter(c=>c.fl==='g').length;if(!A.length)return '사탕 개수를 정해 주세요.';
  if(!E.length)return '고른 모양의 사탕이 병에 없어요.';
  if(s.p.pick==='any')return `모양을 모르고 뽑으면 ${A.length}개 중 포도맛이 ${g}개라서 확률은 ${fr(g,A.length)}이에요. 이제 모양을 골라 보세요.`;
  const up=ge/E.length>g/A.length,same=ge*A.length===g*E.length;
  return `${s.p.pick==='o'?'동그라미':'별'} 모양이라는 걸 알면 전체가 ${A.length}개에서 <b>${E.length}개</b>로 줄어요. 포도맛일 확률은 ${fr(g,A.length)}에서 <b>${fr(ge,E.length)}</b>로 ${same?'그대로예요. 이 병에서는 모양이 맛에 대한 정보를 주지 않아요':up?'<b>커졌어요</b>':'<b>작아졌어요</b>'}.`;},
 why:'<ul><li>정보가 많을 때는 <b>표</b>로 정리하면 쉬워요.</li><li>모양을 알면 그 모양의 사탕만 따지면 돼요. 전체 경우의 수가 바뀌니까 확률도 바뀌어요.</li><li>처음 병(딸기 동그라미 4, 딸기 별 2, 포도 동그라미 1, 포도 별 3)에서 포도맛일 확률은 아무거나 '+fr(4,10)+', 동그라미 '+fr(1,5)+', 별 '+fr(3,5)+'이에요. 포도맛을 먹고 싶으면 별을 골라야 해요.</li><li>모양마다 포도맛의 비율이 똑같다면, 모양을 알아도 확률은 달라지지 않아요.</li></ul>',
 tryIt:['아무거나 → 동그라미만 → 별만 순서로 바꾸며 확률을 비교해 보세요.','100번 뽑기를 여러 번 눌러 실험 비율이 계산한 확률에 가까워지는지 보세요.','모양을 알아도 확률이 변하지 않는 병을 만들어 보세요. (예: 네 종류를 모두 2개씩)']
});

EX.push({course:'math',id:'lots',lesson:2,name:'제비뽑기',size:[800,440],
 ask:'<b>예상해 보기</b> 첫 번째로 꽝을 뽑았어요. 두 번째에 당첨될 확률은 처음과 같을까요? 뽑은 제비를 다시 넣을 때와 넣지 않을 때를 비교해 보세요.',
 controls:[{type:'range',key:'w',label:'당첨 제비',min:1,max:5,step:1,val:2,fmt:v=>v+'개'},{type:'range',key:'l',label:'꽝 제비',min:1,max:8,step:1,val:4,fmt:v=>v+'개'},
  {type:'seg',key:'mode',label:'뽑은 제비는',opts:[['back','다시 넣는다'],['keep','다시 넣지 않는다']],val:'keep'}],
 buttons:[{label:'제비 뽑기',act:'draw'},{label:'처음부터',act:'again',ghost:true},{label:'1000번 실험',act:'sim'}],
 reset(s){s.w=s.p.w;s.l=s.p.l;s.drawn=[];s.sim=null;},
 param(s){this.reset(s);},
 act(s,a){if(a==='again'){s.w=s.p.w;s.l=s.p.l;s.drawn=[];}
  if(a==='draw'&&s.w+s.l>0&&s.drawn.length<12){const win=Math.random()<s.w/(s.w+s.l);s.drawn.push(win);if(s.p.mode==='keep'){win?s.w--:s.l--;}}
  if(a==='sim'){let F=0,S=0;for(let i=0;i<1000;i++){let w=s.p.w,l=s.p.l;if(Math.random()<w/(w+l))continue;F++;if(s.p.mode==='keep')l--;if(Math.random()<w/(w+l))S++;}s.sim={F,S};}},
 step(){},
 slip(x,y,win,a=1){ctx.globalAlpha=a;box(x-24,y-15,48,30,win?'#f2b32c':'#cfd6de',null,4);txt(win?'당첨':'꽝',x,y,win?'#5a4300':'#4a5563',12/Math.max(1,FS*.8),true,'center');ctx.globalAlpha=1;},
 draw(s){paper();const mob=FS>1.3,T0=s.p.w+s.p.l,T=s.w+s.l,keep=s.p.mode==='keep';
  card(16,16,300,408,'주머니 속 제비');
  ctx.fillStyle='#f3e6d3';ctx.strokeStyle='#b58a52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(56,90);ctx.quadraticCurveTo(30,400,166,400);ctx.quadraticCurveTo(302,400,276,90);ctx.closePath();ctx.fill();ctx.stroke();
  line(70,84,262,84,'#b58a52',7);
  const A=[];for(let i=0;i<s.w;i++)A.push(true);for(let i=0;i<s.l;i++)A.push(false);
  A.forEach((v,i)=>this.slip(98+(i%3)*68,140+Math.floor(i/3)*46,v));
  if(!T)txt('제비를 다 뽑았어요',166,230,MC.sub,14,true,'center');
  card(328,16,456,150,'지금 뽑으면 당첨될 확률');
  txt('처음',358,84,MC.sub,13,true);frac(s.p.w,T0,420,84,22,MC.ink);
  txt('지금',520,84,MC.sub,13,true);const ch=T&&s.w*T0!==s.p.w*T;if(T)frac(s.w,T,584,84,mob?22:28,ch?MC.red:MC.green);
  if(!mob)txt(!s.drawn.length?'':ch?'달라졌어요':'그대로예요',640,84,ch?MC.red:MC.green,15,true);
  txt(keep?`주머니에 남은 제비: 당첨 ${s.w}개, 꽝 ${s.l}개`:'뽑은 제비를 다시 넣어서 주머니 속은 늘 처음과 같아요',348,144,MC.sub,12,true);
  card(328,178,456,110,'뽑은 순서');
  s.drawn.forEach((v,i)=>this.slip(366+(i%8)*54,228+Math.floor(i/8)*34,v));
  if(!s.drawn.length)txt('제비 뽑기를 눌러 보세요',348,238,MC.sub,13,true);
  card(328,300,456,124,'1000번 실험: 첫 번째가 꽝이었을 때, 두 번째 당첨 비율');
  const ex=keep?s.p.w/(T0-1):s.p.w/T0;hbar(348,350,416,22,s.sim&&s.sim.F?s.sim.S/s.sim.F:0,ex,MC.bar);
  txt(s.sim?`첫 번째가 꽝이었던 ${s.sim.F}번 중 ${s.sim.S}번 당첨 (${pct(s.sim.S/Math.max(1,s.sim.F))})`:'1000번 실험을 눌러 보세요',348,398,MC.blue,13,true);
 },
 now(s){const T0=s.p.w+s.p.l,T=s.w+s.l,keep=s.p.mode==='keep';if(!s.drawn.length)return `당첨 ${s.p.w}개, 꽝 ${s.p.l}개. 처음 당첨 확률은 ${fr(s.p.w,T0)}이에요. 제비를 뽑아 보세요.`;
  const last=s.drawn[s.drawn.length-1]?'당첨':'꽝';if(!T)return '제비를 모두 뽑았어요. <b>처음부터</b>를 눌러 다시 해 보세요.';
  if(!keep)return `방금 <b>${last}</b>을 뽑았지만 다시 넣었어요. 주머니 속 상황이 처음과 똑같아서 당첨 확률은 <b>그대로 ${fr(s.p.w,T0)}</b>이에요.`;
  return `방금 <b>${last}</b>을 뽑고 다시 넣지 않았어요. 제비의 개수가 바뀌어서 당첨 확률이 ${fr(s.p.w,T0)}에서 <b>${fr(s.w,T)}</b>로 달라졌어요.`;},
 why:'<ul><li>똑같은 제비뽑기라도 <b>다시 넣느냐, 넣지 않느냐</b>에 따라 확률이 달라지기도 하고 그대로이기도 해요.</li><li>다시 넣으면 주머니 속이 처음과 똑같아서, 앞에서 무엇을 뽑았든 다음 확률은 그대로예요.</li><li>다시 넣지 않으면 제비의 개수가 바뀌어요. 당첨 2개·꽝 4개에서 꽝 하나가 빠지면 '+fr(2,6)+'가 '+fr(2,5)+'로 바뀌어요.</li><li>핵심 질문: <b>새로 알게 된 사실이 앞으로 일어날 일의 조건을 바꾸었나?</b> 바꾸었으면 다시 계산하고, 아니면 그대로예요.</li></ul>',
 tryIt:['“다시 넣지 않는다”로 놓고 한 장씩 뽑으며 확률 분수가 어떻게 변하는지 보세요.','“다시 넣는다”로 바꾸면 몇 번을 뽑아도 확률이 변하나요?','두 방식에서 각각 1000번 실험을 눌러 빨간 선(계산)과 막대를 비교해 보세요.']
});

EX.push({course:'math',id:'streak',lesson:2,name:'연속 앞면 다음엔?',size:[800,440],
 ask:'<b>예상해 보기</b> 동전이 4번 연속 앞면이 나왔어요. 다음에는 “슬슬 뒷면이 나올 때”일까요?',
 controls:[{type:'range',key:'k',label:'연속으로 나온 앞면',min:2,max:8,step:1,val:4,fmt:v=>v+'번'},
  {type:'range',key:'n',label:'던질 횟수',vals:[100,1000,10000,100000,1000000],val:1000,fmt:v=>big(v)+'번'}],
 buttons:[{label:'던지기',act:'go'},{label:'기록 지우기',act:'clear',ghost:true}],
 reset(s){s.n=0;s.run=0;s.cond=0;s.hit=0;s.blocks=0;s.ball=0;s.bi=0;s.bok=true;s.tail=[];},
 param(s,k){if(k==='k')this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);const k=s.p.k;
  for(let i=0;i<s.p.n;i++){const h=Math.random()<.5;if(s.run>=k){s.cond++;if(h)s.hit++;}s.run=h?s.run+1:0;
   s.bok=s.bok&&h;s.bi++;if(s.bi===k+1){s.blocks++;if(s.bok)s.ball++;s.bi=0;s.bok=true;}
   s.n++;if(i>=s.p.n-40)s.tail.push(h);}
  s.tail=s.tail.slice(-40);},
 step(){},
 draw(s){paper();const k=s.p.k,mob=FS>1.3;
  card(16,16,768,112,'방금 던진 마지막 동전들 (왼쪽 → 오른쪽 순서)');
  const T=s.tail,r=8.5,x0=30;let mark=-1;for(let i=T.length-1;i>=k;i--){let ok=true;for(let j=1;j<=k;j++)if(!T[i-j]){ok=false;break;}if(ok){mark=i;break;}}
  if(mark>=0){box(x0+(mark-k)*18.6-2,62,k*18.6+2,34,'#fff4d6',MC.gold,6,2);}
  T.forEach((h,i)=>drawCoin(x0+i*18.6+r,79,r,h));
  if(mark>=0){circle(x0+mark*18.6+r,79,r+5,null,MC.blue,3);if(!mob)txt(`앞면 ${k}번 연속 → 그다음 동전`,clamp(x0+mark*18.6,150,640),112,MC.blue,11,true,'center');}
  if(!T.length)txt('던지기를 눌러 보세요',400,80,MC.sub,14,true,'center');
  const P=(x,title,l1,num,den,val,cnt,expv)=>{card(x,140,378,284,title);txt(l1,x+20,196,MC.ink,13,true);txt('계산',x+20,246,MC.sub,12,true);frac(num,den,x+90,246,mob?18:26,MC.red);
    txt('실험',x+20,312,MC.sub,12,true);hbar(x+70,300,288,24,val,expv,MC.bar);txt(cnt,x+20,358,MC.blue,13,true);};
  P(16,'질문 ①  아직 던지기 전',`${k+1}번 던져서 모두 앞면일 확률`,1,1<<(k+1),s.blocks?s.ball/s.blocks:0,s.blocks?`${k+1}번씩 ${fmtN(s.blocks)}묶음 중 ${fmtN(s.ball)}묶음 (${pct(s.ball/s.blocks)})`:'',1/(1<<(k+1)));
  P(406,`질문 ②  이미 ${k}번 연속 앞면이 나온 뒤`,'다음 한 번이 앞면일 확률',1,2,s.cond?s.hit/s.cond:0,s.cond?`그런 순간 ${fmtN(s.cond)}번 중 다음도 앞면 ${fmtN(s.hit)}번 (${pct(s.hit/s.cond)})`:s.n?'아직 그런 순간이 없었어요. 더 던져 보세요':'',.5);
  if(!mob){txt('아주 드문 일이에요',36,396,MC.sub,12,false);txt('앞의 결과와 상관없이 반반이에요',426,396,MC.sub,12,false);}
 },
 now(s){const k=s.p.k;if(!s.n)return `동전을 많이 던진 다음, <b>앞면이 ${k}번 연속 나온 순간</b>만 골라서 그다음 동전을 살펴볼 거예요.`;
  if(!s.cond)return `${fmtN(s.n)}번 던졌지만 앞면 ${k}번 연속은 아직 없었어요. 더 던져 보세요.`;
  return `앞면이 ${k}번 연속 나온 순간이 ${fmtN(s.cond)}번 있었고, 그다음에도 앞면이 나온 것은 <b>${pct(s.hit/s.cond)}</b>예요. “이제 뒷면 차례”가 아니라 <b>여전히 반반</b>이에요.`;},
 why:'<ul><li>동전과 주사위는 <b>앞에서 무엇이 나왔는지 기억하지 못해요</b>. 앞면이 4번 나왔다고 동전에서 앞면이 사라지지 않아요.</li><li>그래서 이미 앞면이 연속으로 나온 뒤에도 다음 한 번이 앞면일 확률은 그대로 '+fr(1,2)+'이에요.</li><li>헷갈리는 두 질문: “아직 던지기 전에 4번 모두 앞면일 확률”은 '+fr(1,16)+'로 아주 낮아요. 하지만 “이미 3번 앞면이 나온 뒤 4번째도 앞면일 확률”은 '+fr(1,2)+'이에요.</li><li>앞의 결과가 뒤의 조건을 바꾸지 않으니까 확률도 바뀌지 않아요. “잃었으니 이번엔 딸 차례”라는 생각이 틀린 까닭이기도 해요.</li></ul>',
 tryIt:['연속 4번으로 놓고 1만 번, 100만 번 던져 질문 ②의 실험 비율을 보세요.','연속 횟수를 8번으로 올려도 다음 동전은 반반일까요?','질문 ①과 질문 ②의 계산 값이 왜 이렇게 다른지 말로 설명해 보세요.']
});

/* ===================== 3차시 ===================== */
const RUNCOL=['#2f7fd1','#2e9e6b','#e8772e','#7a52c7','#d9534f'];
EX.push({course:'math',id:'lln',lesson:3,name:'큰 수의 법칙',size:[800,480],
 ask:'<b>예상해 보기</b> 동전을 10번 던졌더니 앞면이 7번 나왔어요. 확률 1/2이 틀린 걸까요? 100번, 1만 번, 100만 번 던지면 어떻게 될까요?',
 controls:[{type:'seg',key:'kind',label:'무엇을 셀까',opts:[['coin','동전의 앞면'],['die','주사위의 1의 눈']],val:'coin'},
  {type:'seg',key:'faces',label:'주사위 면 수 (주사위일 때)',opts:[4,6,8,10,12,16].map(f=>[f,f+'면']),val:6}],
 buttons:[{label:'+1번',act:'a1'},{label:'+10번',act:'a10'},{label:'+100번',act:'a100'},{label:'100만 번까지 자동',act:'auto'},{label:'새 줄로 다시',act:'new',ghost:true},{label:'모두 지우기',act:'clear',ghost:true}],
 p0(s){return s.p.kind==='coin'?.5:1/s.p.faces;},
 fresh(){return{n:0,k:0,pts:[],next:1,snap:[]};},
 reset(s){s.runs=[this.fresh()];s.auto=false;},
 param(s){this.reset(s);},
 add(s,m){const R=s.runs[s.runs.length-1],p=this.p0(s);m=Math.min(m,1e6-R.n);
  for(let i=0;i<m;i++){R.n++;if(Math.random()<p)R.k++;if(R.n>=R.next){R.pts.push([Math.log10(R.n)/6,R.k/R.n]);R.next=R.n<150?R.n+1:R.n*1.03;}
   if(R.n===10||R.n===100||R.n===1000||R.n===10000||R.n===100000||R.n===1000000)R.snap.push([R.n,R.k]);}
  if(m>0&&R.pts.length&&R.pts[R.pts.length-1][0]!==Math.log10(R.n)/6)R.pts.push([Math.log10(R.n)/6,R.k/R.n]);},
 act(s,a){if(a==='clear')return this.reset(s);if(a==='new'){s.auto=false;if(s.runs[s.runs.length-1].n){s.runs.push(this.fresh());if(s.runs.length>5)s.runs.shift();}return;}
  if(a==='auto'){s.auto=!s.auto;return;}s.auto=false;this.add(s,{a1:1,a10:10,a100:100}[a]);},
 step(s){if(s.auto){const R=s.runs[s.runs.length-1];if(R.n>=1e6){s.auto=false;return;}this.add(s,Math.max(1,Math.ceil(R.n*0.05)));}},
 draw(s){paper();const p=this.p0(s),R=s.runs[s.runs.length-1],mob=FS>1.3,coin=s.p.kind==='coin',what=coin?'앞면':'1의 눈';
  card(16,16,768,322,`던진 횟수가 늘어날 때 ${what}이 나온 비율`);
  const gx=70,gy=60,gw=690,gh=226,ymax=coin?1:Math.min(1,p*3.2);
  for(let e=0;e<=6;e++){const x=gx+gw*e/6;line(x,gy,x,gy+gh,'#eef2f6',1.5);txt(['1','10','100','1천','1만','10만','100만'][e],x,gy+gh+14,MC.sub,11,true,'center');}
  line(gx,gy+gh,gx+gw,gy+gh,'#8a97a8',1.5);line(gx,gy,gx,gy+gh,'#8a97a8',1.5);
  [0,.25,.5,.75,1].forEach(f=>{const v=ymax*f;txt(pct(v).replace('.0',''),gx-8,gy+gh-gh*f,MC.sub,10,true,'right');});
  const ey=gy+gh-gh*(p/ymax);line(gx,ey,gx+gw,ey,MC.red,2.5,[7,5]);txt('계산한 확률 '+(coin?'1/2':'1/'+s.p.faces),gx+gw-4,ey-11,MC.red,12,true,'right');
  plotLines(gx,gy,gw,gh,s.runs.map((r,i)=>({pts:r.pts,col:RUNCOL[i%5],w:i===s.runs.length-1?2.6:1.6,a:i===s.runs.length-1?1:.45})),0,ymax);
  if(R.n){const lp=R.pts[R.pts.length-1];circle(gx+lp[0]*gw,gy+gh-clamp(lp[1]/ymax,0,1)*gh,5,RUNCOL[(s.runs.length-1)%5],'#fff',2);}
  txt('던진 횟수 →',gx+gw,gy+gh+34,MC.sub,11,true,'right');
  card(16,348,768,116);const diff=R.k-R.n*p,cx=[36,230,424,610];
  const S=(i,l,v,col)=>{txt(l,cx[i],372,MC.sub,12,true);txt(v,cx[i],372+36*Math.min(FS,1.35),col||MC.ink,mob?15:23,true);};
  S(0,'던진 횟수',fmtN(R.n)+'번');S(1,what+' 횟수',fmtN(R.k)+'번');
  if(!mob){S(2,'기대 횟수와의 차이',R.n?(diff>=0?'+':'−')+fmtN(Math.abs(diff))+'번':'-');S(3,'나온 비율',R.n?pct(R.k/R.n):'-',R.n&&Math.abs(R.k/R.n-p)<0.01?MC.green:MC.gold);
   txt(R.n?`계산과 ${(Math.abs(R.k/R.n-p)*100).toFixed(2)}%p 차이`:'',cx[3],444,MC.sub,12,true);txt(`기대 횟수 ${fmtN(R.n*p)}번`,cx[2],444,MC.sub,12,true);}
  else S(2,'나온 비율',R.n?pct(R.k/R.n):'-');
 },
 now(s){const R=s.runs[s.runs.length-1],p=this.p0(s);if(!R.n)return '버튼을 눌러 조금씩 던져 보세요. 처음에는 선이 크게 출렁이지만, 던질수록 어떻게 되는지 지켜보세요.';
  const d=Math.abs(R.k/R.n-p)*100;let m=`${fmtN(R.n)}번 던져 ${fmtN(R.k)}번 나왔어요(${pct(R.k/R.n)}). `;
  m+=R.n<30?'횟수가 적어서 계산한 확률과 <b>크게 다를 수 있어요</b>. 확률이 틀린 게 아니라 던진 횟수가 적어서예요.':R.n<3000?'선이 빨간 점선 쪽으로 <b>점점 다가가고 있어요</b>.':`계산한 확률과의 차이가 <b>${d.toFixed(2)}%p</b>뿐이에요. 횟수가 많아질수록 수학적 확률에 가까워지는 것, 이것이 <b>큰 수의 법칙</b>이에요.`;
  if(s.runs.length>1)m+=' 새 줄은 처음엔 서로 다르게 출렁이지만 결국 같은 곳으로 모여요.';return m;},
 why:'<ul><li><b>큰 수의 법칙</b>: 횟수가 많아질수록 실제 결과가 수학적 확률에 가까워져요.</li><li>10번 중 앞면 8번은 흔한 일이에요. 하지만 100만 번 중 80만 번은 거의 일어나지 않아요.</li><li>숫자의 차이만 보면 안 돼요. 10번 중 3번 차이는 크지만, 100번 중 1번 차이는 작아요. <b>전체 횟수에 대한 비율</b>로 봐야 해요. 기대 횟수와의 차이(개수)는 오히려 커질 수도 있어요.</li><li>“앞면이 4번 나왔어도 다음은 반반”은 <b>바로 다음 한 번</b> 이야기이고, 큰 수의 법칙은 <b>아주 많이 던졌을 때의 전체 비율</b> 이야기라서 서로 부딪히지 않아요.</li><li>초심자의 행운이 오래가지 않는 까닭, 여론 조사에서 1000명 넘게 물어보는 까닭도 이 법칙이에요.</li></ul>',
 tryIt:['+1번을 10번 눌러 선이 얼마나 출렁이는지 본 뒤 “100만 번까지 자동”을 눌러 보세요.','“새 줄로 다시”를 눌러 여러 줄을 겹쳐 그려 보세요. 처음과 끝이 어떻게 다른가요?','“기대 횟수와의 차이”와 “나온 비율”을 함께 지켜보세요. 차이가 커져도 비율은 가까워지나요?','16면 주사위의 1의 눈으로 바꿔도 같은 일이 일어나나요?'],
 rec(s){if(!s)return '';const R=s.runs[s.runs.length-1],p=this.p0(s);if(!R.snap.length)return '';return '<table><tr><th>던진 횟수</th><th>나온 횟수</th><th>기대와 차이</th><th>비율</th></tr>'+R.snap.map(([n,k])=>`<tr><td>${big(n)}</td><td>${fmtN(k)}</td><td>${fmtN(Math.abs(k-n*p))}</td><td>${pct(k/n)}</td></tr>`).join('')+'</table>';}
});

EX.push({course:'math',id:'rice',lesson:3,name:'쌀알 뿌리기',size:[800,470],
 ask:'<b>예상해 보기</b> 넓이 공식을 모르는 모양의 넓이를, 눈을 감고 쌀알을 뿌려서 알아낼 수 있을까요?',
 controls:[{type:'seg',key:'shape',label:'보자기 위의 모양',opts:[['quad','4색 보자기'],['circle','꽉 찬 원'],['blob','울퉁불퉁한 모양']],val:'quad'},
  {type:'range',key:'per',label:'한 번에 뿌릴 쌀알',vals:[10,100,1000,10000,100000],val:100,fmt:v=>big(v)+'알'}],
 buttons:[{label:'쌀알 뿌리기',act:'go'},{label:'치우기',act:'clear',ghost:true}],
 AREA:40,QC:[['검정','#2b2b2b'],['파랑','#3b7ddd'],['빨강','#e0473c'],['노랑','#f2c230']],
 br(t){return 0.33+0.07*Math.sin(3*t)+0.05*Math.cos(5*t)+0.03*Math.sin(2*t+1);},
 inside(s,x,y){if(s.p.shape==='circle')return (x-.5)**2+(y-.5)**2<=.25;const dx=x-.5,dy=y-.5;return Math.hypot(dx,dy)<=this.br(Math.atan2(dy,dx));},
 reset(s){s.n=0;s.in=0;s.q=[0,0,0,0];s.dots=0;if(!s.off){s.off=document.createElement('canvas');s.off.width=s.off.height=600;}
  const g=s.off.getContext('2d'),Z=600;g.clearRect(0,0,Z,Z);
  if(s.p.shape==='quad'){this.QC.forEach((c,i)=>{g.fillStyle=c[1];g.globalAlpha=.88;g.fillRect((i%2)*Z/2,Math.floor(i/2)*Z/2,Z/2,Z/2);});g.globalAlpha=1;}
  else{g.fillStyle='#fdf1d6';g.fillRect(0,0,Z,Z);g.fillStyle='#dff0e6';g.strokeStyle='#2e9e6b';g.lineWidth=4;g.beginPath();
   if(s.p.shape==='circle')g.arc(Z/2,Z/2,Z/2-2,0,7);else for(let i=0;i<=360;i++){const t=i*Math.PI/180,r=this.br(t)*Z;g.lineTo(Z/2+r*Math.cos(t),Z/2+r*Math.sin(t));}
   g.closePath();g.fill();g.stroke();}
  if(s.p.shape==='blob'){let a=0;const N=7200;for(let i=0;i<N;i++){const r=this.br(i/N*2*Math.PI);a+=r*r/2*(2*Math.PI/N);}s.true=a*this.AREA;}else s.true=this.AREA*Math.PI/4;},
 param(s,k){if(k==='shape')this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);const g=s.off.getContext('2d'),n=s.p.per,quad=s.p.shape==='quad',draw=Math.min(n,2500);
  for(let i=0;i<n;i++){const x=Math.random(),y=Math.random();let inn=false;if(quad)s.q[(x<.5?0:1)+(y<.5?0:2)]++;else{inn=this.inside(s,x,y);if(inn)s.in++;}
   if(i<draw&&s.dots<40000){g.fillStyle=quad?'#fffbe8':inn?'#1f7a4d':'#d9534f';g.fillRect(x*600-2,y*600-2,4,4);s.dots++;}}
  s.n+=n;},
 step(){},
 draw(s){paper();const mob=FS>1.3,quad=s.p.shape==='quad',A=this.AREA;
  card(16,16,438,438,`보자기 전체 넓이 = ${A}`);ctx.drawImage(s.off,35,46,400,400);ctx.strokeStyle='#8a7d5c';ctx.lineWidth=2;ctx.strokeRect(35,46,400,400);
  if(s.n>s.dots&&!mob)txt(`쌀알 ${fmtN(s.n)}알 중 ${fmtN(s.dots)}알만 그렸어요`,235,434,'#1d2a3a',11,true,'center','rgba(255,255,255,.85)');
  card(466,16,318,438,`뿌린 쌀알: ${fmtN(s.n)}알`);
  if(quad){this.QC.forEach((c,i)=>{const y=74+i*86*Math.min(1,1/FS*1.3);box(486,y-12,20,20,c[1],null,4);txt(c[0],514,y,MC.ink,14,true);
     txt(`${fmtN(s.q[i])}알`,582,y,MC.ink,13,true);if(s.n){txt(pct(s.q[i]/s.n),764,y,MC.blue,13,true,'right');
      if(!mob){hbar(486,y+18,278,10,s.q[i]/s.n,.25,MC.bar);txt(`넓이 약 ${(A*s.q[i]/s.n).toFixed(1)}`,486,y+44,MC.sub,12,true);}}});
   if(!mob)txt('빨간 선: 1/4 (25%) · 각 칸의 진짜 넓이는 10',486,430,MC.red,11,true);}
  else{const r=s.n?s.in/s.n:0;txt('모양 안',486,70,'#1f7a4d',13,true);txt(fmtN(s.in)+'알',764,70,'#1f7a4d',15,true,'right');
   txt('모양 밖',486,70+28*FS,MC.red,13,true);txt(fmtN(s.n-s.in)+'알',764,70+28*FS,MC.red,15,true,'right');
   txt('안에 떨어진 비율',486,170,MC.sub,12,true);txt(s.n?pct(r):'-',764,170,MC.blue,16,true,'right');hbar(486,186,278,14,r,s.true/A,MC.bar);
   txt(`쌀알로 구한 넓이 (${A} × 비율)`,486,246,MC.sub,12,true);txt(s.n?'약 '+(A*r).toFixed(2):'-',486,246+34*Math.min(FS,1.3),MC.ink,mob?20:30,true);
   if(!mob){txt(s.p.shape==='circle'?'공식으로 구한 넓이 (반지름×반지름×3.14…)':'컴퓨터가 아주 잘게 나눠 구한 넓이',486,340,MC.sub,12,true);txt(s.true.toFixed(2),486,372,MC.red,22,true);
    if(s.n)txt(`차이 ${Math.abs(A*r-s.true).toFixed(2)}`,486,416,MC.sub,13,true);}}
 },
 now(s){const A=this.AREA;if(!s.n)return '눈을 감고 아무 데나 고르게 쌀알을 뿌려요. <b>쌀알 뿌리기</b>를 눌러 보세요.';
  if(s.p.shape==='quad'){const d=Math.max(...s.q.map(v=>Math.abs(v/s.n-.25)))*100;return `${fmtN(s.n)}알을 뿌렸어요. 네 칸은 넓이가 같아서 각각 ${fr(1,4)}쯤 떨어져야 해요. 지금 가장 큰 차이는 <b>${d.toFixed(1)}%p</b>예요.`+(s.n<1000?' 더 많이 뿌리면 어떻게 될까요?':' 떨어진 비율이 곧 넓이의 비율이에요.');}
  const est=A*s.in/s.n;return `${fmtN(s.n)}알 중 <b>${fmtN(s.in)}알</b>이 모양 안에 떨어졌어요. 넓이는 ${A} × ${pct(s.in/s.n)} = <b>약 ${est.toFixed(2)}</b>. 진짜 넓이 ${s.true.toFixed(2)}와 ${Math.abs(est-s.true).toFixed(2)} 차이예요.`+(s.n<5000?' 쌀알을 더 뿌리면 더 정확해져요.':'');},
 why:'<ul><li><b>몬테카를로 방법</b>: 무작위로(아무렇게나, 규칙 없이) 여러 번 실험해서 확률이나 값을 알아내는 방법이에요.</li><li>쌀알을 아무 데나 고르게 뿌리면 넓은 곳에는 많이, 좁은 곳에는 적게 떨어져요. 그래서 <b>쌀알이 떨어진 비율 = 넓이의 비율</b>이에요.</li><li>울퉁불퉁한 모양처럼 넓이 공식이 없어도, 안에 떨어진 쌀알만 세면 넓이를 알 수 있어요.</li><li>많이 뿌릴수록 정확해지는 까닭은 <b>큰 수의 법칙</b> 때문이에요.</li><li>꼭 <b>눈을 가리고 무작위로</b> 뿌려야 해요. 일부러 모양 안에 떨어뜨리면 이 방법을 쓸 수 없어요.</li><li>1946년 수학자 울람이 카드 게임에서 이길 확률을 “수백 번 해 보고 세어서” 구하자는 생각에서 시작됐고, 지금은 날씨 예측과 인공지능에도 쓰여요.</li></ul>',
 tryIt:['4색 보자기에 10알만 뿌려 보고, 다시 1만 알을 뿌려 네 칸의 비율을 비교해 보세요.','원에 100알 → 1만 알 → 10만 알을 차례로 뿌리며 넓이가 31.4에 가까워지는지 보세요.','울퉁불퉁한 모양의 넓이를 예상해 본 뒤 쌀알로 확인해 보세요.']
});

EX.push({course:'math',id:'monty',lesson:3,name:'몬티홀 문제',size:[800,470],
 ask:'<b>예상해 보기</b> 문 하나 뒤에 자동차, 나머지 뒤에 염소가 있어요. 내가 문을 고르면 사회자가 염소 문을 열어 보여 줘요. 선택을 바꾸는 게 유리할까요, 그대로가 유리할까요, 똑같을까요?',
 controls:[{type:'seg',key:'doors',label:'문의 개수',opts:[[3,'3개'],[5,'5개'],[10,'10개']],val:3},
  {type:'seg',key:'host',label:'사회자는 자동차 위치를',opts:[['know','알고 있다'],['blind','모른다 (아무 문이나 연다)']],val:'know'}],
 buttons:[{label:'바꾼다',act:'sw'},{label:'안 바꾼다',act:'st'},{label:'1000판 자동: 늘 바꾸기',act:'asw',ghost:true},{label:'1000판 자동: 안 바꾸기',act:'ast',ghost:true},{label:'기록 지우기',act:'clear',ghost:true}],
 reset(s){s.ph='pick';s.car=-1;s.pick=-1;s.other=-1;s.final=-1;s.st={sw:[0,0],st:[0,0],void:0};},
 param(s){this.reset(s);},
 deal(s,pick){const n=s.p.doors,car=rint(n);let other;
  if(s.p.host==='know')other=car!==pick?car:(pick+1+rint(n-1))%n;else other=(pick+1+rint(n-1))%n;
  return{car,other,void:car!==pick&&car!==other};},
 start(s,pick){const d=this.deal(s,pick);s.car=d.car;s.pick=pick;s.other=d.other;s.final=-1;if(d.void){s.ph='void';s.st.void++;}else s.ph='decide';},
 act(s,a){if(a==='clear')return this.reset(s);
  if((a==='sw'||a==='st')&&s.ph==='decide'){s.final=a==='sw'?s.other:s.pick;s.st[a][1]++;if(s.final===s.car)s.st[a][0]++;s.ph='done';}
  if(a==='asw'||a==='ast'){const k=a==='asw'?'sw':'st';for(let i=0;i<1000;i++){const pick=rint(s.p.doors),d=this.deal(s,pick);if(d.void){s.st.void++;continue;}s.st[k][1]++;if((k==='sw'?d.other:pick)===d.car)s.st[k][0]++;}if(s.ph!=='decide')s.ph='pick';}},
 step(){},
 geo(s){const n=s.p.doors,dw=Math.min(120,(768-(n-1)*8)/n),gap=n>1?Math.min(40,(768-n*dw)/(n-1)):0,x0=16+(768-(n*dw+(n-1)*gap))/2;return{n,dw,x:i=>x0+i*(dw+gap)};},
 click(s,x,y){if(y<36||y>220)return;const g=this.geo(s);for(let i=0;i<g.n;i++)if(x>=g.x(i)&&x<=g.x(i)+g.dw){if(s.ph!=='decide')this.start(s,i);return;}},
 draw(s){paper();const g=this.geo(s),mob=FS>1.3,dh=150,dy=44,know=s.p.host==='know',n=g.n;
  for(let i=0;i<n;i++){const x=g.x(i),w=g.dw,open=s.ph==='done'||s.ph==='void'?true:s.ph==='decide'?(i!==s.pick&&i!==s.other):false,mine=i===s.pick&&s.ph!=='pick';
   box(x,dy,w,dh,open?'#efe7da':'#8b5e3c','#5a3a22',5,3);
   if(open){if(i===s.car){const cw=Math.min(w*.7,64);box(x+w/2-cw/2,dy+72,cw,cw*.36,'#d9534f',null,6);box(x+w/2-cw*.3,dy+72-cw*.24,cw*.55,cw*.28,'#d9534f',null,5);circle(x+w/2-cw*.28,dy+72+cw*.36,cw*.11,'#1d2a3a');circle(x+w/2+cw*.28,dy+72+cw*.36,cw*.11,'#1d2a3a');if(w>44)txt('자동차',x+w/2,dy+128,MC.red,12/Math.max(1,FS*.75),true,'center');}
     else if(w>38)txt('염소',x+w/2,dy+dh/2,'#7a6a55',14/Math.max(1,FS*.75),true,'center');else circle(x+w/2,dy+dh/2,6,'#b8a88f');}
   else{ctx.font=`900 ${Math.min(w*.5,44)}px ${FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f6e3c7';ctx.fillText(i+1,x+w/2,dy+dh/2);circle(x+w-10,dy+dh/2,3.5,'#f2b32c');}
   if(mine){box(x-4,dy-4,w+8,dh+8,null,MC.blue,7,4);if(w>60||!mob)txt(w>60?'내가 고른 문':'내 문',x+w/2,dy+dh+16,MC.blue,11,true,'center');}
   if(s.ph==='decide'&&i===s.other&&(w>60||!mob))txt(w>60?'바꿀 수 있는 문':'바꿀 문',x+w/2,dy+dh+16,MC.red,11,true,'center');
   if(s.ph==='done'&&i===s.final){box(x-4,dy-4,w+8,dh+8,null,i===s.car?MC.green:MC.red,7,4);}}
  const msg={pick:'문을 눌러서 하나 골라 보세요',decide:`사회자가 염소 문 ${n-2}개를 열었어요. 바꿀까요?`,done:s.final===s.car?'자동차 당첨! 문을 눌러 새 판을 시작해요':'염소였어요. 문을 눌러 새 판을 시작해요',void:'사회자가 실수로 자동차를 보여 줬어요. 이 판은 무효! 문을 눌러 다시 해요'}[s.ph];
  txt(msg,400,dy+dh+44*Math.min(FS,1.2),s.ph==='done'?(s.final===s.car?MC.green:MC.red):MC.ink,15,true,'center');
  const y0=mob?292:268;card(16,y0,768,470-y0-10,'이긴 비율 (빨간 선은 계산한 확률)');
  const E=know?{sw:(n-1)/n,st:1/n}:{sw:.5,st:.5},rowH=(470-y0-58)/2;
  [['sw','바꿨을 때'],['st','안 바꿨을 때']].forEach(([k,l],i)=>{const y=y0+44+i*rowH,[w,t]=s.st[k];txt(l,36,y+12,MC.ink,13,true);hbar(mob?250:170,y,mob?300:400,24,t?w/t:0,E[k],k==='sw'?MC.bar:'#c7b08e');
    txt(t?`${fmtN(t)}판 중 ${fmtN(w)}판 (${pct(w/t)})`:'아직 없음',764,y+12+(mob?30:0),MC.blue,12,true,'right');});
  if(!know&&s.st.void&&!mob)txt(`무효가 된 판: ${fmtN(s.st.void)}판`,36,452,MC.sub,11,true);
 },
 now(s){const n=s.p.doors,know=s.p.host==='know';const [a,b]=s.st.sw,[c,d]=s.st.st;
  if(b+d<5)return {pick:'캔버스의 문을 눌러 하나 골라요. 직접 여러 판 해 보거나, 1000판 자동으로 비교해 보세요.',decide:`문이 두 개 남았어요. “반반 아닐까?” 하고 느껴지지만, 정말 그런지 <b>바꾼다 / 안 바꾼다</b>를 골라 확인해 보세요.`,done:'결과가 기록됐어요. 문을 눌러 새 판을 시작해요.',void:'사회자가 답을 모르면 이렇게 자동차 문을 열어 버릴 수도 있어요.'}[s.ph];
  const m=`바꿨을 때 ${b?pct(a/b):'-'}, 안 바꿨을 때 ${d?pct(c/d):'-'} 이겼어요. `;
  return m+(know?`사회자가 답을 알고 염소 문만 열어 주면, 바꾸는 쪽이 ${fr(n-1,n)}로 <b>${n-1}배 유리</b>해요. 반반이 아니에요.`:'사회자가 답을 모르고 우연히 염소가 나온 경우에는 <b>정말로 반반</b>이라, 바꾸든 안 바꾸든 차이가 없어요.');},
 why:'<ul><li>처음 고른 문에 자동차가 있을 확률은 '+fr(1,3)+', 나머지 두 문 중에 있을 확률은 '+fr(2,3)+'예요.</li><li>사회자는 <b>답을 알고</b> 염소가 있는 문만 골라서 열어요. 그래서 나머지 문들이 가지고 있던 '+fr(2,3)+'가 사라지지 않고, 남은 한 문에 <b>몰려요</b>.</li><li>그래서 바꾸면 '+fr(2,3)+', 안 바꾸면 '+fr(1,3)+'. 바꾸는 쪽이 두 배 유리해요.</li><li>문이 10개라면 더 분명해요. 사회자가 염소 문 8개를 열어 주면, 남은 한 문에 '+fr(9,10)+'가 몰려요.</li><li>사회자가 답을 <b>모르고</b> 아무 문이나 열었는데 우연히 염소였다면, 그 행동에는 정보가 없어서 반반이에요. “새로운 사실이 조건을 바꾸었나?”를 따지는 문제예요.</li></ul>',
 tryIt:['직접 10판쯤 해 본 뒤, 1000판 자동으로 두 방법을 비교해 보세요.','문을 10개로 늘려 보세요. 바꾸는 쪽이 왜 유리한지 더 잘 느껴지나요?','사회자가 “모른다”로 바꾸고 1000판씩 돌려 보세요. 결과가 어떻게 달라지나요?']
});

/* ===================== 4차시 ===================== */
const WSEQ=['g','b','g','r','g','b','g','y','g','b','g','r','g','b','g','k','g','b','g','r'];
const WC={g:['초록','#3aa65b',10,1],b:['파랑','#3b7ddd',5,2],r:['빨강','#e0473c',3,5],y:['노랑','#e3b21f',1,8],k:['검정','#2b2b2b',1,10]};
EX.push({course:'math',id:'wheel',lesson:4,name:'돌림판 부스',size:[800,480],
 ask:'<b>예상해 보기</b> 쿠폰 1장을 걸어요. 검정에 걸면 10장이나 준대요! 어느 색에 거는 것이 가장 유리할까요?',
 controls:[{type:'seg',key:'bet',label:'쿠폰을 걸 색깔',opts:Object.keys(WC).map(k=>[k,WC[k][0]]),val:'k'},
  {type:'range',key:'prize',label:'이 색을 맞추면 받는 쿠폰 (주인이 되어 바꿔 보기)',min:1,max:25,step:1,val:10,fmt:v=>v+'장'}],
 buttons:[{label:'돌리기',act:'spin'},{label:'20판 자동',act:'a20'},{label:'1000판 자동',act:'a1000'},{label:'처음부터 (상금도 원래대로)',act:'reset',ghost:true}],
 reset(s){s.prize={};Object.keys(WC).forEach(k=>s.prize[k]=WC[k][3]);s.net=0;s.n=0;s.hist=[];s.ang=0;s.spin=null;s.res=-1;s.msg='';},
 param(s,k){if(k==='bet'){s.p.prize=s.prize[s.p.bet];buildControls();}else s.prize[s.p.bet]=s.p.prize;s.net=0;s.n=0;s.hist=[];s.msg='';},
 ev(s,c){const w=WC[c][2];return w*s.prize[c]-(20-w);},
 settle(s,i){const c=WSEQ[i],win=c===s.p.bet;s.net+=win?s.prize[c]:-1;s.n++;pushHist(s);s.res=i;s.msg=win?`${WC[c][0]}! 쿠폰 ${s.prize[c]}장을 받았어요`:`${WC[c][0]}에서 멈췄어요. 쿠폰 1장을 잃었어요`;s.win=win;},
 act(s,a){if(a==='reset'){this.reset(s);s.p.prize=s.prize[s.p.bet];buildControls();return;}
  if(s.spin)return;if(a==='spin'){const i=rint(20),seg=Math.PI*2/20,to=-(i+.5)*seg-rnd(-.3,.3)*seg;let d=((to-s.ang)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)+Math.PI*8;s.spin={t:0,from:s.ang,d,i};s.msg='';}
  else{const k=a==='a20'?20:1000;let i=0;for(let j=0;j<k;j++){i=rint(20);this.settle(s,i);}s.ang=-(i+.5)*Math.PI/10;s.msg=`${k}판을 자동으로 돌렸어요`;s.win=null;}},
 step(s,dt){if(s.spin){s.spin.t+=dt/2.4;const u=Math.min(1,s.spin.t),e=1-Math.pow(1-u,3);s.ang=s.spin.from+s.spin.d*e;if(u>=1){const i=s.spin.i;s.spin=null;this.settle(s,i);}}},
 draw(s){paper();const mob=FS>1.3,cx=168,cy=190,R=138,seg=Math.PI*2/20,b=s.p.bet,w=WC[b][2],p=s.prize[b],e=this.ev(s,b);
  card(16,16,304,448);
  for(let i=0;i<20;i++){const a0=-Math.PI/2+s.ang+i*seg;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a0,a0+seg);ctx.closePath();ctx.fillStyle=WC[WSEQ[i]][1];ctx.globalAlpha=WSEQ[i]===b?1:.5;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
  circle(cx,cy,16,'#fff','#1d2a3a',2.5);ctx.fillStyle='#1d2a3a';ctx.beginPath();ctx.moveTo(cx-11,cy-R-14);ctx.lineTo(cx+11,cy-R-14);ctx.lineTo(cx,cy-R+10);ctx.closePath();ctx.fill();
  txt(s.msg||'색을 고르고 돌려 보세요',168,360,s.win===true?MC.green:s.win===false?MC.red:MC.ink,mob?10:13,true,'center');
  txt('가진 쿠폰',40,404,MC.sub,12,true);txt(`${20+s.net}장`,40,404+30*Math.min(FS,1.3),20+s.net<0?MC.red:MC.ink,mob?17:24,true);
  if(!mob)txt(20+s.net<0?'(빌린 쿠폰)':`20장에서 시작 · ${fmtN(s.n)}판`,150,438,MC.sub,12,true);
  card(332,16,452,208,`${WC[b][0]}에 걸 때의 기대값`);
  const fs=mob?11:15,y1=74,y2=y1+46*Math.min(FS,1.25),x=352;
  txt('이득',x,y1,MC.blue,12,true);let xx=x+44;xx+=frac(w,20,xx,y1,fs,MC.ink,'left')+8;txt(`× ${p}장 =`,xx,y1,MC.ink,fs,true);xx+=tw(`× ${p}장 =`,fs,true)+10;frac(w*p,20,xx,y1,fs,MC.blue,'left');
  txt('손해',x,y2,MC.red,12,true);xx=x+44;xx+=frac(20-w,20,xx,y2,fs,MC.ink,'left')+8;txt('× 1장 =',xx,y2,MC.ink,fs,true);xx+=tw('× 1장 =',fs,true)+10;frac(20-w,20,xx,y2,fs,MC.red,'left');
  const y3=y2+52*Math.min(FS,1.25);txt('기대값',x,y3,MC.ink,13,true);evDraw(e,20,x+70,y3,mob?15:22,'left');
  if(!mob)txt(e===0?'20판 하면 평균적으로 본전':e<0?`20판 하면 평균 ${-e}장 손해`:`20판 하면 평균 ${e}장 이득 (주인이 손해!)`,x+190,y3,e<0?MC.red:e>0?MC.blue:MC.green,13,true);
  histChart(332,236,452,228,s.hist,s.n,e/20,'쿠폰이 늘거나 줄어든 양');
 },
 now(s){const b=s.p.bet,e=this.ev(s,b),nm=WC[b][0];if(!s.n)return `${nm}은 20칸 중 <b>${WC[b][2]}칸</b>이고 맞추면 ${s.prize[b]}장을 받아요. 한 판씩 돌려 보거나 자동으로 여러 판 돌려 보세요.`;
  let m=`${nm}에 ${fmtN(s.n)}판 걸어서 쿠폰이 <b>${s.net>=0?'+':''}${fmtN(s.net)}장</b> 변했어요. 계산으로는 ${(s.n*e/20>=0?'+':'')}${fmtN(s.n*e/20)}장쯤 될 거라고 예상돼요. `;
  m+=s.n<40?'몇 판만으로는 계산과 많이 다를 수 있어요. 운 좋게 딸 수도 있어요.':'판 수가 많아지니 파란 선이 빨간 점선(기대값)을 <b>따라가요</b>.';return m;},
 why:'<ul><li><b>기대값</b>은 게임을 여러 번 반복했을 때 결국 얼마나 이득 또는 손해를 보는지 알려 주는 값이에요.</li><li>기대값 = (맞출 확률 × 받는 이득) − (못 맞출 확률 × 잃는 손해)</li><li>검정은 상금이 10장이지만 20칸 중 1칸뿐이에요. '+fr(1,20)+'×10 − '+fr(19,20)+'×1 = −'+fr(9,20)+'. 20판에 평균 9장을 잃어요.</li><li>상금이 가장 적은 초록이 기대값 0(본전)으로 가장 유리해요. <b>상금이 크다고 유리한 게 아니라 상금과 확률을 함께 봐야 해요.</b></li><li>기대값이 손해여도 한두 판은 딸 수 있어요. 기대값은 한 판의 결과가 아니라 <b>많이 했을 때</b> 결과가 어디로 가는지 알려 줘요.</li></ul>',
 tryIt:['검정에 한 판씩 20번 걸어 보세요. 몇 번이나 맞나요? 쿠폰은 얼마나 남나요?','다섯 색을 차례로 골라 1000판 자동을 돌려 어느 색이 가장 덜 잃는지 비교해 보세요.','내가 부스 주인이라면? 초록의 상금을 2장으로 올리면 누가 손해를 볼까요?','검정의 상금이 몇 장이어야 본전이 될까요? 슬라이더로 찾아보세요.'],
 rec(s){if(!s)return '';return '<table><tr><th>색</th><th>확률</th><th>상금</th><th>기대값</th></tr>'+Object.keys(WC).map(k=>`<tr><td>${WC[k][0]}</td><td>${fr(WC[k][2],20)}</td><td>${s.prize[k]}장</td><td>${evHtml(this.ev(s,k),20)}</td></tr>`).join('')+'</table>';}
});

const DPRIZE={2:30,3:15,4:10,5:8,6:6,7:4,8:6,9:8,10:10,11:15,12:30};
EX.push({course:'math',id:'dicebooth',lesson:4,name:'주사위 부스',size:[800,480],
 ask:'<b>예상해 보기</b> 주사위 2개 눈의 합을 맞추는 게임이에요. 가장 잘 나오는 7에 걸까요, 상금이 30장인 2에 걸까요?',
 controls:[{type:'range',key:'bet',label:'쿠폰을 걸 숫자 (두 눈의 합)',min:2,max:12,step:1,val:7,fmt:v=>'합 '+v},
  {type:'range',key:'prize',label:'이 숫자를 맞추면 받는 쿠폰',min:1,max:40,step:1,val:4,fmt:v=>v+'장'}],
 buttons:[{label:'굴리기',act:'roll'},{label:'36판 자동',act:'a36'},{label:'3600판 자동',act:'a3600'},{label:'처음부터 (상금도 원래대로)',act:'reset',ghost:true}],
 reset(s){s.prize={...DPRIZE};s.net=0;s.n=0;s.hist=[];s.last=null;s.msg='';s.win=null;},
 param(s,k){if(k==='bet'){s.p.prize=s.prize[s.p.bet];buildControls();}else s.prize[s.p.bet]=s.p.prize;s.net=0;s.n=0;s.hist=[];s.msg='';s.win=null;},
 ways(t){return 6-Math.abs(7-t);},
 ev(s,t){const w=this.ways(t);return w*s.prize[t]-(36-w);},
 play(s){const a=rint(6)+1,b=rint(6)+1,win=a+b===s.p.bet;s.net+=win?s.prize[s.p.bet]:-1;s.n++;pushHist(s);s.last=[a,b];return win;},
 act(s,a){if(a==='reset'){this.reset(s);s.p.prize=s.prize[s.p.bet];buildControls();return;}
  if(a==='roll'){s.win=this.play(s);s.msg=s.win?`합 ${s.p.bet}! 쿠폰 ${s.prize[s.p.bet]}장을 받았어요`:`합 ${s.last[0]+s.last[1]}. 쿠폰 1장을 잃었어요`;}
  else{const k=a==='a36'?36:3600;for(let i=0;i<k;i++)this.play(s);s.win=null;s.msg=`${fmtN(k)}판을 자동으로 굴렸어요`;}},
 step(){},
 draw(s){paper();const mob=FS>1.3,t=s.p.bet,w=this.ways(t),p=s.prize[t],e=this.ev(s,t);
  card(16,16,250,208);if(s.last){drawDie(96,84,64,s.last[0]);drawDie(186,84,64,s.last[1]);}else txt('굴리기를 눌러 보세요',141,84,MC.sub,13,true,'center');
  txt(s.msg,141,140,s.win===true?MC.green:s.win===false?MC.red:MC.ink,mob?8:12,true,'center');
  txt('가진 쿠폰',36,176,MC.sub,12,true);txt(`${20+s.net}장`,mob?150:110,178,20+s.net<0?MC.red:MC.ink,mob?14:22,true);if(FS<1.1)txt(`${fmtN(s.n)}판`,246,178,MC.sub,12,true,'right');
  card(278,16,506,208,`합 ${t}에 걸 때의 기대값 (합 ${t}이 되는 경우 ${w}가지)`);
  const fs=mob?11:15,y1=74,y2=y1+46*Math.min(FS,1.25),x=298;
  txt('이득',x,y1,MC.blue,12,true);let xx=x+44;xx+=frac(w,36,xx,y1,fs,MC.ink,'left')+8;txt(`× ${p}장 =`,xx,y1,MC.ink,fs,true);xx+=tw(`× ${p}장 =`,fs,true)+10;frac(w*p,36,xx,y1,fs,MC.blue,'left');
  txt('손해',x,y2,MC.red,12,true);xx=x+44;xx+=frac(36-w,36,xx,y2,fs,MC.ink,'left')+8;txt('× 1장 =',xx,y2,MC.ink,fs,true);xx+=tw('× 1장 =',fs,true)+10;frac(36-w,36,xx,y2,fs,MC.red,'left');
  const y3=y2+52*Math.min(FS,1.25);txt('기대값',x,y3,MC.ink,13,true);evDraw(e,36,x+70,y3,mob?15:22,'left');
  if(!mob)txt(e===0?'36판 하면 평균적으로 본전':e<0?`36판 하면 평균 ${-e}장 손해`:`36판 하면 평균 ${e}장 이득 (주인이 손해!)`,x+190,y3,e<0?MC.red:e>0?MC.blue:MC.green,13,true);
  card(16,236,380,228,'숫자별 기대값 (36판 기준)');
  const E=[];for(let k=2;k<=12;k++)E.push(this.ev(s,k));const mx=Math.max(6,...E.map(Math.abs)),bx=34,bw=344/11,zy=mob?340:330,sc=70/mx;
  line(bx,zy,bx+344,zy,'#8a97a8',1.5);
  E.forEach((v,i)=>{const x0=bx+i*bw+4,h=v*sc,k=i+2;ctx.fillStyle=v<0?'#e58a82':v>0?MC.bar:MC.green;if(v===0)ctx.fillRect(x0,zy-3,bw-8,6);else ctx.fillRect(x0,Math.min(zy,zy-h),bw-8,Math.abs(h));
    if(k===t)box(x0-3,zy-76,bw-2,152,null,MC.ink,4,2);if(!mob)txt(v===0?'0':(v>0?'+':'−')+Math.abs(v),x0+(bw-8)/2,v<=0?zy-h+11:zy-h-10,v<0?MC.red:v>0?MC.blue:MC.green,10,true,'center');
    txt(k,x0+(bw-8)/2,zy+92,MC.ink,11,true,'center');if(!mob)txt(s.prize[k]+'장',x0+(bw-8)/2,zy+110,MC.sub,9.5,true,'center');});
  histChart(408,236,376,228,s.hist,s.n,e/36,'쿠폰이 늘거나 줄어든 양');
 },
 now(s){const t=s.p.bet,e=this.ev(s,t),w=this.ways(t);if(!s.n)return `합 ${t}이 나올 확률은 ${fr(w,36)}이고, 맞추면 ${s.prize[t]}장을 받아요. 아래 막대에서 숫자별 기대값을 비교해 보세요.`;
  let m=`합 ${t}에 ${fmtN(s.n)}판 걸어서 쿠폰이 <b>${s.net>=0?'+':''}${fmtN(s.net)}장</b> 변했어요(계산으로는 ${(e>=0?'+':'')}${fmtN(s.n*e/36)}장쯤). `;
  let all=true;for(let k=2;k<=12;k++)if(this.ev(s,k)>0)all=false;
  m+=all?'막대를 보면 <b>이득인 숫자가 하나도 없어요</b>. 잘해야 본전이에요.':'지금 상금표에는 손님이 이득 보는 숫자가 있어요. 주인이라면 고쳐야 해요.';return m;},
 why:'<ul><li>주사위 2개의 경우는 6×6=36가지예요. 합 7은 6가지로 가장 잘 나오고, 2와 12는 1가지뿐이에요.</li><li>2에 걸면 '+fr(1,36)+'×30 − '+fr(35,36)+'×1 = −'+fr(5,36)+', 7에 걸면 '+fr(6,36)+'×4 − '+fr(30,36)+'×1 = −'+fr(6,36)+'. <b>잘 나오는 것과 유리한 것은 다른 이야기예요.</b></li><li>손해가 조금 더 적은 쪽은 있지만 둘 다 손해예요. 가장 좋은 선택은 “둘 다 하지 않는 것”이에요.</li><li>확률과 상금이 7을 가운데 두고 좌우 대칭이라 기대값도 대칭이에요.</li><li>부스 주인은 자기가 손해 보지 않도록 미리 기대값을 계산해서 상금을 정해요.</li></ul>',
 tryIt:['2와 7에 각각 3600판 자동을 돌려 어느 쪽이 덜 잃는지 확인해 보세요.','막대그래프에서 본전인 숫자를 찾아 그 숫자에 걸어 보세요. 정말 본전 근처인가요?','합 7의 상금이 몇 장이면 본전이 될까요? 그보다 올리면 누가 손해인가요?'],
 rec(s){if(!s)return '';let h='<table><tr><th>합</th><th>확률</th><th>상금</th><th>기대값</th></tr>';for(let k=2;k<=12;k++)h+=`<tr><td>${k}</td><td>${fr(this.ways(k),36)}</td><td>${s.prize[k]}장</td><td>${evHtml(this.ev(s,k),36)}</td></tr>`;return h+'</table>';}
});

/* ===================== 5차시 ===================== */
const BALL=[['r','빨강','#e0473c'],['b','파랑','#3b7ddd'],['w','흰색','#ffffff']];
EX.push({course:'math',id:'bag',lesson:5,name:'공 주머니 게임 설계',size:[800,470],
 ask:'<b>내가 부스 주인!</b> 손님이 쿠폰 1장을 걸고 공 색깔을 맞추는 게임이에요. 영수가 정한 상금에는 문제가 있대요. 어떤 문제일까요? 주인이 손해 보지 않게 고쳐 보세요.',
 controls:[{type:'range',key:'nr',label:'빨간 공',min:1,max:6,step:1,val:1,fmt:v=>v+'개'},{type:'range',key:'nb',label:'파란 공',min:1,max:6,step:1,val:2,fmt:v=>v+'개'},{type:'range',key:'nw',label:'흰 공',min:1,max:6,step:1,val:3,fmt:v=>v+'개'},
  {type:'range',key:'pr',label:'빨강 상금',min:1,max:10,step:1,val:4,fmt:v=>v+'장'},{type:'range',key:'pb',label:'파랑 상금',min:1,max:10,step:1,val:3,fmt:v=>v+'장'},{type:'range',key:'pw',label:'흰색 상금',min:1,max:10,step:1,val:2,fmt:v=>v+'장'},
  {type:'seg',key:'cust',label:'어떤 손님이 올까',opts:[['smart','기대값을 계산하는 손님'],['rand','아무 색에나 거는 손님']],val:'smart',wide:true}],
 buttons:[{label:'손님 1명',act:'c1'},{label:'손님 100명',act:'c100'},{label:'손님 1만 명',act:'c10000'},{label:'기록 지우기',act:'clear',ghost:true}],
 reset(s){s.net=0;s.n=0;s.hist=[];s.msg='';},
 param(s){this.reset(s);},
 T(s){return s.p.nr+s.p.nb+s.p.nw;},
 ev(s,k){const c=s.p['n'+k],T=this.T(s);return c*s.p['p'+k]-(T-c);},
 best(s){let b='r';['b','w'].forEach(k=>{if(this.ev(s,k)>this.ev(s,b))b=k;});return b;},
 per(s){const T=this.T(s);return s.p.cust==='smart'?-this.ev(s,this.best(s))/T:-(this.ev(s,'r')+this.ev(s,'b')+this.ev(s,'w'))/3/T;},
 act(s,a){if(a==='clear')return this.reset(s);const k=+a.slice(1),T=this.T(s),best=this.best(s);let bet,win,col;
  for(let i=0;i<k;i++){bet=s.p.cust==='smart'?best:'rbw'[rint(3)];const x=rint(T);col=x<s.p.nr?'r':x<s.p.nr+s.p.nb?'b':'w';win=bet===col;s.net+=win?-s.p['p'+bet]:1;s.n++;pushHist(s);}
  const nm=k=>BALL.find(b=>b[0]===k)[1];s.msg=k===1?`손님이 ${nm(bet)}에 걸었고 ${nm(col)} 공이 나왔어요 → 주인 ${win?'−'+s.p['p'+bet]:'+1'}장`:`손님 ${fmtN(k)}명이 다녀갔어요`;},
 step(){},
 draw(s){paper();const mob=FS>1.3,T=this.T(s);
  card(16,16,210,226,`공 ${T}개`);ctx.fillStyle='#f3e6d3';ctx.strokeStyle='#b58a52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(46,70);ctx.quadraticCurveTo(26,230,121,230);ctx.quadraticCurveTo(216,230,196,70);ctx.closePath();ctx.fill();ctx.stroke();
  const A=[];BALL.forEach(b=>{for(let i=0;i<s.p['n'+b[0]];i++)A.push(b[2]);});const cols=T>12?5:4,r=T>12?12:15;
  A.forEach((c,i)=>circle(121-(cols-1)*(r+2)+(i%cols)*(2*r+4),98+Math.floor(i/cols)*(2*r+4),r,c,'#7a8899',1.5));
  card(238,16,546,226,'손님 입장에서 본 기대값');
  const hx=[330,440,548,676];if(!mob)['확률','상금','기대값',''].forEach((h,i)=>txt(h,hx[i],58,MC.sub,12,true,'center'));
  let bad=false,zero=false;BALL.forEach((b,i)=>{const k=b[0],c=s.p['n'+k],e=this.ev(s,k),y=92+i*44;if(e>0)bad=true;if(e===0)zero=true;
    circle(264,y,11,b[2],'#7a8899',1.5);if(!mob)txt(b[1],282,y,MC.ink,13,true);
    frac(c,T,hx[0],y,mob?11:13,MC.ink);txt(s.p['p'+k]+'장',hx[1],y,MC.gold,mob?11:15,true,'center');evDraw(e,T,hx[2],y,mob?11:13);
    if(!mob)txt(e>0?'손님 이득 → 주인 손해':e===0?'본전':'손님 손해 → 주인 이득',hx[3],y,e>0?MC.red:e===0?MC.green:MC.blue,12,true,'center');});
  const y4=228;txt(bad?'손님이 이득 보는 색이 있어요. 이대로 열면 부스가 망해요!':zero?'손님이 잘 골라도 본전이에요. 주인이 손해 보지 않아요.':'어떤 색에 걸어도 손님이 손해예요. 주인에게 유리한 설계예요.',258,y4-4,bad?MC.red:MC.green,mob?8:13,true);
  card(16,254,210,206,'주인의 쿠폰');txt((s.net>=0?'+':'')+fmtN(s.net)+'장',36,318,s.net<0?MC.red:MC.blue,mob?16:26,true);
  if(!mob){txt(`손님 ${fmtN(s.n)}명`,36,356,MC.sub,12,true);txt(s.p.cust==='smart'?'손님은 가장 유리한':'손님은 세 색 중',36,400,MC.sub,12,true);txt(s.p.cust==='smart'?`${BALL.find(b=>b[0]===this.best(s))[1]}에만 걸어요`:'아무 색에나 걸어요',36,420,MC.sub,12,true);}
  histChart(238,254,546,206,s.hist,s.n,this.per(s),'손님이 올수록 주인의 쿠폰은');
 },
 now(s){const T=this.T(s),bk=this.best(s),be=this.ev(s,bk),nm=BALL.find(b=>b[0]===bk)[1];
  let m=s.msg?s.msg+'. ':'';if(be>0)m+=`기대값을 계산할 줄 아는 손님은 <b>${nm}</b>에 걸어서 ${T}판마다 평균 ${be}장을 따 가요. 그 쿠폰은 <b>주인 주머니</b>에서 나가요. ${nm} 상금을 낮추거나 공 개수를 바꿔 보세요.`;
  else if(be===0)m+=`가장 유리한 ${nm}에 걸어도 손님은 본전이에요. 주인은 손해 보지 않아요.`;else m+=`어떤 색에 걸어도 손님이 손해라서, 손님이 많이 올수록 주인의 쿠폰이 늘어요. <b>시간은 주인의 편</b>이에요.`;
  if(s.n>=100&&s.p.cust==='rand'&&be>0)m+=' 아무 색에나 거는 손님만 오면 주인이 벌 수도 있지만, 똑똑한 손님이 오면 달라져요.';return m;},
 why:'<ul><li>손님이 잃은 쿠폰은 주인에게 가고, 손님이 딴 쿠폰은 주인 주머니에서 나가요. <b>손님의 기대값이 +이면 주인은 그만큼 손해</b>예요.</li><li>영수의 게임: 빨강 '+fr(1,6)+'×4 − '+fr(5,6)+' = −'+fr(1,6)+', 파랑 '+fr(2,6)+'×3 − '+fr(4,6)+' = +'+fr(2,6)+', 흰색 '+fr(3,6)+'×2 − '+fr(3,6)+' = +'+fr(3,6)+'. 파랑과 흰색에서 손님이 이득을 봐요.</li><li>고치는 방법: <b>손님의 이득을 낮추고 손해를 높여요</b>. 잘 나오는 색의 상금을 낮추면 돼요.</li><li>손님 한 명은 운 좋게 딸 수 있지만, 손님이 수백 명 오면 결과는 기대값대로 흘러가요(큰 수의 법칙). 주인에게는 운이 필요 없어요.</li><li>세상의 도박도 이렇게 <b>처음부터 참가자가 손해 보도록</b> 숫자가 정해져 있어요.</li></ul>',
 tryIt:['처음 상태에서 “계산하는 손님” 100명을 불러 보세요. 주인의 쿠폰이 어떻게 되나요?','세 색 모두 기대값이 0이나 −가 되도록 상금을 고쳐 보세요.','손님이 재미있어할 만큼 상금은 크게, 그래도 주인은 손해 보지 않게 만들 수 있을까요?','공 개수를 바꾸면 같은 상금이라도 기대값이 어떻게 달라지나요?'],
 rec(s){if(!s)return '';const T=this.T(s);return '<table><tr><th>색</th><th>확률</th><th>상금</th><th>손님 기대값</th></tr>'+BALL.map(b=>`<tr><td>${b[1]}</td><td>${fr(s.p['n'+b[0]],T)}</td><td>${s.p['p'+b[0]]}장</td><td>${evHtml(this.ev(s,b[0]),T)}</td></tr>`).join('')+'</table>';}
});

EX.push({course:'math',id:'boxes',lesson:5,name:'상자 열기 게임',size:[800,480],
 ask:'<b>예상해 보기</b> 상자를 차례로 열어 쿠폰을 쌓아요. 언제든 “그만!” 하면 쌓인 쿠폰을 가져가지만, 꽝이 나오면 모두 잃고 참가비도 잃어요. 몇 개를 열고 멈추는 게 가장 좋을까요?',
 controls:[{type:'range',key:'n',label:'상자 수',min:3,max:8,step:1,val:5,fmt:v=>v+'개'},{type:'range',key:'b',label:'꽝 상자 수',min:1,max:4,step:1,val:2,fmt:v=>v+'개'},
  {type:'range',key:'fee',label:'참가비 (꽝이면 잃는 쿠폰)',min:1,max:3,step:1,val:1,fmt:v=>v+'장'},{type:'range',key:'plan',label:'자동 실험의 계획: 몇 개 열고 멈출까',min:1,max:5,step:1,val:1,fmt:v=>v+'개'}],
 buttons:[{label:'상자 열기',act:'open'},{label:'그만!',act:'stop'},{label:'새 판',act:'new',ghost:true},{label:'1000판 자동 (계획대로)',act:'auto'},{label:'기록 지우기',act:'clear',ghost:true}],
 B(s){return Math.min(s.p.b,s.p.n-1);},
 G(s){return s.p.n-this.B(s);},
 plan(s){return Math.min(s.p.plan,this.G(s));},
 odds(s,k){const n=s.p.n,b=this.B(s),tot=comb(n,b),win=comb(n-k,b);return{tot,win,ev:win*k-(tot-win)*s.p.fee};},
 shuffle(s){const n=s.p.n,a=new Array(n).fill(false);let left=this.B(s);while(left){const i=rint(n);if(!a[i]){a[i]=true;left--;}}return a;},
 newGame(s){s.ord=this.shuffle(s);s.open=0;s.ph='play';},
 reset(s){s.my={n:0,net:0};s.sim={n:0,net:0,k:0};this.newGame(s);},
 param(s){this.reset(s);},
 act(s,a){if(a==='clear')return this.reset(s);if(a==='new')return this.newGame(s);
  if(a==='open'){if(s.ph!=='play'){this.newGame(s);return;}if(s.open>=s.p.n)return;const lose=s.ord[s.open];s.open++;if(lose){s.ph='lost';s.my.n++;s.my.net-=s.p.fee;}else if(s.open>=this.G(s)&&s.ord.slice(0,s.open).filter(v=>!v).length===this.G(s)){s.ph='stop';s.my.n++;s.my.net+=s.open;}}
  if(a==='stop'&&s.ph==='play'&&s.open>0){s.ph='stop';s.my.n++;s.my.net+=s.open;}
  if(a==='auto'){const k=this.plan(s);if(s.sim.k!==k)s.sim={n:0,net:0,k};for(let i=0;i<1000;i++){const o=this.shuffle(s);let ok=true;for(let j=0;j<k;j++)if(o[j]){ok=false;break;}s.sim.n++;s.sim.net+=ok?k:-s.p.fee;}}},
 step(){},
 draw(s){paper();const mob=FS>1.3,n=s.p.n,b=this.B(s),G=this.G(s),pk=this.plan(s);
  card(16,16,768,170,`상자 ${n}개 중 꽝 ${b}개 · 왼쪽부터 차례로 열어요`);
  const bw=Math.min(84,(728-(n-1)*10)/n),x0=36+(728-(n*bw+(n-1)*10))/2;
  for(let i=0;i<n;i++){const x=x0+i*(bw+10),y=52,op=i<s.open,rev=s.ph!=='play'&&!op,lose=s.ord[i];
   if(op||rev){ctx.globalAlpha=rev?.45:1;box(x,y,bw,70,lose?'#fde4e1':'#fff4d6',lose?MC.red:'#e3b23c',6,2.5);txt(lose?'꽝':'쿠폰',x+bw/2,y+35,lose?MC.red:'#8a6500',14/Math.max(1,FS*.8),true,'center');ctx.globalAlpha=1;}
   else{box(x,y,bw,70,'#c8a06a','#7a5a2c',6,2.5);line(x,y+22,x+bw,y+22,'#7a5a2c',2);txt(i+1,x+bw/2,y+46,'#5a3f18',15/Math.max(1,FS*.8),true,'center');}}
  const st=s.ph==='lost'?0:s.open;
  txt(s.ph==='play'?(s.open?`쌓인 쿠폰 ${st}장 · 더 열까요, 그만할까요?`:'상자 열기를 눌러 시작해요'):s.ph==='lost'?`꽝! 쌓은 쿠폰을 모두 잃고 참가비 ${s.p.fee}장도 잃었어요`:`그만! 쿠폰 ${st}장을 가져가요`,400,150+6*FS,s.ph==='lost'?MC.red:s.ph==='stop'?MC.green:MC.ink,mob?10:14,true,'center');
  card(16,198,470,266,'계획별 기대값 (몇 개 열고 멈출지 미리 정했을 때)');
  for(let k=1;k<=G;k++){const o=this.odds(s,k),rowH=Math.min(44,196/G),y=258+(k-1)*rowH,on=k===pk;if(on)box(26,y-rowH/2+2,450,rowH-4,'#f0f5fb',MC.blue,6,2);
   txt(`${k}개 열고 멈춤`,40,y,MC.ink,mob?9:13,true);
   if(!mob){let xx=176;xx+=frac(o.win,o.tot,xx,y,12,MC.ink,'left')+5;txt(`×${k} −`,xx,y,MC.ink,12,true);xx+=tw(`×${k} −`,12,true)+5;xx+=frac(o.tot-o.win,o.tot,xx,y,12,MC.ink,'left')+5;txt(`×${s.p.fee}`,xx,y,MC.ink,12,true);}
   evDraw(o.ev,o.tot,mob?380:410,y,mob?11:15);}
  card(498,198,286,266,'실험 결과');
  const o=this.odds(s,pk),avg=s.sim.n&&s.sim.k===pk?s.sim.net/s.sim.n:null;
  txt(`계획: ${pk}개 열고 멈춤`,518,244,MC.blue,13,true);
  txt('계산한 기대값 (한 판)',518,244+30*Math.min(FS,1.2),MC.sub,12,true);txt((o.ev>=0?'+':'−')+Math.abs(o.ev/o.tot).toFixed(2)+'장',764,244+30*Math.min(FS,1.2),o.ev<0?MC.red:o.ev>0?MC.blue:MC.green,14,true,'right');
  txt('자동 실험 평균 (한 판)',518,244+60*Math.min(FS,1.2),MC.sub,12,true);txt(avg==null?'-':(avg>=0?'+':'−')+Math.abs(avg).toFixed(2)+'장',764,244+60*Math.min(FS,1.2),avg==null?MC.sub:avg<0?MC.red:MC.blue,14,true,'right');
  if(!mob){txt(avg==null?'':`${fmtN(s.sim.n)}판 · 모두 ${(s.sim.net>=0?'+':'')}${fmtN(s.sim.net)}장`,518,340,MC.sub,12,true);
   line(518,366,764,366,MC.line,1.5);txt('내가 직접 한 판',518,392,MC.sub,12,true);txt(`${s.my.n}판 · ${(s.my.net>=0?'+':'')}${s.my.net}장`,764,392,s.my.net<0?MC.red:MC.ink,14,true,'right');
   txt(o.ev>0?'손님 이득 → 주인 손해':o.ev===0?'본전':'손님 손해 → 주인 이득',518,436,o.ev>0?MC.red:o.ev===0?MC.green:MC.blue,13,true);}
 },
 now(s){const G=this.G(s);let best=1;for(let k=2;k<=G;k++)if(this.odds(s,k).ev>this.odds(s,best).ev)best=k;const o=this.odds(s,best);
  let m=`계산해 보면 <b>${best}개만 열고 멈추는 계획</b>이 가장 좋아요(기대값 ${evHtml(o.ev,o.tot)}). `;
  m+=o.ev>0?`이 계획을 아는 손님은 ${o.tot}판마다 평균 ${o.ev}장을 따 가요. 주인이라면 꽝을 늘리거나 참가비를 올려서 고쳐야 해요.`:o.ev===0?'가장 좋은 계획도 본전이라 주인은 손해 보지 않아요.':'어떤 계획을 세워도 손님이 손해예요. 주인에게 유리한 설계예요.';
  if(s.ph==='lost')m+=' 욕심내서 더 열수록 꽝을 만날 확률이 커져요.';return m;},
 why:'<ul><li>이 게임은 손님이 <b>어디서 멈출지</b>를 정할 수 있어요. 그래서 계획마다 기대값을 따로 계산해요.</li><li>상자 5개·꽝 2개일 때 꽝이 놓이는 경우는 10가지예요. 첫째 상자가 꽝이 아닌 경우는 6가지라서, 1개만 열면 '+fr(6,10)+'×1 − '+fr(4,10)+'×1 = +'+fr(2,10)+'.</li><li>2개까지 열면 '+fr(3,10)+'×2 − '+fr(7,10)+' = −'+fr(1,10)+', 3개까지 열면 '+fr(1,10)+'×3 − '+fr(9,10)+' = −'+fr(6,10)+'. 많이 열수록 상금은 커지지만 성공 확률이 빠르게 줄어요.</li><li>계산할 줄 아는 손님은 “1개만 열고 멈춘다”로 이득을 봐요. 그러면 주인이 손해예요.</li><li>고치는 방법: 꽝 상자를 늘려 당첨 확률을 낮추거나, 참가비를 올려 손해를 키워요.</li></ul>',
 tryIt:['직접 여러 판 해 보세요. 몇 개까지 열고 싶어지나요? 결과는 어땠나요?','계획을 1개, 2개, 3개로 바꾸며 1000판 자동을 돌려 계산한 기대값과 비교해 보세요.','주인이 손해 보지 않도록 꽝 상자 수나 참가비를 고쳐 보세요. 모든 계획의 기대값이 0 이하가 되면 성공이에요.']
});
