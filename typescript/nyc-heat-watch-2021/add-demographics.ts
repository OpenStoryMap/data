import { FeatureCollection } from "@turf/turf";

export default function addDemographics(dataSet: FeatureCollection, demographics: Array<any>): FeatureCollection {
  for(const feature of dataSet.features) {
    for(const demographicsInfo of demographics) {
      // @ts-ignore
      if (feature.properties['TRACTCE'] === demographicsInfo['tract']) {
        // @ts-ignore
        feature.properties['peopleOfColor'] = demographicsInfo['B02001_003E'] / demographicsInfo['B02001_001E'];
      }
    }
  }

  return dataSet;
}
