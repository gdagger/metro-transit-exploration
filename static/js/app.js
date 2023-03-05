// let mt_url = "https://svc.metrotransit.org/mtgtfs/gtfs.zip";
function underRoute(feature) {
  return {
    color: `black`,
    weight: 6,
    opacity: 0.7,
    dashArray: ''
  }
}

function routeStyle(feature) {
  return {
    color: `#${feature.properties.route_color}`,
    weight: 4,
    opacity: 0.7,
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
  radius: 3,
  color: "#000000",
  weight: 1,
  opacity: .5,
  fillOpacity: 0.1,
  fillColor: '#ffffff'

};



function onEachRoute(feature,layer) {  

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
          // Set selected route style when clicked
          e.target.setStyle(selectedRoute);

          // Zoom to fit route boundaries
          myMap.fitBounds(e.target._bounds);

          // Store as last layer clicked
          let prevLayerClicked = e.target;
          }
      });
}

// stop_id', 'stop_name', 'stop_desc', 'location_type', 'wheelchair_boarding', 'platform_code'
function onEachStop(feature,layer) {  
  // Define actions for interacting with route feature
  layer.on({

      // Set route highlight style on hover
      mouseover: e => {
          layer.setStyle(selectedRoute);
      },

      // Reset route style when hover 
      mouseout: e => {
          layer.setStyle(routeStyle);
      },

      // Set route style when selected
      click: e => {
          // Set selected route style when clicked
          layer.setStyle(selectedRoute);

          // Zoom to fit route boundaries
          myMap.fitBounds(e.target._bounds);

          // Store as last layer clicked
          let prevLayerClicked = layer;
          }
      })

      layer.bindPopup(`<p><strong>${feature.properties.stop_name}</strong><br>
                  Stop ID: ${feature.properties.stop_id}<br>
                  Description: ${feature.properties.stop_desc}<br>
                  Location Type: ${feature.properties.location_type}<br>
                  Wheelchair Boarding: ${feature.properties.wheelchair_boarding}<br>
                  Platform Code: ${feature.properties.platform_code}<br></p>`
                  );
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
  style: underRoute
})

let routesLayer = L.geoJSON(feed_geojson, {
  style: routeStyle,
  onEachFeature: onEachRoute
});

underRoutesLayer.addTo(myMap);
routesLayer.addTo(myMap);


let stopsLayer = L.geoJSON(stops_geojson, {
  pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, stopMarkerOptions).bindPopup(`<p><strong>${feature.properties.stop_name}</strong><br>
                Stop ID: ${feature.properties.stop_id}<br>
                Description: ${feature.properties.stop_desc}<br>
                Location Type: ${feature.properties.location_type}<br>
                Wheelchair Boarding: ${feature.properties.wheelchair_boarding}<br>
                Platform Code: ${feature.properties.platform_code}<br></p>`);;
  }
}).addTo(myMap);