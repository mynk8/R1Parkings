import { Plane } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { radians } from "../utils";

export const RoadStripes = () => {
  const groupRef = useRef<THREE.Group>(null);
  const speed = 30; // Speed at which stripes move (units per second)
  const stripeLength = 40;
  const gap = 30;
  const totalStripeSpace = stripeLength + gap;

  // Animate the group's x position to create a moving effect in the reverse direction.
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x += speed * delta;
      // Loop the offset when it exceeds the space of one stripe+gap.
      if (groupRef.current.position.x > totalStripeSpace) {
        groupRef.current.position.x -= totalStripeSpace;
      }
    }
  });

  // Calculate how many stripes are needed to cover the entire road width.
  const roadWidth = 1000;
  const stripeCount = Math.ceil(roadWidth / totalStripeSpace) + 2;
  const startX = -roadWidth / 2 - totalStripeSpace;

  return (
    <group ref={groupRef}>
      {Array.from({ length: stripeCount }).map((_, i) => {
        const xPos = startX + i * totalStripeSpace;
        return (
          <Plane
            key={i}
            args={[stripeLength, 2]} // Stripe width and height
            position={[xPos, -0.19, 0]} // Slightly above the road (road at y = -0.2)
            rotation={[radians(-90), 0, 0]}
          >
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
        );
      })}
    </group>
  );
};

export default RoadStripes;

