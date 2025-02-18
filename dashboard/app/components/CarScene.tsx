import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Plane } from "@react-three/drei";
import { radians } from "../utils";
import { Spawner } from "../components/Spawner";
import {
  WORLD_DURATION,
  WORLD_END,
  WORLD_START,
  roadColor,
} from "../constants/constants";
import * as THREE from "three";
import { Car } from "../components/Car";
import { BuildingSet } from "../components/BuildingSet";
import { RoadStripes } from "./RoadStripes";
// Import postprocessing effects
import { EffectComposer, HueSaturation, BrightnessContrast, Vignette } from '@react-three/postprocessing';

export const CarScene = ({
  children,
  camera,
  className = "h-[calc(100vh-2rem)]",
  orbitControls = true,
  hideAllComments = false,
}: {
  camera?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  orbitControls?: boolean;
  hideAllComments?: boolean;
}) => {
  return (
    <Canvas
      style={{
        background: "linear-gradient(to top right, #5a2dc2, #7a48e6)",
      }}
    >
      {camera || (
        <PerspectiveCamera
          makeDefault
          fov={45}
          near={0.5}
          far={500}
          position={[60, 60, 20]}
          rotation={[radians(60), 0, 0]}
        />
      )}

      {/* Add lighting */}
      <ambientLight intensity={0.7} color="#e0f7fa" />
      <directionalLight intensity={0.8} position={[10, 10, 5]} />

      {children}

      {orbitControls ? (
        <OrbitControls
          minPolarAngle={radians(0)}
          maxPolarAngle={radians(30)}
          minDistance={30}
          maxDistance={180}
        />
      ) : null}

      {/* Road */}
      <group>
        {/* Road base */}
        <Plane
          args={[1000, 24]}
          position={[0, -0.2, 0]}
          rotation={[radians(-90), 0, 0]}
        >
          {/* Use meshBasicMaterial if you want the road color unchanged by lighting */}
          <meshBasicMaterial color={roadColor} />
        </Plane>

        {/* Moving road stripes */}
        <RoadStripes />
      </group>

      {/* Cars */}
      <Spawner
        spawnInterval={8.2}
        duration={WORLD_DURATION - 6}
        startPosition={new THREE.Vector3(WORLD_START, 0, -10)}
        endPosition={new THREE.Vector3(WORLD_END, 0, -10)}
      >
        <Car forward={false} searching comment={!hideAllComments && true} />
      </Spawner>
      <Spawner
        spawnInterval={4.3}
        duration={WORLD_DURATION - 12}
        startPosition={new THREE.Vector3(WORLD_START, 0, -6)}
        endPosition={new THREE.Vector3(WORLD_END, 0, -6)}
      >
        <Car forward={false} />
      </Spawner>
      <Spawner
        spawnInterval={7.4}
        duration={WORLD_DURATION - 18}
        startPosition={new THREE.Vector3(WORLD_START, 0, -2)}
        endPosition={new THREE.Vector3(WORLD_END, 0, -2)}
      >
        <Car forward={false} />
      </Spawner>
      <Spawner
        spawnInterval={9.8}
        duration={WORLD_DURATION - 18}
        endPosition={new THREE.Vector3(WORLD_START, 0, 2)}
        startPosition={new THREE.Vector3(WORLD_END, 0, 2)}
      >
        <Car />
      </Spawner>
      <Spawner
        spawnInterval={7}
        duration={WORLD_DURATION - 12}
        endPosition={new THREE.Vector3(WORLD_START, 0, 6)}
        startPosition={new THREE.Vector3(WORLD_END, 0, 6)}
      >
        <Car />
      </Spawner>
      {/* My Car */}
      <group position={new THREE.Vector3(0, 0, 10)}>
        <Car searching comment={!hideAllComments && true} />
      </group>

      {/* Buildings Left */}
      <Spawner
        spawnInterval={3.6}
        duration={WORLD_DURATION}
        startPosition={new THREE.Vector3(WORLD_START, 0, 76)}
        endPosition={new THREE.Vector3(WORLD_END, 0, 76)}
      >
        <BuildingSet />
      </Spawner>
      {/* Buildings Right */}
      <Spawner
        spawnInterval={3.6}
        duration={WORLD_DURATION}
        startPosition={new THREE.Vector3(WORLD_START, 0, -76)}
        endPosition={new THREE.Vector3(WORLD_END, 0, -76)}
      >
        <BuildingSet />
      </Spawner>

      {/* Postprocessing effects for a yellowish murky filter */}
      <EffectComposer>
        {/* Shift hue slightly to yellow and reduce saturation */}
        <HueSaturation hue={0.1} saturation={-0.2} />
        {/* Darken overall brightness a bit and add contrast */}
        <BrightnessContrast brightness={-0.1} contrast={0.2} />
        {/* Optionally add a vignette for mood */}
        <Vignette eskil={true} offset={0.3} darkness={0.8} />
      </EffectComposer>
    </Canvas>
  );
};
