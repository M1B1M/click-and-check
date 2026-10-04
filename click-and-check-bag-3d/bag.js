import * as THREE from './vendor/three.module.js';
import { createShoppingBag } from './model.js';

// false = a completely still model. Otherwise gentle motion and pointer tilt.
const ANIMATE = true;
const BRAND = 'CLICK AND CHECK';
const referenceURL = new URL('./brand-reference.png', import.meta.url).href;
const fallbackURL = new URL('./preview.png', import.meta.url).href;

for(const host of document.querySelectorAll('[data-cc-bag]')){
  if(host.dataset.initialized)continue;
  host.dataset.initialized='true';
  host.innerHTML=`<img class="cc-bag__fallback" alt="كيس Click and Check الأسود والذهبي"><canvas class="cc-bag__canvas" role="img" aria-label="مجسم ثلاثي الأبعاد لكيس Click and Check بالأسود والذهبي"></canvas><span class="cc-bag__status" role="status">جاري تجهيز التصميم…</span>`;
  host.querySelector('img').src=fallbackURL;
  init(host).catch(error=>{
    console.warn('Bag 3D:',error);
    host.querySelector('.cc-bag__status').textContent='';
    // The supplied design image stays visible if WebGL is unavailable.
  });
}

async function init(host){
  const canvas=host.querySelector('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,50);
  const cursorLight = new THREE.PointLight(0xffd88a, 0, 8);
cursorLight.position.set(0, 1, 4);
scene.add(cursorLight);
  const target=new THREE.Vector3(0,.45,0);
  camera.position.set(0,1.45,9.8);camera.lookAt(target);
  scene.add(new THREE.HemisphereLight(0xfff4db,0x34343a,2.7));
  const key=new THREE.DirectionalLight(0xffe6b6,4);key.position.set(4,6,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe6eeff,3);fill.position.set(-4,3,2);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffd38c,3);rim.position.set(2,3,-4);scene.add(rim);
  const studio=new THREE.Scene();studio.background=new THREE.Color(0x242424);
  for(const [x,y,z,w,h,power] of [[-4,2,2,2,7,5],[4,2,1,2,7,4],[0,6,0,4,4,3]]){
    const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
    p.material.color.multiplyScalar(power);p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);
  }
  const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(studio,.04);scene.environment=environment.texture;
  pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  const textureCanvas=document.createElement('canvas');textureCanvas.width=1024;textureCanvas.height=1024;
  const ctx=textureCanvas.getContext('2d');
  const texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  function lettering(){
    ctx.textAlign='center';ctx.fillStyle='#d6b46a';
    ctx.font='56px Georgia';ctx.fillText(BRAND,512,745);
    ctx.font='22px Georgia';ctx.fillText('P E R F U M E S · S H O P P I N G · G I F T S',512,813);
    ctx.strokeStyle='#ba9347';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(275,875);ctx.lineTo(475,875);ctx.moveTo(549,875);ctx.lineTo(749,875);ctx.stroke();
    ctx.font='40px Georgia';ctx.fillText('∞',512,888);
    texture.needsUpdate=true;
  }
  lettering();
  const bag=createShoppingBag(texture);scene.add(bag);bag.rotation.y=-.27;
  /* Entrance animation */
bag.scale.set(0.78, 0.78, 0.78);
bag.position.y = -0.45;

let entrance = 0;
let hovered = false;
let hoverAmount = 0;
  // Soft procedural ground shadow beneath the floating bag.
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(0,0,0,.65)');gradient.addColorStop(1,'rgba(0,0,0,0)');
  sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4.6,2.7),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.68;scene.add(shadow);
  let visible=true,disposed=false,elapsed=0,last=0,px=0,py=0,tiltX=0,tiltY=0;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  function render(){if(!disposed)renderer.render(scene,camera);}
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;
    const vertical=THREE.MathUtils.degToRad(camera.fov);
    const horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
    camera.position.z=Math.max(8.6,3.6/(2*Math.tan(horizontal/2)));
    camera.lookAt(target);camera.updateProjectionMatrix();render();
  }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
  function frame(now){
    const dt=Math.min((now-last)/1000,.05);if(now-last<32)return;last=now;
    if(!visible||document.hidden)return;
    if(!ANIMATE||reduce.matches){bag.position.y=0;bag.rotation.set(0,-.27,0);render();return;}
   elapsed += dt;


/* =========================
   INTRO ANIMATION
========================= */

entrance = THREE.MathUtils.damp(
    entrance,
    1,
    3.2,
    dt
);

const ease = 1 - Math.pow(1 - entrance, 3);


/* =========================
   HOVER
========================= */

hoverAmount = THREE.MathUtils.damp(
    hoverAmount,
    hovered ? 1 : 0,
    5,
    dt
);


/* =========================
   MOUSE TILT
========================= */

tiltX = THREE.MathUtils.damp(
    tiltX,
    py * .11,
    5,
    dt
);

tiltY = THREE.MathUtils.damp(
    tiltY,
    px * .28,
    5,
    dt
);


/* =========================
   ROTATION
========================= */

bag.rotation.y =
    -.27
    + Math.sin(elapsed * .42) * .10
    + tiltY;

bag.rotation.x =
    tiltX
    + Math.sin(elapsed * .55) * .01;

bag.rotation.z =
    Math.sin(elapsed * .6) * .015
    - px * .018;


/* =========================
   FLOATING
========================= */

const floatY =
    Math.sin(elapsed * 1.15) * .07;

bag.position.y =
    THREE.MathUtils.lerp(-.45, 0, ease)
    + floatY
    + hoverAmount * .13;


/* =========================
   SCALE
========================= */

const breathing =
    Math.sin(elapsed * .8) * .006;

const scale =
    THREE.MathUtils.lerp(.78, 1, ease)
    + breathing
    + hoverAmount * .035;

bag.scale.setScalar(scale);


/* =========================
   GOLD CURSOR LIGHT
========================= */

cursorLight.intensity =
    THREE.MathUtils.damp(
        cursorLight.intensity,
        hovered ? 2.4 : .4,
        5,
        dt
    );

cursorLight.position.x =
    THREE.MathUtils.damp(
        cursorLight.position.x,
        px * 3,
        4,
        dt
    );

cursorLight.position.y =
    THREE.MathUtils.damp(
        cursorLight.position.y,
        1.2 - py * 2,
        4,
        dt
    );


render();
   
  }
  function updateLoop(){
    renderer.setAnimationLoop(ANIMATE&&!reduce.matches&&visible&&!document.hidden?frame:null);
    if(reduce.matches||!ANIMATE){bag.position.y=0;bag.rotation.set(0,-.27,0);}
    last=performance.now();render();
  }
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updateLoop();});intersection.observe(host);
  function pointerMove(event){
    if(!fine.matches||reduce.matches)return;
    const b=host.getBoundingClientRect();px=(event.clientX-b.left)/b.width*2-1;py=(event.clientY-b.top)/b.height*2-1;
  }
function pointerEnter(){
    hovered = true;
}

function pointerLeave(){
    hovered = false;
    px = 0;
    py = 0;
}
 host.addEventListener('pointerenter', pointerEnter);
host.addEventListener('pointermove', pointerMove);
host.addEventListener('pointerleave', pointerLeave);
  reduce.addEventListener('change',updateLoop);document.addEventListener('visibilitychange',updateLoop);
  updateLoop();host.dataset.ready='true';
  // Extract only the existing gold emblem from concept 3 at render time.
  // The original reference image is preserved unchanged.
  const img=new Image();
  img.onload=()=>{
    if(disposed)return;
    const icon=document.createElement('canvas');icon.width=icon.height=512;
    const ic=icon.getContext('2d');
    const sx=img.naturalWidth/1448,sy=img.naturalHeight/1086;
    ic.drawImage(img,809*sx,120*sy,210*sx,203*sy,0,0,512,512);
    const pixels=ic.getImageData(0,0,512,512);
    for(let i=0;i<pixels.data.length;i+=4){
      const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
      const brightness=Math.max(r,g,b);
      pixels.data[i+3]=r>g*.99&&g>b*1.07?Math.round(THREE.MathUtils.clamp((brightness-40)/70,0,1)*255):0;
    }
    ic.putImageData(pixels,0,0);
    ctx.clearRect(0,0,1024,1024);ctx.drawImage(icon,242,130,540,540);lettering();render();
  };
  img.onerror=()=>{console.warn('Brand emblem unavailable; wordmark retained.');};
  img.src=referenceURL;
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer.setAnimationLoop(null);host.dataset.ready='false';});
  canvas.addEventListener('webglcontextrestored',()=>{host.dataset.ready='true';updateLoop();});
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;disposed=true;renderer.setAnimationLoop(null);
    resizeObserver.disconnect();intersection.disconnect();reduce.removeEventListener('change',updateLoop);
    document.removeEventListener('visibilitychange',updateLoop);host.removeEventListener('pointermove',pointerMove);host.removeEventListener('pointerleave',pointerLeave);
    const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());texture.dispose();shadowTexture.dispose();environment.dispose();renderer.dispose();
  },{once:true});
}
host.removeEventListener('pointerenter', pointerEnter);