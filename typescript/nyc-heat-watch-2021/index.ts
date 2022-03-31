import * as fs from 'fs';

import { downloadAndExtract } from '../download';
import { runCensusTractDataQuery } from '../census';
import findMaxHeatIndexes from './find-max-heat-indexes';
import addDemographics from './add-demographics';
import { FeatureCollection } from '@turf/turf';


async function main(): Promise<void> {
  const baseExportPath = 'export/nyc-heat-watch-2021';

  const nycRasterZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61856f082b61750162f4725f?action=download&direct&version=1';
  const nycTraverseZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61d5e591b0ea71120cb2a84f?action=download&direct&version=1';
  const nyCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_36_tract_500k.zip';

  const njRasterZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c9dc5565802714bd0b5?action=download&direct&version=1';
  const njTraverseZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c7186713b026e8ffa00?action=download&direct&version=1';
  const njCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_34_tract_500k.zip';

  await Promise.all([
    downloadAndExtract(nycRasterZipUrl, `${baseExportPath}/rasters/nyc`),
    downloadAndExtract(nycTraverseZipUrl, `${baseExportPath}/traverses/nyc`),
    downloadAndExtract(nyCensusTractZipUrl, `${baseExportPath}/census-tracts/ny`),

    downloadAndExtract(njRasterZipUrl, `${baseExportPath}/rasters/nj`),
    downloadAndExtract(njTraverseZipUrl, `${baseExportPath}/traverses/nj`),
    downloadAndExtract(njCensusTractZipUrl, `${baseExportPath}/census-tracts/nj`),
  ]);

  const nycHeatIndexes = await findMaxHeatIndexes(`${baseExportPath}/census-tracts/ny/cb_2018_36_tract_500k.shp`, `${baseExportPath}/traverses/nyc/af_trav.shp`);
  const njHeatIndexes = await findMaxHeatIndexes(`${baseExportPath}/census-tracts/nj/cb_2018_34_tract_500k.shp`, `${baseExportPath}/traverses/nj/af_trav.shp`);

  const heatIndexFeatureCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: nycHeatIndexes.concat(njHeatIndexes)
  }

  const nyStateFips = '36';
  const nyCountyFips = '061';
  const bronxCountyFips = '005';

  const njStateFips = '34';
  const hudsonCountyFips = '017';
  const essexCountyFips = '013';
  const unionCountyFips = '039';

  const totalPopulationFips = 'B02001_001E';
  const blackAloneFips = 'B02001_003E';

  const nyDemographic = await runCensusTractDataQuery(nyStateFips, [nyCountyFips, bronxCountyFips] , [totalPopulationFips, blackAloneFips]);
  const njDemographic = await runCensusTractDataQuery(njStateFips, [hudsonCountyFips, essexCountyFips, unionCountyFips] , [totalPopulationFips, blackAloneFips]);
  
  const maxHeatAndDemographics = addDemographics(heatIndexFeatureCollection, nyDemographic.concat(njDemographic));

  fs.writeFileSync(`${baseExportPath}/heatAndDemographics.geojson`, JSON.stringify(maxHeatAndDemographics));
}

main();
