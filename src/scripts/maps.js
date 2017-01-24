function initialize() {

  var styleArray = [
  {
    "featureType": "administrative",
    "elementType": "labels.text.fill",
    "stylers": [
    {
      "color": "#444444"
    }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "all",
    "stylers": [
    {
      "color": "#ffffff"
    }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "all",
    "stylers": [
    {
      "saturation": -100
    },
    {
      "lightness": 45
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "visibility": "on"
    },
    {
      "saturation": "100"
    },
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "simplified"
    }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.icon",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "all",
    "stylers": [
    {
      "visibility": "off"
    }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry.stroke",
    "stylers": [
    {
      "color": "#d3a87c"
    }
    ]
  },
  {
    "featureType": "water",
    "elementType": "all",
    "stylers": [
    {
      "color": "#e7e7e7"
    },
    {
      "visibility": "on"
    }
    ]
  }
  ];

  var myLatLng = {lat: 53.5651147, lng: 10.0224086};

  var mapOptions = {
    zoom: 15,
    center: myLatLng,
    styles: styleArray,
    disableDefaultUI: true
  };

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hochschule für angewandte Wissenschaften Hamburg Modecampus Armgartstraße (HAW Hamburg)'
  });


  var map = new google.maps.Map(document.getElementById('map'),
    mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);
