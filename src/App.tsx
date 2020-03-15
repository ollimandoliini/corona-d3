import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { default as geoJson } from "./sairaanhoitopiirit_geo.json";
import { geoPath, geoCentroid, geoMercator } from "d3-geo";
import _ from "lodash";
import * as d3 from "d3";
import polylabel from "polylabel";

const height = 800;
const width = height / 2;

const apiUrl =
  "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";

const center = geoCentroid(geoJson);
const projection = geoMercator()
  .center(center)
  .fitSize([width, height], geoJson);

const path = geoPath().projection(projection);

const Map2 = ({ data }: D3Props) => {
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
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.3);

      svg
        .selectAll(".labels")
        .data(geoJson.features)
        .enter()
        .append("text")
        .attr("class", "count")
        .attr("transform", d => {
          var coord = d.geometry.coordinates;
          if (d.geometry.type === "MultiPolygon") {
            var u = d3.scan(
              coord.map(function(p) {
                return -d3.polygonArea(p[0]);
              })
            );
            coord = coord[u];
          }
          var n = polylabel([coord[0].map(projection)]);
          return `translate(${n})`;
        })
        .text(d => numberOfConfirmed(data, d.properties.district))
        .style("fill", "black");
    }
  }, [data]);

  return (
    <div className="map">
      <svg className="d3-map" ref={d3Map} />
    </div>
  );
};

const Chart = ({ data }: D3Props) => {
  const d3Chart = useRef(null);

  if (data?.confirmed && d3Chart.current) {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const dates = data?.confirmed.map(a => ({
      ...a,
      date: Date.parse(a.date)
    }));

    const getDaysArray = (start, end) => {
      const arr = [];
      for (let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
      }
      return arr;
    };

    const byDates = dates => {
      const firstDate = _.min(dates.map(a => a.date));
      const lastDate = _.max(dates.map(a => a.date));

      // console.log(getDaysArray(new Date(firstDate), new Date(lastDate)));
    };
    byDates(dates);

    const svg = d3
      .select(d3Chart.current)
      .attr("width", width)
      .attr("height", height);
    var x = d3
      .scaleTime()
      .domain(
        d3.extent(dates, function(d) {
          return d.date;
        })
      )
      .range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dates, function(d) {
          return +d.value;
        })
      ])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));
  }

  return (
    <div className="chart-container">
      <svg className="d3-chart" ref={d3Chart} />
    </div>
  );
};

interface D3Props {
  data: CoronaData;
}

interface CoronaData {
  confirmed: Confirmed[];
  deaths: Death[];
  recovered: Recovered[];
}

interface Confirmed {
  id: string;
  date: string;
  healthCareDistrict: string;
  infectionSourceCountry: string;
  infectionSource: string;
}

type Death = Confirmed;

type Recovered = Omit<Confirmed, "infectionSourceCountry" | "infectionSource">;

// {"id":"1","date":"2020-01-29T11:00:00.000Z","healthCareDistrict":"Lappi","infectionSourceCountry":"CHN","infectionSource":"unknown"}

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
      <div className="main">
        <Chart data={data} />
      </div>
      <Map2 data={data} />
    </div>
  );
}

export default App;
