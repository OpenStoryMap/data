import { Feature, FeatureCollection, intersect, MultiPolygon, Polygon } from '@turf/turf';

export default function filterRedline(areasOfInterest: FeatureCollection, redlineDataset: FeatureCollection): Array<Feature> {
  const overlappedRedline: Array<Feature> = [];

  for (const redlineData of redlineDataset.features) {
    for (const tract of areasOfInterest.features) {
      if (intersect(redlineData as Feature<Polygon | MultiPolygon>, tract as Feature<Polygon | MultiPolygon>)) {
        let alreadyFound = false;

        for(const foundRedline of overlappedRedline) {
          if(intersect(foundRedline as Feature<Polygon | MultiPolygon>, redlineData as Feature<Polygon | MultiPolygon>)) {
            alreadyFound = true;
            break;
          }
        }

        if(!alreadyFound) {
          overlappedRedline.push(redlineData);
        }
      }
    }
  }

  return overlappedRedline;
}
