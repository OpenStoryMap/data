import { Feature, FeatureCollection, intersect, MultiPolygon, Polygon } from '@turf/turf';

export default function filterRedline(areasOfInterest: FeatureCollection, redlineDataset: FeatureCollection): Array<Feature> {
  const overlappedRedline = [];

  for (const redlineData of redlineDataset.features) {
    for (const tract of areasOfInterest.features) {
      if (intersect(redlineData as Feature<Polygon | MultiPolygon>, tract as Feature<Polygon | MultiPolygon>)) {
        overlappedRedline.push(redlineData);
      }
    }
  }

  return overlappedRedline;
}
