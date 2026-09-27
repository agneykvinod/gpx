import * as THREE from "three";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78909c);
scene.fog = new THREE.Fog(0x78909c, 95, 300);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.05, 600);
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById("game").prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdbeafe, 0x23301f, 1.65));
const sun = new THREE.DirectionalLight(0xfff4df, 2.8);
sun.position.set(-70, 110, 55);
sun.castShadow = true;
sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
sun.shadow.bias = -0.0005;
scene.add(sun);

const world = new THREE.Group(); scene.add(world);
const mat = (c,r=.75,m=.05) => new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const dark = mat(0x090b0f,.35,.55), carbon = mat(0x171a1f,.55,.5);
const roadMat = mat(0x20242a,.96,0), grassMat = mat(0x1e432b,1,0);
const kerbRed = mat(0xc52e38,.7,0), kerbWhite = mat(0xe8e8e2,.7,0);
const bikeRed = mat(0xb80f20,.3,.42), bikeRed2 = mat(0x5e0710,.36,.45);
const metal = mat(0x9aa4ad,.23,.9), tyreMat = mat(0x090a0c,.92,0);
const glass = new THREE.MeshStandardMaterial({color:0x12222b,roughness:.08,metalness:.25,transparent:true,opacity:.72});
const white = mat(0xf2f2ed,.5,0);

const grass = new THREE.Mesh(new THREE.PlaneGeometry(520,520),grassMat);
grass.rotation.x=-Math.PI/2; grass.position.y=-.08; grass.receiveShadow=true; world.add(grass);

const pts=[
 new THREE.Vector3(-34,0,38),new THREE.Vector3(-49,0,21),new THREE.Vector3(-48,0,-5),
 new THREE.Vector3(-34,0,-27),new THREE.Vector3(-8,0,-36),new THREE.Vector3(19,0,-30),
 new THREE.Vector3(39,0,-13),new THREE.Vector3(45,0,9),new THREE.Vector3(31,0,28),
 new THREE.Vector3(8,0,37),new THREE.Vector3(-10,0,30),new THREE.Vector3(-20,0,15),
 new THREE.Vector3(-15,0,1),new THREE.Vector3(2,0,-4),new THREE.Vector3(18,0,6),
 new THREE.Vector3(19,0,20),new THREE.Vector3(3,0,25),new THREE.Vector3(-14,0,21),
 new THREE.Vector3(-23,0,8),new THREE.Vector3(-22,0,-10),new THREE.Vector3(-11,0,-20),
 new THREE.Vector3(5,0,-19),new THREE.Vector3(21,0,-11),new THREE.Vector3(25,0,5),
 new THREE.Vector3(14,0,18),new THREE.Vector3(-4,0,19),new THREE.Vector3(-20,0,8),
 new THREE.Vector3(-18,0,-7),new THREE.Vector3(-7,0,-13),new THREE.Vector3(8,0,-9),
 new THREE.Vector3(14,0,2),new THREE.Vector3(7,0,12),new THREE.Vector3(-6,0,14),
 new THREE.Vector3(-19,0,6),new THREE.Vector3(-18,0,-8),new THREE.Vector3(-9,0,-16),
 new THREE.Vector3(4,0,-12),new THREE.Vector3(9,0,-2),new THREE.Vector3(0,0,7),
 new THREE.Vector3(-12,0,6),new THREE.Vector3(-24,0,-2),new THREE.Vector3(-29,0,12)
];
const curve=new THREE.CatmullRomCurve3(pts,true,"centripetal",.5);
const samples=480, trackWidth=8.2;

function frameAt(t){
 const p=curve.getPointAt((t+1)%1), tan=curve.getTangentAt((t+1)%1).normalize();
 const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
 return {p,tan,side};
}

const roadGeo=new THREE.BufferGeometry(), v=[], uv=[];
for(let i=0;i<=samples;i++){
 const t=i/samples, f=frameAt(t), l=f.p.clone().addScaledVector(f.side,trackWidth/2), r=f.p.clone().addScaledVector(f.side,-trackWidth/2);
 v.push(l.x,.01,l.z,r.x,.01,r.z); uv.push(i/samples,0,i/samples,1);
}
const ids=[]; for(let i=0;i<samples;i++){let a=i*2;ids.push(a,a+1,a+2,a+1,a+3,a+2)}
roadGeo.setAttribute("position",new THREE.Float32BufferAttribute(v,3));
roadGeo.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2)); roadGeo.setIndex(ids); roadGeo.computeVertexNormals();
const road=new THREE.Mesh(roadGeo,roadMat); road.receiveShadow=true; world.add(road);

function strip(offset,width,material,y=.035){
 const g=new THREE.BufferGeometry(), vv=[];
 for(let i=0;i<=samples;i++){const f=frameAt(i/samples),a=f.p.clone().addScaledVector(f.side,offset-width/2),b=f.p.clone().addScaledVector(f.side,offset+width/2);vv.push(a.x,y,a.z,b.x,y,b.z)}
 const ii=[];for(let i=0;i<samples;i++){let a=i*2;ii.push(a,a+1,a+2,a+1,a+3,a+2)}
 g.setAttribute("position",new THREE.Float32BufferAttribute(vv,3));g.setIndex(ii);g.computeVertexNormals();
 const mesh=new THREE.Mesh(g,material);mesh.receiveShadow=true;world.add(mesh);
}
strip(trackWidth/2+.18,.55,kerbWhite,.045); strip(trackWidth/2+.48,.55,kerbRed,.05);
strip(-trackWidth/2-.18,.55,kerbWhite,.045); strip(-trackWidth/2-.48,.55,kerbRed,.05);

function addRoadMarks(){
 const markMat=mat(0xf0f0e7,.8,0);
 for(let i=0;i<samples;i+=7){
  const f=frameAt(i/samples);
  const m=new THREE.Mesh(new THREE.BoxGeometry(.13,.012,1.15),markMat);
  m.position.copy(f.p);m.position.y=.075;m.rotation.y=Math.atan2(f.tan.x,f.tan.z);world.add(m);
 }
}
addRoadMarks();

function box(w,h,d,material,pos,rotY=0){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.copy(pos);m.rotation.y=rotY;m.castShadow=true;m.receiveShadow=true;world.add(m);return m;
}
function createTree(pos,scale=1){
 const g=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.5,7),mat(0x4c3425));trunk.position.y=.75;g.add(trunk);
 const crown=new THREE.Mesh(new THREE.DodecahedronGeometry(1.0,1),mat(0x173b24));crown.position.y=1.85;g.add(crown);
 g.position.copy(pos);g.scale.setScalar(scale);g.traverse(o=>{if(o.isMesh)o.castShadow=true});world.add(g);
}
for(let i=0;i<72;i++){
 const t=(i/72+.013)%1,f=frameAt(t),side=i%2?1:-1;
 const p=f.p.clone().addScaledVector(f.side,14+Math.random()*23);p.y=0;
 createTree(p,.65+Math.random()*.55);
}

function grandstand(t){
 const f=frameAt(t), base=f.p.clone().addScaledVector(f.side,15);
 const rot=Math.atan2(f.tan.x,f.tan.z)+Math.PI/2;
 const g=new THREE.Group();
 const deck=new THREE.Mesh(new THREE.BoxGeometry(16,1.1,6),mat(0x454950,.8,.15));deck.position.y=.65;g.add(deck);
 for(let i=0;i<6;i++){const tier=new THREE.Mesh(new THREE.BoxGeometry(15-i*1.3,.35,5.4),mat(0x747982,.8,.1));tier.position.set(0,1.25+i*.38,-i*.34);g.add(tier)}
 for(let i=-6;i<=6;i++){const seat=new THREE.Mesh(new THREE.BoxGeometry(.35,.16,4.8),mat(i%2?0x172a48:0xb52b35));seat.position.set(i*1.05,3.7,-1.8);g.add(seat)}
 g.position.copy(base);g.rotation.y=rot;g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});world.add(g);
}
grandstand(.10);grandstand(.42);grandstand(.73);

function banner(t,text){
 const f=frameAt(t),p=f.p.clone().addScaledVector(f.side,11);
 const g=new THREE.Group();
 const board=new THREE.Mesh(new THREE.BoxGeometry(10,.9,.12),mat(0x0b0d12,.45,.2));g.add(board);
 for(const x of [-4.3,4.3]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,3.5,8),metal);pole.position.set(x,-1.25,0);g.add(pole)}
 const c=document.createElement("canvas");c.width=512;c.height=64;const ctx=c.getContext("2d");ctx.fillStyle="#0b0d12";ctx.fillRect(0,0,512,64);ctx.fillStyle="#f5f5f0";ctx.font="bold 28px Arial";ctx.textAlign="center";ctx.fillText(text,256,42);
 const tex=new THREE.CanvasTexture(c);const sign=new THREE.Mesh(new THREE.PlaneGeometry(9.5,.72),new THREE.MeshBasicMaterial({map:tex}));sign.position.z=-.08;g.add(sign);
 g.position.copy(p);g.rotation.y=Math.atan2(f.tan.x,f.tan.z)+Math.PI/2;world.add(g);
}
banner(.17,"GPX RACING");banner(.56,"PIT • RACE • REPEAT");banner(.86,"APEX IS EVERYTHING");

const start=curve.getPointAt(0),st=curve.getTangentAt(0).normalize(),ss=new THREE.Vector3(-st.z,0,st.x).normalize();
for(let i=-6;i<7;i++){const tile=new THREE.Mesh(new THREE.BoxGeometry(.62,.025,.62),mat(i%2?0x111214:0xf2f2ed));tile.position.copy(start).addScaledVector(ss,i*.62);tile.position.y=.08;world.add(tile)}

function makeBike(){
 const g=new THREE.Group();
 const fair=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI*.58),bikeRed);fair.scale.set(.45,.38,1.25);fair.position.set(0,.82,-.12);fair.rotation.x=Math.PI;g.add(fair);
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.32,16,10),bikeRed2);nose.scale.set(.85,.75,1.4);nose.position.set(0,.84,-.9);nose.rotation.x=Math.PI/2;g.add(nose);
 const tank=new THREE.Mesh(new THREE.SphereGeometry(.42,16,10),bikeRed);tank.scale.set(.78,.6,.95);tank.position.set(0,1.02,.08);g.add(tank);
 const seat=new THREE.Mesh(new THREE.BoxGeometry(.34,.13,.72),dark);seat.position.set(0,1.08,.62);seat.rotation.x=-.08;g.add(seat);
 const tail=new THREE.Mesh(new THREE.SphereGeometry(.28,14,8),bikeRed2);tail.scale.set(.72,.5,1.2);tail.position.set(0,1.08,1.0);g.add(tail);
 const wheelGeo=new THREE.CylinderGeometry(.31,.31,.13,24);wheelGeo.rotateZ(Math.PI/2);
 for(const z of [-.78,.82]){const w=new THREE.Mesh(wheelGeo,tyreMat);w.position.set(0,.38,z);w.castShadow=true;g.add(w)}
 const discGeo=new THREE.CylinderGeometry(.205,.205,.018,24);discGeo.rotateZ(Math.PI/2);
 for(const z of [-.79,.83]){const d=new THREE.Mesh(discGeo,metal);d.position.set(0,.38,z);g.add(d)}
 const fork=new THREE.Mesh(new THREE.BoxGeometry(.08,.65,.08),metal);fork.position.set(.16,.65,-.78);fork.rotation.x=-.18;g.add(fork);const fork2=fork.clone();fork2.position.x=-.16;g.add(fork2);
 const bar=new THREE.Mesh(new THREE.BoxGeometry(.72,.06,.08),metal);bar.position.set(0,1.25,-.62);bar.rotation.z=.03;g.add(bar);
 const dash=new THREE.Mesh(new THREE.BoxGeometry(.25,.18,.06),glass);dash.position.set(0,1.25,-.48);dash.rotation.x=-.45;g.add(dash);
 const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.7,12),metal);exhaust.rotateZ(Math.PI/2);exhaust.position.set(.36,.62,.42);g.add(exhaust);
 // rider
 const suit=mat(0x171b22,.6,.1), helmet=mat(0xe7e9ed,.28,.4);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.23,.5,5,10),suit);torso.position.set(0,1.45,.32);torso.rotation.x=.58;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),helmet);head.position.set(0,1.72,-.02);g.add(head);
 const visor=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),glass);visor.scale.set(.95,.7,.25);visor.position.set(0,1.72,-.16);g.add(visor);
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g;
}
const bike=makeBike();world.add(bike);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34,depthWrite:false}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.075;world.add(shadow);

let running=false,elapsed=0,progress=0,lap=1,speed=0,targetLean=0,lean=0,throttle=false,braking=false,tiltEnabled=false,tiltValue=0;
const MAX_LEAN=49;
const $=id=>document.getElementById(id);
const fmt=s=>{const m=Math.floor(s/60),sec=(s%60).toFixed(2).padStart(5,"0");return String(m).padStart(2,"0")+":"+sec};
function reset(){running=true;elapsed=0;progress=0;lap=1;speed=0;targetLean=0;lean=0;tiltValue=0;$("menu").classList.add("hidden");$("crash").classList.add("hidden");$("finish").classList.add("hidden");$("status").textContent="RACE MODE • FIND THE APEX"}
function crash(){running=false;$("crash").classList.remove("hidden");$("crashText").textContent="You lost the rear grip. Reduce lean or brake earlier."}
function finish(){running=false;$("finish").classList.remove("hidden");$("finishText").textContent="Race time: "+fmt(elapsed)}
function updateBike(dt){
 const t=progress%1,f=frameAt(t),f2=frameAt((t+.004)%1);
 const turn=f.tan.clone().cross(f2.tan).y,corner=Math.min(1,Math.abs(turn)*34);
 const desired=tiltEnabled?tiltValue:targetLean;
 targetLean=THREE.MathUtils.clamp(desired,-52,52);lean=THREE.MathUtils.damp(lean,targetLean,9,dt);
 let accel=throttle?27:2.5;if(braking)accel-=42;
 speed=THREE.MathUtils.clamp(speed+(accel-speed*.48)*dt,0,68);
 const gripLimit=MAX_LEAN-corner*10-Math.max(0,(speed-48))*.12;
 if(Math.abs(lean)>gripLimit){crash();return}
 progress+=(speed/235)*dt;
 if(progress>=1){progress-=1;lap++;if(lap>3){finish();return}}
 const yaw=Math.atan2(f.tan.x,f.tan.z);
 bike.position.copy(f.p);bike.position.y=.08;
 bike.rotation.set(THREE.MathUtils.degToRad(-lean*.12),yaw,THREE.MathUtils.degToRad(-lean*.82));
 shadow.position.set(f.p.x,.08,f.p.z);
 const cam=f.p.clone().addScaledVector(f.tan,-8.7);cam.y=3.35+Math.abs(lean)*.018;
 camera.position.lerp(cam,1-Math.pow(.0007,dt));
 const look=f.p.clone().addScaledVector(f.tan,5.2);look.y=1.0;camera.lookAt(look);
 $("speed").textContent=Math.round(speed*3.6);$("lean").textContent=Math.round(lean)+"°";$("lap").textContent=Math.min(lap,3)+" / 3";$("time").textContent=fmt(elapsed);
}
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.035,(t-(loop.last||t))/1000);loop.last=t;if(running){elapsed+=dt;updateBike(dt)}renderer.render(scene,camera)}
requestAnimationFrame(loop);

function steer(x){targetLean=(x/innerWidth-.5)*82}
renderer.domElement.addEventListener("pointerdown",e=>{if(running)steer(e.clientX)});
renderer.domElement.addEventListener("pointermove",e=>{if(running&&e.buttons)steer(e.clientX)});
for(const [id,set] of [["throttle",v=>throttle=v],["brake",v=>braking=v]]){const el=$(id);el.addEventListener("pointerdown",()=>set(true));for(const ev of ["pointerup","pointercancel","pointerleave"])el.addEventListener(ev,()=>set(false))}
window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")targetLean=-40;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")targetLean=40;if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")throttle=true;if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")braking=true});
window.addEventListener("keyup",e=>{if(["ArrowLeft","ArrowRight","a","d"].includes(e.key))targetLean=0;if(["ArrowUp","ArrowDown","w","s"].includes(e.key))throttle=false;if(["ArrowDown","s"].includes(e.key))braking=false});
$("sensor").addEventListener("click",async()=>{if(!window.DeviceOrientationEvent){$("status").textContent="MOTION SENSOR UNAVAILABLE";return}try{if(typeof DeviceOrientationEvent.requestPermission==="function"){const p=await DeviceOrientationEvent.requestPermission();if(p!=="granted")return}tiltEnabled=true;$("status").textContent="TILT MODE • MOTION ACTIVE"}catch(e){$("status").textContent="TILT PERMISSION UNAVAILABLE"}});
window.addEventListener("deviceorientation",e=>{if(tiltEnabled)tiltValue=THREE.MathUtils.clamp((e.gamma||0)*1.35,-48,48)});
$("start").onclick=reset;$("restart").onclick=reset;$("finishRestart").onclick=reset;
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.35))});
const p0=frameAt(0);camera.position.copy(p0.p).addScaledVector(p0.tan,-9);camera.position.y=3.6;camera.lookAt(p0.p);
