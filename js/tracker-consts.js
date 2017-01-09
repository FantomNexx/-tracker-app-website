var DEFAULT_MAP_ZOOM = 18;


var image_track_point = {

    url: 'http://fantomsoftware.com/fantom_tracker/css/ic_track_point.png',

    size: new google.maps.Size(26, 26),

    origin: new google.maps.Point(0, 0),

    anchor: new google.maps.Point(13, 13)

};


var image_track_point_minor = {

    url: 'http://fantomsoftware.com/fantom_tracker/css/ic_track_point_minor.png',

    size: new google.maps.Size(26, 26),

    origin: new google.maps.Point(0, 0),

    anchor: new google.maps.Point(13, 13)

};


var GOOGLE_MAP_STYLES = [{


    "featureType": "landscape",

    "stylers": [

        {"saturation": 0},

        {"lightness": 0},

        {"visibility": "on"}]


}, {


    "featureType": "poi",

    "stylers": [

        {"saturation": 50},

        {"lightness": 0},

        {"visibility": "all"}]


}, {


    "featureType": "road.highway",

    "stylers": [

        {"saturation": -100},

        {"lightness": 20},

        {"visibility": "all"}]


}, {


    "featureType": "road.arterial",

    "stylers": [

        {"saturation": -100},

        {"lightness": 30},

        {"visibility": "on"}]


}, {


    "featureType": "road.local",

    "stylers": [

        {"saturation": -100},

        {"lightness": 40},

        {"visibility": "on"}]


}, {


    "featureType": "transit",

    "stylers": [

        {"saturation": -100},

        {"visibility": "all"}]


}, {


    "featureType": "administrative.province",

    "stylers": [

        {"visibility": "on"}]


}, {


    "featureType": "water",

    "elementType": "labels",

    "stylers": [

        {"visibility": "on"},

        {"lightness": -25},

        {"saturation": -100}]


}, {


    "featureType": "water",

    "elementType": "geometry",

    "stylers": [

        {"color": "#6fbbdf"},

        {"visibility": "on"}]


}, {


    "featureType": "water",

    "elementType": "labels.text.fill",

    "stylers": [

        {"color": "#ffffff"},

        {"visibility": "on"}]


}];