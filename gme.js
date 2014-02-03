var map;
var infowindow;
var geocoder;
var directionsDisplay;
var directionsService;
var alternate = false;
var directionsDiv;
var autocomplete;
var places;

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(60.25, 25),
        zoom: 10,
        scaleControl: true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: true
        },
        mapTypeId: google.maps.MapTypeId.STREET
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
                              mapOptions);

    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    places = new google.maps.places.PlacesService(map);

    infowindow = new google.maps.InfoWindow({
        content: '<div style="width:15em;">&nbsp;</div>'
    });
    var mapsEngineLayer = new google.maps.visualization.MapsEngineLayer({
        mapId: '09463119221158894629-11613121305523030954',
        layerKey: 'mjr_01',
        map: map,
        clickable: true,
        suppressInfoWindows: true
    });
    google.maps.event.addListener(mapsEngineLayer, 'click', function(event) {
        infowindow.close();
        var content = '<div class="googft-info-window">' + event.infoWindowHtml +
          '<div class="googft-info-window"><a href="#" onclick="getdirections('+
          event.featureId+','+event.latLng.lat()+','+event.latLng.lng()+');">directions<a></div></div>';
        infowindow.setContent(content);
        infowindow.setPosition(event.latLng);
        var anchor = new google.maps.MVCObject();
        anchor.set('position', event.latLng);
//        anchor.set('anchorPoint', event.pixelOffset);
        infowindow.open(map, anchor);
    });
    directionsDiv = document.getElementById('directions-widget');

}

function getdirections(featureId, lat, lng) {
    var latLng = new google.maps.LatLng(lat,lng);
    // Create a div to hold the control.
    infowindow.close();

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
    });
}

function doDirections(travelMode) {
    selectImage(travelMode);
    var start = document.getElementById("from").value;
    if (alternate) {
        var end = document.getElementById("to").value;
    } else {
        var end = document.getElementById("real-to").value;
    }
    var request = {
        origin:start,
        destination:end,
        travelMode: travelMode
    };
    console.log('Getting directions from ' + start + ' to ' + end);
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            console.log('FOund a route!');
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


google.maps.event.addDomListener(window, 'load', initialize);
