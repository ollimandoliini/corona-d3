import React from "react";
import {
  geoPath,
  geoCentroid,
  geoMercator,
  ExtendedFeatureCollection,
  ExtendedFeature,
} from "d3-geo";
import { MultiPolygon, Polygon } from "geojson";

import { CoronaData } from "../types";

const geoJsonData = require("../districts_geo.json") as ExtendedFeatureCollection<
  ExtendedFeature<MultiPolygon | Polygon>
>;

interface MapProps {
  data: CoronaData | null;
  district: string | null;
  setDistrict: React.Dispatch<React.SetStateAction<string | null>>;
}

const Map = ({ data, district, setDistrict }: MapProps) => {
  const height = 800;
  const width = height / 2;

  const center = geoCentroid(geoJsonData);
  const projection = geoMercator()
    .center(center)
    .fitSize([width, height], geoJsonData);

  const path = geoPath().projection(projection);

  const numberOfConfirmed = (data: CoronaData, district: string) =>
    data.confirmed.filter((a) => a.healthCareDistrict === district).length;

  const color = (num: number) => {
    if (num === 0) {
      return "rgba(255, 0, 0, 0)";
    }
    const alpha = Math.log2(num) / 10;
    return `rgba(255, 0, 0, ${alpha})`;
  };

  if (!data) {
    return null;
  }

  return (
    <div className="map">
      <svg className="d3-map" viewBox={`0 0 ${width} ${height}`}>
        {geoJsonData.features.map((d, i) => (
          <path
            key={`path-${i}`}
            d={path(d) as string | undefined}
            className=""
            stroke="#FFFFFF"
            fill={color(numberOfConfirmed(data, d?.properties?.district))}
            strokeWidth={0.5}
          />
        ))}
        {geoJsonData.features.map((d, i) => (
          <text transform={`translate(${path.centroid(d)})`} key={i}>
            {numberOfConfirmed(data, d?.properties?.district)}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default Map;
