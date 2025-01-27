import * as fs from 'fs';

import { downloadFile, downloadAndExtract } from '../download';
import { runCensusTractDataQuery } from '../census';
import { geoJsonFromFile, parseGeoJsonFromShapeFile } from '../loaders';
import { findMaxHeatIndexes, mergeHeatIndexData } from './heat-index';
import addDemographics from './add-demographics';
import filterRedline from './filter-redline';
import * as constants from './constants';
import { filterNyc, getElizabethParks } from './greenspace';
import { FeatureCollection } from '@turf/turf';
import filterBusLine from './transit';


async function main(): Promise<void> {
  await Promise.all([
    downloadAndExtract(constants.nycRasterZipUrl, `${constants.baseExportPath}/rasters/nyc`),
    downloadAndExtract(constants.nycTraverseZipUrl, `${constants.baseExportPath}/traverses/nyc`),
    downloadAndExtract(constants.nyCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/ny`),
    downloadFile(constants.manhattanRedlineUrl, `${constants.baseExportPath}/redline/manhattan.geojson`),
    downloadFile(constants.bronxRedlineUrl, `${constants.baseExportPath}/redline/bronx.geojson`),
    downloadFile(constants.nycGreenspaceUrl, `${constants.baseExportPath}/greenspace/nyc.geojson`),

    downloadAndExtract(constants.njRasterZipUrl, `${constants.baseExportPath}/rasters/nj`),
    downloadAndExtract(constants.njTraverseZipUrl, `${constants.baseExportPath}/traverses/nj`),
    downloadAndExtract(constants.njCensusTractZipUrl, `${constants.baseExportPath}/census-tracts/nj`),
    downloadFile(constants.hudsonCountyRedlineUrl, `${constants.baseExportPath}/redline/hudson-county.geojson`),
    downloadFile(constants.essexCountyRedlineUrl, `${constants.baseExportPath}/redline/essex-county.geojson`),
    downloadFile(constants.unionCountyRedlineUrl, `${constants.baseExportPath}/redline/union-county.geojson`),
    downloadFile(constants.jerseyCityGreenspaceUrl, `${constants.baseExportPath}/greenspace/jersey-city.geojson`),
    downloadAndExtract(constants.newarkGreenspaceUrl, `${constants.baseExportPath}/greenspace/newark`),

    downloadFile(constants.njtransitBusRoutesUrl, `${constants.baseExportPath}/transit/njtransit-bus-routes.geojson`),
  ]);

  const nycCensusTracts = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/census-tracts/ny/cb_2018_36_tract_500k.shp`);

  const nycMorningTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nyc/am_trav (2021_12_08 04_38_32 UTC).shp`);
  const nycAfternoonTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nyc/af_trav.shp`);
  const nycEveningTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nyc/pm_trav (2021_12_08 04_38_32 UTC).shp`);

  const nycMorningHeatIndexes = await findMaxHeatIndexes(nycCensusTracts, nycMorningTraversePointFeatures, 'morning');
  const nycAfternoonHeatIndexes = await findMaxHeatIndexes(nycCensusTracts, nycAfternoonTraversePointFeatures, 'afternoon');
  const nycEveningHeatIndexes = await findMaxHeatIndexes(nycCensusTracts, nycEveningTraversePointFeatures, 'evening');

  const nycHeatIndexes = mergeHeatIndexData(nycMorningHeatIndexes, nycAfternoonHeatIndexes, nycEveningHeatIndexes);


  const njCensusTracts = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/census-tracts/nj/cb_2018_34_tract_500k.shp`);

  const njMorningTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nj/am_trav.shp`);
  const njAfternoonTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nj/af_trav.shp`);
  const njEveningTraversePointFeatures = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/traverses/nj/pm_trav.shp`);

  const njMorningHeatIndexes = await findMaxHeatIndexes(njCensusTracts, njMorningTraversePointFeatures, 'morning');
  const njAfternoonHeatIndexes = await findMaxHeatIndexes(njCensusTracts, njAfternoonTraversePointFeatures, 'afternoon');
  const njEveningHeatIndexes = await findMaxHeatIndexes(njCensusTracts, njEveningTraversePointFeatures, 'evening');

  const njHeatIndexes = mergeHeatIndexData(njMorningHeatIndexes, njAfternoonHeatIndexes, njEveningHeatIndexes);

  const heatIndexFeatureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: nycHeatIndexes.concat(njHeatIndexes)
  }

  const nyDemographics = await runCensusTractDataQuery(
    constants.nyStateFips,
    [constants.nyCountyFips, constants.bronxCountyFips],
    constants.nonWhite.concat([
      constants.totalPopulation, constants.medianHouseholdIncome, constants.black,
      constants.educationTotal, constants.lessThanHighSchool, constants.highSchool,
      constants.someCollege, constants.bachelors, constants.graduate
    ]));

  const njDemographics = await runCensusTractDataQuery(
    constants.njStateFips,
    [constants.hudsonCountyFips, constants.essexCountyFips, constants.unionCountyFips],
    constants.nonWhite.concat([
      constants.totalPopulation, constants.medianHouseholdIncome, constants.black,
      constants.educationTotal, constants.lessThanHighSchool, constants.highSchool,
      constants.someCollege, constants.bachelors, constants.graduate
    ]));
  
  const maxHeatAndDemographics = addDemographics(heatIndexFeatureCollection, nyDemographics.concat(njDemographics));

  fs.writeFileSync(`${constants.baseExportPath}/heatAndDemographics.geojson`, JSON.stringify(maxHeatAndDemographics));

  const maxHeatAndDemographics = JSON.parse(fs.readFileSync(`${constants.baseExportPath}/heatAndDemographics.geojson`).toString());


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
  

  const nycGreenspace = filterNyc(maxHeatAndDemographics, geoJsonFromFile(`${constants.baseExportPath}/greenspace/nyc.geojson`));
  const jerseyCityGreenspace = geoJsonFromFile(`${constants.baseExportPath}/greenspace/jersey-city.geojson`);
  const newarkGreenspace = await parseGeoJsonFromShapeFile(`${constants.baseExportPath}/greenspace/newark/Newark_Parks.shp`);
  const elizabethGreenspace = await getElizabethParks();

  const overlappedGreenspace: FeatureCollection = {
    type: 'FeatureCollection',
    features: nycGreenspace.concat(jerseyCityGreenspace.features).concat(newarkGreenspace.features).concat(elizabethGreenspace)
  }

  fs.writeFileSync(`${constants.baseExportPath}/overlappedGreenspace.geojson`, JSON.stringify(overlappedGreenspace));

  const njtransitBusRoutes = geoJsonFromFile(`${constants.baseExportPath}/transit/njtransit-bus-routes.geojson`);
  const njtransitOneBusRoute = filterBusLine(njtransitBusRoutes, constants.njTransitOneBusLine);
  fs.writeFileSync(`${constants.baseExportPath}/njtransit-one-bus.geojson`, JSON.stringify(njtransitOneBusRoute));
}


main();
