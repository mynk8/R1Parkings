"use client";

import { Card } from "./ui/card";
import { useState } from "react";
import { indexplaceAtom } from "@/lib/atom";
import { useSetAtom } from "jotai";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "./ui/select";
const mapData = [
  {
    place: "dlf-mall",
    url: "https://www.google.com/maps/embed/v1/search?q=DLF+Mall+of+India,+Sector+18,+Noida,+Uttar+Pradesh,+India&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
  },
  {
    place: "ambience-mall",
    url: "https://www.google.com/maps/embed/v1/place?q=Ambience+Mall,+Vasant+Kunj:+2,+Nelson+Mandela+Marg,+Ambience+Island,+Vasant+Kunj+II,+Vasant+Kunj,+New+Delhi,+Delhi+110070,+India&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8",
  },
  // ... more map data objects
];

export function Overview() {
  const [currentPlace, setCurrentPlace] = useState(mapData[0]);
  const setPlaceAtom = useSetAtom(indexplaceAtom);
  return (
    <Card className="flex-grow h-full flex flex-col">
      <Select
        value={currentPlace.place}
        onValueChange={(value) => {
          const selected = mapData.find((item) => item.place === value);
          if (selected) {
            setCurrentPlace(selected);
            setPlaceAtom(() => currentPlace.place);
          }
        }}
      >
        <SelectTrigger className="p-2 m-1 border rounded">
          <SelectValue placeholder="Select Location" />
        </SelectTrigger>
        <SelectContent>
          {mapData.map((item) => (
            <SelectItem key={item.place} value={item.place}>
              {item.place}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <iframe
        className="w-full flex-grow"
        src={currentPlace.url}
        style={{ border: 0 }}
        title={currentPlace.place}
      ></iframe>
    </Card>
  );
}
