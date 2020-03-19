import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import _ from "lodash";
import * as d3 from "d3";
import polylabel from "polylabel";
import {
  geoPath,
  geoCentroid,
  geoMercator,
  ExtendedFeatureCollection,
  ExtendedFeature
} from "d3-geo";
import { MultiPolygon, Polygon } from "geojson";

const geoJson = require("./sairaanhoitopiirit_geo.json") as ExtendedFeatureCollection<
  ExtendedFeature<MultiPolygon | Polygon>
>;

const height = 800;
const width = height / 2;

const apiUrl =
  "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData";

const center = geoCentroid(geoJson);
const projection = geoMercator()
  .center(center)
  .fitSize([width, height], geoJson);

const path = geoPath().projection(projection);

const Map2 = ({ data, setDistrict }: MapProps) => {
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
          color(numberOfConfirmed(data, d?.properties?.district))
        )
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.3)
        .on("click", d => setDistrict(d?.properties?.district));

      svg
        .selectAll(".labels")
        .data(geoJson.features)
        .enter()
        .append("text")
        .attr("class", "count")
        .style("fill", "black")
        .text("kissa")
        .attr("transform", d => "translate(" + path.centroid(d) + ")")
        .text(d => numberOfConfirmed(data, d?.properties?.district));
    }
  }, [data]);

  return (
    <div className="map">
      <svg className="d3-map" ref={d3Map} />
    </div>
  );
};

const Chart = ({ data }: DataProps) => {
  const d3Chart = useRef(null);

  if (data?.confirmed && d3Chart.current) {
    const margin = { top: 10, right: 30, bottom: 30, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const dates = data?.confirmed.map(a => ({
      ...a,
      date: Date.parse(a.date)
    }));

    // const getDaysArray = (start, end) => {
    //   const arr = [];
    //   for (let dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    //     arr.push(new Date(dt));
    //   }
    //   return arr;
    // };

    // const byDates = dates => {
    //   const firstDate = _.min(dates.map(a => a.date));
    //   const lastDate = _.max(dates.map(a => a.date));

    //   // console.log(getDaysArray(new Date(firstDate), new Date(lastDate)));
    // };
    // byDates(dates);

    // const svg = d3
    //   .select(d3Chart.current)
    //   .attr("width", width)
    //   .attr("height", height);
    // var x = d3
    //   .scaleTime()
    //   .domain(d3.extent(dates, d => d?.date))
    //   .range([0, width]);
    // svg
    //   .append("g")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x));

    // const y = d3
    //   .scaleLinear()
    //   .domain([
    //     0,
    //     d3.max(dates, function(d) {
    //       return +d.value;
    //     })
    //   ])
    //   .range([height, 0]);
    // svg.append("g").call(d3.axisLeft(y));
  }

  return (
    <div className="chart-container">
      <svg className="d3-chart" ref={d3Chart} />
    </div>
  );
};

interface DataProps {
  data: CoronaData | null;
}

interface MapProps {
  data: CoronaData | null;
  setDistrict: any;
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

interface StatsProps {
  data: CoronaData | null;
  district: string | null;
}

const Stats = ({ data, district }: StatsProps) => {
  if (!data) {
    return null;
  }

  const total =
    data.confirmed.length + data.recovered.length + data.deaths.length;

  let stats;

  if (!district) {
    stats = {
      confirmed: data.confirmed.length,
      recovered: data.recovered.length,
      deaths: data.deaths.length
    };
  } else {
    stats = {
      confirmed: data.confirmed.filter(a => a.healthCareDistrict === district)
        .length,
      recovered: data.recovered.filter(a => a.healthCareDistrict === district)
        .length,
      deaths: data.deaths.filter(a => a.healthCareDistrict === district).length
    };
  }

  return (
    <div>
      {district ? <h2>{district}</h2> : <h2>Koko Suomi</h2>}
      <table className="stats-table">
        <tbody>
          <tr>
            <td>Vahvistetut</td>
            <td>{stats.confirmed}</td>
          </tr>
          <tr>
            <td>Parantuneet</td>
            <td>{stats.recovered}</td>
          </tr>
          <tr>
            <td>Kuolleet</td>
            <td>{stats.deaths}</td>
          </tr>
          <tr>
            <td>Yhteensä</td>
            <td>{stats.confirmed + stats.recovered + stats.deaths}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

function App() {
  const [data, setData] = useState<CoronaData | null>(null);
  const [district, setDistrict] = useState<string | null>(null);

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
        <h1>COVID-19 Suomessa</h1>
        <Stats data={data} district={district} />
        {/* <Chart data={data} /> */}
      </div>
      <Map2 data={data} setDistrict={setDistrict} />
    </div>
  );
}

export default App;
