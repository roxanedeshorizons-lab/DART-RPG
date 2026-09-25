

// ============================================================
// CONFIG
// ============================================================
const ACTIONS={
  atk_faible:{name:"Attaque faible",icon:"🗡️",sector:13,feedClass:"atk",
    simple:{type:"atk",val:5,  desc:"−5 PV au boss"},
    double:{type:"atk",val:10, desc:"−10 PV au boss"},
    triple:{type:"atk",val:15, desc:"−15 PV au boss"}},
  atk_moyenne:{name:"Attaque moyenne",icon:"🗡️🗡️",sector:20,feedClass:"atk",
    simple:{type:"atk",val:10, desc:"−10 PV au boss"},
    double:{type:"atk",val:20, desc:"−20 PV au boss"},
    triple:{type:"atk",val:30, desc:"−30 PV au boss"}},
  atk_forte:{name:"Attaque forte",icon:"🗡️🗡️🗡️",sector:11,feedClass:"atk",
    simple:{type:"atk",val:20, desc:"−20 PV au boss"},
    double:{type:"atk",val:40, desc:"−40 PV au boss"},
    triple:{type:"atk",val:60, desc:"−60 PV au boss"}},
  soin:{name:"Soin",icon:"💚",sector:5,feedClass:"heal",
    simple:{type:"heal_team",val:10,desc:"+10 PV équipe"},
    double:{type:"heal_team",val:20,desc:"+20 PV équipe"},
    triple:{type:"heal_team",val:35,desc:"+35 PV équipe"}},
  bouclier:{name:"Bouclier",icon:"🛡️",feedClass:"shield",
    simple:{type:"shield",val:20,desc:"+20 PV de bouclier"},
    double:{type:"shield",val:40,desc:"+40 PV de bouclier"},
    triple:{type:"shield",val:60,desc:"+60 PV de bouclier"}},
  feu:{name:"Feu",icon:"🔥",sector:2,feedClass:"feu",
    simple:{type:"fire",val:1,desc:"+1 stack de feu — boss −3 PV/manche × 2"},
    double:{type:"fire",val:2,desc:"+2 stacks de feu — boss −6 PV/manche × 2"},
    triple:{type:"fire",val:3,desc:"+3 stacks de feu — boss −9 PV/manche × 2"}},
  esquive:{name:"Esquive",icon:"🌀",sector:17,feedClass:"dodge",
    simple:{type:"dodge_charge",val:1,desc:"+1 charge d'esquive"},
    double:{type:"dodge_charge",val:2,desc:"+2 charges d'esquive"},
    triple:{type:"dodge",val:1.0,desc:"Esquive instantanée — prochaine attaque annulée"}},
  manque:{name:"Manqué",icon:"✕",sector:0,feedClass:"neutral",
    simple:{type:"none",val:0,desc:"Manqué — 0 dégât"},
    double:{type:"none",val:0,desc:"Manqué — 0 dégât"},
    triple:{type:"none",val:0,desc:"Manqué — 0 dégât"}},
  neutre:{name:"Zone neutre",icon:"⚫",sector:null,feedClass:"neutral",
    simple:{type:"atk",val:3,desc:"−3 PV au boss"},
    double:{type:"atk",val:6,desc:"−6 PV au boss",bonus:{type:"heal_team",val:3}},
    triple:{type:"atk",val:9,desc:"−9 PV au boss"}},
  brise:{name:"Brise-Bouclier",icon:"⚒️",feedClass:"brise",color:"#e8a030",
    simple:{type:"brise",val:1,desc:"Casse 1 bouclier boss"},
    double:{type:"brise",val:2,desc:"Casse 2 boucliers + soigne l'équipe",bonus:{type:"heal_team",val:5}},
    triple:{type:"brise",val:999,desc:"Casse TOUS les boucliers boss"}},
  eau:{name:"Eau",icon:"💧",feedClass:"dodge",
    simple:{type:"cancel_teamfire",desc:"Éteint le feu ennemi"},
    double:{type:"cancel_teamfire",desc:"Éteint le feu + +5 PV équipe",bonus:{type:"heal_team",val:5}},
    triple:{type:"cancel_teamfire",desc:"Éteint le feu + −20 PV boss",bonus:{type:"atk",val:20}}},
};

function getArmorMult(){return Math.max(0,1-(G.effects.armor||0)*0.20);}
function getArmorReduc(){return Math.min(80,(G.effects.armor||0)*20);}

let CURRENT_SECTOR_MAP={};
function buildSectorMap(bossIdx){
  const boss=getBoss(bossIdx);
  const s=boss.sectors||{atk_faible:13,atk_moyenne:[20,3],atk_forte:11,soin:[5]};
  CURRENT_SECTOR_MAP={};
  function set(v,ak){if(v==null)return;if(Array.isArray(v))v.forEach(n=>CURRENT_SECTOR_MAP[n]=ak);else CURRENT_SECTOR_MAP[v]=ak;}
  set(s.atk_faible,'atk_faible'); set(s.atk_moyenne,'atk_moyenne');
  set(s.atk_forte,'atk_forte');
  set(s.soin,'soin');
  set(s.bouclier,'bouclier'); set(s.esquive,'esquive');
  set(s.feu,'feu'); set(s.brise,'brise'); set(s.eau,'eau');
  CURRENT_SECTOR_MAP[0]='manque';
}
function getAction(v){return CURRENT_SECTOR_MAP[v]||"neutre";}

const BOSS_CONFIG=[
  {id:"balafre",nom:"Balafre",icon:"⚔️",
   sectors:{atk_faible:3,atk_moyenne:[2,5],atk_forte:18,soin:[1,10,19,9],rage:[4,6],bouclier:[13,16,11]},
   desc:"Difficulté : Simple",teamPV:120,pv:150,manches:5,
   pattern:[{type:"atk",val:25,desc:"Balafre grogne !"},{type:"atk",val:25,desc:"Balafre frappe !"},{type:"heal",val:20,desc:"Balafre se soigne..."},{type:"atk",val:35,desc:"Balafre se déchaîne !"},{type:"atk",val:40,desc:"Balafre attaque avec furie !"}]},
  {id:"chose_pale",nom:"La Chose Pâle",icon:"👻",
   sectors:{atk_faible:2,atk_moyenne:[3,11],atk_forte:1,soin:[13,15,16,12],rage:[10,19],feu:[6],brise:[20],esquive:[14],bouclier:[4,17,7]},
   desc:"Difficulté : Moyen",teamPV:60,pv:380,manches:9,
   pattern:[{type:"atk",val:40,desc:`La Chose Pâle avance...`},{type:"heal",val:40,desc:`La Chose Pâle se régénère...`},{type:"armorUp",val:2,desc:`La Chose Pâle se blinde !`},{type:"atk",val:40,desc:`La Chose Pâle frappe !`},{type:"atk",val:50,desc:`La Chose Pâle surgit !`},{type:"atk",val:60,desc:`La Chose Pâle attaque !`},{type:"heal",val:30,desc:`La Chose Pâle se soigne...`},{type:"atk",val:80,desc:`La Chose Pâle frappe fort !`},{type:"atk",val:90,desc:`La Chose Pâle se déchaîne !`}]},
  {id:"frabork",nom:"Frabork le Géant",icon:"🪨",
   sectors:{atk_faible:4,atk_moyenne:[8,9],atk_forte:2,soin:[13,15,7,14],rage:[18,3],feu:[11],eau:[17],brise:[12],esquive:[10],bouclier:[1,19,5]},
   desc:"Difficulté : Difficile",teamPV:140,pv:500,manches:7,
   pattern:[{type:"atk",val:100,desc:`Frabork écrase !`},{type:"armorUp",val:3,desc:`Frabork se fortifie massivement !`},{type:"fireDot",val:8,desc:`Frabork vous enflamme !`},{type:"heal",val:50,desc:`Frabork récupère...`},{type:"armorUp",val:2,desc:`Frabork se renforce encore !`},{type:"atkFire",val:60,desc:`Frabork vous écrase et vous embrase !`},{type:"atkFire",val:80,desc:`Frabork frappe et met le feu !`}]},
];

// Couleurs visuelles de la cible par boss (index = bossIdx)
const CIBLE_CONFIG=[
  // 0 — Balafre (Simple) : ring order 20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5
  // neutre,soin,forte,rage,bouclier | soin,soin,neutre,moyenne,neutre | faible,soin,neutre,bouclier,neutre | bouclier,neutre,soin,neutre,moyenne
  {18:{color:'#7a1515',icon:'🗡️🗡️🗡️'},2:{color:'#7a1515',icon:'🗡️🗡️'},5:{color:'#7a1515',icon:'🗡️🗡️'},3:{color:'#7a1515',icon:'🗡️'},
   1:{color:'#1a5a1a',icon:'💚'},10:{color:'#1a5a1a',icon:'💚'},19:{color:'#1a5a1a',icon:'💚'},9:{color:'#1a5a1a',icon:'💚'},
   4:{color:'#c8a800',icon:'🤬'},6:{color:'#c8a800',icon:'🤬'},
   13:{color:'#3a1a5a',icon:'🛡️'},16:{color:'#3a1a5a',icon:'🛡️'},11:{color:'#3a1a5a',icon:'🛡️'}},
  // 1 — La Chose Pâle (Moyen) : ring order 20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5
  // brise,forte,neutre,bouclier,soin | feu,rage,soin,faible,bouclier | moyenne,rage,bouclier,soin,neutre | moyenne,esquive,neutre,soin,neutre
  {1:{color:'#7a1515',icon:'🗡️🗡️🗡️'},3:{color:'#7a1515',icon:'🗡️🗡️'},11:{color:'#7a1515',icon:'🗡️🗡️'},2:{color:'#7a1515',icon:'🗡️'},
   13:{color:'#1a5a1a',icon:'💚'},15:{color:'#1a5a1a',icon:'💚'},16:{color:'#1a5a1a',icon:'💚'},12:{color:'#1a5a1a',icon:'💚'},
   10:{color:'#c8a800',icon:'🤬'},19:{color:'#c8a800',icon:'🤬'},
   6:{color:'#c85a00',icon:'🔥'},
   20:{color:'#3a2a0a',icon:'⚒️'},
   14:{color:'#d0d0d0',icon:'🌀'},
   4:{color:'#3a1a5a',icon:'🛡️'},17:{color:'#3a1a5a',icon:'🛡️'},7:{color:'#3a1a5a',icon:'🛡️'}},
  // 2 — Frabork (Difficile) : ring order 20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5
  // neutre,bouclier,rage,faible,soin | neutre,esquive,soin,forte,eau | rage,bouclier,soin,neutre,moyenne | feu,soin,moyenne,brise,bouclier
  {2:{color:'#7a1515',icon:'🗡️🗡️🗡️'},8:{color:'#7a1515',icon:'🗡️🗡️'},9:{color:'#7a1515',icon:'🗡️🗡️'},4:{color:'#7a1515',icon:'🗡️'},
   13:{color:'#1a5a1a',icon:'💚'},15:{color:'#1a5a1a',icon:'💚'},7:{color:'#1a5a1a',icon:'💚'},14:{color:'#1a5a1a',icon:'💚'},
   18:{color:'#c8a800',icon:'🤬'},3:{color:'#c8a800',icon:'🤬'},
   11:{color:'#c85a00',icon:'🔥'},
   17:{color:'#0a2a3a',icon:'💧'},
   12:{color:'#3a2a0a',icon:'⚒️'},
   10:{color:'#d0d0d0',icon:'🌀'},
   1:{color:'#3a1a5a',icon:'🛡️'},19:{color:'#3a1a5a',icon:'🛡️'},5:{color:'#3a1a5a',icon:'🛡️'}},
];

// Boss builtins (with any saved overrides merged in) + customs combined
function findBuiltinById(id){return BOSS_CONFIG.find(b=>b.id===id);}
function allBosses(){
  const builtins=BOSS_CONFIG.map(b=>{
    const ov=G.bossOverrides&&G.bossOverrides[b.id];
    if(!ov)return b;
    return {...b,sectors:ov.sectors,cible:ov.cible,pv:ov.pv,teamPV:ov.teamPV,overridden:true};
  });
  return builtins.concat(G.customBosses||[]);
}
function getBoss(i){return allBosses()[i];}
function getCibleFor(i){
  if(i<BOSS_CONFIG.length){
    const b=getBoss(i);
    return (b&&b.cible)?b.cible:CIBLE_CONFIG[i];
  }
  return (getBoss(i)||{}).cible||{};
}

// ============================================================
// LABO DE CREATION — boss customs
// ============================================================
const LABO_ACTIONS=[
  {key:'neutre',icon:'⚫',label:'Neutre',color:'#2a2a2a'},
  {key:'atk_faible',icon:'🗡️',label:'Attaque faible',color:'#7a1515'},
  {key:'atk_moyenne',icon:'⚔️',label:'Attaque moyenne',color:'#7a1515'},
  {key:'atk_forte',icon:'⚔️⚔️⚔️',label:'Attaque forte',color:'#7a1515'},
  {key:'soin',icon:'💚',label:'Soin',color:'#1a5a1a'},
  {key:'bouclier',icon:'🛡️',label:'Bouclier',color:'#3a1a5a'},
  {key:'feu',icon:'🔥',label:'Feu',color:'#c85a00'},
  {key:'esquive',icon:'🌀',label:'Esquive',color:'#d0d0d0'},
  {key:'rage',icon:'🤬',label:'Rage',color:'#c8a800',max:2},
  {key:'eau',icon:'💧',label:'Eau',color:'#0a2a3a'},
  {key:'brise',icon:'⚒️',label:'Brise-bouclier',color:'#3a2a0a'},
];
const LABO_EMOJIS=['🐲','🐉','👹','👺','💀','☠️','🧟','🧛','🧙','🦴','🕷️','🦂','🐺','🦇','🐍','🦖','🐙','👻','🤖','👁️','🔥','❄️','⚡','🌪️'];
const CUSTOM_BOSS_STORAGE_KEY='dartRpgCustomBosses';
const BOSS_OVERRIDE_STORAGE_KEY='dartRpgBossOverrides';

function loadCustomBosses(){
  try{
    const raw=localStorage.getItem(CUSTOM_BOSS_STORAGE_KEY);
    G.customBosses=raw?JSON.parse(raw):[];
  }catch(e){ G.customBosses=[]; }
}
function saveCustomBosses(){
  try{ localStorage.setItem(CUSTOM_BOSS_STORAGE_KEY,JSON.stringify(G.customBosses)); }catch(e){}
}
function loadBossOverrides(){
  try{
    const raw=localStorage.getItem(BOSS_OVERRIDE_STORAGE_KEY);
    G.bossOverrides=raw?JSON.parse(raw):{};
  }catch(e){ G.bossOverrides={}; }
}
function saveBossOverrides(){
  try{ localStorage.setItem(BOSS_OVERRIDE_STORAGE_KEY,JSON.stringify(G.bossOverrides)); }catch(e){}
}

// ============================================================
// MODE JOUR / NUIT
// ============================================================
const THEME_STORAGE_KEY='dartRpgTheme';
function loadTheme(){
  let theme='light';
  try{ if(localStorage.getItem(THEME_STORAGE_KEY)==='dark') theme='dark'; }catch(e){}
  applyTheme(theme);
}
function saveTheme(theme){
  try{ localStorage.setItem(THEME_STORAGE_KEY,theme); }catch(e){}
}
function applyTheme(theme){
  G.theme=theme==='dark'?'dark':'light';
  document.documentElement.setAttribute('data-theme',G.theme);
  renderThemeToggle();
}
function toggleTheme(){
  const next=G.theme==='dark'?'light':'dark';
  applyTheme(next);
  saveTheme(next);
}
function renderThemeToggle(){
  const isDark=G.theme==='dark';
  const icon=document.getElementById('theme-icon');
  const label=document.getElementById('theme-label');
  const sw=document.getElementById('theme-switch');
  if(icon)icon.textContent=isDark?'🌙':'🌞';
  if(label)label.textContent=isDark?'Mode Nuit':'Mode Jour';
  if(sw){ sw.classList.toggle('on',isDark); sw.setAttribute('aria-checked',isDark?'true':'false'); }
}

function defaultCustomPattern(teamPV){
  const round5=n=>Math.max(5,Math.round(n/5)*5);
  const val=round5(teamPV*0.15);
  return {manches:6,pattern:[
    {type:'atk',val,desc:'Le boss attaque !'},
    {type:'atk',val,desc:'Le boss frappe !'},
    {type:'heal',val:round5(val*1.5),desc:'Le boss se soigne...'},
    {type:'atk',val:round5(val*1.3),desc:'Le boss attaque plus fort !'},
    {type:'atk',val:round5(val*1.3),desc:'Le boss frappe plus fort !'},
    {type:'atk',val:round5(val*1.6),desc:'Le boss se déchaîne !'},
  ]};
}

function sectorsToLaboMap(sectorsObj){
  const map={};
  Object.entries(sectorsObj||{}).forEach(([key,val])=>{
    (Array.isArray(val)?val:[val]).forEach(n=>{ map[n]=key; });
  });
  return map;
}

function newLaboState(){
  return {kind:'new',sourceId:null,nom:'',icon:'🐲',bossPV:200,teamPV:100,sectors:{},swapMode:false,swapSelected:null};
}

function openLaboFromCodex(){
  closeCodex();
  openLabo();
}

// kind: undefined/'new' = brand new custom boss, 'builtin' = editing a builtin (id in BOSS_CONFIG), 'custom' = editing an existing custom boss
function openLabo(kind,sourceId){
  if(kind==='builtin'){
    const effective=allBosses().find(b=>b.id===sourceId);
    G.labo=effective
      ? {kind:'builtin',sourceId,nom:effective.nom,icon:effective.icon,bossPV:effective.pv,teamPV:effective.teamPV,sectors:sectorsToLaboMap(effective.sectors)}
      : newLaboState();
  } else if(kind==='custom'){
    const existing=G.customBosses.find(b=>b.id===sourceId);
    G.labo=existing
      ? {kind:'custom',sourceId:existing.id,nom:existing.nom,icon:existing.icon,bossPV:existing.pv,teamPV:existing.teamPV,sectors:sectorsToLaboMap(existing.sectors)}
      : newLaboState();
  } else {
    G.labo=newLaboState();
  }
  G.labo.swapMode=false;
  G.labo.swapSelected=null;
  const ov=document.getElementById('labo-ov');
  if(!ov)return;
  renderLaboMeta();
  renderLaboCible();
  renderLaboFooter();
  renderLaboSwapUI();
  ov.classList.add('active');
}
// Opens the labo pre-loaded with the current (possibly overridden) sectors/PV of boss at index i, builtin or custom
function openLaboForBoss(i){
  const b=getBoss(i);
  if(!b)return;
  openLabo(b.custom?'custom':'builtin', b.id);
}
function closeLabo(){
  const ov=document.getElementById('labo-ov');
  if(ov)ov.classList.remove('active');
  closeLaboActionPicker();
}

function renderLaboMeta(){
  const nomEl=document.getElementById('labo-nom');
  const pvEl=document.getElementById('labo-pv');
  const teamEl=document.getElementById('labo-teampv');
  const locked=G.labo.kind==='builtin';
  if(nomEl){ nomEl.value=G.labo.nom; nomEl.disabled=locked; }
  if(pvEl)pvEl.value=G.labo.bossPV;
  if(teamEl)teamEl.value=G.labo.teamPV;
  const grid=document.getElementById('labo-emoji-grid');
  if(grid){
    grid.innerHTML=LABO_EMOJIS.map(em=>`<button type="button" class="labo-emoji-btn${em===G.labo.icon?' selected':''}" ${locked?'disabled':''} onclick="setLaboIcon('${em}')">${em}</button>`).join('');
  }
  const lockNote=document.getElementById('labo-lock-note');
  if(lockNote)lockNote.style.display=locked?'block':'none';
}
function setLaboIcon(em){
  G.labo.icon=em;
  renderLaboMeta();
}

function laboRageCount(){
  return Object.values(G.labo.sectors).filter(v=>v==='rage').length;
}

function renderLaboCible(){
  const svgEl=document.getElementById('labo-cible-svg');
  if(!svgEl)return;
  const SECTORS=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  const CX=200,CY=200;
  const R={bullseye:12,bull:30,tripleIn:105,tripleOut:120,doubleIn:172,doubleOut:190,numRing:202};
  const NEUTRAL='#2a2a2a';

  function darkenColor(hex,pct){
    const n=parseInt(hex.slice(1),16),f=1-pct/100;
    const r=Math.round(((n>>16)&0xff)*f);
    const g=Math.round(((n>>8)&0xff)*f);
    const b=Math.round((n&0xff)*f);
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function toRad(d){return(d-90)*Math.PI/180;}
  function pt(a,r){const rad=toRad(a);return[CX+r*Math.cos(rad),CY+r*Math.sin(rad)];}
  function arc(i,r1,r2){
    const a1=i*18-9,a2=i*18+9;
    const[x1,y1]=pt(a1,r1),[x2,y2]=pt(a2,r1);
    const[x3,y3]=pt(a2,r2),[x4,y4]=pt(a1,r2);
    const f=v=>v.toFixed(2);
    return `M ${f(x1)} ${f(y1)} A ${r1} ${r1} 0 0 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${r2} ${r2} 0 0 0 ${f(x4)} ${f(y4)} Z`;
  }
  const NS='http://www.w3.org/2000/svg';
  function mkEl(tag,attrs){
    const e=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    return e;
  }

  svgEl.innerHTML='';
  svgEl.appendChild(mkEl('circle',{cx:CX,cy:CY,r:R.doubleOut+6,fill:'#0a0a0a'}));

  SECTORS.forEach((num,i)=>{
    const key=G.labo.sectors[num];
    const def=LABO_ACTIONS.find(a=>a.key===key);
    const hasDef=def&&def.key!=='neutre';
    const simpleFill=hasDef?def.color:NEUTRAL;
    const doubleFill=hasDef?darkenColor(def.color,25):NEUTRAL;
    const tripleFill=hasDef?darkenColor(def.color,45):NEUTRAL;
    const selCls=G.labo.swapSelected===num?' labo-sector-selected':'';

    const p1=arc(i,R.bull,R.tripleIn);
    const p2=arc(i,R.tripleOut,R.doubleIn);
    const se=mkEl('path',{d:p1+' '+p2,fill:simpleFill,stroke:'#333','stroke-width':'0.5','data-num':num,class:'labo-sector'+selCls});
    se.style.cursor='pointer';
    se.addEventListener('click',()=>handleLaboSectorClick(num));
    svgEl.appendChild(se);

    const te=mkEl('path',{d:arc(i,R.tripleIn,R.tripleOut),fill:tripleFill,stroke:'#333','stroke-width':'0.5','data-num':num,class:'labo-sector'+selCls});
    te.style.cursor='pointer';
    te.addEventListener('click',()=>handleLaboSectorClick(num));
    svgEl.appendChild(te);

    const de=mkEl('path',{d:arc(i,R.doubleIn,R.doubleOut),fill:doubleFill,stroke:'#333','stroke-width':'0.5','data-num':num,class:'labo-sector'+selCls});
    de.style.cursor='pointer';
    de.addEventListener('click',()=>handleLaboSectorClick(num));
    svgEl.appendChild(de);

    if(hasDef){
      const iconR=(R.tripleOut+R.doubleIn)/2;
      const[ix,iy]=pt(i*18,iconR);
      const ic=mkEl('text',{x:ix.toFixed(2),y:iy.toFixed(2),'text-anchor':'middle','dominant-baseline':'central','font-size':'15','pointer-events':'none'});
      ic.textContent=def.icon;
      svgEl.appendChild(ic);
    }
  });

  SECTORS.forEach((_,i)=>{
    const a=i*18-9;
    const[x1,y1]=pt(a,R.bull),[x2,y2]=pt(a,R.doubleOut);
    const l=mkEl('line',{x1:x1.toFixed(2),y1:y1.toFixed(2),x2:x2.toFixed(2),y2:y2.toFixed(2),stroke:'#444','stroke-width':'0.8'});
    l.style.pointerEvents='none';
    svgEl.appendChild(l);
  });

  const bull=mkEl('circle',{cx:CX,cy:CY,r:R.bull,fill:'#1a5a1a',stroke:'#333','stroke-width':'0.8'});
  bull.style.pointerEvents='none';
  svgEl.appendChild(bull);

  const bs=mkEl('circle',{cx:CX,cy:CY,r:R.bullseye,fill:'#5a0000',stroke:'#333','stroke-width':'0.8'});
  bs.style.pointerEvents='none';
  svgEl.appendChild(bs);

  SECTORS.forEach((num,i)=>{
    const[x,y]=pt(i*18,R.numRing);
    const t=mkEl('text',{x:x.toFixed(2),y:y.toFixed(2),'text-anchor':'middle','dominant-baseline':'central',fill:'#cccccc','font-size':'14','font-weight':'700','pointer-events':'none'});
    t.textContent=num;
    svgEl.appendChild(t);
  });
}

// Routes a sector click to either the action picker (normal mode) or the swap-select flow (swap mode)
function handleLaboSectorClick(num){
  if(G.labo.swapMode) handleLaboSwapClick(num);
  else openLaboActionPicker(num);
}

function toggleLaboSwapMode(){
  G.labo.swapMode=!G.labo.swapMode;
  G.labo.swapSelected=null;
  renderLaboSwapUI();
  renderLaboCible();
}

function renderLaboSwapUI(){
  const btn=document.getElementById('labo-swap-toggle');
  const hint=document.getElementById('labo-swap-hint');
  if(btn)btn.classList.toggle('active',!!G.labo.swapMode);
  if(hint){
    if(!G.labo.swapMode){ hint.style.display='none'; }
    else{
      hint.style.display='block';
      hint.textContent=G.labo.swapSelected==null
        ? 'Touchez un premier secteur à échanger.'
        : `Secteur ${G.labo.swapSelected} sélectionné — touchez un second secteur pour échanger (ou recliquez dessus pour annuler).`;
    }
  }
}

// Two-click swap: first click highlights a sector, second click on a different sector swaps their actions,
// reclicking the already-selected sector deselects it. Mirrors drag & drop without needing an actual drag (simpler on mobile).
function handleLaboSwapClick(num){
  if(G.labo.swapSelected===num){
    G.labo.swapSelected=null;
    renderLaboSwapUI();
    renderLaboCible();
    return;
  }
  if(G.labo.swapSelected==null){
    G.labo.swapSelected=num;
    renderLaboSwapUI();
    renderLaboCible();
    return;
  }
  const a=G.labo.swapSelected,b=num;
  const av=G.labo.sectors[a],bv=G.labo.sectors[b];
  if(bv===undefined)delete G.labo.sectors[a];else G.labo.sectors[a]=bv;
  if(av===undefined)delete G.labo.sectors[b];else G.labo.sectors[b]=av;
  G.labo.swapSelected=null;
  renderLaboSwapUI();
  renderLaboCible();
  flashLaboSectors([a,b]);
}

// Brief white flash on both swapped sectors (all three rings) to confirm the exchange
function flashLaboSectors(nums){
  const svgEl=document.getElementById('labo-cible-svg');
  if(!svgEl)return;
  nums.forEach(num=>{
    svgEl.querySelectorAll(`[data-num="${num}"]`).forEach(el=>{
      const original=el.getAttribute('fill');
      el.setAttribute('fill','rgba(255,255,255,0.55)');
      setTimeout(()=>el.setAttribute('fill',original),220);
    });
  });
}

function openLaboActionPicker(num){
  const pk=document.getElementById('labo-picker');
  const sectorEl=document.getElementById('labo-picker-sector');
  const list=document.getElementById('labo-picker-list');
  if(!pk||!list)return;
  if(sectorEl)sectorEl.textContent=num;
  const rageCount=laboRageCount();
  const currentKey=G.labo.sectors[num];
  list.innerHTML=LABO_ACTIONS.map(a=>{
    const isRageMaxed=a.key==='rage'&&rageCount>=2&&currentKey!=='rage';
    return `<button type="button" class="labo-action-btn" ${isRageMaxed?'disabled':''} onclick="chooseLaboAction(${num},'${a.key}')">
      <span style="font-size:16px">${a.icon}</span><span>${a.label}${a.key==='rage'?' ('+rageCount+'/2)':''}</span>
    </button>`;
  }).join('');
  pk.classList.add('active');
}
function closeLaboActionPicker(){
  const pk=document.getElementById('labo-picker');
  if(pk)pk.classList.remove('active');
}
function chooseLaboAction(num,key){
  const rageCount=laboRageCount();
  const currentKey=G.labo.sectors[num];
  if(key==='rage'&&rageCount>=2&&currentKey!=='rage'){ closeLaboActionPicker(); return; }
  if(key==='neutre'){ delete G.labo.sectors[num]; }
  else { G.labo.sectors[num]=key; }
  closeLaboActionPicker();
  renderLaboCible();
}

function buildSectorsFromLabo(){
  const grouped={};
  Object.entries(G.labo.sectors).forEach(([numStr,key])=>{
    const num=Number(numStr);
    if(!grouped[key])grouped[key]=[];
    grouped[key].push(num);
  });
  return grouped;
}
function buildCibleFromLabo(){
  const cible={};
  Object.entries(G.labo.sectors).forEach(([numStr,key])=>{
    const def=LABO_ACTIONS.find(a=>a.key===key);
    if(!def||def.key==='neutre')return;
    cible[Number(numStr)]={color:def.color,icon:def.icon};
  });
  return cible;
}

// Re-renders after a boss's data changed in place (edit/reset/create) — index composition is unaffected
function refreshAfterBossDataChange(){
  buildSectorMap(G.selectedBoss);
  renderHome();
  renderRef();
  renderCible();
}

// Creates a brand new custom boss from scratch (Labo opened via the Codex)
function saveLaboBoss(){
  const nom=(G.labo.nom||'').trim();
  if(!nom){ alert('Donne un nom a ton boss !'); return; }
  const bossPV=Math.max(10,parseInt(G.labo.bossPV,10)||100);
  const teamPV=Math.max(10,parseInt(G.labo.teamPV,10)||100);
  const sectors=buildSectorsFromLabo();
  const cible=buildCibleFromLabo();
  const {manches,pattern}=defaultCustomPattern(teamPV);
  const bossObj={
    id:'custom_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    nom, icon:G.labo.icon||'🐲', pv:bossPV, teamPV, manches,
    desc:'Boss personnalisé', sectors, cible, pattern, custom:true
  };
  G.customBosses.push(bossObj);
  saveCustomBosses();
  closeLabo();
  refreshAfterBossDataChange();
}

// Updates the boss currently being edited (builtin -> saved as an override, custom -> updated in place)
function saveLaboChanges(){
  const bossPV=Math.max(10,parseInt(G.labo.bossPV,10)||100);
  const teamPV=Math.max(10,parseInt(G.labo.teamPV,10)||100);
  const sectors=buildSectorsFromLabo();
  const cible=buildCibleFromLabo();
  if(G.labo.kind==='builtin'){
    G.bossOverrides[G.labo.sourceId]={sectors,cible,pv:bossPV,teamPV};
    saveBossOverrides();
  } else if(G.labo.kind==='custom'){
    const idx=G.customBosses.findIndex(b=>b.id===G.labo.sourceId);
    if(idx===-1)return;
    const nom=(G.labo.nom||'').trim()||G.customBosses[idx].nom;
    G.customBosses[idx]={...G.customBosses[idx],nom,icon:G.labo.icon||G.customBosses[idx].icon,pv:bossPV,teamPV,sectors,cible};
    saveCustomBosses();
  } else {
    saveLaboBoss();
    return;
  }
  closeLabo();
  refreshAfterBossDataChange();
}

// Discards unsaved edits in the labo and reloads the boss's original/persisted values
function resetLaboBoss(){
  if(G.labo.kind==='builtin'){
    delete G.bossOverrides[G.labo.sourceId];
    saveBossOverrides();
    const original=findBuiltinById(G.labo.sourceId);
    G.labo=original
      ? {kind:'builtin',sourceId:original.id,nom:original.nom,icon:original.icon,bossPV:original.pv,teamPV:original.teamPV,sectors:sectorsToLaboMap(original.sectors)}
      : newLaboState();
  } else if(G.labo.kind==='custom'){
    const existing=G.customBosses.find(b=>b.id===G.labo.sourceId);
    G.labo=existing
      ? {kind:'custom',sourceId:existing.id,nom:existing.nom,icon:existing.icon,bossPV:existing.pv,teamPV:existing.teamPV,sectors:sectorsToLaboMap(existing.sectors)}
      : newLaboState();
  } else {
    G.labo=newLaboState();
  }
  G.labo.swapMode=false;
  G.labo.swapSelected=null;
  renderLaboMeta();
  renderLaboCible();
  renderLaboSwapUI();
  refreshAfterBossDataChange();
}

// Forks the boss being edited into a brand new independent custom boss, leaving the original untouched
function saveLaboAsNew(){
  const bossPV=Math.max(10,parseInt(G.labo.bossPV,10)||100);
  const teamPV=Math.max(10,parseInt(G.labo.teamPV,10)||100);
  const sectors=buildSectorsFromLabo();
  const cible=buildCibleFromLabo();
  const {manches,pattern}=defaultCustomPattern(teamPV);
  const nom=(G.labo.nom||'').trim()||'Boss custom';
  const bossObj={
    id:'custom_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
    nom, icon:G.labo.icon||'🐲', pv:bossPV, teamPV, manches,
    desc:'Boss personnalisé', sectors, cible, pattern, custom:true
  };
  G.customBosses.push(bossObj);
  saveCustomBosses();
  closeLabo();
  refreshAfterBossDataChange();
}

function renderLaboFooter(){
  const el=document.getElementById('labo-footer');
  if(!el)return;
  if(G.labo.kind==='new'){
    el.innerHTML='<button class="btn-gold" onclick="saveLaboBoss()">Sauvegarder ce boss</button>';
  } else {
    el.innerHTML=
      '<button class="btn-gold" onclick="saveLaboChanges()">Sauvegarder les modifications</button>'+
      '<button class="btn-ghost" onclick="resetLaboBoss()">Réinitialiser</button>'+
      '<button class="btn-ghost" onclick="saveLaboAsNew()">⚗️ Sauvegarder comme nouveau boss</button>';
  }
}

function editCustomBoss(id){
  openLabo('custom',id);
}
function deleteCustomBoss(id){
  const idx=G.customBosses.findIndex(b=>b.id===id);
  if(idx===-1)return;
  const selectedId=(getBoss(G.selectedBoss)||{}).id;
  G.customBosses.splice(idx,1);
  saveCustomBosses();
  const newIdx=allBosses().findIndex(b=>b.id===selectedId);
  G.selectedBoss=newIdx!==-1?newIdx:0;
  refreshAfterBossDataChange();
}

// ============================================================
// ITEMS & CHALLENGES
// ============================================================
const ITEMS={
  potion:{name:'Potion de soin',icon:'🧪',desc:'+30 PV equipe'},
  boost:{name:'Boost d\'attaque',icon:'⚡',desc:'Prochaine attaque x2'},
  bouclier:{name:'Bouclier d\'urgence',icon:'🛡️',desc:'Annule prochaine attaque boss'},
  poison_i:{name:'Poison express',icon:'💀',desc:'Boss -20 PV immediatement'},
  esquive_i:{name:'Esquive garantie',icon:'🌀',desc:'Esquive instantanee'},
  resurr:{name:'Resurrection',icon:'❤️',desc:'Survie a 10 PV si equipe tombe a 0'},
  slot:{name:'Slot inventaire',icon:'📦',desc:'+1 slot permanent (max 4)'},
};
const EVENS_SET=new Set([0,2,4,6,8,10,12,14,16,18,20,25]);
const CHALLENGES=[
  {id:'c1',name:'La Sequence',desc:'Toucher 5 → 10 → 20 dans cet ordre — 6 flechettes max',maxDarts:6,reward:'potion',
   eval:(darts)=>{const sq=[5,10,20];let i=0;for(const d of darts){if(d.value===sq[i])i++;if(i===sq.length)return 'win';}if(darts.length>=6)return 'fail';return 'continue';}},
  {id:'c2',name:'Le Triple Defi',desc:'3 triples en 8 flechettes max',maxDarts:8,reward:'boost',
   eval:(darts)=>{if(darts.filter(d=>d.multi===3).length>=3)return 'win';if(darts.length>=8)return 'fail';return 'continue';}},
  {id:'c3',name:'La Montee',desc:'Toucher 1 → 2 → 3 → 19 → 20 dans l\'ordre — 9 flechettes max',maxDarts:9,reward:'poison_i',
   eval:(darts)=>{const sq=[1,2,3,19,20];let i=0;for(const d of darts){if(d.value===sq[i])i++;if(i===sq.length)return 'win';}if(darts.length>=9)return 'fail';return 'continue';}},
  {id:'c4',name:'Le Centenaire',desc:'Exactement 100 points en 5 flechettes (valeur x multiplicateur)',maxDarts:5,reward:'bouclier',
   eval:(darts)=>{const tot=darts.reduce((s,d)=>s+d.value*d.multi,0);if(tot>100)return 'fail';if(darts.length===5)return tot===100?'win':'fail';return 'continue';}},
  {id:'c5',name:'Les Jumeaux',desc:'2x le 5, 1x le 10, 2x le 20 — 10 flechettes max',maxDarts:10,reward:'esquive_i',
   eval:(darts)=>{const f5=darts.filter(d=>d.value===5).length>=2,f10=darts.filter(d=>d.value===10).length>=1,f20=darts.filter(d=>d.value===20).length>=2;if(f5&&f10&&f20)return 'win';if(darts.length>=10)return 'fail';return 'continue';}},
  {id:'c6',name:'Les Adjacents',desc:'Toucher 20, 1 et 18 (n\'importe quel ordre) — 6 flechettes max',maxDarts:6,reward:'potion',
   eval:(darts)=>{const v=new Set(darts.map(d=>d.value));if(v.has(20)&&v.has(1)&&v.has(18))return 'win';if(darts.length>=6)return 'fail';return 'continue';}},
  {id:'c7',name:'Les Pairs',desc:'9 flechettes paires exactement (0-20 pairs + bull) — echec immediat si impair',maxDarts:9,reward:'bouclier',
   eval:(darts)=>{const last=darts[darts.length-1];if(!EVENS_SET.has(last.value))return 'fail';if(darts.length===9)return 'win';return 'continue';}},
  {id:'c8',name:'Le Bulls Eye',desc:'Toucher le bull 2 fois en 6 flechettes max',maxDarts:6,reward:'resurr',
   eval:(darts)=>{if(darts.filter(d=>d.value===25).length>=2)return 'win';if(darts.length>=6)return 'fail';return 'continue';}},
  {id:'c9',name:'La Croix',desc:'4 secteurs differents en exactement 4 flechettes',maxDarts:4,reward:'poison_i',
   eval:(darts)=>{if(darts.length===4)return new Set(darts.map(d=>d.value)).size===4?'win':'fail';return 'continue';}},
  {id:'c10',name:'L\'Impossible ⭐',desc:'3 doubles consecutifs en 6 flechettes max — recompense speciale : +1 slot',maxDarts:6,reward:'slot',
   eval:(darts)=>{let c=0,mx=0;for(const d of darts){d.multi===2?c++:c=0;if(c>mx)mx=c;}if(mx>=3)return 'win';if(darts.length>=6)return 'fail';return 'continue';}},
];

// ============================================================
// STATE
// ============================================================
let G={
  screen:'home',selectedBoss:0,
  players:[{name:'Joueur 1',color:'#1a2a4a'},{name:'Joueur 2',color:'#2a1a4a'}],
  teamPV:0,teamPVMax:0,bossPV:0,bossPVMax:0,
  manche:1,scores:[],currentPlayer:0,_playerDarts:[],
  effects:{shield:0,shieldDur:0,dodge:0,dodgeCharges:0,fire:{stacks:0,dur:0,dmgPerStack:3},teamFire:0,armor:0},
  goldenDartsRemaining:0,bossShield:0,liveFeed:[],finalScore:0,
  inventory:[],inventorySlots:3,
  activeBoostNext:false,activeResurr:false,activeBouclierItem:false,
  inputLocked:false,isUndoing:false,playerEditor:null,secretTaps:0,xavierTaps:0,
  bossPVRoundStart:0,teamPVAtRoundStart:0,shieldAtRoundStart:0,
  // rage tracking for current round: has1/has2 = whether each rage sector was hit this manche
  rage:{has1:false,has2:false},
  customBosses:[],bossOverrides:{},labo:null,
  theme:'light',
};
let DI={mod:1,darts:[]};
let lastDartTime=0;

function ini(n){return n.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2)||'?';}
const PV_SCALE={1:0.6,2:1.0,3:1.5,4:2.0};
function pvScale(){return PV_SCALE[G.players.length]||1.0;}
function scaledPV(base){return Math.round(base*pvScale());}

// ============================================================
// NAV
// ============================================================
function nav(s){
  document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
  const el=document.getElementById('screen-'+s);
  if(el){el.classList.add('active');el.scrollTop=0;}
  G.screen=s;
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.screen===s));
  const bottomNav=document.querySelector('.bottom-nav');
  if(bottomNav)bottomNav.style.display=s==='game'?'none':'';
  if(s==='ressource')renderRessource();
}
function showRef(){document.getElementById('ref-page').classList.add('visible');}
function hideRef(){document.getElementById('ref-page').classList.remove('visible');}

// ============================================================
// SECRET CODEX
// ============================================================
let _secretTimer=null;
function secretTap(){
  G.secretTaps=(G.secretTaps||0)+1;
  const t=document.getElementById('home-title');
  if(t){t.classList.remove('title-tap-flash');void t.offsetWidth;t.classList.add('title-tap-flash');}
  clearTimeout(_secretTimer);
  _secretTimer=setTimeout(()=>{G.secretTaps=0;},1500);
  if(G.secretTaps>=5){G.secretTaps=0;openCodex();}
}
function openCodex(){
  const ov=document.getElementById('codex-ov');
  if(!ov)return;
  renderCodex();
  ov.classList.add('active');
}
function closeCodex(){
  const ov=document.getElementById('codex-ov');
  if(ov)ov.classList.remove('active');
}

// ============================================================
// EASTER EGG — BON ANNIVERSAIRE XAVIER
// ============================================================
let _xavierTimer=null;
function xavierTap(e){
  if(e)e.stopPropagation();
  G.xavierTaps=(G.xavierTaps||0)+1;
  clearTimeout(_xavierTimer);
  _xavierTimer=setTimeout(()=>{G.xavierTaps=0;},1500);
  if(G.xavierTaps>=3){G.xavierTaps=0;openXavierEgg();}
}
function openXavierEgg(){
  const existing=document.getElementById('xavier-ov');
  if(existing)existing.remove();
  const ov=document.createElement('div');
  ov.id='xavier-ov';
  ov.style.cssText='position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:420px;height:100vh;z-index:600;background:rgba(0,0,0,0.97);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden';
  // Gâteau animé
  const cake=document.createElement('div');
  cake.textContent='🎂';
  cake.style.cssText='font-size:80px;animation:bounce 1.4s ease-in-out infinite;margin-bottom:20px;line-height:1';
  // Titre
  const title=document.createElement('div');
  title.textContent='BON ANNIVERSAIRE';
  title.style.cssText='font-family:var(--font-title);font-size:32px;color:var(--gold);letter-spacing:.06em;text-align:center;margin-bottom:8px';
  // Nom
  const name=document.createElement('div');
  name.textContent='Xavier !';
  name.style.cssText='font-size:24px;color:#fff;font-style:italic;text-align:center;margin-bottom:40px';
  // Bouton fermer
  const btn=document.createElement('button');
  btn.textContent='Fermer';
  btn.style.cssText='background:transparent;border:1px solid #333;border-radius:8px;padding:8px 24px;font-family:var(--font-body);font-size:13px;color:#666;cursor:pointer;margin-top:10px;position:relative;z-index:2';
  btn.onclick=()=>ov.remove();
  ov.appendChild(cake);ov.appendChild(title);ov.appendChild(name);ov.appendChild(btn);
  // Emojis tombants
  const emojis=['🎉','🎊','🎈','✨','🎁'];
  emojis.forEach((em,i)=>{
    const el=document.createElement('div');
    el.textContent=em;
    el.style.cssText='position:absolute;font-size:28px;top:-40px;left:'+(10+i*18)+'%;animation:fall '+(2.5+i*0.4)+'s linear '+(i*0.3)+'s infinite;pointer-events:none';
    ov.appendChild(el);
  });
  document.querySelector('.app').appendChild(ov);
}
function renderCodex(){
  const el=document.getElementById('codex-content');
  if(!el)return;
  el.innerHTML='';
  const typeIcon={atk:'⚔️',atkFire:'🔥⚔️',heal:'💊',shield:'🛡️',cancelFire:'💨',fireDot:'🔥',armorUp:'🛡️🛡️'};
  const typeColor={atk:'var(--danger)',atkFire:'#e85020',heal:'var(--green)',shield:'var(--purple)',cancelFire:'#40c0e0',fireDot:'#c84020',armorUp:'#e8a030'};
  allBosses().forEach((boss,bi)=>{
    const block=document.createElement('div');
    block.className='codex-boss-block';

    const hd=document.createElement('div');hd.className='codex-boss-hd';
    const ic=document.createElement('div');ic.className='codex-boss-icon';ic.textContent=boss.icon||'👾';
    const nm=document.createElement('div');nm.className='codex-boss-name';nm.textContent=boss.nom;
    const st=document.createElement('div');st.className='codex-boss-stats';
    st.innerHTML='Équipe <strong>'+boss.teamPV+' PV</strong><br>Boss <strong>'+boss.pv+' PV</strong>';
    hd.appendChild(ic);hd.appendChild(nm);hd.appendChild(st);
    block.appendChild(hd);

    const tbl=document.createElement('table');tbl.className='codex-table';
    boss.pattern.forEach((p,i)=>{
      const tr=document.createElement('tr');
      const tdN=document.createElement('td');tdN.className='codex-td-num';tdN.textContent='M'+(i+1);
      const tdI=document.createElement('td');tdI.className='codex-td-icon';tdI.textContent=typeIcon[p.type]||'❓';
      const tdD=document.createElement('td');tdD.className='codex-td-desc';tdD.textContent=p.desc;
      const tdV=document.createElement('td');tdV.className='codex-td-val';
      tdV.style.color=typeColor[p.type]||'var(--muted)';
      if(p.type==='atk')tdV.textContent='−'+p.val;
      else if(p.type==='atkFire')tdV.textContent='−'+p.val+' + 🔥';
      else if(p.type==='heal')tdV.textContent='+'+p.val;
      else if(p.type==='shield')tdV.textContent='🛡'+p.val;
      else if(p.type==='cancelFire')tdV.textContent='💨';
      else if(p.type==='fireDot')tdV.textContent='🔥 +'+p.val+' PV/manche';
      else if(p.type==='armorUp')tdV.textContent='+'+p.val+' bouclier(s)';
      else tdV.textContent='';
      tr.appendChild(tdN);tr.appendChild(tdI);tr.appendChild(tdD);tr.appendChild(tdV);
      tbl.appendChild(tr);
    });
    block.appendChild(tbl);

    const loop=document.createElement('div');loop.className='codex-loop';loop.textContent='🔁 Pattern en boucle';
    block.appendChild(loop);
    el.appendChild(block);

    if(bi<allBosses().length-1){const sep=document.createElement('div');sep.className='codex-sep';el.appendChild(sep);}
  });
}
let txSX=0;
document.addEventListener('touchstart',e=>{txSX=e.touches[0].clientX;},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-txSX;
  const vis=document.getElementById('ref-page').classList.contains('visible');
  if(dx<-60&&!vis)showRef();
  if(dx>60&&vis)hideRef();
},{passive:true});

// ============================================================
// HOME
// ============================================================
function renderHome(){
  const el=document.getElementById('boss-list');
  if(!el)return;
  el.innerHTML=allBosses().map((b,i)=>`
    <div class="boss-item${i===G.selectedBoss?' selected':''}" onclick="selBoss(${i})">
      <div class="boss-item-header">
        <div class="boss-num">${b.icon||i+1}</div>
        <div><div class="boss-item-name">${b.nom}${b.custom?' <span class="labo-boss-badge" title="Boss personnalisé">⚗️</span>':''}</div><div class="boss-item-desc">${b.desc}</div></div>
      </div>
      <div class="boss-pills">
        <div class="pill">Équipe <span>${scaledPV(b.teamPV)} PV</span></div>
        <div class="pill">Boss <span>${b.pv===666?`<span onclick="xavierTap(event)" style="cursor:pointer">666</span>`:scaledPV(b.pv)} PV</span></div>
        <div class="pill"><span>${b.manches}</span> manches</div>
      </div>
      <div class="boss-item-actions">
        ${b.custom?`<button onclick="event.stopPropagation();deleteCustomBoss('${b.id}')">🗑️ Supprimer</button>`:''}
        <button class="boss-labo-btn" onclick="event.stopPropagation();openLaboForBoss(${i})" title="Ouvrir dans le Labo">⚗️</button>
      </div>
    </div>`).join('');
  const pl=document.getElementById('players-list');
  if(!pl)return;
  pl.innerHTML=G.players.map((p,i)=>`
    <div class="player-row-input">
      <span class="player-row-num">${i+1}</span>
      <input class="player-name-inp" value="${p.name}" placeholder="Joueur ${i+1}" onchange="G.players[${i}].name=this.value"/>
      ${G.players.length>1?`<button class="remove-btn" onclick="removeP(${i})">×</button>`:''}
    </div>`).join('');
}
function selBoss(i){G.selectedBoss=i;buildSectorMap(i);renderHome();renderRef();renderCible();}
function removeP(i){G.players.splice(i,1);renderHome();}
function addP(){
  if(G.players.length>=4)return;
  const cols=['#1a2a4a','#2a1a4a','#1a3a1a','#3a1a1a'];
  G.players.push({name:`Joueur ${G.players.length+1}`,color:cols[G.players.length]});
  renderHome();
}

function startGame(){
  document.querySelectorAll('.player-name-inp').forEach((inp,i)=>{if(G.players[i])G.players[i].name=inp.value||`Joueur ${i+1}`;});
  const boss=getBoss(G.selectedBoss);
  G.teamPV=boss.teamPV;G.teamPVMax=boss.teamPV;
  G.bossPV=boss.pv;G.bossPVMax=boss.pv;
  G.manche=1;G.scores=G.players.map(()=>null);G.currentPlayer=0;
  G._playerDarts=[];G.liveFeed=[];
  G.effects={shield:0,shieldDur:0,dodge:0,dodgeCharges:0,fire:{stacks:0,dur:0,dmgPerStack:3},teamFire:0,armor:0};
  G.goldenDartsRemaining=0;
  G.activeBoostNext=false;G.activeResurr=false;G.activeBouclierItem=false;
  buildSectorMap(G.selectedBoss);
  G.bossShield=0;G.rage={has1:false,has2:false};
  G.stats={biggestHit:0,totalDmg:0,totalDmgTaken:0,heals:0,startTime:Date.now()};
  initDI();renderGameUI();nav('game');
}

// ============================================================
// DART INPUT
// ============================================================
function initDI(){DI={mod:1,darts:[]};G.goldenDartsRemaining=0;renderMods();}
function setMod(m){DI.mod=m;renderMods();}
function renderMods(){
  [1,2,3].forEach(m=>{const el=document.getElementById('mod-'+m);if(el)el.classList.toggle('active',DI.mod===m);});
  const cd=document.getElementById('cible-btn-double');
  const ct=document.getElementById('cible-btn-triple');
  if(cd)cd.classList.toggle('active',DI.mod===2);
  if(ct)ct.classList.toggle('active',DI.mod===3);
}

function computeRageMulti(){
  return (G.rage.has1&&G.rage.has2)?2:1;
}

function scaleEf(ef,mult){
  if(mult===1||!ef)return ef;
  const s={...ef};
  if(typeof s.val==='number'){
    if(s.type==='parade')s.val=Math.min(1.0,Math.round(s.val*mult*100)/100);
    else if(s.val!==999)s.val=Math.round(s.val*mult);
  }
  if(s.bonus&&typeof s.bonus.val==='number')s.bonus={...s.bonus,val:Math.round(s.bonus.val*mult)};
  return s;
}

function setGridLocked(locked){
  const grid=document.getElementById('num-grid');
  if(grid){grid.style.opacity=locked?'0.4':'1';grid.style.pointerEvents=locked?'none':'auto';}
  const cible=document.getElementById('cible-svg');
  if(cible){cible.style.opacity=locked?'0.4':'1';cible.style.pointerEvents=locked?'none':'auto';}
  const miss=document.querySelector('.cible-miss-btn');
  if(miss)miss.style.pointerEvents=locked?'none':'auto';
  ['mod-1','mod-2','mod-3'].forEach(id=>{const b=document.getElementById(id);if(b)b.style.pointerEvents=locked?'none':'auto';});
}

function dartPress(v){
  if(G.inputLocked)return;
  if(G.screen!=='game')return;
  const now=Date.now();
  if(now-lastDartTime<80)return;
  lastDartTime=now;
  if(G.scores[G.currentPlayer]!==null)return;
  const maxDarts=G.goldenDartsRemaining>0?6:3;
  if(DI.darts.length>=maxDarts)return;
  const m=DI.mod;
  if(v===25&&m===3){setMod(2);return;}
  // Bull vert (25 pts) — Miroir de feu
  if(v===25&&m===1){
    const label='Bull';
    let mef;
    if(G.effects.fire.stacks>0){
      const prevStacks=G.effects.fire.stacks;
      G.effects.fire.stacks*=2;
      G.effects.fire.dmgPerStack=6;
      mef={type:'bull_miroir',fire:true,prevStacks};
      addFeedItem({icon:'🫧',text:(G.players[G.currentPlayer]?.name||'')+' — Miroir de feu !',val:'🔥'.repeat(G.effects.fire.stacks)+' × 6 PV/manche',fc:'feu'});
      renderEffectsMini();
    } else {
      const dmg=20;
      G.bossPV=Math.max(0,G.bossPV-dmg);
      G.stats.totalDmg+=dmg;
      if(dmg>G.stats.biggestHit)G.stats.biggestHit=dmg;
      mef={type:'bull_miroir',fire:false,val:20};
      addFeedItem({icon:'🫧',text:(G.players[G.currentPlayer]?.name||'')+' — Miroir',val:'-20 PV au boss',fc:'atk'});
      updatePVBars();
    }
    DI.darts.push({value:v,multi:m,label,ak:'bull_miroir',ef:mef,ad:{feedClass:'special'},dartIcon:'🫧',dartName:'Miroir',golden:false});
    setMod(1);renderStrip();
    if(G.bossPV<=0){setTimeout(()=>showEnd(true),400);return;}
    if(DI.darts.length>=maxDarts){finishPlayerTurn();}
    return;
  }
  // Bull rouge (DBull 50 pts) — Flechettes dorees
  if(v===25&&m===2){
    const label='DBull';
    G.goldenDartsRemaining=3;
    addFeedItem({icon:'🎯',text:(G.players[G.currentPlayer]?.name||'')+' — Flechettes dorees !',val:'+3 flechettes x1.3',fc:'special'});
    DI.darts.push({value:v,multi:m,label,ak:'bull_dore',ef:{type:'bull_dore'},ad:{feedClass:'special'},dartIcon:'🎯',dartName:'Dorees',golden:false});
    setMod(1);renderStrip();
    if(DI.darts.length>=maxDarts){finishPlayerTurn();}
    return;
  }
  const ak=getAction(v);
  const ad=ACTIONS[ak];
  if(!ad)return;
  const ml=m===1?'simple':m===2?'double':'triple';
  const ef=ad[ml];
  const prefix=m===1?'':m===2?'D':'T';
  const label=v===0?'0':v===25?(m===2?'DBull':'Bull'):`${prefix}${v}`;
  const dartIcon=ad.icon;
  const dartName=null;
  const isGolden=G.goldenDartsRemaining>0&&DI.darts.length>=3;
  const goldenMult=isGolden?1.3:1.0;
  const aef=isGolden?scaleEf(ef,goldenMult):ef;

  // Track rage combo — touching each rage sector at least once this manche, any multiplier
  const rageS=getBoss(G.selectedBoss).sectors.rage||[];
  if(rageS.length&&v===rageS[0]) G.rage.has1=true;
  if(rageS.length>1&&v===rageS[1]) G.rage.has2=true;

  DI.darts.push({value:v,multi:m,label,ak,ef:aef,ad,dartIcon,dartName,golden:isGolden});
  if(isGolden)G.goldenDartsRemaining--;
  setMod(1);

  // Update boss PV live for attacks
  const rageMulti=computeRageMulti();
  if(aef.type==='atk'){
    const boostMult=G.activeBoostNext?2:1;
    if(G.activeBoostNext){G.activeBoostNext=false;addFeedItem({icon:'⚡',text:'Boost actif !',val:'Attaque x2',fc:'special'});}
    const rawDmg=Math.round(aef.val*rageMulti*boostMult);
    G.rawDmgThisRound=(G.rawDmgThisRound||0)+rawDmg;
    const dmg=Math.round(rawDmg*getArmorMult());
    DI.darts[DI.darts.length-1].actualDmg=dmg;
    const goldSuffix=isGolden?' 🎯':'';
    G.bossPV=Math.max(0,G.bossPV-dmg);
    if(dmg>G.stats.biggestHit)G.stats.biggestHit=dmg;
    G.stats.totalDmg+=dmg;
    const armorSuffix=G.effects.armor>0?' (armure −'+getArmorReduc()+'%)':'';
    addFeedItem({icon:ad.icon,text:(G.players[G.currentPlayer]?.name||'')+' — '+ad.name+goldSuffix,val:'−'+dmg+' PV boss'+armorSuffix,fc:'atk'});
    updatePVBars();
  }
  if(aef.type==='heal_team'){
    G.teamPV=Math.min(G.teamPVMax,G.teamPV+aef.val);
    G.stats.heals+=aef.val;
    addFeedItem({icon:'💚',text:(G.players[G.currentPlayer]?.name||'')+' — Soin'+(isGolden?' 🎯':''),val:'+'+aef.val+' PV équipe',fc:'heal'});
    updatePVBars();
  }
  if(aef.type==='shield'){
    G.effects.shield=(G.effects.shield||0)+aef.val;
    addFeedItem({icon:'🛡️',text:(G.players[G.currentPlayer]?.name||'')+' — Bouclier'+(isGolden?' 🎯':''),val:'+'+aef.val+' PV de bouclier',fc:'shield'});
    renderEffectsMini();
  }
  if(aef.type==='fire'){
    G.effects.fire.stacks+=aef.val;
    G.effects.fire.dur=2;
    const dps=G.effects.fire.dmgPerStack||3;
    updatePVBars();
    addFeedItem({icon:'🔥',text:(G.players[G.currentPlayer]?.name||'')+' — Feu'+(isGolden?' 🎯':''),val:'🔥'.repeat(G.effects.fire.stacks)+' — '+(G.effects.fire.stacks*dps)+' PV/manche',fc:'feu'});
    renderEffectsMini();
  }
  if(aef.type==='dodge'){
    const prevDodge=G.effects.dodge;const prevDodgeCharges=G.effects.dodgeCharges||0;
    G.effects.dodge=1.0;G.effects.dodgeCharges=0;
    DI.darts[DI.darts.length-1].prevDodge=prevDodge;
    DI.darts[DI.darts.length-1].prevDodgeCharges=prevDodgeCharges;
    addFeedItem({icon:'🌀',text:(G.players[G.currentPlayer]?.name||'')+' — Esquive'+(isGolden?' 🎯':''),val:`Esquive prête — prochaine attaque annulée !`,fc:'dodge'});
    renderEffectsMini();
  }
  if(aef.type==='dodge_charge'){
    const prevCharges=G.effects.dodgeCharges||0;const prevDodge2=G.effects.dodge;
    const newCharges=Math.min(3,prevCharges+aef.val);
    G.effects.dodgeCharges=newCharges;
    DI.darts[DI.darts.length-1].prevDodgeCharges=prevCharges;
    DI.darts[DI.darts.length-1].prevDodge=prevDodge2;
    DI.darts[DI.darts.length-1].chargeActivated=false;
    if(newCharges>=3){
      G.effects.dodge=1.0;G.effects.dodgeCharges=0;
      DI.darts[DI.darts.length-1].chargeActivated=true;
      addFeedItem({icon:'🌀',text:(G.players[G.currentPlayer]?.name||'')+` — Esquive`+(isGolden?' 🎯':''),val:`3/3 charges — Esquive prête !`,fc:'dodge'});
    } else {
      addFeedItem({icon:'🌀',text:(G.players[G.currentPlayer]?.name||'')+` — Esquive`+(isGolden?' 🎯':''),val:`${'🌀'.repeat(newCharges)} ${newCharges}/3 charges`,fc:'dodge'});
    }
    renderEffectsMini();
  }
  if(aef.type==='cancel_teamfire'){
    const prevTeamFire=G.effects.teamFire||0;
    DI.darts[DI.darts.length-1].prevTeamFire=prevTeamFire;
    G.effects.teamFire=0;
    updatePVBars();
    addFeedItem({icon:'💧',text:(G.players[G.currentPlayer]?.name||'')+' — Eau'+(isGolden?' 🎯':''),val:prevTeamFire>0?'Feu ennemi éteint !':'Aucun feu actif',fc:'dodge'});
    renderEffectsMini();
  }
  if(aef.type==='brise'){
    const before=G.effects.armor;
    const removed=aef.val===999?before:Math.min(aef.val,before);
    G.effects.armor=aef.val===999?0:Math.max(0,before-aef.val);
    DI.darts[DI.darts.length-1].actualArmorRemoved=removed;
    const restant=G.effects.armor;
    const feedVal=removed>0?(restant>0?'🛡️'.repeat(restant)+' −'+(restant*20)+'%':' Armure brisée !'):'Aucun bouclier à briser';
    addFeedItem({icon:'⚒️',text:(G.players[G.currentPlayer]?.name||'')+' — Brise-Bouclier',val:feedVal,fc:'brise'});
    if(aef.bonus&&aef.bonus.type==='heal_team'&&removed>0){
      G.teamPV=Math.min(G.teamPVMax,G.teamPV+aef.bonus.val);
      G.stats.heals+=aef.bonus.val;
      addFeedItem({icon:'💚',text:(G.players[G.currentPlayer]?.name||'')+' — Soin (Brise)',val:'+'+aef.bonus.val+' PV équipe',fc:'heal'});
      updatePVBars();
    }
    renderEffectsMini();
  }
  if(aef.type==='none'){
    addFeedItem({icon:'✕',text:(G.players[G.currentPlayer]?.name||'')+' — Manqué',val:'0 dégât',fc:'neutral'});
  }
  // Bonuses (brise handles its own bonus above)
  if(aef.bonus&&aef.type!=='brise'){
    const b=aef.bonus;
    if(b.type==='heal_team'){G.teamPV=Math.min(G.teamPVMax,G.teamPV+b.val);addFeedItem({icon:'💚',text:'Bonus soin',val:'+'+b.val+' PV',fc:'heal'});updatePVBars();}
    if(b.type==='atk'){G.bossPV=Math.max(0,G.bossPV-b.val);G.stats.totalDmg+=b.val;if(b.val>G.stats.biggestHit)G.stats.biggestHit=b.val;addFeedItem({icon:'💥',text:'Contre-attaque',val:'−'+b.val+' PV boss',fc:'atk'});updatePVBars();}
  }

  // Check rage combo active
  if(G.rage.has1&&G.rage.has2){
    addFeedItem({icon:'🤬',text:'Combo Rage activé ! ('+rageS[0]+'+'+rageS[1]+')',val:'Dégâts ×2',fc:'rage'});
  }

  renderStrip();
  renderEffectsMini();

  // Check if boss died from this dart
  if(G.bossPV<=0){
    setTimeout(()=>showEnd(true),400);
    return;
  }


  if(DI.darts.length>=maxDarts){finishPlayerTurn();}
  else if(isGolden&&G.goldenDartsRemaining===0){finishPlayerTurn();}
}

function addFeedItem(f){
  G.liveFeed.push(f);
  if(G.liveFeed.length>3)G.liveFeed.shift();
  const el=document.getElementById('live-feed');
  if(!el)return;
  el.innerHTML='';
  G.liveFeed.forEach(item=>{
    const div=document.createElement('div');
    div.className='feed-item '+item.fc;
    const icon=document.createElement('span');icon.className='feed-icon';icon.textContent=item.icon;
    const text=document.createElement('span');text.className='feed-text';text.textContent=item.text;
    const val=document.createElement('span');val.className='feed-val';val.textContent=item.val;
    div.appendChild(icon);div.appendChild(text);div.appendChild(val);
    el.appendChild(div);
  });
  // Mettre à jour la dernière action visible
  const last=G.liveFeed[G.liveFeed.length-1];
  const lat=document.getElementById('last-action-text');
  if(lat&&last)lat.textContent=`${last.icon}  ${last.text}${last.val?' — '+last.val:''}`;
}

function toggleFeedDropdown(e){
  if(e)e.stopPropagation();
  const dd=document.getElementById('feed-dropdown');
  if(!dd)return;
  const open=dd.style.display!=='none';
  dd.style.display=open?'none':'';
  const btn=document.getElementById('feed-dd-btn');
  if(btn)btn.textContent=open?'▼':'▲';
}

// Fermer le dropdown si clic en dehors
document.addEventListener('click',function(e){
  const dd=document.getElementById('feed-dropdown');
  const row=document.getElementById('last-action-row');
  if(dd&&dd.style.display!=='none'&&!dd.contains(e.target)&&row&&!row.contains(e.target)){
    dd.style.display='none';
    const btn=document.getElementById('feed-dd-btn');
    if(btn)btn.textContent='▼';
  }
});

function replayDartsFromZero(){
  const darts = Array.isArray(DI.darts) ? DI.darts.filter(Boolean) : [];
  const startBossPV = G.bossPVRoundStart ?? G.bossPVMax;
  const startTeamPV = G.teamPVAtRoundStart ?? G.teamPVMax;
  const currentArmor = G.armorAtRoundStart ?? 0;
  const currentShield = G.shieldAtRoundStart ?? 0;
  G.bossPV = startBossPV;
  G.teamPV = startTeamPV;
  G.effects = {
    shield:currentShield,shieldDur:0,dodge:0,dodgeCharges:0,
    fire:{stacks:0,dur:0,dmgPerStack:3},
    teamFire:0,armor:currentArmor
  };
  G.goldenDartsRemaining = 0;
  G.rage = {has1:false,has2:false};

  for(const dart of darts){
    const ef = dart && dart.ef ? dart.ef : {};
    const ad = dart && dart.ad ? dart.ad : {feedClass:'neutral'};
    if(ef.type === 'atk'){
      const dmg = Number.isFinite(dart.actualDmg) ? dart.actualDmg : Math.round((ef.val || 0) * (dart.golden ? 1.3 : 1));
      G.bossPV = Math.max(0, G.bossPV - dmg);
    }
    if(ef.type === 'heal_team') G.teamPV = Math.min(G.teamPVMax, G.teamPV + (ef.val || 0));
    if(ef.type === 'fire'){
      G.effects.fire.stacks += Number(ef.val || 0);
      if(G.effects.fire.stacks > 0) G.effects.fire.dur = 2;
    }
    if(ef.type === 'shield') G.effects.shield = (G.effects.shield || 0) + (ef.val || 0);
    if(ef.type === 'dodge') G.effects.dodge = 1.0;
    if(ef.type === 'dodge_charge'){
      const nextCharges = Math.min(3, (G.effects.dodgeCharges || 0) + (ef.val || 0));
      G.effects.dodgeCharges = nextCharges;
      if(nextCharges >= 3){G.effects.dodge = 1.0; G.effects.dodgeCharges = 0;}
    }
    if(ef.type === 'cancel_teamfire') G.effects.teamFire = 0;
    if(ef.type === 'bull_miroir'){
      if(ef.fire){ G.effects.fire.stacks = ef.prevStacks || 0; }
      else { G.bossPV = Math.max(0, G.bossPV - 20); }
    }
    if(ef.type === 'brise') G.effects.armor = Math.max(0, G.effects.armor - (dart.actualArmorRemoved || 0));
    if(ef.bonus && ef.bonus.type === 'heal_team') G.teamPV = Math.min(G.teamPVMax, G.teamPV + (ef.bonus.val || 0));
    if(ef.bonus && ef.bonus.type === 'atk') G.bossPV = Math.max(0, G.bossPV - (ef.bonus.val || 0));
    if(ad && ad.feedClass) {
      // aucune mutation des objets de DI.darts ; on garde leur structure d'origine intacte
    }
  }
}

function undoLastDart(){
  console.log('undoLastDart appelé, darts:', DI.darts.length, 'inputLocked:', G.inputLocked);
  if(G.isUndoing || G.screen !== 'game' || DI.darts.length === 0) return;
  G.isUndoing = true;
  G.inputLocked = false;
  setGridLocked(false);

  const last = DI.darts.pop();
  G.liveFeed = G.liveFeed.slice(0, -1);
  const el=document.getElementById('live-feed');
  if(el && el.lastChild) el.removeChild(el.lastChild);
  const lastAction=document.getElementById('last-action-text');
  if(lastAction) lastAction.textContent = G.liveFeed.length ? `${G.liveFeed[G.liveFeed.length-1].icon}  ${G.liveFeed[G.liveFeed.length-1].text}${G.liveFeed[G.liveFeed.length-1].val?' — '+G.liveFeed[G.liveFeed.length-1].val:''}` : '—';

  replayDartsFromZero();

  if(last && last.golden) G.goldenDartsRemaining = Math.min(3, (G.goldenDartsRemaining || 0) + 1);
  G.isUndoing = false;
  setMod(1);
  updatePVBars();
  renderEffectsMini();
  confirmP();
}

function removeLast(){
  undoLastDart();
}

// Le bouton "Valider la manche" ne s'active que lorsque TOUS les joueurs ont joue leurs flechettes
function confirmP(){
  if(G.isUndoing)return;
  const allDone=G.scores.every(s=>s!==null);
  const btn=document.getElementById('confirm-btn');
  if(btn){btn.disabled=!allDone;btn.style.opacity=allDone?'1':'.5';}
  renderStrip();
}

// Verrouille les flechettes du joueur courant des qu'il a fini son tour, puis passe
// automatiquement au joueur suivant qui n'a pas encore joue (sans attaque du boss entre les deux) —
// la manche n'est validee et le boss n'attaque qu'une fois TOUS les joueurs verrouilles.
function finishPlayerTurn(){
  if(G.isUndoing)return;
  const cp=G.currentPlayer;
  if(G.scores[cp]!==null)return;
  const maxDarts=G.goldenDartsRemaining>0?6:3;
  if(DI.darts.length<maxDarts)return;

  G._playerDarts[cp]=[...DI.darts];
  G.scores[cp]=cp;

  const nextPlayer=G.players.findIndex((_,idx)=>idx!==cp&&G.scores[idx]===null);
  if(nextPlayer!==-1){
    G.currentPlayer=nextPlayer;
    DI={mod:1,darts:[]};
    G.goldenDartsRemaining=0;
    G.inputLocked=false;
    setGridLocked(false);
    lastDartTime=0;
    G.playerEditor=null;
    setMod(1);
  }

  confirmP();
  renderStrip();
}

function removeActiveDart(playerIndex, dartIndex){
  if(G.screen !== 'game' || G.currentPlayer !== playerIndex || G.scores[playerIndex] !== null) return;
  if(!Array.isArray(DI.darts)) return;
  const remaining=[...DI.darts];
  remaining.splice(dartIndex,1);
  DI.darts=remaining;
  G._playerDarts[playerIndex]=[...remaining];
  G.inputLocked=false;
  setGridLocked(false);
  G.playerEditor=null;
  lastDartTime=0;
  rebuildRoundStateFromCurrentDarts();
  renderEffectsMini();
  updatePVBars();
  confirmP();
  renderStrip();
}

function undoLastP(){
  if(!G._playerDarts)return;
  let last=-1;
  for(let i=G.players.length-1;i>=0;i--){if(G.scores[i]!==null){last=i;break;}}
  if(last===-1)return;
  // Revert PV
  const darts=G._playerDarts[last]||[];
  const rageMulti=computeRageMulti();
  darts.forEach(d=>{
    if(d.ef.type==='atk')G.bossPV=Math.min(G.bossPVMax,G.bossPV+Math.round(d.ef.val*rageMulti));
    if(d.ef.type==='heal_team')G.teamPV=Math.max(0,G.teamPV-d.ef.val);
    if(d.ef.bonus&&d.ef.bonus.type==='heal_team')G.teamPV=Math.max(0,G.teamPV-d.ef.bonus.val);
    if(d.ef.bonus&&d.ef.bonus.type==='atk')G.bossPV=Math.min(G.bossPVMax,G.bossPV+d.ef.bonus.val);
    const rageS2=getBoss(G.selectedBoss).sectors.rage||[];
    if(rageS2.length&&d.value===rageS2[0])G.rage.has1=false;
    if(rageS2.length>1&&d.value===rageS2[1])G.rage.has2=false;
  });
  // Remove feed items
  darts.forEach(()=>{
    G.liveFeed.pop();
    const el=document.getElementById('live-feed');
    if(el&&el.lastChild)el.removeChild(el.lastChild);
  });
  G.scores[last]=null;G.currentPlayer=last;G.inputLocked=false;setGridLocked(false);lastDartTime=0;
  DI.darts=[...darts];G._playerDarts[last]=[];
  const btn=document.getElementById('confirm-btn');
  if(btn){btn.disabled=true;btn.style.opacity='.5';}
  renderMiniRefBar();
  updatePVBars();renderStrip();renderMods();
}

// ============================================================
// GAME UI
// ============================================================
function renderMiniRefBar(){
  const el=document.getElementById('mini-ref-bar');if(!el)return;
  const boss=getBoss(G.selectedBoss);
  const s=boss.sectors;
  const r=s.rage||[];
  el.innerHTML=
    '<div class="mri" style="background:#1e1204;border-color:#4a3010;color:#e0a030" onclick="showMiniRef(&quot;atk_faible&quot;)">🗡️<span class="mri-num">'+s.atk_faible+'</span></div>'+
    '<div class="mri" style="background:#1e0c04;border-color:#4a2010;color:#e07020" onclick="showMiniRef(&quot;atk_moyenne&quot;)">🗡️🗡️<span class="mri-num">'+s.atk_moyenne[0]+'/'+s.atk_moyenne[1]+'</span></div>'+
    '<div class="mri" style="background:#1e0404;border-color:#5a0808;color:#e03030" onclick="showMiniRef(&quot;atk_forte&quot;)">🗡️🗡️🗡️<span class="mri-num">'+s.atk_forte+'</span></div>'+
    '<div class="mri" style="background:#081408;border-color:#1a3a1a;color:#7ace7a" onclick="showMiniRef(&quot;soin&quot;)">💚<span class="mri-num">'+s.soin+'</span></div>'+
    '<div class="mri" style="background:#100820;border-color:#2a1a4a;color:#9b7fe8" onclick="showMiniRef(&quot;bouclier&quot;)">🛡️<span class="mri-num">'+s.bouclier+'</span></div>'+
    (r.length>=2?'<div class="mri" style="background:#1e0e04;border-color:#5a3010;color:#e8a030" onclick="showMiniRef(&quot;neutre_combo&quot;)">🤬<span class="mri-num">'+r[0]+'+'+r[1]+'</span></div>':'')+
    '<div class="mri" style="background:#080e1a;border-color:#1a2a3a;color:#4a90d0" onclick="showMiniRef(&quot;esquive&quot;)">🌀<span class="mri-num">'+s.esquive+'</span></div>'+
    '<div class="mri" style="background:#1e0a00;border-color:#6a2800;color:#ff7030" onclick="showMiniRef(&quot;feu&quot;)">🔥<span class="mri-num">'+s.feu+'</span></div>'+
    (s.eau?'<div class="mri" style="background:#080e1a;border-color:#1a2a3a;color:#4a9ae8" onclick="showMiniRef(&quot;eau&quot;)">💧<span class="mri-num">'+s.eau+'</span></div>':'')+
    (s.brise?'<div class="mri" style="background:#1a0e00;border-color:#5a3800;color:#e8a030" onclick="showMiniRef(&quot;brise&quot;)">⚒️<span class="mri-num">'+s.brise+'</span></div>':'')+
    '<div class="mri" style="background:#041418;border-color:#1a4050;color:#40c0e0" onclick="showMiniRef(&quot;bull_miroir&quot;)">🫧<span class="mri-num">25</span></div>'+
    '<div class="mri" style="background:#1a1400;border-color:#8a6000;color:#ffd700" onclick="showMiniRef(&quot;bull_dore&quot;)">🎯<span class="mri-num">50</span></div>';
}

function toggleClavier(){
  const cl=document.getElementById('clavier-section');
  if(cl)cl.style.display=cl.style.display==='none'?'':'none';
}

function flashEl(el,baseColor){
  el.setAttribute('fill','rgba(255,255,255,0.35)');
  setTimeout(()=>el.setAttribute('fill',baseColor),180);
}

function renderCible(){
  const svgEl=document.getElementById('cible-svg');
  if(!svgEl)return;
  const SECTORS=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  const CX=200,CY=200;
  const R={bullseye:12,bull:30,tripleIn:105,tripleOut:120,doubleIn:172,doubleOut:190,numRing:202};
  const cfg=getCibleFor(G.selectedBoss)||null;
  const NEUTRAL='#2a2a2a';
  const BULL_COLOR='#1a5a1a',BS_COLOR='#5a0000';
  const rageSet=new Set(getBoss(G.selectedBoss).sectors.rage||[]);

  function darkenColor(hex,pct){
    const n=parseInt(hex.slice(1),16),f=1-pct/100;
    const r=Math.round(((n>>16)&0xff)*f);
    const g=Math.round(((n>>8)&0xff)*f);
    const b=Math.round((n&0xff)*f);
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }
  function toRad(d){return(d-90)*Math.PI/180;}
  function pt(a,r){const rad=toRad(a);return[CX+r*Math.cos(rad),CY+r*Math.sin(rad)];}
  function arc(i,r1,r2){
    const a1=i*18-9,a2=i*18+9;
    const[x1,y1]=pt(a1,r1),[x2,y2]=pt(a2,r1);
    const[x3,y3]=pt(a2,r2),[x4,y4]=pt(a1,r2);
    const f=v=>v.toFixed(2);
    return `M ${f(x1)} ${f(y1)} A ${r1} ${r1} 0 0 1 ${f(x2)} ${f(y2)} L ${f(x3)} ${f(y3)} A ${r2} ${r2} 0 0 0 ${f(x4)} ${f(y4)} Z`;
  }
  const NS='http://www.w3.org/2000/svg';
  function mkEl(tag,attrs){
    const e=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
    return e;
  }

  svgEl.innerHTML='';
  svgEl.appendChild(mkEl('circle',{cx:CX,cy:CY,r:R.doubleOut+6,fill:'#0a0a0a'}));

  SECTORS.forEach((num,i)=>{
    const c=cfg?cfg[num]:null;
    const simpleFill=c?c.color:NEUTRAL;
    const actionKey=CURRENT_SECTOR_MAP[num];
    const isAtk=actionKey&&actionKey.startsWith('atk_');
    const isRage=rageSet.has(num);
    const doubleFill=c?darkenColor(c.color,25):NEUTRAL;
    const tripleFill=c?darkenColor(c.color,45):NEUTRAL;

    const p1=arc(i,R.bull,R.tripleIn);
    const p2=arc(i,R.tripleOut,R.doubleIn);
    const se=mkEl('path',{d:p1+' '+p2,fill:simpleFill,stroke:'#333','stroke-width':'0.5'});
    se.style.cursor='pointer';
    se.addEventListener('click',()=>{flashEl(se,simpleFill);dartPress(num);});
    svgEl.appendChild(se);

    const te=mkEl('path',{d:arc(i,R.tripleIn,R.tripleOut),fill:tripleFill,stroke:'#333','stroke-width':'0.5'});
    te.style.cursor='pointer';
    te.addEventListener('click',()=>{flashEl(te,tripleFill);dartPress(num);});
    svgEl.appendChild(te);

    const de=mkEl('path',{d:arc(i,R.doubleIn,R.doubleOut),fill:doubleFill,stroke:'#333','stroke-width':'0.5'});
    de.style.cursor='pointer';
    de.addEventListener('click',()=>{flashEl(de,doubleFill);dartPress(num);});
    svgEl.appendChild(de);

    if(c&&c.icon){
      const iconR=(R.tripleOut+R.doubleIn)/2;
      const[ix,iy]=pt(i*18,iconR);
      const ic=mkEl('text',{x:ix.toFixed(2),y:iy.toFixed(2),'text-anchor':'middle','dominant-baseline':'central','font-size':'15','pointer-events':'none'});
      ic.textContent=c.icon;
      svgEl.appendChild(ic);
    }
  });

  // Fils de séparation
  SECTORS.forEach((_,i)=>{
    const a=i*18-9;
    const[x1,y1]=pt(a,R.bull),[x2,y2]=pt(a,R.doubleOut);
    const l=mkEl('line',{x1:x1.toFixed(2),y1:y1.toFixed(2),x2:x2.toFixed(2),y2:y2.toFixed(2),stroke:'#444','stroke-width':'0.8'});
    l.style.pointerEvents='none';
    svgEl.appendChild(l);
  });

  // Bull (25)
  const bull=mkEl('circle',{cx:CX,cy:CY,r:R.bull,fill:BULL_COLOR,stroke:'#333','stroke-width':'0.8'});
  bull.style.cursor='pointer';
  bull.addEventListener('click',()=>{flashEl(bull,BULL_COLOR);dartPress(25);});
  svgEl.appendChild(bull);

  // Bullseye — tap force mod=2 (DBull)
  const bs=mkEl('circle',{cx:CX,cy:CY,r:R.bullseye,fill:BS_COLOR,stroke:'#333','stroke-width':'0.8'});
  bs.style.cursor='pointer';
  bs.addEventListener('click',()=>{flashEl(bs,BS_COLOR);setMod(2);dartPress(25);});
  svgEl.appendChild(bs);

  // Numéros
  SECTORS.forEach((num,i)=>{
    const[x,y]=pt(i*18,R.numRing);
    const t=mkEl('text',{x:x.toFixed(2),y:y.toFixed(2),'text-anchor':'middle','dominant-baseline':'central',fill:'#cccccc','font-size':'14','font-weight':'700','pointer-events':'none'});
    t.textContent=num;
    svgEl.appendChild(t);
  });
}

function renderGameUI(){
  const boss=getBoss(G.selectedBoss);
  document.getElementById('game-boss-name').textContent=boss.nom;
  document.getElementById('game-manche').textContent=G.manche;
  G.bossPVRoundStart=G.bossPV;
  G.armorAtRoundStart=G.effects.armor||0;
  G.shieldAtRoundStart=G.effects.shield||0;
  G.rawDmgThisRound=0;
  G.scores=G.players.map(()=>null);G.currentPlayer=0;
  G._playerDarts=[];G.liveFeed=[];G.inputLocked=false;G.isUndoing=false;setGridLocked(false);lastDartTime=0;
  G.bossPVRoundStart=G.bossPV;G.teamPVAtRoundStart=G.teamPV;
  G.rage={has1:false,has2:false};
  const feedEl=document.getElementById('live-feed');
  if(feedEl)feedEl.innerHTML='';
  const lat=document.getElementById('last-action-text');
  if(lat)lat.textContent='—';
  const dd=document.getElementById('feed-dropdown');
  if(dd)dd.style.display='none';
  const ddbtn=document.getElementById('feed-dd-btn');
  if(ddbtn)ddbtn.textContent='▼';
  initDI();updatePVBars();renderEffectsMini();renderStrip();
  const btn=document.getElementById('confirm-btn');
  if(btn){btn.disabled=true;btn.style.opacity='.5';}
  renderMiniRefBar();
  renderCible();
}

function updatePVBars(){
  const tPct=Math.max(0,Math.min(100,G.teamPV/G.teamPVMax*100));
  const bPct=Math.max(0,Math.min(100,G.bossPV/G.bossPVMax*100));
  const tv=document.getElementById('team-pv');const bv=document.getElementById('boss-pv');
  const tb=document.getElementById('team-pv-bar');const bb=document.getElementById('boss-pv-bar');
  const fireStacks=G.effects.teamFire||0;
  const fireSuffix=fireStacks>0?'🔥'.repeat(Math.min(fireStacks,4)):'';
  if(tv){
    tv.textContent=G.teamPV+(fireSuffix?fireSuffix:'');
    if(fireStacks>0){
      tv.style.color='#e85020';
      tv.style.textShadow='0 0 12px rgba(232,80,32,0.8),0 0 24px rgba(232,80,32,0.4)';
    } else {
      tv.style.color='';
      tv.style.textShadow='';
    }
  }
  const bossFireStacks=G.effects.fire.stacks||0;
  const bossFireEl=document.getElementById('boss-fire-icons');
  if(bv)bv.textContent=Math.max(0,G.bossPV);
  if(bv&&bossFireStacks>0){
    bv.style.color='#e85020';
    bv.style.textShadow='0 0 12px rgba(232,80,32,0.8),0 0 24px rgba(232,80,32,0.4)';
  } else if(bv){
    bv.style.color='';
    bv.style.textShadow='';
  }
  if(bossFireEl){
    if(bossFireStacks===0){bossFireEl.innerHTML='';}
    else if(bossFireStacks===1){bossFireEl.innerHTML='<span style="font-size:28px">🔥</span>';}
    else if(bossFireStacks===2){bossFireEl.innerHTML='<span style="font-size:22px">🔥🔥</span>';}
    else if(bossFireStacks===3){bossFireEl.innerHTML='<span style="font-size:18px">🔥🔥🔥</span>';}
    else{bossFireEl.innerHTML='<span style="font-size:14px">'+'🔥'.repeat(bossFireStacks)+'</span>';}
  }
  if(tb){tb.style.width=tPct+'%';tb.style.background=tPct>50?'var(--green)':tPct>25?'#e08050':'var(--danger)';}
  if(bb){bb.style.width=bPct+'%';bb.style.background=bPct>50?'var(--danger)':bPct>25?'#e08050':'var(--success)';}
}

function renderEffectsMini(){
  const team=document.getElementById('effects-team');
  const boss=document.getElementById('effects-boss');
  if(!team||!boss)return;
  team.innerHTML='';boss.innerHTML='';

  function chip(label,bg,border,size){
    const d=document.createElement('div');
    d.style.cssText=`border-radius:6px;padding:3px 7px;font-size:${size||'18px'};line-height:1.2;background:${bg};border:1px solid ${border};`;
    d.textContent=label;
    return d;
  }
  function shieldEmoji(pv){return pv>=999?'🛡️🛡️🛡️🛡️':pv>40?'🛡️🛡️🛡️':pv>20?'🛡️🛡️':'🛡️';}

  // === Zone équipe (verte) — défenses de l'équipe ===
  if((G.effects.dodgeCharges||0)>0)
    team.appendChild(chip('🌀'.repeat(G.effects.dodgeCharges),'#080e1a','#1a2a4a'));
  if(G.effects.dodge>=1.0)
    team.appendChild(chip('🌀✨','#080820','#2a4a8a'));
  if((G.effects.shield||0)>0)
    team.appendChild(chip(shieldEmoji(G.effects.shield)+' '+G.effects.shield,'#100820','#2a1a4a'));

  // === Zone boss (rouge) — dégâts infligés + effets boss ===
  if((G.effects.armor||0)>0)
    boss.appendChild(chip('🛡️'.repeat(G.effects.armor)+' −'+(G.effects.armor*20)+'%','#1a0e18','#5a2a7a'));
  if(G.bossShield>0)
    boss.appendChild(chip('🛡️'.repeat(G.bossShield>60?4:G.bossShield>30?3:1),'#0a1020','#1a3a6a'));
}

function rebuildRoundStateFromCurrentDarts(){
  const startBossPV = G.bossPVRoundStart ?? G.bossPVMax;
  const startTeamPV = G.teamPVAtRoundStart ?? G.teamPVMax;
  const currentArmor = G.armorAtRoundStart ?? 0;
  const currentShield = G.shieldAtRoundStart ?? 0;
  G.bossPV = startBossPV;
  G.teamPV = startTeamPV;
  G.effects = {
    shield:currentShield,shieldDur:0,dodge:0,dodgeCharges:0,
    fire:{stacks:0,dur:0,dmgPerStack:3},
    teamFire:0,armor:currentArmor
  };
  G.goldenDartsRemaining = 0;
  G.rage = {has1:false,has2:false};

  const allDarts=[];
  G.players.forEach((_,idx)=>{
    const source = idx === G.currentPlayer ? DI.darts : (G._playerDarts && G._playerDarts[idx] ? G._playerDarts[idx] : []);
    if(Array.isArray(source)) allDarts.push(...source);
  });

  for(const dart of allDarts){
    if(!dart || !dart.ef) continue;
    const ef=dart.ef;
    if(ef.type === 'atk'){
      const dmg = Number.isFinite(dart.actualDmg) ? dart.actualDmg : Math.round((ef.val || 0) * (dart.golden ? 1.3 : 1));
      G.bossPV = Math.max(0, G.bossPV - dmg);
    }
    if(ef.type === 'heal_team') G.teamPV = Math.min(G.teamPVMax, G.teamPV + (ef.val || 0));
    if(ef.type === 'fire'){
      G.effects.fire.stacks += Number(ef.val || 0);
      if(G.effects.fire.stacks > 0) G.effects.fire.dur = 2;
    }
    if(ef.type === 'shield') G.effects.shield = (G.effects.shield || 0) + (ef.val || 0);
    if(ef.type === 'dodge') G.effects.dodge = 1.0;
    if(ef.type === 'dodge_charge'){
      const nextCharges = Math.min(3, (G.effects.dodgeCharges || 0) + (ef.val || 0));
      G.effects.dodgeCharges = nextCharges;
      if(nextCharges >= 3){G.effects.dodge = 1.0; G.effects.dodgeCharges = 0;}
    }
    if(ef.type === 'cancel_teamfire') G.effects.teamFire = 0;
    if(ef.type === 'bull_miroir'){
      if(ef.fire){ G.effects.fire.stacks = ef.prevStacks || 0; }
      else { G.bossPV = Math.max(0, G.bossPV - 20); }
    }
    if(ef.type === 'brise') G.effects.armor = Math.max(0, G.effects.armor - (dart.actualArmorRemoved || 0));
    if(ef.bonus && ef.bonus.type === 'heal_team') G.teamPV = Math.min(G.teamPVMax, G.teamPV + (ef.bonus.val || 0));
    if(ef.bonus && ef.bonus.type === 'atk') G.bossPV = Math.max(0, G.bossPV - (ef.bonus.val || 0));
  }
}

function openPlayerEditMenu(playerIndex){
  if(G.screen !== 'game') return;
  if(G.currentPlayer !== playerIndex || G.scores[playerIndex] !== null) return;
  G.playerEditor = playerIndex;
  renderStrip();
}

function closePlayerEditMenu(){
  G.playerEditor = null;
  renderStrip();
}

function removePlayerDart(playerIndex, dartIndex){
  if(G.screen !== 'game') return;

  if(playerIndex === G.currentPlayer && G.scores[playerIndex] === null){
    if(!Array.isArray(DI.darts)) return;
    const remaining=[...DI.darts];
    remaining.splice(dartIndex,1);
    DI.darts=remaining;
    G._playerDarts[playerIndex]=[...remaining];
    G.playerEditor=null;
    G.inputLocked=false;
    setGridLocked(false);
    lastDartTime=0;
    rebuildRoundStateFromCurrentDarts();
    renderEffectsMini();
    updatePVBars();
    confirmP();
    renderStrip();
    return;
  }

  if(!G._playerDarts || !G._playerDarts[playerIndex]) return;
  const remaining=[...G._playerDarts[playerIndex]];
  remaining.splice(dartIndex,1);

  G._playerDarts[playerIndex]=remaining;
  G.scores[playerIndex]=null;
  G.currentPlayer=playerIndex;
  DI.darts=[...remaining];
  G.inputLocked=false;
  setGridLocked(false);
  G.playerEditor=null;
  lastDartTime=0;
  rebuildRoundStateFromCurrentDarts();
  renderEffectsMini();
  updatePVBars();
  confirmP();
  renderStrip();
}

// Construit la ligne HTML d'un seul joueur (utilise pour afficher tous les joueurs en meme temps)
function renderPlayerRowHtml(i){
  const p=G.players[i];
  if(!p)return '';

  const done=G.scores[i]!==null;
  const active=i===G.currentPlayer&&!done;
  const darts=active?DI.darts:(done&&G._playerDarts[i]?G._playerDarts[i]:[]);
  const totalSlots=active&&darts.length>3?darts.length:3;
  const showActiveEditButton = active && Array.isArray(DI.darts) && DI.darts.length >= 3 && G.screen === 'game';
  const slots=Array.from({length:totalSlots},(_,j)=>{
    const d=darts[j];
    if(d){
      const fcMap={atk:'#e06060',heal:'var(--green)',shield:'var(--purple)',rage:'#e8a030',dodge:'var(--blue)',neutral:'var(--muted)',special:'var(--gold)',feu:'#ff7030'};
      const feedClass=d.ad && d.ad.feedClass ? d.ad.feedClass : 'neutral';
      const col=d.golden?'#ffd700':(fcMap[feedClass]||'var(--muted)');
      const border=d.golden?'#8a6000':col;
      return `<div class="p-slot" style="background:${col}22;border:1px solid ${border}55;color:${col}">${d.dartIcon||''}${d.label||''}</div>`;
    }
    if(done)return `<div class="p-slot" style="background:var(--bg3);color:var(--dim)">—</div>`;
    if(active)return `<div class="p-slot empty">—</div>`;
    return `<div class="p-slot" style="background:var(--bg);color:#111">—</div>`;
  }).join('');

  const popup = G.playerEditor === i && active && Array.isArray(DI.darts) && DI.darts.length >= 3 ? `
    <div class="player-edit-popup" style="display:flex;align-items:flex-end;gap:8px;padding:6px 8px;margin:0 0 6px 0;background:#120f0a;border:1px solid #a67c1d;border-radius:9px;box-shadow:0 10px 20px rgba(0,0,0,.25);max-width:100%;overflow-x:auto;white-space:nowrap;position:relative;">
      ${DI.darts.map((d,idx)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:48px;padding:4px 6px;background:#1b140a;border:1px solid #3d2e10;border-radius:7px;">
        <span style="font-size:14px;line-height:1">${d.dartIcon||'•'}</span>
        <span style="font-size:11px;color:#f3e3b3;line-height:1.1">${d.label||''}</span>
        <button onclick="removePlayerDart(${i},${idx});event.stopPropagation();" style="background:transparent;border:1px solid #7c5b18;color:#f7d67a;border-radius:5px;cursor:pointer;width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0;font-size:11px;line-height:1">✕</button>
      </div>`).join('')}
    </div>
  ` : '';

  return `<div class="player-strip-row${active?' active':''}${done?' done':''}" style="position:relative;display:flex;flex-direction:column;align-items:stretch;gap:4px;">
    ${popup}
    <div style="display:flex;align-items:center;gap:8px;width:100%">
      <div class="p-av" style="background:${p.color};color:#fff">${ini(p.name)}</div>
      <div class="p-nm" style="display:flex;align-items:center;gap:8px;position:relative;flex:1;min-width:0">
        <span>${p.name}</span>
        ${showActiveEditButton ? `<button class="player-edit-btn" onclick="event.stopPropagation();openPlayerEditMenu(${i});" style="background:#1c170b;border:1px solid #9b7b27;border-radius:8px;padding:2px 6px;color:#f0d67a;cursor:pointer;font-size:12px;line-height:1.2">✏️</button>` : ''}
      </div>
      <div class="p-slots" style="flex-wrap:wrap;display:flex;gap:4px;justify-content:flex-end;flex:1;min-width:0">${slots}</div>
    </div>
  </div>`;
}

// Affiche tous les joueurs en meme temps dans la bande joueurs (chacun garde ses flechettes visibles)
function renderStrip(){
  const el=document.getElementById('players-strip');if(!el)return;
  el.innerHTML = G.players.map((_,i)=>renderPlayerRowHtml(i)).join('');

  const gb=document.getElementById('golden-banner');
  if(gb){
    if(G.goldenDartsRemaining>0&&G.currentPlayer<G.players.length){
      gb.style.display='block';
      gb.textContent='🎯 Flechettes dorees — '+G.goldenDartsRemaining+' restante'+(G.goldenDartsRemaining>1?'s':'')+' — effets x1.3';
    } else {
      gb.style.display='none';
    }
  }
}

document.addEventListener('click',function(e){
  const btn=e.target.closest('.player-edit-btn');
  const popup=e.target.closest('.player-edit-popup');
  if(!btn && !popup && G.playerEditor !== null){
    G.playerEditor = null;
    renderStrip();
  }
});

// ============================================================
// VALIDATE ROUND — resolve boss action
// ============================================================
function showTeamActionsOverlay(cards, onDone){
  if(cards.length===0){onDone();return;}
  const ov=document.getElementById('team-overlay');
  const content=document.getElementById('team-overlay-content');
  const btn=document.getElementById('team-overlay-btn');
  const dots=document.getElementById('team-overlay-dots');
  ov.classList.add('active');
  let idx=0;

  function showCard(){
    content.innerHTML='';
    const card=cards[idx];

    // Dots
    dots.innerHTML=cards.map((_,i)=>
      '<div style="width:'+(i===idx?'16':'6')+'px;height:6px;border-radius:3px;background:'+(i===idx?'var(--gold)':'var(--bg3)')+'"></div>'
    ).join('');

    // Icon
    const ic=document.createElement('div');ic.style.cssText='font-size:64px;margin-bottom:14px';ic.textContent=card.icon;
    // Title
    const ti=document.createElement('div');ti.style.cssText='font-family:var(--font-title);font-size:26px;color:'+card.color+';letter-spacing:.06em;margin-bottom:6px;text-align:center';ti.textContent=card.title;
    // Subtitle
    const su=document.createElement('div');su.style.cssText='font-size:15px;color:#ccc;margin-bottom:20px;text-align:center';su.textContent=card.subtitle;
    // Effect box
    const bx=document.createElement('div');bx.style.cssText='background:'+card.color+'18;border:1px solid '+card.color+'44;border-radius:12px;padding:14px 20px;margin-bottom:12px;text-align:center;width:100%';
    bx.innerHTML='<div style="font-size:13px;color:'+card.color+';line-height:1.5">'+card.effect+'</div>';

    [ic,ti,su,bx].forEach(el=>content.appendChild(el));

    btn.textContent=idx<cards.length-1?'Suivant →':`Voir l'attaque du boss`;
    btn.onclick=()=>{
      idx++;
      if(idx<cards.length) showCard();
      else{ov.classList.remove('active');onDone();}
    };
  }
  showCard();
}

function validateRound(){
  if(G.isUndoing || G.screen !== 'game') return;
  // Un seul recap pour tous les joueurs : on attend que chacun ait lance ses 3 flechettes
  // (le verrouillage par joueur se fait des que ses 3 flechettes sont jouees, voir finishPlayerTurn())
  if(!G.scores.every(s=>s!==null)) return;

  const boss=getBoss(G.selectedBoss);

  renderEffectsMini();

  const teamCards=[];
  if(G.effects.dodge>=1.0){
    teamCards.push({
      icon:'🌀',title:'Esquive prête !',color:'#4a9ae8',
      subtitle:'Prochaine attaque annulée',
      effect:`La prochaine attaque du boss sera <strong style="color:#4a9ae8">complètement annulée</strong>`
    });
  } else if((G.effects.dodgeCharges||0)>0){
    const dc=G.effects.dodgeCharges;
    teamCards.push({
      icon:'🌀',title:`${dc}/3 charges d'esquive`,color:'#4a9ae8',
      subtitle:`${'🌀'.repeat(dc)} Accumulation en cours`,
      effect:`Encore ${3-dc} charge${3-dc>1?'s':''} pour activer l'esquive`
    });
  }
  if(G.rage.has1&&G.rage.has2){
    const rageS=boss.sectors.rage||[];
    teamCards.push({
      icon:'🤬',title:'Rage activée !',color:'#e8a030',
      subtitle:'Combo '+rageS[0]+' + '+rageS[1]+' réussi !',
      effect:'Tous les dégâts d\'attaque de ce tour sont multipliés par <strong style="color:#e8a030">×2</strong>'
    });
  }
  if((G.effects.shield||0)>0){
    teamCards.push({
      icon:'🛡️',title:'Bouclier actif !',color:'#9b7fe8',
      subtitle:'Protection en cours',
      effect:`L'équipe est protégée par <strong style="color:#9b7fe8">${G.effects.shield} PV de bouclier</strong>`
    });
  }

  const patternIndex=(G.manche-1)%boss.pattern.length;
  const bossAction=boss.pattern[patternIndex];

  const launchBossOverlay=()=>{
    if(bossAction.type==='armorUp'){
      G.effects.armor=Math.min(4,G.effects.armor+bossAction.val);
      renderEffectsMini();
      const ar=G.effects.armor;
      addFeedItem({icon:'🛡️',text:boss.nom+' — Armure',val:'🛡️'.repeat(ar)+' −'+(ar*20)+'% dégâts',fc:'shield'});
      const subtitles=['','Vos attaques sont réduites de 20%','Vos attaques sont réduites de 40%','Vos attaques sont réduites de 60%','Vos attaques sont réduites de 80% — Brisez ses boucliers !'];
      showSpecialBossOverlay(boss,'🛡️🛡️','#e8a030',`Le boss gagne ${bossAction.val} bouclier(s) !`,subtitles[ar]||'');
      return;
    }
    if(bossAction.type==='fireDot'){
      G.effects.teamFire=(G.effects.teamFire||0)+1;
      renderEffectsMini();
      addFeedItem({icon:'🔥',text:boss.nom+' — Feu ennemi',val:'🔥'.repeat(G.effects.teamFire)+' actif',fc:'feu'});
      showSpecialBossOverlay(boss,'🔥','#c84020',bossAction.desc||boss.nom+' vous embrase !','🔥'.repeat(G.effects.teamFire)+' — '+G.effects.teamFire*8+' PV par manche (cumulable)');
      return;
    }
    if(bossAction.type==='cancelFire'){
      G.effects.fire={stacks:0,dur:0,dmgPerStack:3};
      renderEffectsMini();
      showSpecialBossOverlay(boss,'💨','#80c0e0','Le Souffleur éteint le feu !','Tous vos stacks de feu sont annulés');
      return;
    }
    if(bossAction.type==='atk'||bossAction.type==='atkFire'){
      const isAtkFire=bossAction.type==='atkFire';
      if(isAtkFire){
        G.effects.teamFire=(G.effects.teamFire||0)+1;
        updatePVBars();
        renderEffectsMini();
        addFeedItem({icon:'🔥',text:boss.nom+' — Feu ennemi',val:'🔥'.repeat(G.effects.teamFire)+' actif',fc:'feu'});
      }
      const rawDmg=bossAction.val;
      if(G.activeBouclierItem){
        G.activeBouclierItem=false;
        const bi=G.inventory.indexOf('bouclier');if(bi!==-1)G.inventory.splice(bi,1);
        updateItemBtn();
        showBossAttackOverlay(boss,bossAction,rawDmg,0,[{icon:'🛡️',label:'Bouclier d\'urgence — attaque annulee !',before:rawDmg,after:0,color:'#9b7fe8'}],isAtkFire?'🔥'.repeat(G.effects.teamFire)+' — '+G.effects.teamFire*8+' PV/manche':null);
        return;
      }
      const mods=[];
      let dmg=rawDmg;
      const dodgeRatio=G.effects.dodge;
      if(dodgeRatio>0){
        const before=dmg;
        dmg=Math.round(dmg*(1-dodgeRatio));
        G.effects.dodge=0;
        mods.push({icon:'🌀',label:dodgeRatio>=1.0?"L'equipe esquive — degats annules":"L'equipe esquive — degats reduits de "+Math.round(dodgeRatio*100)+'%',before,after:dmg,color:'#4a9ae8'});
      }
      if((G.effects.shield||0)>0 && dmg>0){
        const before=dmg;
        const absorbed=Math.min(G.effects.shield,dmg);
        G.effects.shield-=absorbed;
        dmg-=absorbed;
        mods.push({icon:'🛡️',label:absorbed>=before?"Le bouclier absorbe tous les dégâts !":"Le bouclier absorbe "+absorbed+" PV de dégâts",before,after:dmg,color:'#9b7fe8'});
      }
      showBossAttackOverlay(boss,bossAction,rawDmg,dmg,mods,isAtkFire?'🔥'.repeat(G.effects.teamFire)+' — '+G.effects.teamFire*8+' PV/manche':null);
    } else {
      if(bossAction.type==='heal'){G.bossPV=Math.min(G.bossPVMax,G.bossPV+bossAction.val);updatePVBars();}
      if(bossAction.type==='shield'){G.bossShield=bossAction.val;}
      renderEffectsMini();
      showBossNonAtkOverlay(boss,bossAction);
    }
  };

  showTeamActionsOverlay(teamCards, launchBossOverlay);
}

function showBossAttackOverlay(boss,bossAction,rawDmg,finalDmg,mods,fireNote){
  const ov=document.getElementById('boss-overlay');
  const btn=document.getElementById('boss-overlay-btn');
  ov.classList.add('active');
  btn.style.display='none';

  let phase=0;
  let modStep=0;
  let phaseTimer=null;
  const bossPVAvant=G.bossPVRoundStart??G.bossPV;
  const bossPVApres=Math.max(0,G.bossPV);
  const dmgEquipe=bossPVAvant-bossPVApres;

  function renderPhase(){
    if(phaseTimer){clearTimeout(phaseTimer);phaseTimer=null;}
    const content=document.getElementById('boss-overlay-content');
    content.innerHTML='';
    ov.classList.toggle('team-attack-phase', phase===0);

    if(phase===0){
      const noDmg=dmgEquipe<=0;
      const intro=document.createElement('div');
      intro.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;text-align:center;animation:teamAttackIn .3s ease-out;';

      const e1=document.createElement('div');e1.style.cssText='font-size:72px;margin-bottom:12px';e1.textContent='👥';
      const title=document.createElement('div');title.className='team-attack-title';title.textContent=noDmg?`L'ÉQUIPE N'ATTAQUE PAS`:`L'ÉQUIPE ATTAQUE ${getBoss(G.selectedBoss).nom} !`;
      intro.appendChild(e1);intro.appendChild(title);
      content.appendChild(intro);

      if(!noDmg){
        const armorPct=G.armorAtRoundStart*20;
        const rawTotal=G.rawDmgThisRound||dmgEquipe;
        const hasArmor=armorPct>0&&rawTotal>dmgEquipe;
        const dmgWrap=document.createElement('div');dmgWrap.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:18px;';

        if(hasArmor){
          const shield=document.createElement('div');shield.style.cssText='display:flex;align-items:center;gap:8px;background:#1a0e18;border:1px solid #5a2a7a;border-radius:10px;padding:8px 14px;margin-bottom:16px';
          const sIcon=document.createElement('span');sIcon.textContent='🛡️';sIcon.style.fontSize='18px';
          const sTxt=document.createElement('span');sTxt.style.cssText='font-size:12px;color:#c090e0';sTxt.textContent='Bouclier boss actif — dégâts réduits de '+armorPct+'%';
          shield.appendChild(sIcon);shield.appendChild(sTxt);
          dmgWrap.appendChild(shield);

          const dmgRow=document.createElement('div');dmgRow.style.cssText='display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px';
          const dRaw=document.createElement('div');dRaw.style.cssText='font-family:var(--font-title);font-size:52px;color:#555;text-decoration:line-through';dRaw.textContent='−'+rawTotal;
          const dArr=document.createElement('div');dArr.style.cssText='font-size:22px;color:var(--dim)';dArr.textContent='→';
          const dReal=document.createElement('div');dReal.style.cssText='font-family:var(--font-title);font-size:72px;color:var(--danger);line-height:1';dReal.textContent='−'+dmgEquipe;
          dmgRow.appendChild(dRaw);dmgRow.appendChild(dArr);dmgRow.appendChild(dReal);
          dmgWrap.appendChild(dmgRow);
        } else {
          const counter=document.createElement('div');
          counter.className='team-attack-dmg';
          counter.style.color='var(--danger)';
          counter.textContent='−'+dmgEquipe;
          dmgWrap.appendChild(counter);
        }

        const bossBar=document.createElement('div');bossBar.style.cssText='display:flex;align-items:center;justify-content:center;gap:18px;margin-top:18px;margin-bottom:14px';
        const before=document.createElement('div');before.style.cssText='font-family:var(--font-title);font-size:42px;color:#666';before.textContent=bossPVAvant;
        const arrow=document.createElement('div');arrow.style.cssText='font-size:26px;color:var(--text)';arrow.textContent='→';
        const after=document.createElement('div');after.style.cssText='font-family:var(--font-title);font-size:52px;color:var(--danger);font-weight:700;animation:teamDamagePulse 0.8s ease-in-out';after.textContent=bossPVApres;
        bossBar.appendChild(before);bossBar.appendChild(arrow);bossBar.appendChild(after);
        const label=document.createElement('div');label.style.cssText='font-size:14px;color:#e08080;margin-bottom:12px';label.textContent=`Le boss descend en points de vie !`;
        dmgWrap.appendChild(label);dmgWrap.appendChild(bossBar);
        content.appendChild(dmgWrap);
        phaseTimer=setTimeout(()=>{phase=1;renderPhase();},2300);
        return;
      }

      const zero=document.createElement('div');zero.className='team-attack-zero';zero.textContent='Aucun dégât !';
      content.appendChild(zero);
      phaseTimer=setTimeout(()=>{phase=1;renderPhase();},2300);
      return;

    } else if(phase===1){
      const e1=document.createElement('div');e1.style.cssText='font-size:72px;margin-bottom:10px';e1.textContent=fireNote?'🔥⚔️':'💀';
      const e2=document.createElement('div');e2.style.cssText='font-family:var(--font-title);font-size:30px;color:var(--danger);letter-spacing:.08em;margin-bottom:8px';e2.textContent=boss.nom.toUpperCase();
      const e3=document.createElement('div');e3.style.cssText='font-size:16px;color:#e08080;margin-bottom:20px';e3.textContent=bossAction.desc;
      const e4=document.createElement('div');e4.style.cssText='font-family:var(--font-title);font-size:88px;color:var(--danger);line-height:1;margin-bottom:6px';e4.textContent=rawDmg;
      const e5=document.createElement('div');e5.style.cssText='font-size:14px;color:#e08080;margin-bottom:'+(fireNote?'12px':'32px');e5.textContent='PV bruts';
      [e1,e2,e3,e4,e5].forEach(el=>content.appendChild(el));
      if(fireNote){
        const ef=document.createElement('div');ef.style.cssText='font-size:14px;color:#e85020;margin-bottom:24px;padding:6px 12px;background:#1a0808;border-radius:8px;border:1px solid #4a1010';ef.textContent='🔥 '+fireNote;
        content.appendChild(ef);
      }
      btn.style.display='block';
      btn.className='boss-overlay-btn';
      btn.textContent=mods.length>0?"L'equipe reagit →":'Encaisser →';
      btn.onclick=()=>{phase=mods.length>0?2:3;modStep=0;renderPhase();};

    } else if(phase===2){
      const mod=mods[modStep];
      const e1=document.createElement('div');e1.style.cssText='font-size:64px;margin-bottom:12px';e1.textContent=mod.icon;
      const e2=document.createElement('div');e2.style.cssText='font-size:18px;font-weight:600;color:#fff;margin-bottom:20px;text-align:center;line-height:1.3';e2.textContent=mod.label;
      // Before → After
      const cmp=document.createElement('div');cmp.style.cssText='display:flex;align-items:center;gap:20px;margin-bottom:24px';
      const bl=document.createElement('div');bl.style.cssText='text-align:center';
      const bn=document.createElement('div');bn.style.cssText='font-family:var(--font-title);font-size:52px;color:#555;text-decoration:line-through';bn.textContent=mod.before;
      const blab=document.createElement('div');blab.style.cssText='font-size:11px;color:var(--dim);margin-top:2px';blab.textContent='Avant';
      bl.appendChild(bn);bl.appendChild(blab);
      const arr=document.createElement('div');arr.style.cssText='font-size:30px;color:var(--dim)';arr.textContent='→';
      const al=document.createElement('div');al.style.cssText='text-align:center';
      const an=document.createElement('div');an.style.cssText='font-family:var(--font-title);font-size:60px;color:'+mod.color;an.textContent=mod.after;
      const alab=document.createElement('div');alab.style.cssText='font-size:11px;color:var(--dim);margin-top:2px';alab.textContent='PV';
      al.appendChild(an);al.appendChild(alab);
      cmp.appendChild(bl);cmp.appendChild(arr);cmp.appendChild(al);
      content.appendChild(e1);content.appendChild(e2);content.appendChild(cmp);
      // Progress dots if multiple mods
      if(mods.length>1){
        const dots=document.createElement('div');dots.style.cssText='display:flex;gap:7px;justify-content:center;margin-bottom:10px';
        mods.forEach((_,i)=>{const d=document.createElement('div');d.style.cssText='width:8px;height:8px;border-radius:50%;background:'+(i===modStep?'var(--danger)':i<modStep?'#555':'var(--border)');dots.appendChild(d);});
        content.appendChild(dots);
      }
      btn.style.display='block';
      btn.className='boss-overlay-btn';
      const isLast=modStep===mods.length-1;
      if(isLast){btn.textContent=finalDmg===0?'Aucun degat ✨':'Encaisser →';btn.onclick=()=>{phase=3;renderPhase();};}
      else{btn.textContent='Suivant →';btn.onclick=()=>{modStep++;renderPhase();};}

    } else {
      // Apply damage only now
      G.teamPV=Math.max(0,G.teamPV-finalDmg);
      G.stats.totalDmgTaken+=finalDmg;
      if(G.teamPV<=0&&G.activeResurr){
        G.teamPV=10;G.activeResurr=false;
        const ri=G.inventory.indexOf('resurr');if(ri!==-1)G.inventory.splice(ri,1);
        updateItemBtn();
        addFeedItem({icon:'❤️',text:'Resurrection !',val:'Equipe survit a 10 PV',fc:'heal'});
      }
      updatePVBars();
      const defeat=G.teamPV<=0;
      const victory=G.bossPV<=0;
      const impactColor=finalDmg===0?'var(--gold)':defeat?'var(--danger)':'#e06060';
      const impactIcon=finalDmg===0?'✨':defeat?'💔':'❤️';
      const teamColor=defeat?'var(--danger)':G.teamPV<20?'#e08050':'var(--green)';
      const e1=document.createElement('div');e1.style.cssText='font-size:56px;margin-bottom:14px';e1.textContent=impactIcon;
      const e2=document.createElement('div');e2.style.cssText='font-size:16px;color:#ccc;margin-bottom:6px';e2.textContent=finalDmg===0?'Aucun degat subi !':'L equipe encaisse';
      const e3=document.createElement('div');e3.style.cssText='font-family:var(--font-title);font-size:88px;color:'+impactColor+';line-height:1;margin-bottom:8px';e3.textContent=finalDmg===0?'0':'−'+finalDmg;
      const e4=document.createElement('div');e4.style.cssText='font-size:14px;color:#888;margin-bottom:24px';e4.textContent='PV perdus';
      // Team PV box
      const box=document.createElement('div');box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 20px;margin-bottom:28px;text-align:center';
      const bl=document.createElement('div');bl.style.cssText='font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px';bl.textContent='❤️ PV Equipe';
      const bv=document.createElement('div');bv.style.cssText='font-family:var(--font-title);font-size:36px;color:'+teamColor;bv.textContent=G.teamPV+' / '+G.teamPVMax;
      box.appendChild(bl);box.appendChild(bv);
      [e1,e2,e3,e4,box].forEach(el=>content.appendChild(el));
      btn.style.display='block';
      if(defeat){btn.className='boss-overlay-btn';btn.textContent='Voir la defaite';btn.onclick=()=>{ov.classList.remove('active');showEnd(false);};}
      else if(victory){btn.className='boss-overlay-btn ok';btn.textContent='Boss vaincu ! 🎉';btn.onclick=()=>{ov.classList.remove('active');showEnd(true);};}
      else{btn.className='boss-overlay-btn ok';btn.textContent='Tour '+(G.manche+1)+' →';btn.onclick=()=>{ov.classList.remove('active');endRound(finalDmg);};}
    }
  }

  renderPhase();
}

function showBossNonAtkOverlay(boss,bossAction){
  const ov=document.getElementById('boss-overlay');
  const btn=document.getElementById('boss-overlay-btn');
  ov.classList.add('active');
  const content=document.getElementById('boss-overlay-content');
  content.innerHTML='';
  const isHeal=bossAction.type==='heal';
  const color=isHeal?'var(--green)':'#9b7fe8';
  const actIcon=isHeal?'💚':'🛡️';
  const e1=document.createElement('div');e1.style.cssText='font-size:72px;margin-bottom:10px';e1.textContent='💀';
  const e2=document.createElement('div');e2.style.cssText='font-family:var(--font-title);font-size:30px;color:var(--danger);letter-spacing:.08em;margin-bottom:20px';e2.textContent=boss.nom.toUpperCase();
  const e3=document.createElement('div');e3.style.cssText='font-size:48px;margin-bottom:12px';e3.textContent=actIcon;
  const e4=document.createElement('div');e4.style.cssText='font-size:18px;font-weight:600;color:'+color+';margin-bottom:12px;text-align:center';e4.textContent=bossAction.desc;
  const e5=document.createElement('div');e5.style.cssText='font-family:var(--font-title);font-size:72px;color:'+color+';line-height:1;margin-bottom:6px';e5.textContent=(isHeal?'+':'')+bossAction.val;
  const e6=document.createElement('div');e6.style.cssText='font-size:14px;color:#888;margin-bottom:32px';e6.textContent=isHeal?'PV recuperes':'PV de bouclier';
  [e1,e2,e3,e4,e5,e6].forEach(el=>content.appendChild(el));
  btn.style.display='block';
  btn.className='boss-overlay-btn ok';
  btn.textContent='Tour '+(G.manche+1)+' →';
  btn.onclick=()=>{ov.classList.remove('active');endRound(0);};
}

function showSpecialBossOverlay(boss,icon,color,title,subtitle){
  const ov=document.getElementById('boss-overlay');
  const btn=document.getElementById('boss-overlay-btn');
  ov.classList.add('active');
  const content=document.getElementById('boss-overlay-content');
  content.innerHTML='';
  const e1=document.createElement('div');e1.style.cssText='font-size:72px;margin-bottom:10px';e1.textContent='💀';
  const e2=document.createElement('div');e2.style.cssText='font-family:var(--font-title);font-size:30px;color:var(--danger);letter-spacing:.08em;margin-bottom:20px';e2.textContent=boss.nom.toUpperCase();
  const e3=document.createElement('div');e3.style.cssText='font-size:64px;margin-bottom:14px';e3.textContent=icon;
  const e4=document.createElement('div');e4.style.cssText='font-size:20px;font-weight:700;color:'+color+';margin-bottom:12px;text-align:center';e4.textContent=title;
  const e5=document.createElement('div');e5.style.cssText='font-size:14px;color:var(--muted);margin-bottom:32px;text-align:center';e5.textContent=subtitle;
  [e1,e2,e3,e4,e5].forEach(el=>content.appendChild(el));
  btn.style.display='block';
  btn.className='boss-overlay-btn ok';
  btn.textContent='Tour suivant →';
  btn.onclick=()=>{ov.classList.remove('active');endRound(0);};
}

// Rotation des joueurs (independante du rythme d'attaque du boss)
// Le boss vient d'agir : nouvelle manche, tous les joueurs repartent a zero ensemble
function endRound(bossDmg){
  renderEffectsMini();
  G.manche++;
  G.bossPVRoundStart = G.bossPV;
  G.teamPVAtRoundStart = G.teamPV;
  G.armorAtRoundStart = G.effects.armor || 0;
  G.shieldAtRoundStart = G.effects.shield || 0;
  G.rawDmgThisRound = 0;

  G.scores = G.players.map(()=>null);
  G.currentPlayer = 0;
  G.playerEditor = null;
  DI = {mod:1,darts:[]};
  G.goldenDartsRemaining = 0;
  G.inputLocked = false;
  setGridLocked(false);
  lastDartTime = 0;

  const btn=document.getElementById('confirm-btn');
  if(btn){btn.disabled=true;btn.style.opacity='.5';}
  renderStrip();
  updatePVBars();
  renderEffectsMini();
}

// ============================================================
// END
// ============================================================
function showEnd(victory){
  G.inputLocked=false;setGridLocked(false);
  const boss=getBoss(G.selectedBoss);
  document.getElementById('end-title').textContent=victory?'VICTOIRE !':'DÉFAITE';
  document.getElementById('end-title').style.color=victory?'var(--gold)':'var(--danger)';
  document.getElementById('end-lbl').textContent=boss.nom;
  document.getElementById('end-sub').textContent=victory?boss.nom+' est vaincu !':'Vaincus au tour '+G.manche+'...';
  const dmg=G.bossPVMax-G.bossPV;
  G.finalScore=victory?G.teamPV:dmg;
  document.getElementById('end-score-num').textContent=G.finalScore;
  document.getElementById('end-score-lbl').textContent=victory?'PV restants':'Dégâts infligés';
  const elapsed=Math.floor((Date.now()-G.stats.startTime)/1000);
  const mins=Math.floor(elapsed/60);
  const secs=(elapsed%60).toString().padStart(2,'0');
  const duration=mins+':'+secs;
  document.getElementById('end-stats').innerHTML=
    '<div class="end-stat"><div class="end-stat-lbl">Durée</div><div class="end-stat-val gold">'+duration+'</div></div>'+
    '<div class="end-stat"><div class="end-stat-lbl">Plus gros coup</div><div class="end-stat-val gold">'+G.stats.biggestHit+' PV</div></div>'+
    '<div class="end-stat"><div class="end-stat-lbl">Dégâts infligés</div><div class="end-stat-val">'+G.stats.totalDmg+' PV</div></div>'+
    '<div class="end-stat"><div class="end-stat-lbl">Dégâts subis</div><div class="end-stat-val '+(G.teamPV<=0?'danger':'')+'">'+G.stats.totalDmgTaken+' PV</div></div>'+
    '<div class="end-stat"><div class="end-stat-lbl">Soins reçus</div><div class="end-stat-val heal" style="color:var(--green)">'+G.stats.heals+' PV</div></div>';
  nav('end');
}

// ============================================================
// MINI REF
// ============================================================
function colorDesc(d){
  return d
    .replace(/(−[\d]+ PV au boss)/g,'<span style="color:#e05050">$1</span>')
    .replace(/(\+[\d]+ PV équipe)/g,'<span style="color:#4a9a4a">$1</span>')
    .replace(/(Annule[^,<]+dégâts[^,<]*)/gi,'<span style="color:#4a9ae8">$1</span>')
    .replace(/(Absorbe TOUS[^,<]*)/gi,'<span style="color:#9b7fe8">$1</span>')
    .replace(/(Absorbe[\s\d]+PV[^,<]*)/gi,'<span style="color:#9b7fe8">$1</span>')
    .replace(/(−[\d]+ PV\/manche)/g,'<span style="color:#4a9a4a">$1</span>')
    .replace(/(Dégâts[^,<]+×[\d.]+[^,<]*)/gi,'<span style="color:#e8a030">$1</span>')
    .replace(/(boss ne peut pas[^,<]*)/gi,'<span style="color:#9b7fe8">$1</span>')
    .replace(/(Dégâts boss[^,<]*)/gi,'<span style="color:#4a9ae8">$1</span>');
}

function getCurrentSector(key){
  const boss=getBoss(G.selectedBoss);
  if(!boss||!boss.sectors)return null;
  const s=boss.sectors;
  const map={atk_faible:s.atk_faible,atk_moyenne:s.atk_moyenne,atk_forte:s.atk_forte,
    soin:s.soin,bouclier:s.bouclier,esquive:s.esquive,feu:s.feu};
  return map[key]||null;
}

function showMiniRef(key){
  const pop=document.getElementById('mini-ref-popup');
  if(key==='eau'){
    if(pop.style.display==='block'&&pop.dataset.key===key){pop.style.display='none';return;}
    const s=getBoss(G.selectedBoss).sectors;
    const h=document.createElement('div');
    const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:6px';
    const ic=document.createElement('span');ic.style.cssText='font-size:18px';ic.textContent='💧';
    const nm=document.createElement('span');nm.style.cssText='font-weight:600;color:var(--text)';nm.innerHTML='Eau — <span style="color:#4a9ae8">secteur '+s.eau+'</span>';
    const cl=document.createElement('span');cl.style.cssText='font-size:10px;color:var(--dim);margin-left:auto';cl.textContent='✕ fermer';
    r.appendChild(ic);r.appendChild(nm);r.appendChild(cl);h.appendChild(r);
    const e1=document.createElement('div');e1.className='ref-effect';e1.innerHTML='<span class="ref-tag s">Simple</span><span style="color:#4a9ae8">Éteint le feu ennemi — aucun dégât</span>';
    const e2=document.createElement('div');e2.className='ref-effect';e2.innerHTML='<span class="ref-tag d">Double</span><span style="color:#4a9ae8">Éteint le feu + <span style="color:var(--green)">+5 PV équipe</span></span>';
    const e3=document.createElement('div');e3.className='ref-effect';e3.innerHTML='<span class="ref-tag t">Triple</span><span style="color:#4a9ae8">Éteint le feu + <span style="color:var(--danger)">−20 PV boss</span></span>';
    const e4=document.createElement('div');e4.style.cssText='font-size:11px;color:var(--dim);margin-top:4px';e4.textContent='Si pas de feu actif : aucun effet';
    h.appendChild(e1);h.appendChild(e2);h.appendChild(e3);h.appendChild(e4);
    pop.innerHTML='';pop.appendChild(h);
    pop.style.display='block';pop.dataset.key=key;
    return;
  }
  if(key==='bull_miroir'||key==='bull_dore'){
    if(pop.style.display==='block'&&pop.dataset.key===key){pop.style.display='none';return;}
    if(key==='bull_miroir'){
      const h=document.createElement('div');
      const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:6px';
      const ic=document.createElement('span');ic.style.cssText='font-size:18px';ic.textContent='🫧';
      const nm=document.createElement('span');nm.style.cssText='font-weight:600;color:var(--text)';nm.innerHTML='Single Bull — <span style="color:#40c0e0">25 pts</span>';
      const cl=document.createElement('span');cl.style.cssText='font-size:10px;color:var(--dim);margin-left:auto';cl.textContent='✕ fermer';
      r.appendChild(ic);r.appendChild(nm);r.appendChild(cl);h.appendChild(r);
      const e1=document.createElement('div');e1.className='ref-effect';e1.innerHTML='<span class="ref-tag" style="background:#0a1a1e;color:#40c0e0;border-color:#1a4050">🔥 Feu actif</span><span style="color:#40c0e0">Stacks x2 + 6 PV/stack ce tour</span>';
      const e2=document.createElement('div');e2.className='ref-effect';e2.innerHTML='<span class="ref-tag" style="background:#0a1a1e;color:#40c0e0;border-color:#1a4050">Pas de feu</span><span style="color:#e06060">-20 PV directs au boss</span>';
      const e3=document.createElement('div');e3.style.cssText='font-size:11px;color:var(--dim);margin-top:4px';e3.textContent='Pas de multiplicateur Simple/Double/Triple';
      h.appendChild(e1);h.appendChild(e2);h.appendChild(e3);
      pop.innerHTML='';pop.appendChild(h);
    } else {
      const h=document.createElement('div');
      const r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:6px';
      const ic=document.createElement('span');ic.style.cssText='font-size:18px';ic.textContent='🎯';
      const nm=document.createElement('span');nm.style.cssText='font-weight:600;color:var(--text)';nm.innerHTML='Bullseye / DBull — <span style="color:#ffd700">50 pts</span>';
      const cl=document.createElement('span');cl.style.cssText='font-size:10px;color:var(--dim);margin-left:auto';cl.textContent='✕ fermer';
      r.appendChild(ic);r.appendChild(nm);r.appendChild(cl);h.appendChild(r);
      const e1=document.createElement('div');e1.className='ref-effect';e1.innerHTML='<span style="color:#ffd700">+3 flechettes supplementaires — effets x1.3</span>';
      const e2=document.createElement('div');e2.style.cssText='font-size:11px;color:var(--dim);margin-top:4px';e2.textContent='Pas de multiplicateur Simple/Double/Triple';
      h.appendChild(e1);h.appendChild(e2);
      pop.innerHTML='';pop.appendChild(h);
    }
    pop.style.display='block';pop.dataset.key=key;
    return;
  }
  const a=ACTIONS[key];if(!a)return;
  if(pop.style.display==='block'&&pop.dataset.key===key){pop.style.display='none';return;}
  pop.innerHTML=
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+
      '<span style="font-size:18px">'+a.icon+'</span>'+
      '<span style="font-weight:600;color:var(--text)">'+a.name+' — secteur <span style="color:var(--gold)">'+( getCurrentSector(key)||a.sector)+'</span></span>'+
      '<span style="font-size:10px;color:var(--dim);margin-left:auto">✕ fermer</span>'+
    '</div>'+
    (key==='neutre_combo'?
      (()=>{const rs=getBoss(G.selectedBoss).sectors.rage||[];return rs.length>=2?'<div style="font-size:12px;color:var(--muted)">Toucher <strong style="color:#e8a030">'+rs[0]+' + '+rs[1]+'</strong> dans la même manche (peu importe l\'ordre ou Simple/Double/Triple) multiplie tous les dégâts d\'attaque de la manche par <strong style="color:#e8a030">×2</strong>.</div>':'<div style="font-size:12px;color:var(--muted)">Combo rage non disponible pour ce boss.</div>';})()
    :
      '<div class="ref-effect"><span class="ref-tag s">Simple</span>'+colorDesc(a.simple.desc)+'</div>'+
      '<div class="ref-effect"><span class="ref-tag d">Double</span>'+colorDesc(a.double.desc)+'</div>'+
      '<div class="ref-effect"><span class="ref-tag t">Triple</span>'+colorDesc(a.triple.desc)+'</div>'
    );
  pop.style.display='block';
  pop.dataset.key=key;
}
function hideMiniRef(){document.getElementById('mini-ref-popup').style.display='none';}

function renderRef(){
  const el=document.getElementById('ref-content');if(!el)return;
  const boss=getBoss(G.selectedBoss);
  const s=boss.sectors;
  const r=s.rage||[];
  const sectorOf={atk_faible:s.atk_faible,atk_moyenne:s.atk_moyenne,atk_forte:s.atk_forte,
    soin:s.soin,bouclier:s.bouclier,esquive:s.esquive,feu:s.feu};
  const title=document.getElementById('ref-title');
  if(title)title.textContent=boss.nom;
  const main=['atk_faible','atk_moyenne','atk_forte','soin','bouclier','feu','esquive'];
  el.innerHTML='<div style="padding:0 20px 16px">'+
    main.map(key=>{
      const a=ACTIONS[key];
      const sec=sectorOf[key];
      return '<div class="ref-item">'+
        '<div class="ref-item-header"><span class="ref-icon">'+a.icon+'</span><span class="ref-name">'+a.name+'</span><span class="ref-sector">Secteur '+sec+'</span></div>'+
        '<div class="ref-effect"><span class="ref-tag s">Simple</span>'+colorDesc(a.simple.desc)+'</div>'+
        '<div class="ref-effect"><span class="ref-tag d">Double</span>'+colorDesc(a.double.desc)+'</div>'+
        '<div class="ref-effect"><span class="ref-tag t">Triple</span><span style="color:var(--purple)">'+colorDesc(a.triple.desc)+'</span></div>'+
      '</div>';
    }).join('')+
    (r.length>=2?
      '<div class="ref-item" style="border-color:#5a3010;background:#1e0e04">'+
        '<div class="ref-item-header"><span class="ref-icon">🤬</span><span class="ref-name">Rage — Combo</span><span class="ref-sector">Secteurs '+r[0]+' + '+r[1]+'</span></div>'+
        '<div class="ref-effect" style="color:#e8a030">Toucher le <strong>'+r[0]+'</strong> ET le <strong>'+r[1]+'</strong> dans la même manche (même joueur ou non, peu importe l\'ordre ou Simple/Double/Triple) multiplie tous les dégâts d\'attaque de la manche par <strong>×2</strong>.</div>'+
      '</div>'
    : '')+
    '<div class="ref-item"><div class="ref-item-header"><span class="ref-icon">⚫</span><span class="ref-name">Zones neutres</span><span class="ref-sector">Autres secteurs</span></div>'+
    '<div class="ref-effect"><span class="ref-tag s">Simple</span><span style="color:#e05050">−3 PV boss</span></div>'+
    '<div class="ref-effect"><span class="ref-tag d">Double</span><span style="color:#e05050">−6 PV boss</span> + <span style="color:#4a9a4a">+3 PV équipe</span></div>'+
    '<div class="ref-effect"><span class="ref-tag t">Triple</span><span style="color:#e05050">−9 PV boss</span></div>'+
    '</div>'+
    '<div style="font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.08em;padding:16px 0 8px;border-top:1px solid var(--border);margin-top:4px">Zones speciales</div>'+
    '<div class="ref-item" style="border-color:#6a2800;background:#1e0a00">'+
      '<div class="ref-item-header"><span class="ref-icon">🔥</span><span class="ref-name">Feu</span><span class="ref-sector">Secteur '+s.feu+'</span></div>'+
      '<div class="ref-effect"><span class="ref-tag s">Simple</span><span style="color:#ff7030">+1 stack — 3 PV/manche x2</span></div>'+
      '<div class="ref-effect"><span class="ref-tag d">Double</span><span style="color:#ff7030">+2 stacks — 6 PV/manche x2</span></div>'+
      '<div class="ref-effect"><span class="ref-tag t">Triple</span><span style="color:#ff7030">+3 stacks — 9 PV/manche x2</span></div>'+
      '<div style="font-size:11px;color:#ff7030;margin-top:4px">Stacks cumulables — resets apres 2 manches</div>'+
    '</div>'+
    '<div class="ref-item" style="border-color:#1a4050;background:#041418">'+
      '<div class="ref-item-header"><span class="ref-icon">🫧</span><span class="ref-name">Single Bull</span><span class="ref-sector">25 pts (fixe)</span></div>'+
      '<div class="ref-effect"><span class="ref-tag" style="background:#0a1a1e;color:#40c0e0;border-color:#1a4050">🔥 Feu actif</span><span style="color:#40c0e0">Stacks x2 + 6 PV/stack ce tour</span></div>'+
      '<div class="ref-effect"><span class="ref-tag" style="background:#0a1a1e;color:#40c0e0;border-color:#1a4050">Pas de feu</span><span style="color:#e06060">-20 PV directs au boss</span></div>'+
      '<div style="font-size:11px;color:var(--dim);margin-top:4px">Pas de multiplicateur Simple/Double/Triple</div>'+
    '</div>'+
    (s.eau?
      '<div class="ref-item" style="border-color:#1a2a3a;background:#080e1a">'+
        '<div class="ref-item-header"><span class="ref-icon">💧</span><span class="ref-name">Eau</span><span class="ref-sector">Secteur '+s.eau+'</span></div>'+
        '<div class="ref-effect"><span class="ref-tag s">Simple</span><span style="color:#4a9ae8">Éteint le feu ennemi — aucun dégât</span></div>'+
        '<div class="ref-effect"><span class="ref-tag d">Double</span><span style="color:#4a9ae8">Éteint le feu + <span style="color:var(--green)">+5 PV équipe</span></span></div>'+
        '<div class="ref-effect"><span class="ref-tag t">Triple</span><span style="color:#4a9ae8">Éteint le feu + <span style="color:var(--danger)">−20 PV boss</span></span></div>'+
        '<div style="font-size:11px;color:var(--dim);margin-top:4px">Si pas de feu actif : aucun effet</div>'+
      '</div>'
    : '')+
    '<div class="ref-item" style="border-color:#8a6000;background:#1a1400">'+
      '<div class="ref-item-header"><span class="ref-icon">🎯</span><span class="ref-name">Bullseye / DBull</span><span class="ref-sector">50 pts (fixe)</span></div>'+
      '<div class="ref-effect"><span style="color:#ffd700">+3 flechettes supplementaires — effets x1.3</span></div>'+
      '<div style="font-size:11px;color:var(--dim);margin-top:4px">Pas de multiplicateur Simple/Double/Triple</div>'+
    '</div>'+
  '</div>';
}

// ============================================================
// INVENTORY
// ============================================================
function updateItemBtn(){
  const btn=document.getElementById('item-game-btn');
  if(!btn)return;
  const n=G.inventory.length;
  btn.textContent='📦 Objet ('+n+')';
  btn.className='item-game-btn'+(n>0?' has-items':'');
}

function addToInventory(key){
  if(key==='slot'){
    if(G.inventorySlots<4){G.inventorySlots++;renderInventory();}
    return true;
  }
  if(G.inventory.length>=G.inventorySlots)return false;
  G.inventory.push(key);
  renderInventory();
  updateItemBtn();
  return true;
}

function removeFromInventory(key){
  const i=G.inventory.indexOf(key);
  if(i!==-1){G.inventory.splice(i,1);renderInventory();updateItemBtn();}
}

function useItem(key){
  const it=ITEMS[key];if(!it)return;
  removeFromInventory(key);
  closeItemPicker();
  if(key==='potion'){
    G.teamPV=Math.min(G.teamPVMax,G.teamPV+30);
    updatePVBars();
    addFeedItem({icon:'🧪',text:'Potion de soin utilisee',val:'+30 PV equipe',fc:'heal'});
  }
  if(key==='boost'){G.activeBoostNext=true;addFeedItem({icon:'⚡',text:'Boost charge !',val:'Prochaine attaque x2',fc:'special'});}
  if(key==='bouclier'){G.activeBouclierItem=true;addFeedItem({icon:'🛡️',text:'Bouclier d\'urgence charge !',val:'Prochaine attaque boss annulee',fc:'shield'});}
  if(key==='poison_i'){
    G.bossPV=Math.max(0,G.bossPV-20);
    updatePVBars();
    addFeedItem({icon:'💀',text:'Poison express !',val:'-20 PV boss',fc:'poison'});
    if(G.bossPV<=0)setTimeout(()=>showEnd(true),400);
  }
  if(key==='esquive_i'){G.effects.dodge=1.0;addFeedItem({icon:'🌀',text:'Esquive garantie !',val:'Prochaine attaque boss esquivee',fc:'dodge'});}
  if(key==='resurr'){G.activeResurr=true;addFeedItem({icon:'❤️',text:'Resurrection chargee !',val:'Survie a 10 PV si defaite',fc:'heal'});}
}

function openItemPicker(){
  if(G.screen!=='game')return;
  const picker=document.getElementById('item-picker');
  const list=document.getElementById('item-picker-list');
  if(!picker||!list)return;
  list.innerHTML='';
  if(G.inventory.length===0){
    const e=document.createElement('div');e.style.cssText='text-align:center;color:var(--dim);padding:40px 20px;font-size:14px';e.textContent='Inventaire vide';
    list.appendChild(e);
  } else {
    G.inventory.forEach(key=>{
      const it=ITEMS[key];if(!it)return;
      const row=document.createElement('div');row.className='item-row';
      const ic=document.createElement('div');ic.style.cssText='font-size:26px;flex-shrink:0';ic.textContent=it.icon;
      const info=document.createElement('div');info.style.cssText='flex:1';
      const nm=document.createElement('div');nm.style.cssText='font-size:14px;font-weight:600;color:var(--text);margin-bottom:2px';nm.textContent=it.name;
      const ds=document.createElement('div');ds.style.cssText='font-size:12px;color:var(--muted)';ds.textContent=it.desc;
      info.appendChild(nm);info.appendChild(ds);
      const ubtn=document.createElement('button');ubtn.className='item-use-btn';ubtn.textContent='Utiliser';
      ubtn.onclick=()=>useItem(key);
      row.appendChild(ic);row.appendChild(info);row.appendChild(ubtn);
      list.appendChild(row);
    });
  }
  picker.classList.add('active');
}

function closeItemPicker(){
  const p=document.getElementById('item-picker');if(p)p.classList.remove('active');
}

function renderInventory(){
  const el=document.getElementById('inv-grid');if(!el)return;
  el.innerHTML='';
  for(let i=0;i<G.inventorySlots;i++){
    const slot=document.createElement('div');
    const key=G.inventory[i];
    if(key){
      const it=ITEMS[key];
      slot.className='inv-slot filled';
      const ic=document.createElement('div');ic.className='inv-slot-icon';ic.textContent=it.icon;
      const nm=document.createElement('div');nm.className='inv-slot-name';nm.textContent=it.name;
      slot.appendChild(ic);slot.appendChild(nm);
    } else {
      slot.className='inv-slot empty';
      slot.textContent='Vide';
    }
    el.appendChild(slot);
  }
}

// ============================================================
// CHALLENGES
// ============================================================
let CD={mod:1,darts:[]};
let _challengeDone=false;

function initCD(){CD={mod:1,darts:[]};_challengeDone=false;renderCDMods();renderCDStrip();}
function setCDMod(m){CD.mod=m;renderCDMods();}
function renderCDMods(){
  [1,2,3].forEach(m=>{const el=document.getElementById('cd-mod-'+m);if(el)el.classList.toggle('active',CD.mod===m);});
}
function renderCDStrip(){
  const el=document.getElementById('cd-strip');if(!el)return;
  el.innerHTML='';
  CD.darts.forEach(d=>{
    const chip=document.createElement('div');chip.className='cd-chip ok';chip.textContent=d.label;
    el.appendChild(chip);
  });
  const ch=CHALLENGES.find(c=>c.id===G.currentChallengeId);
  const cnt=document.getElementById('cd-count');
  if(cnt&&ch)cnt.textContent=CD.darts.length+' / '+ch.maxDarts+' flechettes';
}

function challengeDartPress(v){
  const ch=CHALLENGES.find(c=>c.id===G.currentChallengeId);
  if(!ch||_challengeDone)return;
  if(v===25&&CD.mod===3){setCDMod(2);return;}
  const m=CD.mod;
  const prefix=m===1?'':m===2?'D':'T';
  const label=v===0?'0':v===25?(m===2?'DBull':'Bull'):prefix+v;
  CD.darts.push({value:v,multi:m,label});
  setCDMod(1);
  renderCDStrip();
  const result=ch.eval(CD.darts);
  if(result==='win'){_challengeDone=true;setTimeout(()=>showChallengeResult('win',ch),400);}
  else if(result==='fail'){_challengeDone=true;setTimeout(()=>showChallengeResult('fail',ch),400);}
}

function challengeRemoveLast(){
  if(CD.darts.length===0||_challengeDone)return;
  CD.darts.pop();
  setCDMod(1);
  renderCDStrip();
}

function showChallengeResult(type,ch){
  const ov=document.getElementById('gift-ov');
  const content=document.getElementById('gift-content');
  const btn=document.getElementById('gift-btn');
  if(!ov||!content||!btn)return;
  content.innerHTML='';ov.classList.add('active');
  if(type==='win'){
    const gi=document.createElement('div');gi.style.cssText='font-size:90px;cursor:pointer;user-select:none;margin-bottom:16px';gi.textContent='🎁';
    const gt=document.createElement('div');gt.style.cssText='font-size:20px;font-weight:600;color:var(--gold);margin-bottom:8px;text-align:center';gt.textContent=ch.name+' reussi !';
    const gs=document.createElement('div');gs.style.cssText='font-size:14px;color:var(--muted);text-align:center';gs.textContent='Cliquez sur le cadeau pour reveler votre recompense !';
    content.appendChild(gi);content.appendChild(gt);content.appendChild(gs);
    btn.style.display='none';
    gi.onclick=()=>{
      const it=ITEMS[ch.reward];
      const ok=addToInventory(ch.reward);
      content.innerHTML='';
      const ric=document.createElement('div');ric.style.cssText='font-size:80px;margin-bottom:16px';ric.textContent=it.icon;
      const rn=document.createElement('div');rn.style.cssText='font-family:var(--font-title);font-size:26px;color:var(--gold);letter-spacing:.06em;margin-bottom:8px;text-align:center';rn.textContent=it.name.toUpperCase();
      const rd=document.createElement('div');rd.style.cssText='font-size:14px;color:var(--muted);text-align:center;margin-bottom:12px';rd.textContent=it.desc;
      if(!ok){const full=document.createElement('div');full.style.cssText='background:#3a0a0a;border:1px solid var(--danger);border-radius:10px;padding:8px 14px;color:var(--danger);font-size:13px;margin-bottom:8px;text-align:center';full.textContent='Inventaire plein !';content.appendChild(full);}
      content.appendChild(ric);content.appendChild(rn);content.appendChild(rd);
      btn.style.display='block';btn.textContent='Continuer';btn.onclick=()=>{ov.classList.remove('active');exitChallenge();};
    };
  } else {
    const fi=document.createElement('div');fi.style.cssText='font-size:70px;margin-bottom:14px';fi.textContent='💨';
    const ft=document.createElement('div');ft.style.cssText='font-family:var(--font-title);font-size:40px;color:var(--danger);letter-spacing:.06em;margin-bottom:10px';ft.textContent='RATE !';
    const fs=document.createElement('div');fs.style.cssText='font-size:14px;color:var(--muted);text-align:center;margin-bottom:8px';fs.textContent=ch.name;
    content.appendChild(fi);content.appendChild(ft);content.appendChild(fs);
    btn.style.display='block';btn.className='boss-overlay-btn';btn.textContent='Reessayer';
    btn.onclick=()=>{ov.classList.remove('active');startChallenge(ch.id);};
  }
}

function startChallenge(id){
  const ch=CHALLENGES.find(c=>c.id===id);if(!ch)return;
  G.currentChallengeId=id;
  initCD();
  const ov=document.getElementById('ch-overlay');if(!ov)return;
  const title=document.getElementById('ch-title');if(title)title.textContent=ch.name;
  const desc=document.getElementById('ch-desc');if(desc){desc.textContent=ch.desc;}
  const cnt=document.getElementById('cd-count');if(cnt)cnt.textContent='0 / '+ch.maxDarts+' flechettes';
  ov.classList.add('active');
}

function exitChallenge(){
  G.currentChallengeId=null;_challengeDone=false;
  const ov=document.getElementById('ch-overlay');if(ov)ov.classList.remove('active');
  renderRessource();
}

function renderChallenges(){
  const el=document.getElementById('challenges-list');if(!el)return;
  el.innerHTML='';
  CHALLENGES.forEach(ch=>{
    const card=document.createElement('div');card.className='ch-card';
    const badge=document.createElement('div');badge.className='ch-card-badge';badge.textContent='🎲';
    const info=document.createElement('div');info.className='ch-card-info';
    const nm=document.createElement('div');nm.className='ch-card-name';nm.textContent=ch.name;
    const ds=document.createElement('div');ds.className='ch-card-desc';ds.textContent=ch.desc;
    const rw=document.createElement('div');rw.className='ch-card-reward';rw.textContent='Recompense : ??? mystere';
    info.appendChild(nm);info.appendChild(ds);info.appendChild(rw);
    const arr=document.createElement('div');arr.style.cssText='color:var(--dim);font-size:16px';arr.textContent='›';
    card.appendChild(badge);card.appendChild(info);card.appendChild(arr);
    card.onclick=()=>startChallenge(ch.id);
    el.appendChild(card);
  });
}

function renderRessource(){
  renderInventory();
  renderChallenges();
  const sl=document.getElementById('inv-slots-lbl');
  if(sl)sl.textContent='Inventaire ('+G.inventory.length+' / '+G.inventorySlots+' slots)';
}

window.onload=()=>{loadTheme();loadCustomBosses();loadBossOverrides();renderHome();renderRef();nav('home');};
