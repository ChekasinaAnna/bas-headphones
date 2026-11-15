'use strict';
if(location.hostname==='127.0.0.1'||location.hostname==='localhost'){
  let previewVersion='';
  setInterval(async()=>{try{const response=await fetch('/__bas_version',{cache:'no-store'});if(!response.ok)return;const version=await response.text();if(previewVersion&&previewVersion!==version)location.reload();previewVersion=version;}catch{}},1200);
}
const video = document.querySelector('#hero-video');
const scene = document.querySelector('.scene');
const toggle = document.querySelector('#motion-toggle');
const motionLabel = document.querySelector('#motion-label');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function reportMedia(status,detail){if(location.hostname==='127.0.0.1')fetch('/__bas_debug',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,detail})}).catch(()=>{});}
const atmosphere=new URLSearchParams(location.search).get('atmosphere');
document.body.dataset.atmosphere=['waves','studio','metal'].includes(atmosphere)?atmosphere:'waves';
if(document.body.dataset.atmosphere==='waves'){
  video.querySelector('source').src='материалы/Меломан — цвет и маска.mp4';
  video.querySelector('source').type='video/mp4';
  video.poster='материалы/Меломан — прозрачный постер v2.png';
  scene.querySelector('.poster').src=video.poster;
  video.load();
}
let videoReady = video.readyState >= 2;
let paused = reducedMotion.matches;
window.bassAnimationRunning=!paused;
function showMotionState() {
  document.body.classList.toggle('paused', paused);
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', paused ? 'Воспроизвести анимацию' : 'Приостановить анимацию');
  motionLabel.textContent = paused ? 'Анимация на паузе' : 'Анимация';
}
async function playScene(restart = false, requestedByUser = false) {
  if (requestedByUser) document.body.classList.add('motion-opt-in');
  if (restart) video.currentTime = 0;
  paused=false;window.bassAnimationRunning=true;
  if (videoReady) {try { await video.play(); }catch{}}
  showMotionState();
}
video.addEventListener('playing', () => {scene.classList.add('ready');reportMedia('hero-playing',`time=${video.currentTime.toFixed(2)}`);});
video.addEventListener('canplay', () => {videoReady=true;if(!paused)playScene();});
video.addEventListener('error', () => {videoReady=false;scene.classList.remove('ready');reportMedia('hero-media-error',`code=${video.error?.code||0}`);});
video.querySelector('source').addEventListener('error',()=>reportMedia('hero-source-error',`code=${video.error?.code||0}; network=${video.networkState}; ready=${video.readyState}`));
if(location.hostname==='127.0.0.1')setTimeout(()=>reportMedia('hero-state',`ready=${video.readyState}; network=${video.networkState}; time=${video.currentTime.toFixed(2)}; paused=${video.paused}; muted=${video.muted}; error=${video.error?.code||0}`),3500);
toggle.addEventListener('click', () => { if (paused) playScene(false, true); else {video.pause();paused=true;window.bassAnimationRunning=false;showMotionState();} });
document.querySelector('#replay').addEventListener('click', () => playScene(true, true));
reducedMotion.addEventListener('change', e => { if(e.matches) {document.body.classList.remove('motion-opt-in');video.pause();paused=true;window.bassAnimationRunning=false;showMotionState();} });
showMotionState();
if (!reducedMotion.matches) playScene();
else video.pause();

const music=document.querySelector('#bass-music');
const soundToggle=document.querySelector('#sound-toggle');
const soundLabel=document.querySelector('#sound-label');
music.volume=.16;
let soundRequest=0;
soundToggle.addEventListener('click',async()=>{
  const request=++soundRequest;
  if(!music.paused){music.pause();return;}
  soundLabel.textContent='Включаю…';
  try{
    const alignMusic=()=>{music.currentTime=(window.bassVisualTime??video.currentTime)%8;};
    if(music.readyState>=1)alignMusic();else music.addEventListener('loadedmetadata',alignMusic,{once:true});
    await music.play();if(request!==soundRequest)music.pause();
  }
  catch{soundLabel.textContent='Повторить включение';}
});
function soundState(){const playing=!music.paused;soundToggle.setAttribute('aria-pressed',String(playing));soundLabel.textContent=playing?'Выключить звук':'Включить звук';}
music.addEventListener('play',()=>{soundState();reportMedia('music-playing',`volume=${music.volume}`);});music.addEventListener('pause',soundState);
music.addEventListener('error',()=>{soundLabel.textContent='Музыка недоступна';soundToggle.disabled=true;reportMedia('music-media-error',`code=${music.error?.code||0}`);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)music.pause();});

// Контуры звуковой волны расходятся по полу в момент приземления.
// Видеоряд и персонаж не деформируются и не вырезаются по цвету.
const waveCanvas=document.querySelector('#bass-waves'),ctx=waveCanvas.getContext('2d');
function sizeWaves(){const dpr=Math.min(devicePixelRatio||1,1.5);waveCanvas.width=Math.round(innerWidth*dpr);waveCanvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
addEventListener('resize',sizeWaves);sizeWaves();
function drawWaves(){requestAnimationFrame(drawWaves);const w=innerWidth,h=innerHeight;ctx.clearRect(0,0,w,h);
  if(document.body.dataset.atmosphere!=='waves'||reducedMotion.matches)return;
  const scale=Math.min(w/1280,h/720),ox=(w-1280*scale)/2,oy=(h-720*scale)/2;
  const x=ox+1280*.735*scale,y=oy+720*.82*scale,t=video.currentTime||0;
  const impact=Math.max(0,t-4.9);
  ctx.lineWidth=1.2;
  for(let i=0;i<5;i++){
    const r=(100+i*88+Math.min(impact,2)*64)*scale;
    const alpha=(.14-i*.017)*(impact>2?Math.max(0,1-(impact-2)/1.1):1);
    ctx.strokeStyle=`rgba(184,210,255,${alpha})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.17,0,0,Math.PI);ctx.stroke();
  }
}drawWaves();

const picker = document.querySelector('#picker');
const recommendations = {
  city: ['Город остаётся за кадром', 'Присмотрись к беспроводным моделям с шумоподавлением и режимом прозрачности. Проверь удобство посадки, управление и время работы без зарядки.'],
  home: ['Место для любимого альбома', 'Для долгого прослушивания важны удобные полноразмерные чашки и мягкие амбушюры. Открытые модели пропускают окружающие звуки; закрытые лучше изолируют.'],
  games: ['Каждая деталь — в игре', 'Обрати внимание на точность позиционирования, удобный микрофон и низкую задержку. Для продолжительных сессий особенно важны вес и посадка.']
};
function choose(key) {
  const value = recommendations[key] || recommendations.city;
  document.querySelector('#recommendation-title').textContent = value[0];
  document.querySelector('#recommendation-text').textContent = value[1];
  picker.querySelectorAll('[data-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.choice === key)));
}
document.querySelectorAll('[data-open-picker]').forEach(b => b.addEventListener('click', () => {choose('city');picker.showModal();}));
document.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => {choose(b.dataset.choice);if(!picker.open)picker.showModal();}));
picker.addEventListener('click', e => { if(e.target === picker) {const r=picker.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)picker.close();} });
