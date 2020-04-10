import React, { useRef, useEffect } from "react";
import { CoronaData, Confirmed, Recovered, Death } from "../types";
import * as d3 from "d3";

interface ChartProps {
  data: CoronaData | null;
}

const getDaysBetween = (start: Date, end: Date) => {
  for (var arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
};

const getDataForDate = (data: CoronaData, date: Date) => {
  const confirmed = data.confirmed.filter(
    (d) => dateFloor(new Date(d.date)) <= dateFloor(date)
  );
  const recovered = data.recovered.filter(
    (d) => dateFloor(new Date(d.date)) <= dateFloor(date)
  );
  const deaths = data.deaths.filter(
    (d) => dateFloor(new Date(d.date)) <= dateFloor(date)
  );

  return { confirmed, recovered, deaths };
};

const xLabel = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth();
  return day + "." + month + ".";
};

const dateFloor = (d: Date) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

interface DayData {
  date: Date;
  cases: { confirmed: Confirmed[]; recovered: Recovered[]; deaths: Death[] };
}

const Chart = ({ data }: ChartProps) => {
  const d3Chart = useRef(null);

  useEffect(() => {
    if (data && d3Chart.current) {
      const margin = { top: 10, right: 30, bottom: 30, left: 60 };
      const width = 600 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;
      const { confirmed, recovered, deaths } = data;
      const combined = [...confirmed, ...recovered, ...deaths];
      const dates = combined.map((e) => new Date(e.date)).sort();

      const firstDate = dates.reduce((a, b) => {
        return a < b ? a : b;
      });
      const lastDate = dates.reduce((a, b) => {
        return a > b ? a : b;
      });

      const days = getDaysBetween(firstDate, lastDate).map((a) => ({
        date: a,
        cases: getDataForDate(data, a),
      }));

      const svg = d3
        .select(d3Chart.current)
        .attr(
          "viewBox",
          `0 0 ${width + margin.left + margin.right} ${
            height + margin.top + margin.bottom
          }`
        )
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      let [start, end] = d3.extent(days.map((a) => a.date)) as [Date, Date];

      end = new Date(end.setDate(end.getDate() + 1));

      const x = d3.scaleTime().range([0, width]).domain([start, end]);

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .tickFormat(
              xLabel as (dv: Date | { valueOf(): number }, i: number) => string
            )
        );
      var y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(days, (d: DayData) => d.cases.confirmed.length) as number,
        ])
        .range([height, 0]);

      svg.append("g").call(d3.axisLeft(y));

      svg
        .append("path")
        .datum(days)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x((d: any) => x(d.date))
            .y((d: any) => y(d.cases.confirmed.length)) as any
        );
    }
  }, [data]);
  if (!data) {
    return null;
  }

  return (
    <div className="chart-container">
      <svg className="d3-chart" ref={d3Chart} />
    </div>
  );
};

export default Chart;
