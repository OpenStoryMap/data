import * as fs from 'fs';
import { FeatureCollection } from '@turf/turf';

import { downloadFile, downloadAndExtract } from '../download';
import { runCensusTractDataQuery } from '../census';
import findMaxHeatIndexes from './find-max-heat-indexes';
import { addNonWhitePercentage } from './add-demographics';
import filterRedline from './filter-redline';
import * as constants from './constants';


async function main(): Promise<void> {
  await Promise.all([
    downloadAndExtract(constants.nycRasterZipUrl, `${constants.baseExportPath}/rasters/nyc`),
    downloadAndExtract(constants.nycTraverseZipUrl, `${constants.baseExportPath}/traverses/nyc`),
    downloadAndExtract(constants.nyCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/ny`),
    downloadFile(constants.manhattanRedlineUrl, `${constants.baseExportPath}/redline/manhattan.geojson`),
    downloadFile(constants.bronxRedlineUrl, `${constants.baseExportPath}/redline/bronx.geojson`),

    downloadAndExtract(constants.njRasterZipUrl, `${constants.baseExportPath}/rasters/nj`),
    downloadAndExtract(constants.njTraverseZipUrl, `${constants.baseExportPath}/traverses/nj`),
    downloadAndExtract(constants.njCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/nj`),
    downloadFile(constants.hudsonCountyRedlineUrl, `${constants.baseExportPath}/redline/hudson-county.geojson`),
    downloadFile(constants.essexCountyRedlineUrl, `${constants.baseExportPath}/redline/essex-county.geojson`),
    downloadFile(constants.unionCountyRedlineUrl, `${constants.baseExportPath}/redline/union-county.geojson`),
  ]);

  const nycHeatIndexes = await findMaxHeatIndexes(`${constants.baseExportPath}/census-tracts/ny/cb_2018_36_tract_500k.shp`, `${constants.baseExportPath}/traverses/nyc/af_trav.shp`);
  const njHeatIndexes = await findMaxHeatIndexes(`${constants.baseExportPath}/census-tracts/nj/cb_2018_34_tract_500k.shp`, `${constants.baseExportPath}/traverses/nj/af_trav.shp`);

  const heatIndexFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: nycHeatIndexes.concat(njHeatIndexes)
  }

  const nyDemographics = await runCensusTractDataQuery(
    constants.nyStateFips,
    [constants.nyCountyFips, constants.bronxCountyFips],
    constants.nonWhiteFips.concat([constants.totalPopulationFips]));

  const njDemographics = await runCensusTractDataQuery(
    constants.njStateFips,
    [constants.hudsonCountyFips, constants.essexCountyFips, constants.unionCountyFips],
    constants.nonWhiteFips.concat([constants.totalPopulationFips]));
  
  const maxHeatAndDemographics = addNonWhitePercentage(heatIndexFeatureCollection, nyDemographics.concat(njDemographics));

  fs.writeFileSync(`${constants.baseExportPath}/heatAndDemographics.geojson`, JSON.stringify(maxHeatAndDemographics));

  const manhattanRedline = filterRedline(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/redline/manhattan.geojson`));
  const bronxRedline = filterRedline(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/redline/bronx.geojson`));
  const hudsonCountyRedline = filterRedline(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/redline/hudson-county.geojson`));
  const essexCountyRedline = filterRedline(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/redline/essex-county.geojson`));
  const unionCountyRedline = filterRedline(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/redline/union-county.geojson`));

  const overlappedRedline: FeatureCollection = {
    type: 'FeatureCollection',
    features: manhattanRedline.concat(bronxRedline).concat(hudsonCountyRedline).concat(essexCountyRedline).concat(unionCountyRedline)
  }

  fs.writeFileSync(`${constants.baseExportPath}/overlappedRedline.geojson`, JSON.stringify(overlappedRedline));
}

function geoJsonFromFile(filePath: string): FeatureCollection {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData.toString());
}

main();
