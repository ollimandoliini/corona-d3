import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { default as geoJson } from "./sairaanhoitopiirit_geo.json";
import { geoPath, geoCentroid, geoMercator } from "d3-geo";
import _ from "lodash";
import * as d3 from "d3";

const height = 800;
const width = height / 2;

const apiUrl =
  "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";
const center = geoCentroid(geoJson);
const projection = geoMercator()
  .center(center)
  .fitSize([width, height], geoJson);

const path = geoPath().projection(projection);

const Map1 = () => {
  return (
    <div className="map">
      <svg width={width} height={height}>
        <g className="countries">
          {geoJson.features.map((d, i) => (
            <path
              key={`path-${i}`}
              d={geoPath().projection(projection)(d.geometry)}
              className="district"
              fill={"rgb(38,50,56)"}
              stroke="#FFFFFF"
              strokeWidth={0.5}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

const Map2 = ({ data }) => {
  const d3Map = useRef(null);

  const numberOfConfirmed = (data, district) =>
    data.confirmed.filter(a => a.healthCareDistrict === district).length;

  const color = num => {
    if (num === 0) {
      return "rgba(255, 0, 0,0)";
    }
    const alpha = Math.log2(num) / 10;
    return `rgba(255, 0, 0, ${alpha})`;
  };

  useEffect(() => {
    if (data?.confirmed && d3Map.current) {
      console.log(data);

      const svg = d3
        .select(d3Map.current)
        .attr("width", width)
        .attr("height", height);
      svg
        .selectAll(".districts")
        .data(geoJson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "districts")
        .style("fill", d =>
          color(numberOfConfirmed(data, d.properties.district))
        )
        .attr("stroke", "#000000");
      svg
        .selectAll(".labels")
        .data(geoJson.features)
        .enter()
        .append("text")
        .attr("class", "count")
        .attr("transform", d => "translate(" + path.centroid(d) + ")")
        .text(d => numberOfConfirmed(data, d.properties.district))
        .style("fill", "black");
    }
  }, [data]);

  return <svg className="d3-map" width={400} height={200} ref={d3Map} />;
};

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(apiUrl);
      const json = await result.json();
      setData(json);
    })();
  }, []);

  return (
    <div className="App">
      {/* <Map1 /> */}
      <Map2 data={data} />
    </div>
  );
}

export default App;
