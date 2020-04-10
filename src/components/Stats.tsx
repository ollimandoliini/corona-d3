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

const Stats = ({ data, district }: StatsProps) => {
  if (!data) {
    return null;
  }

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
        </tbody>
      </table>

      <Dates data={data} />
    </div>
  );
};

export default Stats;
