declare module "*.json" {
  import { ExtendedFeatureCollection } from "d3-geo";

  const value: ExtendedFeatureCollection<MultiPolygon | Polygon>;
  export default value;
}
