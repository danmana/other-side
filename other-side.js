(function(){
    var mapDiv = document.getElementById('map');
    var otherDiv = document.getElementById('other');
    var map, other;
    function initMap() {
        // Madrid (since it's well known and the other side is in New Zeeland, not somewhere in an ocean)
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

