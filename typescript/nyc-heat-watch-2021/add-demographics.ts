import { FeatureCollection } from '@turf/turf';

import * as constants from './constants';

export function addNonWhitePercentage(dataSet: FeatureCollection, demographics: Array<any>): FeatureCollection {
  for(const feature of dataSet.features) {
    for(const demographicsInfo of demographics) {
      if (feature.properties!['TRACTCE'] === demographicsInfo!['tract']) {
        const nonWhitePopulation = constants.nonWhiteFips.reduce((sum: number, fips: string) => sum + demographicsInfo![fips], 0);
        feature.properties!['nonWhitePercentage'] = Math.round((nonWhitePopulation / demographicsInfo![constants.totalPopulationFips]) * 100) / 100;
      }
    }
  }

  return dataSet;
}
