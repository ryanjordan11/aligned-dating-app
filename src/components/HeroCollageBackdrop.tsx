"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo } from "react";
import { Heart, Star, X } from "lucide-react";
import { profiles } from "@/data/profiles";

type HeroCollageBackdropProps = {
  topClassName?: string;
  sizePx?: number;
};

const CardTile = ({
  src,
  name,
  age,
  style,
}: {
  src: string;
  name: string;
  age: number;
  style: React.CSSProperties;
}) => {
  return (
    <div
      className="absolute w-[220px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
      style={style}
    >
      <div className="relative h-[280px] w-full">
        <img src={src} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="text-sm font-semibold">
            {name} <span className="font-normal">{age}</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-sky-400 ring-2 ring-white/80" />
        </div>
      </div>
      <div className="flex items-center justify-around px-3 py-3 text-black/70">
        <X className="h-5 w-5" />
        <Star className="h-5 w-5" />
        <Heart className="h-5 w-5 text-rose-500" />
      </div>
    </div>
  );
};

const HeroCollageBackdrop = ({
  topClassName = "top-[44%] sm:top-1/2",
  sizePx = 1200,
}: HeroCollageBackdropProps) => {
  const tiles = useMemo(() => {
    const sources = profiles.length ? profiles : [];
    const repeated = Array.from({ length: 18 }, (_, index) => sources[index % sources.length]).map(
      (profile, index) => ({
        key: `${profile.id}-${index}`,
        src: profile.image,
        name: profile.name,
        age: profile.age,
        index,
      }),
    );

    const positions = [
      { x: -420, y: -120, r: -18 },
      { x: -160, y: -160, r: 12 },
      { x: 120, y: -190, r: -8 },
      { x: 390, y: -150, r: 16 },
      { x: -520, y: 190, r: 10 },
      { x: -250, y: 170, r: -14 },
      { x: 40, y: 190, r: 8 },
      { x: 310, y: 190, r: -10 },
      { x: 570, y: 160, r: 14 },
      { x: -470, y: 520, r: -8 },
      { x: -190, y: 520, r: 10 },
      { x: 80, y: 520, r: -14 },
      { x: 350, y: 520, r: 10 },
      { x: 620, y: 520, r: -10 },
      { x: -80, y: -410, r: -12 },
      { x: 560, y: -420, r: 10 },
      { x: -560, y: -410, r: 10 },
      { x: 260, y: -430, r: -16 },
    ];

    return repeated.map((tile, index) => {
      const pos = positions[index % positions.length];
      return {
        ...tile,
        style: {
          transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`,
        } as React.CSSProperties,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black" />
      <div
        className={`absolute left-1/2 ${topClassName} -translate-x-1/2 -translate-y-1/2`}
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          transform: "translate(-50%, -50%) rotate(-18deg)",
        }}
      >
        {tiles.map((tile) => (
          <CardTile key={tile.key} src={tile.src} name={tile.name} age={tile.age} style={tile.style} />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.10),_transparent_45%)]" />
    </div>
  );
};

export default HeroCollageBackdrop;
