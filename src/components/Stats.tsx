import React from "react";
import { CoronaData } from "../types";

interface StatsProps {
  data: CoronaData | null;
  district: string | null;
}

interface DatesProps {
  data: CoronaData | null;
}

const Dates = ({ data }: DatesProps) => {
  return null;
};

const in24Hours = (data: CoronaData) => {
  const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());

  const confirmed = data.confirmed.filter((a) => new Date(a.date) >= yesterday)
    .length;
  const recovered = data.recovered.filter((a) => new Date(a.date) >= yesterday)
    .length;
  const deaths = data.deaths.filter((a) => new Date(a.date) >= yesterday)
    .length;

  return { confirmed, recovered, deaths };
};

const Stats = ({ data, district }: StatsProps) => {
  if (!data) {
    return null;
  }

  const sinceYesterday = in24Hours(data);

  let stats;
  if (!district) {
    stats = {
      confirmed: data.confirmed.length,
      recovered: data.recovered.length,
      deaths: data.deaths.length,
    };
  } else {
    stats = {
      confirmed: data.confirmed.filter((a) => a.healthCareDistrict === district)
        .length,
      recovered: data.recovered.filter((a) => a.healthCareDistrict === district)
        .length,
      deaths: data.deaths.filter((a) => a.healthCareDistrict === district)
        .length,
    };
  }

  return (
    <div>
      {district ? <h2>{district}</h2> : <h2>Koko Suomi</h2>}
      <table className="stats-table">
        <tbody>
          <tr>
            <th></th>
            <th>Yhteensä</th>
            <th>24h</th>
          </tr>
          <tr>
            <td>Vahvistetut</td>
            <td>{stats.confirmed}</td>
            <td>({sinceYesterday.confirmed})</td>
          </tr>
          <tr>
            <td>Parantuneet</td>
            <td>{stats.recovered}</td>
            <td>({sinceYesterday.recovered})</td>
          </tr>
          <tr>
            <td>Kuolleet</td>
            <td>{stats.deaths}</td>
            <td>({sinceYesterday.deaths})</td>
          </tr>
        </tbody>
      </table>

      <Dates data={data} />
    </div>
  );
};

export default Stats;
