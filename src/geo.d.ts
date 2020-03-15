import { ExtendedFeatureCollection } from "@types/d3-geo";

declare module "sairaanhoitopiirit_geo.json" {
  const value: ExtendedFeatureCollection;
  export default value;
}

interface GeoJSON {
  type: string;
  crs: CRS;
  features: Feature[];
}

interface CRS {
  type: string;
  properties: CRSProperties;
}

interface CRSProperties {
  name: String;
}

interface Feature {
  type: string;
}

interface FeatureProperties {
  district: string;
  Name: string;
  description: string;
  timestamp: null;
  begin: null;
  end: null;
  altitudeMode: null;
  tessellate: -1;
  extrude: 0;
  visibility: -1;
  drawOrder: null;
  icon: null;
  snippet: "";
  healthCareDistrict: null;
}
