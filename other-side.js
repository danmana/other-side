(function(){
    var mapDiv = document.getElementById('map');
    var otherDiv = document.getElementById('other');
    var map, other;
    function initMap() {
        // Madrid (since it's well known and the other side is in New Zealand, not somewhere in an ocean)
        var DEFAULT_LOCATION = {
            lat: 40.44818318159315,
            lng: -3.7405035624999594
        };
        map = new google.maps.Map(mapDiv, {
            center: DEFAULT_LOCATION,
            zoom: 7,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite']
            }
        });
        other = new google.maps.Map(otherDiv, {
            center: {lat: - DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng + 180},
            zoom: 7,
            disableDefaultUI: true
        });

        var info = document.getElementById('info-text');
        other.controls[google.maps.ControlPosition.TOP_LEFT].push(info);
        //info.style.display = 'none';

        var ok = document.getElementById('ok');
        var infoIcon = document.getElementById('info-icon');
        ok.addEventListener('click', function(){
            info.style.display = 'none';
            infoIcon.style.display = 'block';
        });


        infoIcon.addEventListener('click', function(){
            info.style.display = 'block';
            infoIcon.style.display = 'none';
        });
        other.controls[google.maps.ControlPosition.TOP_RIGHT].push(infoIcon);

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input.parentNode);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            // Clear out the old markers.
            markers.forEach(function(marker) {
                marker.setMap(null);
            });
            markers = [];

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function(place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };

                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
        });

        function getOther(thisMap) {
            return thisMap === map ? other: map;
        }

        function onlyOne(f) {
            return function(){
                if (f.processing && f.processing !== this) {
                    return;
                }
                f.processing = this;
                f.apply(this);
                delete f.processing;
            }
        }

        function onCenterChanged(){
            var other = getOther(this);
            var c = this.getCenter();
            console.log(c.lat(), c.lng());
            other.setCenter({
                lat: -c.lat(),
                lng: c.lng() + 180
            })
        }

        function onZoomChanged(){
            var other = getOther(this);
            var z = this.getZoom();
            other.setZoom(z);
        }

        function onMapTypeChanged(){
            var other = getOther(this);
            var typeId = this.getMapTypeId();
            other.setMapTypeId(typeId);
        }



        google.maps.event.addListener(map, 'center_changed', onlyOne(onCenterChanged));
        google.maps.event.addListener(other, 'center_changed', onlyOne(onCenterChanged));

        google.maps.event.addListener(map, 'zoom_changed', onlyOne(onZoomChanged));
        google.maps.event.addListener(other, 'zoom_changed', onlyOne(onZoomChanged));

        google.maps.event.addListener(map, 'maptypeid_changed', onMapTypeChanged);


    }

    window.initMap = initMap;
}());

