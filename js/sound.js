"use strict";
/* ================== 효과음 (plinkfx, CC0) ==================
   js/pfx/ 는 plinkfx 0.3.0 원본. 소리 파일 없이 코드로 소리를 만들어 재생해요. */
let PFX=null,LOOPS={};
let MUTE=false;try{MUTE=localStorage.getItem('smart_mute')==='1';}catch(_){}
import('./pfx/index.js').then(m=>{PFX=m;try{m.unlockAudio();m.volume(0.7);}catch(_){}}).catch(()=>{});
/* 한 번 재생. 자동 실험 중 같은 소리가 겹쳐 쌓이지 않게 cooldown 을 둬요 */
function sfx(n,o){if(!n||MUTE||!PFX)return;try{PFX.play(n,{cooldown:0.06,...o});}catch(_){}}
/* 누르고 있는 동안 계속 나는 소리(바람 등) */
function sfxLoop(key,n,on,o){if(!PFX)return;if(on&&!MUTE){if(!LOOPS[key])try{LOOPS[key]=PFX.play(n,{loop:true,...o});}catch(_){}}
  else if(LOOPS[key]){try{LOOPS[key].stop(0.15);}catch(_){}delete LOOPS[key];}}
function sfxStopAll(){Object.keys(LOOPS).forEach(k=>sfxLoop(k,null,false));}
const ICON_ON='<path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/>';
const ICON_OFF='<path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"/><path d="M16 10l4 4m0 -4l-4 4"/>';
function muteBtn(){const b=document.getElementById('mute');if(!b)return;
  const show=()=>{b.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${MUTE?ICON_OFF:ICON_ON}</svg>`;b.setAttribute('aria-label',MUTE?'소리 켜기':'소리 끄기');b.title=b.getAttribute('aria-label');};
  b.onclick=()=>{MUTE=!MUTE;try{localStorage.setItem('smart_mute',MUTE?'1':'0');}catch(_){}if(MUTE)sfxStopAll();else sfx('toggle-on');show();};show();}
/* 버튼을 눌렀을 때 소리: 실험마다 SND[실험id][act], 없으면 기본 소리 */
const D=(n,t,o)=>[n,{delay:t,...o}];
const SND={
 rocket:{go:'whoosh',reset:'pop-down'},
 balloon:{reset:'pop-down'},
 plane:{throw:'toss'},ring:{throw:'toss'},magnus:{throw:'swing'},
 tumble:{go:'step-wood',reset:'pop-down'},
 egg:{drop:'fall-whistle',reset:'pop'},
 toss:{go:s=>s.p.kind==='coin'?['toss',D(s.p.n>1?'coin-bag':'coin-soft',.5)]:['dice-roll']},
 group:{go:s=>s.p.what==='d2'?['dice-roll']:['toss',D('coin-double',.5)]},
 hint:{r1:'dice-roll',r1000:'slot-spin'},
 candy:{p1:'pickup-item',p100:'card-shuffle'},
 lots:{draw:s=>s.drawn.length?['page-turn',D(s.drawn[s.drawn.length-1]?'ding-correct':'pop-down',.45)]:'deny',again:'card-shuffle',sim:'card-shuffle'},
 streak:{go:['toss',D('coin-bag',.6)]},
 lln:{a1:'coin',a10:'coin-double',a100:'coin-bag',auto:'slot-spin',new:'swipe'},
 rice:{go:'rain-burst'},
 monty:{sw:s=>D(s.final===s.car?'victory':'lose',.35),st:s=>D(s.final===s.car?'victory':'lose',.35),asw:'card-shuffle',ast:'card-shuffle',
   click:s=>s.ph==='decide'?['select',D('door-open',.25,{volume:.6})]:null},
 wheel:{spin:'slot-spin',a20:'card-shuffle',a1000:'card-shuffle',reset:'card-shuffle'},
 dicebooth:{roll:'dice-roll',a36:'card-shuffle',a3600:'card-shuffle',reset:'card-shuffle'},
 bag:{c1:s=>['pickup-item',D(s.lastWin?'coin-double':'pop-down',.45)],c100:'card-shuffle',c10000:'card-shuffle'},
 boxes:{open:s=>s.ph==='play'&&s.open===0?'card-shuffle':s.ph==='lost'?['chest-open',D('buzzer-wrong',.35)]:s.ph==='stop'?['chest-open',D('ka-ching',.35)]:['chest-open',D('coin',.35)],
   stop:'ka-ching',new:'card-shuffle',auto:'card-shuffle'},
};
/* 소리 표: '이름' 하나, ['이름',{옵션}] 하나, 또는 그 둘의 목록 */
function playSpec(x){if(!x)return;if(typeof x==='string')return sfx(x);if(Array.isArray(x)&&x.length===2&&typeof x[0]==='string'&&typeof x[1]==='object'&&!Array.isArray(x[1]))return sfx(x[0],x[1]);if(Array.isArray(x))x.forEach(playSpec);}
/* act 를 실행한 뒤 불러요(결과에 따라 소리가 달라지는 실험이 있어서) */
function btnSfx(id,act,def=true){const m=SND[id]&&SND[id][act];const v=typeof m==='function'?m(st):m;
  if(v)return playSpec(v);if(m||!def)return;sfx(act==='clear'?'trash':/reset|again|new/.test(act)?'cancel':'click');}
