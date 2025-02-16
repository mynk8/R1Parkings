import { useEffect, useState } from "react";
import { MathUtils } from "three";
import { BUILDING_SETS } from "../utils/BuildingSets";
import { radians } from "../utils";
import { Building } from "./Building";
import { FLOOR_HEIGHT } from "../constants/constants";

export const BuildingSet = ({
  minHeight = 2,
  maxHeight = 20,
}: {
  minHeight?: number;
  maxHeight?: number;
}) => {
  const [buildingSetIndex, setBuildingSetIndex] = useState<number>(0);

  useEffect(() => {
    setBuildingSetIndex(MathUtils.randInt(0, BUILDING_SETS.length - 1));
  }, []);

  return (
    <group>
      {BUILDING_SETS[buildingSetIndex].map(({ length, position, width }, i) => (
        <>
          <Building
            position={
              position.map((pos) => pos * 2) as [number, number, number]
            }
            size={[width * 2, length * 2]}
            floors={1} // Always one floor
          />
          {/* Add a translucent black plane that is the same size as the building footprint */}
          <mesh
            position={[
              position[0] * 2,
              FLOOR_HEIGHT * (1 - 1), // 0, since there's only one floor
              position[2] * 2,
            ]}
            rotation={[radians(-90), 0, 0]} // Rotate the plane to align with the ground
          >
            <planeGeometry args={[width * 2, length * 2]} />
            <meshBasicMaterial color={"black"} transparent opacity={0.6} />
          </mesh>
        </>
      ))}
    </group>
  );
};

