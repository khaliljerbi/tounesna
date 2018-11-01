// Google Map
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {lat: 35.821355, lng: 10.634874}
    });

    var image = '/assets/b_assets/images/icons/map-marker.png';

    var beachMarker = new google.maps.Marker({
        position: {lat: 35.821355, lng: 10.634874},
        map: map,
        icon: image
    });
}