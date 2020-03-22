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

export type { CoronaData, Confirmed, Death, Recovered };
