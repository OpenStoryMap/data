import { Feature, FeatureCollection, Geometry, intersect, MultiPolygon, Polygon, polygons } from "@turf/turf";
import axios, { Method } from 'axios';

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

export async function getElizabethParks(): Promise<Array<Feature>> {
  const data = JSON.stringify([
    157,
    'CPA,MPA',  // municipal and county parks
    '-73.91877169530196 40.59615977370018,-73.91877169530196 40.728459149613315,' +
    '-74.46740145604414 40.728459149613315,-74.46740145604414 40.59615977370018,' +
    '-73.91877169530196 40.59615977370018',
  ]);

  const config = {
    method: 'POST' as Method,
    url: 'https://map.govpilot.com/api/v1/cmd/get/015',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000,
    data
  };

  const resp = await axios(config);

  return resp.data.data.map((park: any) => {
    return {
      type: 'Feature',
      properties: {
        name: extractParkName(park.DESC)
      },
      geometry: extractGeometry(park.geoshape)
    }
  });
}

const findParkNameKey = 'PARK_NAME:';
function extractParkName(desc: string): string {
  const startPos = desc.indexOf(findParkNameKey) + findParkNameKey.length;
  const nameLength = desc.substring(startPos).indexOf('|');
  return desc.substring(startPos, startPos + nameLength);
}

function extractGeometry(geoShapeStr: string): Geometry {
  const geoShape = JSON.parse(geoShapeStr);

  if ('Polygons' in geoShape) {
    return {
      type: 'MultiPolygon',
      coordinates: geoShape.Polygons.map((polygon: any) => ringsToCoordinates(polygon.Rings))
    }
  }

  return {
    type: 'Polygon',
    coordinates: ringsToCoordinates(geoShape.Rings)
  }
}

function ringsToCoordinates(rings: Array<any>): Array<any> {
  return rings.map((ring: any) => {
    return ring.Points.map((point: any) => {
      return [point.X, point.Y];
    });
  });
}
