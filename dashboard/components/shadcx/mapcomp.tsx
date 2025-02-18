"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Profile {
  id: number;
  name: string;
  status: string;
  coordinates: [number, number];
}

interface MapComponentProps {
  profiles: Profile[];
}

const MapComponent: React.FC<MapComponentProps> = ({ profiles }) => {
  // Center the map on the first profile (fallback if no profiles)
  const center =
    profiles.length > 0 ? profiles[0].coordinates : [51.505, -0.09];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {profiles.map((profile) => (
        <Marker key={profile.id} position={profile.coordinates}>
          <Popup>
            <strong>{profile.name}</strong>
            <br />
            Status: {profile.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
