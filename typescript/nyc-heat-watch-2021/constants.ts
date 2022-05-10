export const baseExportPath = '../geodata/nyc-heat-watch-2021';

export const nycRasterZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61856f082b61750162f4725f?action=download&direct&version=1';
export const nycTraverseZipUrl = 'https://files.osf.io/v1/resources/j6eqr/providers/osfstorage/61d5e591b0ea71120cb2a84f?action=download&direct&version=1';
export const nyCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_36_tract_500k.zip';

export const njRasterZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c9dc5565802714bd0b5?action=download&direct&version=1';
export const njTraverseZipUrl = 'https://files.osf.io/v1/resources/6rwbg/providers/osfstorage/61671c7186713b026e8ffa00?action=download&direct&version=1';
export const njCensusTractZipUrl = 'https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_34_tract_500k.zip';

export const manhattanRedlineUrl = 'https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/NYManhattan1937.geojson';
export const bronxRedlineUrl = 'https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/NYBronx1938.geojson';
export const hudsonCountyRedlineUrl = 'https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/NJHudsonCo1939.geojson';
export const essexCountyRedlineUrl = 'https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/NJEssexCo1939.geojson';
export const unionCountyRedlineUrl = 'https://dsl.richmond.edu/panorama/redlining/static/downloads/geojson/NJUnionCo1939.geojson';

export const nycGreenspaceUrl = 'https://data.cityofnewyork.us/api/geospatial/mwfu-376i?method=export&format=GeoJSON';
export const jerseyCityGreenspaceUrl = 'https://data.jerseycitynj.gov/explore/dataset/jersey-city-parks-map/download/?format=geojson&timezone=America/New_York&lang=en';
export const newarkGreenspaceUrl = 'https://data.ci.newark.nj.us/dataset/540221e5-1716-4115-a058-892943190611/resource/d9f28e90-7935-4f84-97a5-51549fa6af44/download/newarkparks.shp.zip';

export const nyStateFips = '36';
export const nyCountyFips = '061';
export const bronxCountyFips = '005';

export const njStateFips = '34';
export const hudsonCountyFips = '017';
export const essexCountyFips = '013';
export const unionCountyFips = '039';


// Census Variables
export const totalPopulation = 'B02001_001E';
export const black = 'B02009_001E';
export const hispanicOrLatino = 'B03001_002E';
export const nonWhite = [
  'B02001_003E',  // Black or African American alone
  'B02001_004E',  // American Indian and Alaska Native alone
  'B02001_005E',  // Asian alone
  'B02001_006E',  // Native Hawaiian and Other Pacific Islander alone
  'B02001_007E',  // Some other race alone
  'B02001_008E',  // Two or more races
];

export const educationTotal = 'B06009_001E';
export const lessThanHighSchool = 'B06009_002E';
export const highSchool = 'B06009_003E';
export const someCollege = 'B06009_004E';
export const bachelors = 'B06009_005E';
export const graduate = 'B06009_006E';

export const medianHouseholdIncome = 'B19013_001E';


export const capaTraverseNull = -9999;
export const censusIncomeNull = -666666666;
