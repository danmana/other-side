(function(){
    var mapDiv = document.getElementById('map');
    var otherDiv = document.getElementById('other');
    var map, other;
    function initMap() {
        // Madrid (since it's well known and the other side is in New Zealand, not somewhere in an ocean)
        var DEFAULT_LOCATION = {
            lat: 40.44818318159315,
            lng: -3.7405035624999594,
            zoom: 7
        };

        var saveTimeout;
        function saveLocation() {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
                saveTimeout = null;
            }
            // use a timeout to avoid trashing the location hash too fast
            saveTimeout = setTimeout(function(){
                var c = map.getCenter();
                var z = map.getZoom();
                top.location.hash = '@' + c.lat().toFixed(7) + ',' + c.lng().toFixed(7) + ',' + z + 'z';
                saveTimeout = null;
            },100);
        }

        function getLocation(hash){
            var lat, lng, z = 7, parts;
            if (hash && hash.indexOf('@') !== -1) {
                hash = hash.substring(hash.indexOf('@') + 1);
                if (hash[hash.length - 1] === 'z') {
                    hash = hash.substring(0, hash.length-1);
                }
                parts = hash.split(',');
                if (parts.length >= 2) {
                    lat = Number(parts[0]);
                    lng = Number(parts[1])
                    if (parts.length === 3) {
                        z = Number(parts[2]);
                    }
                    return {
                        lat: lat,
                        lng: lng,
                        zoom: z
                    };
                }
            }
            return DEFAULT_LOCATION;
        }


        var initialLocation = getLocation(top.location.hash);



        map = new google.maps.Map(mapDiv, {
            center: {
                lat: initialLocation.lat,
                lng: initialLocation.lng
            },
            zoom: initialLocation.zoom,
            mapTypeControlOptions: {
                mapTypeIds: ['roadmap', 'satellite']
            }
        });
        other = new google.maps.Map(otherDiv, {
            center: {
                lat: -initialLocation.lat,
                lng: initialLocation.lng + 180
            },
            zoom: initialLocation.zoom,
            disableDefaultUI: true
        });

        var info = document.getElementById('info-text');
        other.controls[google.maps.ControlPosition.TOP_LEFT].push(info);
        //info.style.display = 'none';

        var links = document.querySelectorAll('#info-text a'), i, link;
        for (i=0;i<links.length;i++) {
            link = links[i];
            if (link.href.indexOf('#@') !== -1) {
                link.addEventListener('click', function(e){
                    var loc = getLocation(this.hash);
                    map.setCenter({
                        lat: loc.lat,
                        lng: loc.lng
                    });
                    map.setZoom(loc.zoom);
                    e.preventDefault();
                    e.stopPropagation();
                });
            }
        }


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
            other.setCenter({
                lat: -c.lat(),
                lng: c.lng() + 180
            });
            saveLocation();
        }

        function onZoomChanged(){
            var other = getOther(this);
            var z = this.getZoom();
            other.setZoom(z);
            saveLocation();
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

