import { Color, useFrame } from "@react-three/fiber";
import { Euler, MathUtils, Vector3 } from "three";
import { useEffect, useState, useRef, useMemo } from "react";
import { getRamdomComment } from "../utils/comments";
import { Box, Html } from "@react-three/drei";
import { radians } from "../utils";
import { BlinkingParkingSlot } from "./BlinkingParking";
import { GradientPlane } from "./GradientPlane";

interface CarProps {
  color?: Color;
  position?: Vector3;
  size?: [number, number, number];
  searching?: boolean;
  comment?: boolean;
  trail?: boolean;
  forward?: boolean;
}

export const Car: React.FC<CarProps> = ({
  // Remove the default color so every car gets a random color
  color,
  position = new Vector3(0, 0, 0),
  forward = true,
  trail = true,
  searching = false,
  comment = false,
  size,
}) => {
  const [vehicleSize, setVehicleSize] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  useEffect(() => {
    const newSize =
      size || [
        MathUtils.randFloat(1.9, 2.3), // width
        MathUtils.randFloat(0.3, 0.5), // height
        MathUtils.randFloat(4, 5.6), // length
      ];
    setVehicleSize(newSize);
  }, [size]);

  const [randomComment, setRandomComment] = useState(() =>
    getRamdomComment()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRandomComment(getRamdomComment());
    }, 16000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Generate a random color for each Car instance
  const getRandomColor = (): string =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  const carColor = useMemo(() => getRandomColor(), []);

  // Create a ref for the group to apply the bobbing animation
  const carGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (carGroupRef.current) {
      // Bobbing effect: adjust frequency and amplitude as desired
      const bobbing = Math.sin(clock.elapsedTime * 3) * 0.2;
      carGroupRef.current.position.y = position.y + bobbing;
    }
  });

  // Destructure vehicle size for easy reference
  const [width, height, length] = vehicleSize;
  // Define cabin detail dimensions (adjust as needed)
  const cabinWidth = width * 0.8;
  const cabinHeight = height * 0.6;
  const cabinLength = length * 0.3;

  return (
    <>
      <group ref={carGroupRef} position={position}>
        {/* Main Car Body */}
        <Box
          position={[0, height / 2, 0]}
          rotation={[radians(0), radians(90), 0]}
          args={vehicleSize}
        >
          <meshStandardMaterial
            attach="material"
            color={carColor}
            metalness={0.5}
            roughness={0.4}
          />
        </Box>
        {/* Cabin Detail */}
        <Box
          position={[0, height + cabinHeight / 2, 0]}
          args={[cabinWidth, cabinHeight, cabinLength]}
        >
          <meshStandardMaterial
            attach="material"
            color="#ffffff"
            metalness={0.2}
            roughness={0.5}
          />
        </Box>
      </group>

      {searching && <BlinkingParkingSlot position={[0, 2, 0]} />}

      {comment && (
        <Html
          position={[0, 10, 0]}
          center
          style={{ maxWidth: "30rem", width: "100%" }}
          transform={false}
        >
          <div
            style={{
              color: "#aaa",
              fontSize: ".75rem",
              outline: 1,
              outlineColor: "black",
              maxWidth: "30rem",
              width: "100%",
              whiteSpace: "pre",
              userSelect: "none",
            }}
          >
            {randomComment}
          </div>
        </Html>
      )}

      {trail &&
        (forward ? (
          <GradientPlane
            position={new Vector3(vehicleSize[2] / 1.3, -0.02, position.z)}
            size={[3, 2]}
          />
        ) : (
          <GradientPlane
            rotation={new Euler(radians(-90), radians(0), radians(180))}
            position={new Vector3(-(vehicleSize[2] / 1.3), -0.02, position.z)}
            size={[3, vehicleSize[0]]}
          />
        ))}
    </>
  );
};
;
