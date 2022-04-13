import * as fs from 'fs';
import { FeatureCollection } from '@turf/turf';

import { downloadAndExtract } from '../download';
import { runCensusTractDataQuery } from '../census';
import findMaxHeatIndexes from './find-max-heat-indexes';
import { addNonWhitePercentage } from './add-demographics';
import * as constants from './constants';


async function main(): Promise<void> {
  await Promise.all([
    downloadAndExtract(constants.nycRasterZipUrl, `${constants.baseExportPath}/rasters/nyc`),
    downloadAndExtract(constants.nycTraverseZipUrl, `${constants.baseExportPath}/traverses/nyc`),
    downloadAndExtract(constants.nyCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/ny`),

    downloadAndExtract(constants.njRasterZipUrl, `${constants.baseExportPath}/rasters/nj`),
    downloadAndExtract(constants.njTraverseZipUrl, `${constants.baseExportPath}/traverses/nj`),
    downloadAndExtract(constants.njCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/nj`),
  ]);

  const nycHeatIndexes = await findMaxHeatIndexes(`${constants.baseExportPath}/census-tracts/ny/cb_2018_36_tract_500k.shp`, `${constants.baseExportPath}/traverses/nyc/af_trav.shp`);
  const njHeatIndexes = await findMaxHeatIndexes(`${constants.baseExportPath}/census-tracts/nj/cb_2018_34_tract_500k.shp`, `${constants.baseExportPath}/traverses/nj/af_trav.shp`);

  const heatIndexFeatureCollection: FeatureCollection = {
    type: "FeatureCollection",
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
}

main();
