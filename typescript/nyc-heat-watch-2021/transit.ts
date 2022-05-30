import { Feature, FeatureCollection } from "@turf/turf";

export default function filterBusLine(busRoutes: FeatureCollection, busLine: number): FeatureCollection {
  const filteredFeatures: Array<Feature> = [];

  for (const feature of busRoutes.features) {
    if (feature.properties!['LINE'] === busLine) {
      filteredFeatures.push(feature)
    }
  }

  return {
    type: 'FeatureCollection',
    features: filteredFeatures
  }
}
