import * as THREE from "three";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fa1ad);
scene.fog=new THREE.Fog(0x8fa1ad,70,240);

const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,500);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false;
document.getElementById("game").prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdce8ff,0x283020,2.1));
const sun=new THREE.DirectionalLight(0xffffff,2.0);sun.position.set(-50,90,40);scene.add(sun);

const world=new THREE.Group();scene.add(world);

function mat(color,rough=1){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0.05})}
const grassMat=mat(0x263b2b), roadMat=mat(0x25282d), whiteMat=mat(0xe8e8e5), redMat=mat(0xd84646), darkMat=mat(0x101217), bikeMat=mat(0x7c3aed,.45);

const grass=new THREE.Mesh(new THREE.PlaneGeometry(420,420),grassMat);
grass.rotation.x=-Math.PI/2;grass.position.y=-.03;world.add(grass);

// A compact GP-style circuit. Coordinates are deliberately fictional for this prototype.
const pts=[
 new THREE.Vector3(-34,0,38),new THREE.Vector3(-48,0,20),new THREE.Vector3(-47,0,-4),
 new THREE.Vector3(-34,0,-25),new THREE.Vector3(-9,0,-34),new THREE.Vector3(18,0,-28),
 new THREE.Vector3(37,0,-12),new THREE.Vector3(43,0,8),new THREE.Vector3(31,0,26),
 new THREE.Vector3(8,0,35),new THREE.Vector3(-10,0,29),new THREE.Vector3(-19,0,15),
 new THREE.Vector3(-14,0,2),new THREE.Vector3(2,0,-3),new THREE.Vector3(17,0,6),
 new THREE.Vector3(18,0,19),new THREE.Vector3(3,0,24),new THREE.Vector3(-13,0,20),
 new THREE.Vector3(-22,0,8),new THREE.Vector3(-21,0,-9),new THREE.Vector3(-11,0,-19),
 new THREE.Vector3(5,0,-18),new THREE.Vector3(20,0,-10),new THREE.Vector3(24,0,5),
 new THREE.Vector3(13,0,17),new THREE.Vector3(-4,0,18),new THREE.Vector3(-19,0,8),
 new THREE.Vector3(-17,0,-6),new THREE.Vector3(-6,0,-12),new THREE.Vector3(7,0,-8),
 new THREE.Vector3(13,0,2),new THREE.Vector3(6,0,11),new THREE.Vector3(-6,0,13),
 new THREE.Vector3(-18,0,6),new THREE.Vector3(-17,0,-7),new THREE.Vector3(-8,0,-15),
 new THREE.Vector3(4,0,-11),new THREE.Vector3(8,0,-2),new THREE.Vector3(0,0,7),
 new THREE.Vector3(-12,0,6),new THREE.Vector3(-24,0,-2),new THREE.Vector3(-29,0,12),
 new THREE.Vector3(-34,0,38)
];

const curve=new THREE.CatmullRomCurve3(pts,true,"centripetal",.45);
const samples=360, trackWidth=7.5;
const roadGeo=new THREE.BufferGeometry(),roadVerts=[],roadUV=[];
for(let i=0;i<=samples;i++){
 const t=i/samples,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
 const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
 const l=p.clone().addScaledVector(side,trackWidth/2),r=p.clone().addScaledVector(side,-trackWidth/2);
 roadVerts.push(l.x,l.y,l.z,r.x,r.y,r.z);roadUV.push(i/samples,0,i/samples,1);
}
const idx=[];for(let i=0;i<samples;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c)}
roadGeo.setAttribute("position",new THREE.Float32BufferAttribute(roadVerts,3));roadGeo.setAttribute("uv",new THREE.Float32BufferAttribute(roadUV,2));roadGeo.setIndex(idx);roadGeo.computeVertexNormals();
const road=new THREE.Mesh(roadGeo,roadMat);road.position.y=.01;world.add(road);

function addCurb(offset,color){
 for(let i=0;i<samples;i+=4){
  const t=i/samples,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize(),side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
  const pos=p.clone().addScaledVector(side,offset);
  const q=new THREE.Mesh(new THREE.BoxGeometry(.65,.09,.65),mat(color));
  q.position.copy(pos);q.position.y=.07;q.rotation.y=Math.atan2(tan.x,tan.z);world.add(q);
 }
}
addCurb(trackWidth/2+.38,0xdedede);addCurb(trackWidth/2+.58,0xd84747);addCurb(-trackWidth/2-.38,0xdedede);addCurb(-trackWidth/2-.58,0xd84747);

// Start/finish line
const start=curve.getPointAt(0),st=curve.getTangentAt(0).normalize(),ss=new THREE.Vector3(-st.z,0,st.x).normalize();
for(let i=-5;i<6;i++){const tile=new THREE.Mesh(new THREE.BoxGeometry(.7,.025,.65),mat(i%2?0x111111:0xf5f5f5));tile.position.copy(start).addScaledVector(ss,i*.65);tile.position.y=.06;world.add(tile)}

// Simple low-poly bike placeholder: deliberately light for low-end hardware.
const bike=new THREE.Group();
const body=new THREE.Mesh(new THREE.BoxGeometry(.55,.34,1.45),bikeMat);body.position.y=.72;bike.add(body);
const tank=new THREE.Mesh(new THREE.BoxGeometry(.62,.28,.62),bikeMat);tank.position.set(0,.91,-.05);bike.add(tank);
const seat=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.55),darkMat);seat.position.set(0,.98,.43);bike.add(seat);
const wheelGeo=new THREE.CylinderGeometry(.25,.25,.12,16);
function wheel(z){const w=new THREE.Mesh(wheelGeo,darkMat);w.rotation.z=Math.PI/2;w.position.set(0,.34,z);bike.add(w)}
wheel(-.57);wheel(.62);
const screen=new THREE.Mesh(new THREE.BoxGeometry(.35,.12,.18),whiteMat);screen.position.set(0,1.08,-.45);screen.rotation.x=-.3;bike.add(screen);
bike.scale.setScalar(.9);
world.add(bike);

const shadow=new THREE.Mesh(new THREE.CircleGeometry(.75,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.3}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.08;world.add(shadow);

// State
let running=false,elapsed=0,progress=0,lap=1,speed=0,targetLean=0,lean=0,throttle=false,braking=false,tiltEnabled=false,tiltValue=0,crashed=false;
const MAX_LEAN=48;

const $=id=>document.getElementById(id);
function fmt(s){const m=Math.floor(s/60),sec=(s%60).toFixed(2).padStart(5,"0");return String(m).padStart(2,"0")+":"+sec}
function reset(){running=true;crashed=false;elapsed=0;progress=.0;lap=1;speed=0;targetLean=0;lean=0;tiltValue=0;$("menu").classList.add("hidden");$("crash").classList.add("hidden");$("finish").classList.add("hidden")}
function crash(){running=false;crashed=true;$("crash").classList.remove("hidden");$("crashText").textContent="Lean angle exceeded available grip. Smooth the bike through the corner."}
function finish(){running=false;$("finish").classList.remove("hidden");$("finishText").textContent="Race time: "+fmt(elapsed)}
function updateBike(dt){
 const p=curve.getPointAt(progress%1),tan=curve.getTangentAt(progress%1).normalize();
 const ahead=curve.getPointAt((progress+.004)%1),t2=curve.getTangentAt((progress+.004)%1).normalize();
 const turn=tan.clone().cross(t2).y;
 const corner=Math.min(1,Math.abs(turn)*28);
 const desired=tiltEnabled?tiltValue:targetLean;
 targetLean=THREE.MathUtils.clamp(desired,-52,52);
 lean=THREE.MathUtils.damp(lean,targetLean,8,dt);
 const acceleration=throttle?24:7;
 const brakingForce=braking?38:0;
 speed+= (acceleration-brakingForce-speed*.55)*dt;
 speed=THREE.MathUtils.clamp(speed,0,58);
 if(!throttle&&speed<4)speed=4;
 const gripLimit=MAX_LEAN-(corner*9);
 if(Math.abs(lean)>gripLimit){crash();return}
 progress+=(speed/210)*dt;
 if(progress>=1){progress-=1;lap++;if(lap>3){finish();return}}
 const yaw=Math.atan2(tan.x,tan.z);
 bike.position.copy(p);bike.position.y=.02;
 bike.rotation.set(0,yaw,THREE.MathUtils.degToRad(-lean*.7));
 shadow.position.set(p.x,.08,p.z);
 // camera follows from behind
 const camPos=p.clone().addScaledVector(tan,-7.8);camPos.y=4.1;
 camera.position.lerp(camPos,1-Math.pow(.001,dt));
 const look=p.clone().addScaledVector(tan,4);look.y=1.0;
 camera.lookAt(look);
 $("speed").textContent=Math.round(speed*3.6);
 $("lean").textContent=Math.round(lean)+"°";
 $("lap").textContent=Math.min(lap,3)+" / 3";
 $("time").textContent=fmt(elapsed);
}

function loop(t){requestAnimationFrame(loop);const dt=Math.min(.04,(t-(loop.last||t))/1000);loop.last=t;if(running){elapsed+=dt;updateBike(dt)}renderer.render(scene,camera)}
requestAnimationFrame(loop);

function steer(clientX){const n=clientX/innerWidth;targetLean=(n-.5)*78}
renderer.domElement.addEventListener("pointerdown",e=>{if(running)steer(e.clientX)});
renderer.domElement.addEventListener("pointermove",e=>{if(running&&e.buttons)steer(e.clientX)});

$("throttle").addEventListener("pointerdown",()=>throttle=true);
["pointerup","pointercancel","pointerleave"].forEach(e=>$("throttle").addEventListener(e,()=>throttle=false));
$("brake").addEventListener("pointerdown",()=>braking=true);
["pointerup","pointercancel","pointerleave"].forEach(e=>$("brake").addEventListener(e,()=>braking=false));

window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")targetLean=-38;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")targetLean=38;if(e.key==="ArrowUp"||e.key.toLowerCase()==="w")throttle=true;if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")braking=true});
window.addEventListener("keyup",e=>{if(["ArrowLeft","ArrowRight","a","d"].includes(e.key))targetLean=0;if(["ArrowUp","ArrowDown","w","s"].includes(e.key))throttle=false;if(["ArrowDown","s"].includes(e.key))braking=false});

$("sensor").addEventListener("click",async()=>{
 if(!window.DeviceOrientationEvent){$("status").textContent="MOTION SENSOR NOT AVAILABLE";return}
 try{if(typeof DeviceOrientationEvent.requestPermission==="function"){const p=await DeviceOrientationEvent.requestPermission();if(p!=="granted")return}
  tiltEnabled=true;$("status").textContent="TILT MODE ACTIVE";
 }catch(e){$("status").textContent="TILT PERMISSION UNAVAILABLE"}
});
window.addEventListener("deviceorientation",e=>{if(tiltEnabled){const g=e.gamma||0;tiltValue=THREE.MathUtils.clamp(g*1.35,-48,48)}});

$("start").onclick=reset;$("restart").onclick=reset;$("finishRestart").onclick=reset;
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))});

// Initial camera
const p0=curve.getPointAt(0),t0=curve.getTangentAt(0).normalize();camera.position.copy(p0).addScaledVector(t0,-8);camera.position.y=4.1;camera.lookAt(p0);
