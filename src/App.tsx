import React, { useState, useEffect } from "react";
import "./App.css";
import Map from "./components/Map";
import Stats from "./components/Stats";
import Chart from "./components/Chart";
import { CoronaData } from "./types";

const apiUrl =
  "https://w3qa5ydb4l.execute-api.eu-west-1.amazonaws.com/prod/finnishCoronaData/v2";

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
        <Chart data={data} />
      </div>
      <Map data={data} district={district} setDistrict={setDistrict} />
    </div>
  );
}

export default App;
