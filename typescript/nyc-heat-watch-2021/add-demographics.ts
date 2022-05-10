import { FeatureCollection } from '@turf/turf';

import * as constants from './constants';

export default function addDemographics(dataSet: FeatureCollection, demographics: Array<any>): FeatureCollection {
  for(const feature of dataSet.features) {
    for(const demographicsInfo of demographics) {
      if (feature.properties!['TRACTCE'] === demographicsInfo!['tract']) {

        // race
        const nonWhitePopulation = constants.nonWhite.reduce((sum: number, fips: string) => sum + demographicsInfo![fips], 0);
        feature.properties!['nonWhitePercentage'] = roundPercentage(nonWhitePopulation / demographicsInfo![constants.totalPopulation]);

        if (demographicsInfo![constants.black]) {
          feature.properties!['blackPercentage'] = roundPercentage(demographicsInfo![constants.black] / demographicsInfo![constants.totalPopulation]);
        }
        
        // all results are null
        //feature.properties!['hispanicOrLatinoPercentage'] = roundPercentage(demographicsInfo![constants.hispanicOrLatino] / demographicsInfo![constants.totalPopulation]);


        // income
        if(demographicsInfo![constants.medianHouseholdIncome] != constants.censusIncomeNull) {
          feature.properties!['medianHouseholdIncome'] = demographicsInfo![constants.medianHouseholdIncome];
        }

        
        // education - all results are null
        /*feature.properties!['lessThanHighSchoolPercentage'] = roundPercentage(demographicsInfo![constants.lessThanHighSchool] / demographicsInfo![constants.educationTotal]);
        feature.properties!['highSchoolPercentage'] = roundPercentage(demographicsInfo![constants.highSchool] / demographicsInfo![constants.educationTotal]);
        feature.properties!['someCollegePercentage'] = roundPercentage(demographicsInfo![constants.someCollege] / demographicsInfo![constants.educationTotal]);
        feature.properties!['bachelorsPercentage'] = roundPercentage(demographicsInfo![constants.bachelors] / demographicsInfo![constants.educationTotal]);
        feature.properties!['graduatePercentage'] = roundPercentage(demographicsInfo![constants.graduate] / demographicsInfo![constants.educationTotal]);*/
      }
    }
  }

  return dataSet;
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}
