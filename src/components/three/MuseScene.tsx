import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollTimeline } from './timeline';

type WaterShader = { uniforms: Record<string, { value: unknown }>; vertexShader: string };
const smooth = THREE.MathUtils.smoothstep;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function Architecture() {
  const entranceLeft = useRef<THREE.Mesh>(null), entranceRight = useRef<THREE.Mesh>(null), entranceHeader = useRef<THREE.Mesh>(null);
  const innerLeft = useRef<THREE.Mesh>(null), innerRight = useRef<THREE.Mesh>(null);
  const lakeLeft = useRef<THREE.Mesh>(null), lakeRight = useRef<THREE.Mesh>(null);
  const building = useRef<THREE.Group>(null), furniture = useRef<THREE.Group>(null), lake = useRef<THREE.Mesh>(null);
  const sun = useRef<THREE.DirectionalLight>(null), ambient = useRef<THREE.AmbientLight>(null), interior = useRef<THREE.PointLight>(null);
  const facade = useRef<THREE.MeshStandardMaterial>(null);
  const waterShader = useRef<WaterShader | null>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 760px)');
  const dayStone = useMemo(() => new THREE.Color('#a49c8d'), []), eveningStone = useMemo(() => new THREE.Color('#706b61'), []);
  const dayFog = useMemo(() => new THREE.Color('#c5bdaf'), []), eveningFog = useMemo(() => new THREE.Color('#77756d'), []);
  const daySun = useMemo(() => new THREE.Color('#e7d7bd'), []);
  const eveningSun = useMemo(() => new THREE.Color('#d29d70'), []);

  useFrame(({ clock, scene }) => {
    const p = reduced ? 1 : scrollTimeline.current;
    const time = clock.elapsedTime;
    const arrival = smooth(p, .035, .34);
    const exploration = smooth(p, .31, .58);
    const lakeReveal = smooth(p, .69, .92);
    const openingX = 1.325 + arrival * 3.1;
    const openingY = 1 + arrival * 3.9;

    if (entranceLeft.current) entranceLeft.current.position.x = -openingX;
    if (entranceRight.current) entranceRight.current.position.x = openingX;
    if (entranceHeader.current) entranceHeader.current.position.y = openingY;
    if (innerLeft.current) innerLeft.current.position.x = -(1.1 + exploration * 1.8);
    if (innerRight.current) innerRight.current.position.x = 1.1 + exploration * 1.8;
    if (lakeLeft.current) lakeLeft.current.position.x = -(1.45 + lakeReveal * 3.0);
    if (lakeRight.current) lakeRight.current.position.x = 1.45 + lakeReveal * 3.0;

    const entryDepth = smooth(p, .12, .56);
    if (building.current) {
      building.current.position.z = -6 + entryDepth * .45;
      building.current.scale.setScalar(1 + smooth(p,.79,1)*.035);
    }
    if (furniture.current) {
      furniture.current.position.y = -.45 + exploration * .45;
      furniture.current.scale.setScalar(.78 + exploration * .22);
    }
    if (!reduced && lake.current) lake.current.position.y = -1.4 + Math.sin(time * .42) * .035;
    if (!reduced && waterShader.current?.uniforms.uTime) waterShader.current.uniforms.uTime.value = time;

    const dusk = smooth(p,.48,.69) * (1 - smooth(p,.76,.96));
    const openDaylight = smooth(p,.73,.99);
    if (sun.current) {
      sun.current.intensity = THREE.MathUtils.lerp(2.45,1.25, dusk) + openDaylight*.35;
      sun.current.position.set(-7 + dusk*9 - openDaylight*3, 10 - dusk*5 + openDaylight*2, 4 - dusk*4);
      sun.current.color.copy(daySun).lerp(eveningSun,dusk);
    }
    if (ambient.current) ambient.current.intensity = THREE.MathUtils.lerp(.9,.55,dusk) + openDaylight*.22;
    if (interior.current) interior.current.intensity = .15 + smooth(p,.31,.62)*2.4 - openDaylight*.95;
    if (facade.current) facade.current.color.copy(dayStone).lerp(eveningStone,dusk*.34);
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(dayFog).lerp(eveningFog,dusk*.7).lerp(dayFog,openDaylight*.45);
    // Keep the same house recognizable as the light changes; only the light and stone response shift.
  });

  const divisions = mobile ? [90,40,32,12] : [90,40,64,24];
  const plantSegments = mobile ? 10 : 16;
  return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.7,-7]} receiveShadow><planeGeometry args={[70,70]}/><meshStandardMaterial color="#a99e8d" roughness={.94}/></mesh>
    <mesh ref={lake} rotation={[-Math.PI/2,0,0]} position={[0,-1.4,-22]}><planeGeometry args={divisions as [number,number,number,number]}/><meshStandardMaterial color="#526f70" roughness={.3} metalness={.12} transparent opacity={.94} onBeforeCompile={shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x * 0.45 + uTime) * 0.045 + cos(position.y * 0.6 + uTime * 0.7) * 0.035;');shader.uniforms.uTime={value:0};waterShader.current=shader;}}/></mesh>

    <group ref={building} position={[0,0,-6]}>
      <mesh position={[0,-1.35,-7]} castShadow receiveShadow><boxGeometry args={[15,.55,13]}/><meshStandardMaterial color="#8f897d" roughness={.87}/></mesh>
      <mesh position={[0,3.05,-12.7]} castShadow><boxGeometry args={[15,.28,12]}/><meshStandardMaterial color="#68675e" roughness={.9}/></mesh>
      <mesh position={[-7.25,.7,-8]} castShadow><boxGeometry args={[.5,4.4,11]}/><meshStandardMaterial color="#969083" roughness={.92}/></mesh>
      <mesh position={[7.25,.7,-8]} castShadow><boxGeometry args={[.5,4.4,11]}/><meshStandardMaterial color="#827e72" roughness={.92}/></mesh>
      <mesh position={[-3.9,.65,-12.1]} castShadow><boxGeometry args={[6.5,3.8,.55]}/><meshStandardMaterial ref={facade} color="#a49c8d" roughness={.9}/></mesh>
      <mesh position={[3.9,.65,-12.1]} castShadow><boxGeometry args={[6.5,3.8,.55]}/><meshStandardMaterial color="#a49c8d" roughness={.9}/></mesh>

      {/* Front threshold: three pieces move together as the camera advances. */}
      <mesh ref={entranceLeft} position={[-1.325,.8,-11.6]} castShadow><boxGeometry args={[2.65,4.1,.38]}/><meshStandardMaterial color="#746f64" roughness={.83}/></mesh>
      <mesh ref={entranceRight} position={[1.325,.8,-11.6]} castShadow><boxGeometry args={[2.65,4.1,.38]}/><meshStandardMaterial color="#8a8377" roughness={.83}/></mesh>
      <mesh ref={entranceHeader} position={[0,1,-11.55]} castShadow><boxGeometry args={[5.4,3.1,.35]}/><meshStandardMaterial color="#a09889" roughness={.88}/></mesh>

      {/* An inner sliding partition reveals the suite as the camera crosses the threshold. */}
      <mesh ref={innerLeft} position={[-1.1,.8,-7.4]} castShadow><boxGeometry args={[2.2,3.8,.28]}/><meshStandardMaterial color="#81796c" roughness={.86}/></mesh>
      <mesh ref={innerRight} position={[1.1,.8,-7.4]} castShadow><boxGeometry args={[2.2,3.8,.28]}/><meshStandardMaterial color="#988c7a" roughness={.86}/></mesh>

      {/* A second framed opening faces the lake and opens during the water passage. */}
      <mesh position={[-3.05,.7,-18.15]} castShadow><boxGeometry args={[.3,4.4,.35]}/><meshStandardMaterial color="#887f71" roughness={.88}/></mesh>
      <mesh position={[3.05,.7,-18.15]} castShadow><boxGeometry args={[.3,4.4,.35]}/><meshStandardMaterial color="#887f71" roughness={.88}/></mesh>
      <mesh position={[0,2.95,-18.15]} castShadow><boxGeometry args={[6.4,.3,.35]}/><meshStandardMaterial color="#716b61" roughness={.9}/></mesh>
      <mesh ref={lakeLeft} position={[-1.45,.75,-17.92]} castShadow><boxGeometry args={[2.9,4.1,.24]}/><meshStandardMaterial color="#8c8578" roughness={.88}/></mesh>
      <mesh ref={lakeRight} position={[1.45,.75,-17.92]} castShadow><boxGeometry args={[2.9,4.1,.24]}/><meshStandardMaterial color="#9b9283" roughness={.88}/></mesh>

      <group ref={furniture}>
        <mesh position={[0,-.1,-5.2]} castShadow><boxGeometry args={[2.8,.24,1.15]}/><meshStandardMaterial color="#5c5142" roughness={.58}/></mesh>
        <mesh position={[-2.8,-.05,-6.2]} castShadow><boxGeometry args={[1.5,.75,.75]}/><meshStandardMaterial color="#7d7567" roughness={.8}/></mesh>
        <mesh position={[2.8,-.05,-6.2]} castShadow><boxGeometry args={[1.5,.75,.75]}/><meshStandardMaterial color="#8a8274" roughness={.8}/></mesh>
        <mesh position={[-5.4,-.15,-5.8]}><cylinderGeometry args={[.8,.8,1.8,plantSegments]}/><meshStandardMaterial color="#697263" roughness={1}/></mesh>
        <mesh position={[5.5,-.2,-7.2]}><cylinderGeometry args={[1,1.05,1.9,plantSegments]}/><meshStandardMaterial color="#777d6d" roughness={1}/></mesh>
      </group>
      <mesh position={[0,-1.38,-19.35]} receiveShadow><boxGeometry args={[9,.16,2.4]}/><meshStandardMaterial color="#837c70" roughness={.8}/></mesh>
    </group>

    <mesh position={[0,8,-26]}><sphereGeometry args={[1.15,mobile?12:24,mobile?12:24]}/><meshBasicMaterial color="#e7d6b4"/></mesh>
    <ambientLight ref={ambient} intensity={.9}/>
    <directionalLight ref={sun} position={[-7,10,4]} intensity={2.45} color="#e7d7bd" castShadow shadow-mapSize={[mobile?512:1024,mobile?512:1024]}/>
    <pointLight ref={interior} position={[0,1,-10]} intensity={.15} distance={15} color="#d8b98d"/>
  </>;
}

function CameraRig() {
  const { camera } = useThree();
  const position = useRef(new THREE.Vector3(0,.1,9.5));
  const target = useRef(new THREE.Vector3(0,.3,-12));
  const look = useRef(new THREE.Vector3(0,.3,-12));
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 760px)');
  const path = useMemo(() => {
    const x = mobile ? .72 : 1;
    const positions = [
      [0,.1,9.5],[0,.1,6.2],[0,.12,1.1],[-.45,.2,-7.2],[.35,.35,-13.4],[.3,.4,-9.6],[0,.4,-12.4],[0,.45,-22.2],[0,.55,-25.2],
    ].map(([px,py,pz])=>new THREE.Vector3(px*x,py,pz));
    const looks = [
      [0,.2,-12.2],[0,.2,-12.5],[0,.25,-12.8],[0,.3,-14],[0,.35,-18],[0,.4,-20],[0,.5,-22],[0,.45,-8.5],[0,.55,-8.2],
    ].map(([px,py,pz])=>new THREE.Vector3(px*x,py,pz));
    return {
      position: new THREE.CatmullRomCurve3(positions,false,'centripetal'),
      target: new THREE.CatmullRomCurve3(looks,false,'centripetal'),
    };
  }, [mobile]);
  useFrame((_,delta) => {
    const p = reduced ? 1 : scrollTimeline.current;
    path.position.getPoint(p,position.current);
    path.target.getPoint(p,target.current);
    const settle = smooth(p,.88,1);
    const response = reduced ? 1 : THREE.MathUtils.lerp(3.2,1.05,settle);
    if (reduced) { camera.position.copy(position.current); camera.lookAt(target.current); return; }
    camera.position.x = THREE.MathUtils.damp(camera.position.x,position.current.x,response,delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y,position.current.y,response,delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z,position.current.z,response,delta);
    look.current.x = THREE.MathUtils.damp(look.current.x,target.current.x,response,delta);
    look.current.y = THREE.MathUtils.damp(look.current.y,target.current.y,response,delta);
    look.current.z = THREE.MathUtils.damp(look.current.z,target.current.z,response,delta);
    camera.lookAt(look.current);
  });
  return null;
}

function Visibility() {
  const { setFrameloop } = useThree();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    const sync = () => setFrameloop(document.visibilityState === 'visible' ? (reduced ? 'demand' : 'always') : 'never');
    sync(); document.addEventListener('visibilitychange',sync);
    return () => document.removeEventListener('visibilitychange',sync);
  },[reduced,setFrameloop]);
  return null;
}
function SceneContents() { return <><color attach="background" args={['#d0c7b8']}/><fog attach="fog" args={['#c5bdaf',20,52]}/><Architecture/><CameraRig/><Visibility/></>; }

export default function MuseScene() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 760px)');
  const available = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!context) return false;
      context.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch { return false; }
  }, []);
  if (!available) return <div className="scene-fallback" aria-hidden="true"/>;
  return <div className="scene-canvas" aria-hidden="true"><Suspense fallback={null}><Canvas frameloop={reduced?'demand':'always'} shadows dpr={mobile?1:[1,1.25]} camera={{position:[0,.1,9.5],fov:39}} gl={{antialias:false,powerPreference:'low-power',alpha:false}}><SceneContents/></Canvas></Suspense></div>;
}
