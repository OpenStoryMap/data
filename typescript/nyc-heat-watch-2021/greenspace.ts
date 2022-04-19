import { Feature, FeatureCollection, intersect, MultiPolygon, Polygon } from "@turf/turf";

export function filterNyc(areasOfInterest: FeatureCollection, nycData: FeatureCollection): Array<Feature> {
  const overlappedGreenspace: Array<Feature> = [];

  let counter = 0;
  for (const greenspaceData of nycData.features) {
    console.log(++counter);
    for (const tract of areasOfInterest.features) {
      if (intersect(greenspaceData as Feature<Polygon | MultiPolygon>, tract as Feature<Polygon | MultiPolygon>)) {
        overlappedGreenspace.push(greenspaceData);
        break;
      }
    }
  }

  return overlappedGreenspace;
}
