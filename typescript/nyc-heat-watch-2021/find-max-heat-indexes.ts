import { intersect, MultiPolygon, polygon, Polygon, FeatureCollection, Point, Feature } from '@turf/turf';
import { capaNull } from './constants';

type CensusTract = Polygon | MultiPolygon;

let counter = 0;

export default async function findMaxHeatIndexes(censusTracts: FeatureCollection, traversePointFeatures: FeatureCollection): Promise<Array<Feature>> {

  const traversedTracts = new Map<string, {feature: Feature, maxHeatIndex: number}>();

  traversePointFeatures.features.forEach(traversePointFeature => {

    console.log(++counter);

    const tract = findTract(traversePointFeature, censusTracts);

    const heatIndex = traversePointFeature.properties!['hi_f'];
    const geoId = tract.properties!['GEOID'];

    if(heatIndex != capaNull) {
      if (traversedTracts.get(geoId)) {
        if (heatIndex > traversedTracts.get(geoId)!.maxHeatIndex) {
          traversedTracts.get(geoId)!.maxHeatIndex = heatIndex;
        }
      } else {
        traversedTracts.set(geoId, {
          feature: tract,
          maxHeatIndex: heatIndex
        });
      }
    }
  });

  const traversedTractFeatures = new Array<Feature>();
  for (const tract of Array.from(traversedTracts.values())) {
    tract.feature.properties!.maxHeatIndex = tract.maxHeatIndex;

    traversedTractFeatures.push(tract.feature);
  }

  return traversedTractFeatures;
}

function findTract(traversePointFeature: Feature, censusTracts: FeatureCollection) {
  const pointPolygon = getTinyPolygon(traversePointFeature.geometry as Point);

  for (const tract of censusTracts.features) {
    if (intersect(tract as Feature<CensusTract>, pointPolygon)) {
      return tract;
    }
  }

  throw new Error('cannot find tract');
}

const pointSpacer = .00000001;
function getTinyPolygon(point: Point): Feature<Polygon> {
  return polygon([[
    [point.coordinates[0]-pointSpacer, point.coordinates[1]-pointSpacer],
    [point.coordinates[0]+pointSpacer, point.coordinates[1]-pointSpacer],
    [point.coordinates[0]+pointSpacer, point.coordinates[1]+pointSpacer],
    [point.coordinates[0]-pointSpacer, point.coordinates[1]+pointSpacer],
    [point.coordinates[0]-pointSpacer, point.coordinates[1]-pointSpacer]]]);
}
