import { intersect, MultiPolygon, polygon, Polygon, FeatureCollection, Point, Feature } from '@turf/turf';
import { capaNull } from './constants';

type CensusTract = Polygon | MultiPolygon;

let counter = 0;

export async function findMaxHeatIndexes(censusTracts: FeatureCollection, traversePointFeatures: FeatureCollection, time: string): Promise<Array<Feature>> {

  const heatIndexPropertyName = `${time}MaxHeatIndex`;

  const traversedTracts = Object.create(null);

  traversePointFeatures.features.forEach(traversePointFeature => {

    console.log(++counter);

    const tract = findTract(traversePointFeature, censusTracts);

    const heatIndex = traversePointFeature.properties!['hi_f'];
    const geoId = tract.properties!['GEOID'];

    if(heatIndex != capaNull) {
      if (traversedTracts[geoId]) {
        if (heatIndex > traversedTracts[geoId][heatIndexPropertyName]) {
          traversedTracts[geoId][heatIndexPropertyName] = heatIndex;
        }
      } else {
        const tractValue = Object.create(null);
        tractValue['feature'] = tract;
        tractValue[heatIndexPropertyName] = heatIndex

        traversedTracts[geoId] = tractValue;
      }
    }
  });

  const traversedTractFeatures = new Array<Feature>();
  for (const [_, tractData] of Object.entries(traversedTracts)) {
    const feature = (tractData as any)['feature'] as Feature;
    feature.properties![heatIndexPropertyName] = (tractData as any)[heatIndexPropertyName];

    traversedTractFeatures.push(feature);
  }

  return traversedTractFeatures;
}

export function mergeHeatIndexData(morning: Array<Feature>, afternoon: Array<Feature>, evening: Array<Feature>): Array<Feature> {
  const tracts = Object.create(null);

  morning.forEach(feature => {
    const tractId = feature.properties!['TRACTCE'];
    tracts[tractId] = feature;
  });

  afternoon.forEach(feature => {
    const tractId = feature.properties!['TRACTCE'];

    if (!(tractId in tracts)) {
      tracts[tractId] = feature;
    } else {
      tracts[tractId].properties['afternoonMaxHeatIndex'] = feature.properties!['afternoonMaxHeatIndex']
    }
  });

  evening.forEach(feature => {
    const tractId = feature.properties!['TRACTCE'];

    if (!(tractId in tracts)) {
      tracts[tractId] = feature;
    } else {
      tracts[tractId].properties['eveningMaxHeatIndex'] = feature.properties!['eveningMaxHeatIndex']
    }
  });

  const flattenedFeatures: Array<Feature> = [];

  for (const [_, feature] of Object.entries(tracts)) {
    flattenedFeatures.push(feature as Feature);
  }

  return flattenedFeatures;
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
