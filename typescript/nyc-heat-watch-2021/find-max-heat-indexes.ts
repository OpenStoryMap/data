const toJSON = require('shp2json');
import { intersect, MultiPolygon, polygon, Polygon, FeatureCollection, Point, Feature } from '@turf/turf';

type CensusTract = Polygon | MultiPolygon;

let counter = 0;

export default async function findMaxHeatIndexes(censusFilename: string, traversesFilename: string): Promise<Array<Feature>> {

  const censusTracts = await parseGeoJsonFromShapeFile(censusFilename);
  const traversePointFeatures = await parseGeoJsonFromShapeFile(traversesFilename);

  const traversedTracts = new Map<string, {feature: Feature, maxHeatIndex: number}>();

  traversePointFeatures.features.forEach(traversePointFeature => {

    console.log(++counter);

    const tract = findTract(traversePointFeature, censusTracts);

    // @ts-ignore
    const heatIndex = traversePointFeature.properties['hi_f'];
    // @ts-ignore
    const geoId = tract.properties['GEOID'];

    if (traversedTracts.get(geoId)) {
      // @ts-ignore
      if (heatIndex > traversedTracts.get(geoId).maxHeatIndex) {
        // @ts-ignore
        traversedTracts.get(geoId).maxHeatIndex = heatIndex;
      }
    } else {
      traversedTracts.set(geoId, {
        feature: tract,
        maxHeatIndex: heatIndex
      });
    }
  });

  const traversedTractFeatures = new Array<Feature>();
  for (const tract of traversedTracts.values()) {
    // @ts-ignore
    tract.feature.properties.maxHeatIndex = tract.maxHeatIndex;

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

async function parseGeoJsonFromShapeFile(shapeFilename: string): Promise<FeatureCollection> {
  const geoJsonString = await streamToString(toJSON.fromShpFile(shapeFilename));

  return JSON.parse(geoJsonString);
}

/**
 * https://stackoverflow.com/a/49428486/1981635
 * 
 * @param stream 
 * @returns 
 */
async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Array<Uint8Array> = [];

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
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
