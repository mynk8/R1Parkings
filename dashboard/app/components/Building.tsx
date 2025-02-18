
import { FLOOR_HEIGHT } from "../constants/constants";
import { Square, SquareProps } from "./Square";

interface BuildingProps extends SquareProps {
  floors?: number;
}

export const Building = ({ position, size, floors = 1 }: BuildingProps) => {
  return (
    <>
      {Array.from({ length: floors }, (_, index) => (
        <Square
          key={index}
          position={[
            position[0],
            position[1] + index * FLOOR_HEIGHT,
            position[2],
          ]}
          size={size}
          borderColor="white"
        />
      ))}
    </>
  );
};

