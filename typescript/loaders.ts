import * as fs from 'fs';

import { FeatureCollection } from '@turf/turf';
const toJSON = require('shp2json');

export function geoJsonFromFile(filePath: string): FeatureCollection {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData.toString());
}

export async function parseGeoJsonFromShapeFile(shapeFilename: string): Promise<FeatureCollection> {
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
