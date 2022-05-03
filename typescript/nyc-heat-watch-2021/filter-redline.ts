import { Feature, FeatureCollection, intersect, MultiPolygon, Polygon } from '@turf/turf';

export default function filterRedline(areasOfInterest: FeatureCollection, redlineDataset: FeatureCollection): Array<Feature> {
  const overlappedRedline: Array<Feature> = [];

  for (const redlineData of redlineDataset.features) {
    for (const tract of areasOfInterest.features) {
      if (intersect(redlineData as Feature<Polygon | MultiPolygon>, tract as Feature<Polygon | MultiPolygon>)) {
        let alreadyFound = false;

        // there are overlapping polygons in the source data
        for(const foundRedline of overlappedRedline) {
          if(intersect(foundRedline as Feature<Polygon | MultiPolygon>, redlineData as Feature<Polygon | MultiPolygon>)) {
            alreadyFound = true;
            break;
          }
        }

        if(!alreadyFound) {
          redlineData.properties!['grade'] = convertGrade(redlineData.properties!['holc_grade']);
          overlappedRedline.push(redlineData);
        }
      }
    }
  }

  return overlappedRedline;
}

function convertGrade(alphaGrade: string): number {
  switch (alphaGrade) {
    case 'A':
      return 4;
    case 'B':
      return 3;
    case 'C':
      return 2;
    case 'D':
      return 1;
  }

  throw new Error(`Invalid holc_grade ${alphaGrade}`);
}
