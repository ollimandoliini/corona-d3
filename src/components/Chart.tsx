import React from "react";
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

const confirmedOnDate = (data: CoronaData, date: Date) => {
  return data.confirmed.filter(
    (d) => dateFloor(new Date(d.date)) <= dateFloor(date)
  );
};

const SvgPath = ({
  coordinates,
  translate,
}: {
  coordinates: number[][];
  translate: [number, number];
}): JSX.Element => {
  const [startX, startY] = coordinates[0];
  const lines = coordinates
    .slice(1)
    .map(([x, y]) => {
      return `L${x},${y}`;
    })
    .join();

  return (
    <path
      d={`M${startX},${startY}${lines}`}
      fill="none"
      strokeWidth="2"
      stroke="red"
      transform={translate ? `translate(${translate[0]}, ${translate[1]})` : ""}
    />
  );
};

const xLabel = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return day + "." + month + ".";
};

const dateFloor = (d: Date) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

interface DayData {
  date: Date;
  cases: { confirmed: Confirmed[]; recovered: Recovered[]; deaths: Death[] };
}

export const Chart = ({ data }: ChartProps) => {
  const height = 200;
  const width = 600;
  const margin = 35;

  if (!data) {
    return <div>Loading ...</div>;
  }
  const dates = data.confirmed
    .map((value) => new Date(value.date))
    .sort((a, b) => a.getTime() - b.getTime());

  const firstDate = dates[0];
  const lastDate = new Date();
  // const lastDate = new Date(new Date().setDate(new Date().getDate() + 1));
  const latestCount = confirmedOnDate(data, lastDate).length;

  const yCeil = Math.ceil(latestCount / 1000) * 1000;

  const xScale = d3.scaleTime().range([0, width]).domain([firstDate, lastDate]);
  const yScale = d3.scaleLinear().range([height, 0]).domain([0, yCeil]);

  const xTicks = xScale
    .ticks()
    .map((value) => ({ value, xOffset: xScale(value) }));

  console.log(xTicks);

  const yTicks = yScale
    .ticks()
    .map((value) => ({ value, yOffset: yScale(value) }));

  const days = getDaysBetween(firstDate, lastDate);

  const confirmedCasesAndDates = days.map((d) => ({
    date: d,
    cases: confirmedOnDate(data, d).length,
  }));

  const space = width / confirmedCasesAndDates.length;
  const scalar = height / yCeil;

  const foo = confirmedCasesAndDates.map((c, i) => ({
    ...c,
    x: i * space,
    y: c.cases * scalar * -1 + height,
  }));

  console.log(foo);

  const lineCoordinates = foo.map((a) => [a.x, a.y]);

  return (
    <svg
      viewBox={`0 0 ${width + margin * 2} ${height + margin * 2}`}
      transform={`translate(${margin}, ${margin})`}
    >
      <path
        d={`M ${margin} ${height + margin} H ${width + margin}`}
        stroke="currentColor"
      />
      {xTicks.map(({ value, xOffset }, i) => (
        <g key={i} transform={`translate(${xOffset + 20}, ${height + margin})`}>
          <line y2="6" stroke="currentColor" />
          <text
            key={i}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: "translateY(20px)",
            }}
          >
            {xLabel(value)}
          </text>
        </g>
      ))}

      <path
        d={`M ${margin} ${margin} V ${height + margin}`}
        stroke="currentColor"
      />
      {yTicks.map(({ value, yOffset }, i) => (
        <g key={i} transform={`translate(${margin}, ${yOffset + margin})`}>
          <line x2="-6" stroke="currentColor" />
          <text
            key={i}
            style={{
              fontSize: "10px",
              textAnchor: "middle",
              transform: `translateX(-20px)`,
              alignmentBaseline: "middle",
            }}
          >
            {value}
          </text>
        </g>
      ))}
      {/* svgPath(lineCoordinates, [margin, margin] */}
      <SvgPath coordinates={lineCoordinates} translate={[margin, margin]} />
    </svg>
  );
};

export default Chart;
