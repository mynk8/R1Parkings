import React from "react";

function ParkingLot() {
  return (
    <>
      {/* Parking Lot Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#999" />
      </mesh>

      {/* Parked Cars */}
      <mesh position={[-20, 1, -10]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[20, 1, 10]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[10, 1, -20]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    </>
  );
}

export { ParkingLot };
