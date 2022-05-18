import { FeatureCollection } from "@turf/turf";

export default function filterBusRoute(busRoutes: FeatureCollection, busGlobalId: string): FeatureCollection {
  for (const feature of busRoutes.features) {
    if (feature.properties!['GlobalID'] === busGlobalId) {
      return {
        type: 'FeatureCollection',
        features: [feature]
      }
    }
  }

  throw new Error(`Could not find bus route "${busGlobalId}"`);
}
