// Define the GeoJSON
var geojson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              [
                116.979855953678,
                -0.5087384675738917
              ],
              [
                116.97182044971538,
                -0.5276785235651005
              ],
              [
                116.979855953678,
                -0.5764632457170364
              ],
              [
                117.00511039470678,
                -0.6063078131287227
              ],
              [
                117.03553051685378,
                -0.6321347101298471
              ],
              [
                117.09235300916646,
                -0.6258214803002744
              ],
              [
                117.10383230054259,
                -0.5856462065708854
              ],
              [
                117.14056603294608,
                -0.5638366504124406
              ],
              [
                117.19107491500228,
                -0.5781850520132252
              ],
              [
                117.23714409486843,
                -0.5844110335233097
              ],
              [
                117.24232727885345,
                -0.5703431056368657
              ],
              [
                117.23862500457898,
                -0.5459092549202893
              ],
              [
                117.21641135893378,
                -0.5288795424122981
              ],
              [
                117.20086180698229,
                -0.5103689323928791
              ],
              [
                117.16754133851532,
                -0.4851944176493532
              ],
              [
                117.1438467831614,
                -0.46668368501003954
              ],
              [
                117.11719040838818,
                -0.47334755447208465
              ],
              [
                117.10238131129199,
                -0.4970412600819998
              ],
              [
                117.08905312390453,
                -0.5170327582379457
              ],
              [
                117.06832038796978,
                -0.5407263039755037
              ],
              [
                117.05203038116309,
                -0.5459092549202893
              ],
              [
                117.04314492290524,
                -0.5259178484687084
              ],
              [
                117.03870219377734,
                -0.504445525843451
              ],
              [
                116.979855953678,
                -0.5087384675738917
              ]
            ]
          ],
          "type": "Polygon"
        }
      }
    ]
  }
  
  var landCoverAssetId = 'projects/ee-ramadhan/assets/PL_KLHK_Raster_v1/KLHK_PL_2021_raster_v1';
  
  // Load GeoJSON as an Earth Engine feature
  var region = ee.Geometry.Polygon(geojson.features[0].geometry.coordinates);
  
  // Load the land cover image
  var landCoverImage = ee.Image(landCoverAssetId);
  
  // Clip the land cover image to the region of interest
  var clippedLandCover = landCoverImage.clip(region);
  
  // Dictionary mapping values to land cover types
  var landCoverDictionary = {
    11: 'High density dryland forest',
    12: 'Medium density dryland forest',
    21: 'High density swamp forest',
    22: 'Medium density swamp forest',
    31: 'High density mangrove forest',
    32: 'Medium density mangrove forest',
    40: 'Low-level vegetation',
    50: 'Inundated low-level vegetation',
    60: 'Built-up',
    70: 'Bareland',
    80: 'Oil palm',
    90: 'Coconut',
    100: 'Wood shrubs',
    101: 'Rubber plantation',
    102: 'Timber plantation',
    103: 'Banana plantation',
    110: 'Water',
    111: 'Ponds',
    200: 'Snow/ice',
    255: 'Unknown'
  };
  
  
  // Calculate the area for each land cover type
  var areaDictionary = clippedLandCover.reduceRegion({
    reducer: ee.Reducer.frequencyHistogram(),
    geometry: region,
    scale: 30,
  });
  
  // Convert the result to hectares
  var areaInHa = ee.Dictionary(areaDictionary.get('LULC')).map(function(key, value) {
    return ee.Number(value).multiply(900).divide(10000);
  });
  
  // Convert areaInHa to a client-side JavaScript object
  areaInHa.getInfo(function(areaInHaClient) {
    // Create a list to store the results
    var resultList = Object.keys(areaInHaClient).map(function(key) {
      var landCoverType = landCoverDictionary[parseInt(key)];
      return {
        'LandCoverCode': parseInt(key),
        'LandCoverType': landCoverType ? landCoverType : 'Unknown', // Check if land cover type exists
        'AreaHa': areaInHaClient[key]
      };
    });
  
    // Print the list
    print('Result List:', resultList);
  });
  
  
  