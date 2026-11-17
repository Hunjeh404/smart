"use strict";
/* 마스코트 표정: 실험 상태에 따라 고양이 그림을 바꿔요 */
const MOOD={
 rocket:s=>s.run?'surprise':s.done?'happy':'think',
 balloon:s=>s.alt>5?'happy':s.p.burn>0?'surprise':'think',
 paper:s=>s.blow?'blow':'think', two:s=>s.blow?'blow':'think', funnel:s=>s.blow?'blow':'think',
 aoa:s=>s.p.aoa>14?'surprise':'point',
 plane:s=>!s.run?'think':s.k<s.run.pts.length-1?'plane':(s.run.cfg.cg==='good'?'happy':'sad'),
 magnus:s=>s.ball&&!s.ball.done?'throw':s.ball?'point':'think',
 tumble:s=>s.res==='goal'?'clap':s.res?'sad':s.run?'surprise':'think',
 ring:s=>!s.run?'think':s.k<s.run.pts.length-1?'plane':(s.run.cfg.dir==='fwd'&&s.run.cfg.wt==='good'?'happy':'sad'),
 egg:s=>!s.res?(s.ph==='fall'?'surprise':'think'):s.res.egg===0?'happy':s.res.egg===1?'surprise':'sad',
 toss:s=>s.queue>0||s.age<0.6?(s.p.kind==='coin'?'flip':'roll'):s.total?'point':'hello',
 group:s=>s.age<0.6?(s.p.what==='d2'?'roll':'flip'):s.total?'point':'hello',
 hint:s=>s.age<0.7?'roll':s.p.hint==='none'?'watch':'point',
 candy:s=>s.age<0.6?'draw':'think',
 lots:s=>!s.drawn.length?'think':s.age<.5?'draw':s.age<1.2?(s.drawn[s.drawn.length-1]?'clap':'sad'):'point',
 streak:s=>s.age<.8?'flip':s.n?'point':'watch',
 lln:s=>s.auto?(s.p.kind==='die'?'roll':'flip'):s.runs[s.runs.length-1].n>=10000?'happy':'think',
 rice:s=>s.todo>0?'throw':s.n?'point':'think',
 monty:s=>s.ph==='done'?(s.final===s.car?'clap':'sad'):s.ph==='decide'?'watch':s.ph==='void'?'surprise':'hello',
 wheel:s=>s.spin?'spin':s.win===true?'clap':s.win===false?'sad':'think',
 dicebooth:s=>s.rolling>0?'roll':s.win===true?'clap':s.win===false?'sad':'think',
 bag:s=>{if(s.age<.8&&s.col)return 'draw';const e=Math.max(...['r','b','w'].map(k=>s.p['n'+k]*s.p['p'+k]-(s.p.nr+s.p.nb+s.p.nw-s.p['n'+k])));return e>0?'sad':'happy';},
 boxes:s=>s.ph==='lost'?'sad':s.ph==='stop'?'clap':s.open&&s.age<.6?'gift':'think'
};
