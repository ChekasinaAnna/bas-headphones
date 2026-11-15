import * as THREE from './материалы/three.module.js';
import { createSceneClock } from './время-сцены.js';
const canvas=document.querySelector('#acoustic-depth'),body=document.body,video=document.querySelector('#hero-video');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'high-performance'});}catch(error){console.info('Объёмная комната недоступна',error);}
if(renderer){
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0x08204c,1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x08204c,.035);
  const camera=new THREE.PerspectiveCamera(42,1,.1,100);
  const clock=createSceneClock();
  let randomSeed=481516;const random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
  function feltTexture(){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),image=ctx.createImageData(256,256);for(let i=0;i<image.data.length;i+=4){let value=140+Math.round(random()*75);image.data[i]=image.data[i+1]=image.data[i+2]=value;image.data[i+3]=255;}ctx.putImageData(image,0,0);const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12,2);return texture;}
  const texture=feltTexture();
  texture.repeat.set(2,2);texture.colorSpace=THREE.SRGBColorSpace;
  const fabric=new THREE.MeshStandardMaterial({color:0x164091,roughness:.98,metalness:.015,map:texture,bumpMap:texture,bumpScale:.06});
  const darkFabric=fabric.clone();darkFabric.color.setHex(0x102e69);
  const floorMaterial=fabric.clone();floorMaterial.color.setHex(0x102d66);floorMaterial.map=texture.clone();floorMaterial.map.repeat.set(50,50);floorMaterial.bumpMap=floorMaterial.map;
  const silver=new THREE.MeshStandardMaterial({color:0x7c9cc8,roughness:.34,metalness:.7});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),floorMaterial);floor.rotation.x=-Math.PI/2;floor.position.y=-2.3;floor.receiveShadow=true;scene.add(floor);
  const platform=new THREE.Group();platform.position.set(3.05,-2.08,0);scene.add(platform);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(3.12,3.18,.36,128,1),fabric);base.receiveShadow=true;base.castShadow=true;platform.add(base);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(3.13,.022,8,128),silver);lip.rotation.x=Math.PI/2;lip.position.y=-.02;platform.add(lip);
  const groovePoints=[];for(let i=0;i<72;i++){const a=i*Math.PI*2/72;for(const r of [1.15,3.04])groovePoints.push(r*Math.cos(a),.183,r*Math.sin(a));}
  const grooves=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(groovePoints,3)),new THREE.LineBasicMaterial({color:0x3b6dad,transparent:true,opacity:.35}));platform.add(grooves);
  const ribs=[];
  for(let i=0;i<9;i++){
    const curvePoints=[];for(let j=0;j<=88;j++){const angle=j*Math.PI/88;curvePoints.push(new THREE.Vector3(6.9*Math.cos(angle),6.9*Math.sin(angle),0));}
    const profile=new THREE.Shape();const width=.23,depth=.37,r=.075;
    profile.moveTo(-width+r,-depth);profile.lineTo(width-r,-depth);profile.quadraticCurveTo(width,-depth,width,-depth+r);profile.lineTo(width,depth-r);profile.quadraticCurveTo(width,depth,width-r,depth);profile.lineTo(-width+r,depth);profile.quadraticCurveTo(-width,depth,-width,depth-r);profile.lineTo(-width,-depth+r);profile.quadraticCurveTo(-width,-depth,-width+r,-depth);
    const rib=new THREE.Mesh(new THREE.ExtrudeGeometry(profile,{steps:88,bevelEnabled:false,extrudePath:new THREE.CatmullRomCurve3(curvePoints)}),fabric.clone());
    rib.position.set(3.75,-2.28,-1.3-i*1.4);rib.castShadow=true;rib.receiveShadow=true;rib.material.color.setHSL(.615,.70,.18+i*.005);scene.add(rib);ribs.push(rib);
    if(i===0||i===4){const inlay=new THREE.Mesh(new THREE.TorusGeometry(6.92,.022,8,100,Math.PI),silver);inlay.position.copy(rib.position);inlay.position.z+=.39;scene.add(inlay);}
  }
  // Близкая цельная деталь комнаты. Она находится в том же 3D-пространстве.
  const nearFin=new THREE.Mesh(new THREE.TorusGeometry(4.7,.45,20,100,Math.PI*.5),darkFabric);nearFin.rotation.z=Math.PI/2;nearFin.scale.z=1.5;nearFin.position.set(8.2,-1,5.1);nearFin.castShadow=true;scene.add(nearFin);
  scene.add(new THREE.HemisphereLight(0x9bcaff,0x031027,.8));
  const key=new THREE.SpotLight(0xa5cfff,230,40,.72,.6,1.4);key.position.set(1.5,8,7);key.target.position.set(3.05,-1.9,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;scene.add(key,key.target);
  const fill=new THREE.DirectionalLight(0x2d72ff,1.5);fill.position.set(-4,3,2);scene.add(fill);
  const travellingLight=new THREE.PointLight(0x68afff,85,26,1.5);scene.add(travellingLight);
  const glow=new THREE.PointLight(0x126dff,150,28,1.3);glow.position.set(4.2,2,-12);scene.add(glow);
  const frontRim=new THREE.PointLight(0x8abaff,55,18,1.8);frontRim.position.set(7,4,6);scene.add(frontRim);
  // Полупрозрачный объём лучей в общей перспективе комнаты.
  const shafts=[];
  for(let i=0;i<3;i++){
    const material=new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(0x83bbff)},uOpacity:{value:.024}},transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      vertexShader:'varying vec3 vPosition; varying vec3 vNormal; varying vec2 vUv; void main(){vUv=uv; vPosition=(modelMatrix*vec4(position,1.0)).xyz; vNormal=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform vec3 uColor; uniform float uOpacity; varying vec3 vPosition; varying vec3 vNormal; varying vec2 vUv; void main(){float facing=abs(dot(normalize(vNormal),normalize(cameraPosition-vPosition)));float fade=pow(max(0.0,sin(vUv.y*3.14159265)),1.4)*pow(facing,2.2);gl_FragColor=vec4(uColor,uOpacity*fade);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
    const cone=new THREE.Mesh(new THREE.ConeGeometry(2.4,11,48,1,true),material);cone.position.set(3+i*1.6,3,-3-i*3);cone.rotation.z=-.15-i*.07;scene.add(cone);shafts.push(cone);
  }
  function radialTexture(){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,'white');g.addColorStop(.12,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
  const pointsCount=300,positions=new Float32Array(pointsCount*3),sizes=new Float32Array(pointsCount),pointBase=[];
  for(let i=0;i<pointsCount;i++){pointBase.push([-1+random()*11,-1.9+random()*10,2-random()*24,random()*Math.PI*2]);sizes[i]=.024+random()**2*.095;}
  const pointGeometry=new THREE.BufferGeometry();pointGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));pointGeometry.setAttribute('pointSize',new THREE.BufferAttribute(sizes,1));
  const pointMaterial=new THREE.ShaderMaterial({uniforms:{uHeight:{value:innerHeight},uColor:{value:new THREE.Color(0xb5d7ff)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float pointSize; uniform float uHeight; varying float vFade; void main(){vec4 view=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*view;gl_PointSize=clamp(pointSize*uHeight/(-view.z*.77),1.0,11.0);vFade=clamp((38.0+view.z)/24.0,.1,.72);}',
    fragmentShader:'uniform vec3 uColor;varying float vFade;void main(){float d=length(gl_PointCoord-.5)*2.0;float a=exp(-d*d*6.0)*(1.0-smoothstep(.55,1.0,d));gl_FragColor=vec4(uColor,a*vFade);}' });
  const floatingPoints=new THREE.Points(pointGeometry,pointMaterial);floatingPoints.renderOrder=4;scene.add(floatingPoints);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(3.3,1.6),new THREE.MeshBasicMaterial({color:0x010817,map:radialTexture(),transparent:true,opacity:.28,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.set(3.05,-1.892,0);scene.add(contact);
  contact.visible=!location.pathname.endsWith('фон.html');
  const footShadows=[];
  for(const [dx,z] of [[-1.22,-.34],[.96,.02]]){const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1.35,.85),new THREE.MeshBasicMaterial({color:0x010617,map:radialTexture(),transparent:true,opacity:.72,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(3.05+dx,-1.89,z);shadow.visible=contact.visible;scene.add(shadow);footShadows.push(shadow);}
  const actorTexture=new THREE.VideoTexture(video);actorTexture.colorSpace=THREE.NoColorSpace;actorTexture.minFilter=THREE.LinearFilter;actorTexture.magFilter=THREE.LinearFilter;actorTexture.generateMipmaps=false;
  const emptyAtlas=new THREE.DataTexture(new Uint8Array([0,0,0,0]),1,1);emptyAtlas.needsUpdate=true;
  let atlases=null,atlasLoading=false;
  async function loadAtlasFallback(){
    if(atlasLoading||atlases||!contact.visible)return;atlasLoading=true;
    try{
      const loader=new THREE.TextureLoader();atlases=await Promise.all([1,2,3,4].map(i=>loader.loadAsync(`материалы/Кадры героя ${i}.webp`)));
      atlases.forEach(texture=>{texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=false;});
      if(location.hostname==='127.0.0.1')fetch('/__bas_debug',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'hero-frame-fallback-ready',detail:'96 original frames; 12 fps; no video codec dependency'})}).catch(()=>{});
    }catch(error){console.info('Кадры героя не загрузились',error);}
  }
  video.addEventListener('error',loadAtlasFallback);video.querySelector('source')?.addEventListener('error',loadAtlasFallback);
  setTimeout(()=>{if(video.readyState<2||video.paused&&window.bassAnimationRunning!==false)loadAtlasFallback();},3500);
  const actorHeight=7,actorWidth=actorHeight*1280/720;
  const actorMaterial=new THREE.ShaderMaterial({uniforms:{uVideo:{value:actorTexture},uAtlas:{value:emptyAtlas},uUseAtlas:{value:0},uRect:{value:new THREE.Vector4(0,0,1,1)},uRoomLight:{value:.02}},transparent:true,depthWrite:true,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform sampler2D uVideo;uniform sampler2D uAtlas;uniform float uUseAtlas;uniform vec4 uRect;uniform float uRoomLight;varying vec2 vUv;void main(){float a;vec3 c;if(uUseAtlas>.5){vec4 p=texture2D(uAtlas,uRect.xy+vUv*uRect.zw);a=p.a;c=p.rgb;}else{a=texture2D(uVideo,vec2(.5+vUv.x*.5,vUv.y)).r;c=texture2D(uVideo,vec2(vUv.x*.5,vUv.y)).rgb;}if(a<.012)discard;float footShade=1.0-.14*pow(1.0-vUv.y,3.0);c*=vec3(.95,.98,1.025)*footShade;c+=vec3(.0,.009,.024)*uRoomLight;gl_FragColor=vec4(c,a);}' });
  const actor=new THREE.Mesh(new THREE.PlaneGeometry(actorWidth,actorHeight),actorMaterial);actor.frustumCulled=false;actor.renderOrder=3;scene.add(actor);
  const actorFoot=new THREE.Vector3((826/1280-.5)*actorWidth,(.5-660/720)*actorHeight,0),actorOffset=new THREE.Vector3();
  const waveRings=[];for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(1.4,1.43,128),new THREE.MeshBasicMaterial({color:0x7caeff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));ring.renderOrder=2;ring.rotation.x=-Math.PI/2;ring.position.set(3.05,-1.886,0);scene.add(ring);waveRings.push(ring);}
  let pointerX=0,pointerY=0;addEventListener('pointermove',event=>{pointerX=(event.clientX/innerWidth-.5)*2;pointerY=(event.clientY/innerHeight-.5)*2;});
  const foot=new THREE.Vector3(3.05,-1.89,0),projected=new THREE.Vector3();
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();pointMaterial.uniforms.uHeight.value=innerHeight;}addEventListener('resize',resize);resize();
  const captured=new Set();let reported=false,figmaExported=false;const pulse=(time,center,width)=>{const d=Math.min(Math.abs(time-center),8-Math.abs(time-center));return Math.exp(-(d*d)/(width*width));};
  function exportFigmaStill(){
    const currentSize=renderer.getSize(new THREE.Vector2()),dpr=renderer.getPixelRatio(),aspect=camera.aspect;
    renderer.setPixelRatio(1);renderer.setSize(1600,900,false);camera.aspect=1600/900;camera.updateProjectionMatrix();pointMaterial.uniforms.uHeight.value=900;
    renderer.render(scene,camera);
    const image=document.createElement('canvas');image.width=1600;image.height=900;image.getContext('2d').drawImage(canvas,0,0);
    renderer.setPixelRatio(dpr);renderer.setSize(currentSize.x,currentSize.y,false);camera.aspect=aspect;camera.updateProjectionMatrix();pointMaterial.uniforms.uHeight.value=innerHeight;renderer.render(scene,camera);
    image.toBlob(blob=>{if(blob)fetch('/__bas_frame/blink?version=13',{method:'POST',headers:{'Content-Type':'image/png'},body:blob}).catch(()=>{});},'image/png');
  }
  function draw(now){requestAnimationFrame(draw);if(body.dataset.atmosphere!=='waves'){renderer.clear();return;}
    const running=window.bassAnimationRunning!==false&&(!reduced.matches||body.classList.contains('motion-opt-in'));
    const elapsed=clock.step(now,running),t=elapsed%8,phase=t*Math.PI/4,beat=pulse(t,3.8,.38)+pulse(t,5,.38);
    const px=running?pointerX*.045:0,py=running?pointerY*.03:0;
    // Самостоятельный проезд камеры: глубина меняется даже при неподвижной мыши.
    camera.position.set(Math.sin(phase)*.46+px,3.2+Math.sin(phase)*.10+py,11+.46*Math.sin(phase-.45));camera.lookAt(0,1,0);camera.updateMatrixWorld();
    for(let i=0;i<ribs.length;i++){const response=pulse(t,(3.8+i*.17)%8,.4)+pulse(t,(5+i*.17)%8,.4);ribs[i].scale.set(1+response*.026,1+response*.045,1);ribs[i].position.y=-2.28-response*.04;ribs[i].material.emissive.setHex(0x1e63c7);ribs[i].material.emissiveIntensity=.018+response*.16;}
    travellingLight.position.set(3.8+Math.sin(phase)*3.4,3+Math.cos(phase)*1.2,-1-((1+Math.sin(phase-.7))/2)*10);travellingLight.intensity=70+beat*90;glow.intensity=130+beat*80;
    shafts.forEach((shaft,i)=>{shaft.rotation.z=-.15-i*.07+Math.sin(phase+i)*.035;shaft.material.uniforms.uOpacity.value=.022+(.5+.5*Math.sin(phase+i))*.018+beat*.009;});
    for(let i=0;i<pointsCount;i++){const v=pointBase[i];positions[i*3]=v[0]+Math.sin(phase+v[3])*.22;positions[i*3+1]=v[1]+Math.sin(phase+v[3]*.8)*.32;positions[i*3+2]=v[2]+Math.cos(phase+v[3])*.35;}pointGeometry.attributes.position.needsUpdate=true;
    waveRings.forEach((ring,i)=>{const age=t-3.8-i*.19;const active=age>=0&&age<1.9;ring.visible=active;if(active){ring.scale.setScalar(1+age*.85);ring.material.opacity=.26*(1-age/1.9);}});
    const useAtlas=Boolean(atlases&&(video.readyState<2||video.paused&&window.bassAnimationRunning!==false));
    const actorTime=useAtlas?t:video.currentTime%8,hop=pulse(actorTime,3.5,.24)+pulse(actorTime,4.45,.24);
    actorMaterial.uniforms.uUseAtlas.value=useAtlas?1:0;
    if(useAtlas){const frame=Math.floor(actorTime*12)%96,local=frame%24;actorMaterial.uniforms.uAtlas.value=atlases[Math.floor(frame/24)];actorMaterial.uniforms.uRect.value.set((local%6)/6,1-(Math.floor(local/6)+1)/4,1/6,1/4);}
    contact.material.opacity=.28-hop*.08;footShadows.forEach(shadow=>{shadow.material.opacity=.72-hop*.34;shadow.scale.setScalar(1+hop*.18);});
    actor.visible=(video.readyState>=2||useAtlas)&&contact.visible;
    window.bassVisualTime=actorTime;
    if(actor.visible){actor.quaternion.copy(camera.quaternion);actorOffset.copy(actorFoot).applyQuaternion(camera.quaternion);actor.position.copy(foot).sub(actorOffset);actorMaterial.uniforms.uRoomLight.value=beat;body.classList.add('hero-in-room');}
    projected.copy(foot).project(camera);
    // Готовый персонаж следует проекции общей опорной точки комнаты.
    const k=.88*(11/camera.position.z),fit=Math.min(innerWidth/1280,innerHeight/720);
    const sourceX=(innerWidth-1280*fit)/2+1280*.735*fit,sourceY=(innerHeight-720*fit)/2+660*fit;
    const originX=.735*innerWidth,originY=.91*innerHeight;
    body.style.setProperty('--room-hero-x',`${(projected.x*.5+.5)*innerWidth-(originX+k*(sourceX-originX))}px`);
    body.style.setProperty('--room-hero-y',`${(.5-projected.y*.5)*innerHeight-(originY+k*(sourceY-originY))+.1*innerHeight}px`);
    body.style.setProperty('--room-hero-scale',k);
    renderer.render(scene,camera);
    if(location.hostname==='127.0.0.1'){
      if(!figmaExported&&actor.visible&&actorTime>6.25&&actorTime<6.65){figmaExported=true;exportFigmaStill();}
      for(const [at,name] of [[.7,'start'],[4.4,'wave']])if(elapsed>=at&&!captured.has(name)){captured.add(name);canvas.toBlob(blob=>{if(blob)fetch(`/__bas_frame/${name}?version=13`,{method:'POST',headers:{'Content-Type':'image/png'},body:blob}).catch(()=>{});},'image/png');}
      if(!reported&&elapsed>1.2){reported=true;fetch('/__bas_debug',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'room-clock-running',detail:`independent time=${elapsed.toFixed(2)}; hero time=${video.currentTime.toFixed(2)}; paused=${video.paused}`,width:innerWidth,height:innerHeight})}).catch(()=>{});}
    }
  }requestAnimationFrame(draw);
}
