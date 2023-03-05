// let mt_url = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";

let clickedRoute = '';
let clickedLayer = null;
let prevLayerClicked = null;
let prevRoute = null;

function underRoute(feature) {
  return {
    color: `black`,
    weight: 8,
    opacity: 0.7,
    dashArray: ''
  }
}

function selectedUnderRoute(feature) {
  return {
    color: 'black',
    weight: 20,
    opacity: 1,
    dashArray: ''
  }
}

function routeStyle(feature) {
  return {
    color: `#${feature.properties.route_color}`,
    weight: 5,
    opacity: 0.65,
    dashArray: ''
  };
}

function selectedRoute(feature) {
  return {
    color: `#${feature.properties.route_color}`,
    weight: 12,
    opacity: 0.7,
    dashArray: '',
  }
}

let stopMarkerOptions = {
  radius: 12,
  color: "#000000",
  weight: 1,
  opacity: .5,
  fillOpacity: 0.3,
  fillColor: '#000000'
};



function onEachRoute(feature, layer, type) {  

  layer.bindPopup(`<p><strong>${feature.properties.route_name}</strong><br>
                    Route ID: ${feature.properties.route_id}<br>
                    Description: ${feature.properties.route_desc}<br>
                    Type: ${feature.properties.route_type}</p>`);
  // Define actions for interacting with route feature
  layer.on({

      // Set route highlight style on hover
      mouseover: e => {
          e.target.setStyle(selectedRoute);
      },

      // Reset route style when hover 
      mouseout: e => {
        e.target.setStyle(routeStyle);
      },

      // Set route style when selected
      click: e => {
          if (prevLayerClicked) {
            prevLayerClicked.setStyle(routeStyle(prevRoute));
          }
          // clickedRoute = e.target.feature.properties.route_id;
          // clickedLayer = e.target;
          // resizeUnderRoute(clickedRoute);

          e.target.setStyle(selectedRoute(feature));
          // filterSelectedRoute(feature);
          // Zoom to fit route boundaries
          myMap.fitBounds(e.target._bounds);

          

          // Store as last layer clicked
          prevLayerClicked = e.target;
          prevRoute = feature;
          }
      });
}

// stop_id', 'stop_name', 'stop_desc', 'location_type', 'wheelchair_boarding', 'platform_code'
function onEachStop(feature,layer) {  
  // Define actions for interacting with route feature
  layer.on({

      // Set route highlight style on hover
      mouseover: e => {
          // e.target.setStyle(selectedRoute);
      },

      // Reset route style when hover 
      mouseout: e => {
          // e.target.setStyle(routeStyle);
      },

      // Set route style when selected
      click: e => {
          
          // Zoom to fit route boundaries
          myMap.fitBounds(layer.getBounds(), false);
          

          // Store as last layer clicked
          prevLayerClicked = layer;
          }
      });
    layer.bindPopup(`<p><strong>${feature.properties.stop_name}</strong><br>
                Stop ID: ${feature.properties.stop_id}<br>
                Description: ${feature.properties.stop_desc}<br>
                Location Type: ${feature.properties.location_type}<br>
                Wheelchair Boarding: ${feature.properties.wheelchair_boarding}<br>
                Platform Code: ${feature.properties.platform_code}<br></p>`
                );
}

// var picnic_parks = L.geoJson(myJson, {filter: picnicFilter}).addTo(map);
function resizeUnderRoute(feature) {
  feature.setStyle(selectedUnderRoute);
  
}

function filterSelectedRoute(id) {
  if (feature.properties.route_id === clickedRoute) return true


  const filteredFeatures = kitespots.features.filter(item => { 
    return item.properties.windDirection.split("/").includes("S");
});
}

let myMap = L.map("map", {
    center: [45.15, -93.5010],
    zoom: 9.5,
    scrollWheelZoom: false
    });

let streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap)

let underRoutesLayer = L.geoJson(feed_geojson, {
  // filter: filterSelectedRoute,
  style: underRoute,
  onEachFeature: onEachRoute
})

let routesLayer = L.geoJSON(feed_geojson, {
  style: routeStyle,
  onEachFeature: onEachRoute
});

underRoutesLayer.addTo(myMap);
routesLayer.addTo(myMap);


let stopsLayer = L.geoJSON(stops_geojson, {
  onEachFeature: onEachStop,
  pointToLayer: function (feature, latlng) {
      return L.circle(latlng, stopMarkerOptions).bindPopup(`<p><strong>${feature.properties.stop_name}</strong><br>
                Stop ID: ${feature.properties.stop_id}<br>
                Description: ${feature.properties.stop_desc}<br>
                Location Type: ${feature.properties.location_type}<br>
                Wheelchair Boarding: ${feature.properties.wheelchair_boarding}<br>
                Platform Code: ${feature.properties.platform_code}<br></p>`);;
  }
}).addTo(myMap);