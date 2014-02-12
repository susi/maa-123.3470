var map;
var geocoder;
var directionsDisplay;
var directionsService;
var alternate = false;
var directionsDiv;
var autocomplete;
var places;
var selectedTravelMode;
var features;
var mapsEngineLayer;
var infowindow;
var legend;

function getFeatures() {
    var xhReq = new XMLHttpRequest();

    var server = "https://www.googleapis.com/mapsengine/v1/tables/";
    var table = "09463119221158894629-17468829640506321558";

    var GMErequestParams = {
        version: "published",
        key: "AIzaSyCOhR7E6unpcyL6UVTKlZIkkwH0xm7vmuY"
    };

    var url = server + table + "/features?";
    url += "version="+GMErequestParams.version;
    url += "&key="+GMErequestParams.key;

    xhReq.open("GET", url, false);
    xhReq.send(null);
    features = JSON.parse(xhReq.responseText);
    console.log(features);
    return features;
}

function initialize() {
    infowindow = document.getElementById("infowindow");
    var simple_atlas_style = [ { "featureType" : "poi",
        "stylers" : [ { "visibility" : "off" } ]
    },
      { "elementType" : "geometry",
        "featureType" : "administrative",
        "stylers" : [ { "visibility" : "off" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "administrative.land_parcel",
        "stylers" : [ { "visibility" : "on" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "administrative.country",
        "stylers" : [ { "visibility" : "on" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "administrative.province",
        "stylers" : [ { "visibility" : "on" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "administrative.neighborhood",
        "stylers" : [ { "visibility" : "on" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "administrative.locality",
        "stylers" : [ { "visibility" : "on" } ]
      },
      { "elementType" : "labels",
        "featureType" : "administrative.locality",
        "stylers" : [ { "hue" : "#548096" },
            { "saturation" : -50 },
            { "lightness" : 35 },
            { "visibility" : "on" }
          ]
      },
      { "elementType" : "labels",
        "featureType" : "road",
        "stylers" : [ { "visibility" : "simplified" } ]
      },
      { "elementType" : "geometry",
        "featureType" : "water",
        "stylers" : [ { "hue" : "#548096" },
            { "saturation" : -37 },
            { "lightness" : -10 },
            { "visibility" : "on" }
          ]
      },
      { "elementType" : "all",
        "featureType" : "landscape",
        "stylers" : [ { "hue" : "#E3CBAC" },
            { "saturation" : 31 },
            { "lightness" : -12 },
            { "visibility" : "on" }
          ]
      },
      { "featureType" : "road",
        "stylers" : [ { "visibility" : "simplified" },
            { "saturation" : -49 },
            { "lightness" : 5 }
          ]
      },
      { "elementType" : "geometry",
        "featureType" : "road",
        "stylers" : [ { "visibility" : "simplified" },
            { "saturation" : -90 },
            { "lightness" : 90 }
          ]
      },
      { "featureType" : "administrative.land_parcel",
        "stylers" : [ { "visibility" : "off" },
            { "lightness" : 25 }
          ]
      }
    ];

    var simpleAtlas = new google.maps.StyledMapType(simple_atlas_style, {name: "Simple Atlas"});

    var mapOptions = {
        center: new google.maps.LatLng(60.25, 25),
        zoom: 10,
        scaleControl: true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: true
        },
        mapTypeControlOptions: {
            mapTypeIds: [
                google.maps.MapTypeId.ROADMAP,
                google.maps.MapTypeId.TERRAIN,
                google.maps.MapTypeId.SATELLITE,
                google.maps.MapTypeId.HYBRID,
                'simple_atlas']
        },
        panControl: true,
        panControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.DEFAULT,
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
                              mapOptions);
    map.mapTypes.set('simple_atlas', simpleAtlas);
    map.setMapTypeId('simple_atlas');
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    places = new google.maps.places.PlacesService(map);

    mapsEngineLayer = new google.maps.visualization.DynamicMapsEngineLayer({
        mapId: '09463119221158894629-11613121305523030954',
        layerKey: 'mjr_01',
        map: map,
        clickable: true,
        suppressInfoWindows: true
    });
    google.maps.event.addListener(mapsEngineLayer, 'click', function(dynevent) {
        hideSearchResults();
        infowindow.innerHTML = '';

        mapsEngineLayer.getFeatureStyle(dynevent.featureId).resetAll();
        dynevent.getDetails(function(event) {
            var content = event.infoWindowHtml +
              '<br><a href="#" onclick="getdirections('+
              event.featureId+','+event.latLng.lat()+','+event.latLng.lng()+');">directions<a>';
            infowindow.innerHTML = content;
            infowindow.className = 'maximized';
            legend.className = 'legend';
        });
    });
    directionsDiv = document.getElementById('directions-widget');
    
    var searchBox = document.getElementById("search-system");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBox);

    var title = document.getElementById("title");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(title);
    
    legend = document.getElementById("legend");
    google.maps.event.addDomListener(legend, 'click', toggleLegend);
    google.maps.event.addDomListener(infowindow, 'click', toggleInfoWindow);

}

function getdirections(featureId, lat, lng) {
    var latLng = new google.maps.LatLng(lat,lng);
    // Create a div to hold the control.
    infowindow.className = 'minimized';

    if (map.controls[google.maps.ControlPosition.TOP_CENTER].length > 0) {
        map.controls[google.maps.ControlPosition.TOP_CENTER].pop();
    }
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(directionsDiv);

    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('from'),
        {
            bounds: map.getBounds(),
            componentRestrictions: { 'country': 'fi' },
            types: ['geocode']
        });
    document.getElementById('to').value = lat+","+lng;
    document.getElementById('real-to').value = lat+","+lng;
    geocoder.geocode({'latLng': latLng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                document.getElementById('to').value = results[0].formatted_address;
            }
        }
        directionsDiv.className = 'visible shadow';
        if (document.getElementById('to') && document.getElementById('from') && selectedTravelMode) {
            doDirections(selectedTravelMode);
        }
    });
}

function doDirections(travelMode) {
    selectedTravelMode = travelMode;
    selectImage(travelMode);
    var start = document.getElementById("from").value;
    var end;
    if (alternate) {
        end = document.getElementById("to").value;
    } else {
        end = document.getElementById("real-to").value;
    }
    var request = {
        origin:start,
        destination: end,
        travelMode: travelMode
    };
    console.log('Getting directions from ' + start + ' to ' + end);
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            console.log('Found a route!');
            directionsDisplay.setDirections(result);
            directionsDisplay.setMap(map);
            alternate = false;
        }
        else {
            if (!alternate) {
                alert("No direct route found.\nTrying to get as close as possible.");
                alternate = true;
                doDirections(travelMode);
            } else {
                alert("Route not found.\nCannot find a route. Please try another transportation method.");
                alternate = false;
            }
        }
    });
}

function closeDirections() {
    unselectAll();
    map.controls[google.maps.ControlPosition.TOP_CENTER].pop();
    directionsDisplay.setMap(null);
    selectedTravelMode = null;
}

function selectImage(travelMode) {
    if (travelMode == google.maps.TravelMode.DRIVING) {
        document.getElementById('car').src = 'img/auto_selected.png';
        document.getElementById('bus').src = 'img/bussi.png';
        document.getElementById('walk').src = 'img/walk.png';
        document.getElementById('bike').src = 'img/bike.png';
    }
    else if (travelMode == google.maps.TravelMode.TRANSIT) {
        document.getElementById('car').src = 'img/auto.png';
        document.getElementById('bus').src = 'img/bussi_selected.png';
        document.getElementById('walk').src = 'img/walk.png';
        document.getElementById('bike').src = 'img/bike.png';
    }
    else if (travelMode == google.maps.TravelMode.WALKING) {
        document.getElementById('car').src = 'img/auto.png';
        document.getElementById('bus').src = 'img/bussi.png';
        document.getElementById('walk').src = 'img/walk_selected.png';
        document.getElementById('bike').src = 'img/bike.png';
    }
    else if (travelMode == google.maps.TravelMode.BICYCLING) {
        document.getElementById('car').src = 'img/auto.png';
        document.getElementById('bus').src = 'img/bussi.png';
        document.getElementById('walk').src = 'img/walk.png';
        document.getElementById('bike').src = 'img/bike_selected.png';
    }
}

function unselectAll() {
    document.getElementById('car').src = 'img/auto.png';
    document.getElementById('bus').src = 'img/bussi.png';
    document.getElementById('walk').src = 'img/walk.png';
    document.getElementById('bike').src = 'img/bike.png';
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = new google.maps.LatLng(
          position.coords.latitude, position.coords.longitude);
      autocomplete.setBounds(new google.maps.LatLngBounds(geolocation,
          geolocation));
    });
  }
}

function makeSearchResultMouseOverFn(gx_id) {
    return function() {
        var style = mapsEngineLayer.getFeatureStyle(gx_id);
        style.iconSize = '200% 200%';
        style.iconOpacity = 1.0;
    }
}

function makeSearchResultClickFn(f, gx_id) {
    var coords = features.features[f].geometry.coordinates;
    return function() {
        var style = mapsEngineLayer.getFeatureStyle(gx_id);
        console.log("Mouse click on " + gx_id);
    }
}

function makeSearchResultMouseOutFn(gx_id) {
    return function() {
        mapsEngineLayer.getFeatureStyle(gx_id).resetAll();
    }
}

function search() {
    var hits = [];
    var searchBox = document.getElementById('search-box');
    var query = searchBox.value;

    features = getFeatures();

    for (var f in features.features) {
        for (var key in features.features[f].properties) {
            if (((typeof features.features[f].properties[key]) == (typeof '')) &&
                (features.features[f].properties[key].indexOf(query) != -1))
            {
                hits.push([f, features.features[f].properties.gx_id]);
                break;
            }
        }
    }
    var results = document.getElementById('search-results');
    results.innerHTML = '';
    for (var i in hits) {
        var gx_id = hits[i][1];
        f = hits[i][1];
        var result = document.createElement('div');
        result.className = 'result';
        result.onmouseover = makeSearchResultMouseOverFn(gx_id);
        result.onmouseout = makeSearchResultMouseOutFn(gx_id);
        result.onclick = makeSearchResultClickFn(f, gx_id);
        var name = document.createElement('h3');
        name.className = 'result-name';
        name.innerHTML = features.features[f].properties.nimi;
        var p = document.createElement('p');
        p.className = 'result-text';
        p.innerHTML = features.features[f].properties.kuvaus + '...';
        result.appendChild(name);
        result.appendChild(p);
        results.appendChild(result);
    }
    results.className = 'visible';
}

function hideSearchResults() {
    document.getElementById('search-results').className = 'hidden';
    document.getElementById('search-box').value='';
}

function toggleInfoWindow() {
    if (infowindow.className == 'minimized') {
        hideSearchResults();
        legend.className = 'legend';
        infowindow.className = 'maximized';
    }
    else {
        infowindow.className = 'minimized';
    }
}

function toggleLegend() {
    if (legend.className == 'legend') {
        hideSearchResults();
        infowindow.className = 'minimized';
        legend.className = 'full-legend';
    }
    else {
        legend.className = 'legend';
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
