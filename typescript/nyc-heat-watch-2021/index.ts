import fs from 'fs';

import findMaxHeatIndexes from './find-max-heat-indexes';
import { downloadAndExtract } from '../download';


async function main(): Promise<void> {
  const baseExportPath = 'export/nyc-heat-watch-2021';

  const nycRasterZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61856f082b61750162f4725f?action=download&direct&version=1';
  const nycTraverseZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61d5e591b0ea71120cb2a84f?action=download&direct&version=1';
  const nycCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_36_tract_500k.zip';

  const njRasterZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c9dc5565802714bd0b5?action=download&direct&version=1';
  const njTraverseZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c7186713b026e8ffa00?action=download&direct&version=1';
  const njCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_34_tract_500k.zip';

  await Promise.all([
    downloadAndExtract(nycRasterZipUrl, `${baseExportPath}/rasters/nyc`),
    downloadAndExtract(nycTraverseZipUrl, `${baseExportPath}/traverses/nyc`),
    downloadAndExtract(nycCensusTractZipUrl, `${baseExportPath}/census-tracts/ny`),

    downloadAndExtract(njRasterZipUrl, `${baseExportPath}/rasters/nj`),
    downloadAndExtract(njTraverseZipUrl, `${baseExportPath}/traverses/nj`),
    downloadAndExtract(njCensusTractZipUrl, `${baseExportPath}/census-tracts/nj`),
  ]);

  const nycHeatIndexes = await findMaxHeatIndexes(`${baseExportPath}/census-tracts/ny/cb_2018_36_tract_500k.shp`, `${baseExportPath}/traverses/nyc/af_trav.shp`);
  const njHeatIndexes = await findMaxHeatIndexes(`${baseExportPath}/census-tracts/nj/cb_2018_34_tract_500k.shp`, `${baseExportPath}/traverses/nj/af_trav.shp`);

  const heatIndexFeatureCollection = {
    type: "FeatureCollection",
    features: nycHeatIndexes.concat(njHeatIndexes)
  }

  fs.writeFileSync(`${baseExportPath}/max-heat-index.geojson`, JSON.stringify(heatIndexFeatureCollection));
}

main();
