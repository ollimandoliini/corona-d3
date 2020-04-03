import React, { useRef, useEffect } from "react";
import {
  geoPath,
  geoCentroid,
  geoMercator,
  ExtendedFeatureCollection,
  ExtendedFeature
} from "d3-geo";
import { MultiPolygon, Polygon } from "geojson";
import * as d3 from "d3";

import { CoronaData } from "../types";

const geoJson = require("../districts_geo.json") as ExtendedFeatureCollection<
  ExtendedFeature<MultiPolygon | Polygon>
>;
const height = 800;
const width = height / 2;

const center = geoCentroid(geoJson);
const projection = geoMercator()
  .center(center)
  .fitSize([width, height], geoJson);

const path = geoPath().projection(projection);

interface MapProps {
  data: CoronaData | null;
  district: string | null;
  setDistrict: React.Dispatch<React.SetStateAction<string | null>>;
}

const Map = ({ data, district, setDistrict }: MapProps) => {
  const d3Map = useRef(null);
  const numberOfConfirmed = (data: CoronaData, district: string) =>
    data.confirmed.filter(a => a.healthCareDistrict === district).length;

  const color = (num: number) => {
    if (num === 0) {
      return "rgba(255, 0, 0, 0)";
    }
    const alpha = Math.log2(num) / 10;
    return `rgba(255, 0, 0, ${alpha})`;
  };

  useEffect(() => {
    if (data?.confirmed && d3Map.current) {
      const unknown = data?.confirmed.filter(
        a => a.healthCareDistrict === null || a.healthCareDistrict === ""
      ).length;

      const svg = d3
        .select(d3Map.current)
        .attr("viewBox", `0 0 ${width} ${height}`);

      svg
        .selectAll(".districts")
        .data(geoJson.features)
        .attr("stroke-width", d =>
          d?.properties?.district === district ? 1.5 : 0.3
        )
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "districts")
        .attr("stroke-width", 0.3)
        .attr("stroke", "#000000")
        .style("fill", d =>
          color(numberOfConfirmed(data, d?.properties?.district))
        )
        .on("click", d => {
          setDistrict(d?.properties?.district);
        });

      svg
        .selectAll(".labels")
        .data(geoJson.features)
        .enter()
        .append("text")
        .attr("class", "count")
        .style("fill", "black")
        .attr("transform", d => "translate(" + path.centroid(d) + ")")
        .text(d => numberOfConfirmed(data, d?.properties?.district));

      svg
        .append("text")
        .text(d => {
          return "SHP ei tiedossa: " + unknown;
        })
        .attr("x", 0)
        .attr("y", 400)
        .attr("fill", "black");
    }
  }, [data, district, setDistrict]);

  return (
    <div className="map">
      <svg className="d3-map" ref={d3Map} />
    </div>
  );
};

interface DataProps {
  data: CoronaData | null;
}

export default Map;
