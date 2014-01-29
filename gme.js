var map;
var infowindow;

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(60.25, 25),
        zoom: 10,
        scaleControl: true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: true
        }
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
                              mapOptions);
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
        infowindow.setContent(event.infoWindowHtml);
        infowindow.setPosition(event.latLng);
        anchor = new google.maps.MVCObject();
        anchor.set('position', event.latLng);
//        anchor.set('anchorPoint', event.pixelOffset);
        infowindow.open(map, anchor);
    });
    
}

google.maps.event.addDomListener(window, 'load', initialize);
