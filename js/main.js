// https://github.com/BorisMoore/jsrender/blob/master/demos/step-by-step/01_inserting-data.html

$(document).ready(function() {
    var  allMarkers = [];

    var myOptions = {
        zoom: 16,
        center: new google.maps.LatLng(44.812827, 20.462383)
    }

    var map = new google.maps.Map(document.getElementById("map"), myOptions);

    function drawMarker(kafana, map) {
        // "123.32, 231.32"
        var address = kafana.geo.split(',');
        var x = Number(address[0]);
        var y = Number(address[1]);
        allMarkers.push(new google.maps.Marker({
            position: new google.maps.LatLng(x, y),
            map: map,
            title: kafana.name
        }));
        fitMap();
    }

    function fitMap() {
        var bounds = new google.maps.LatLngBounds();
        for(var i=0; i<allMarkers.length; i++) {
            bounds.extend(allMarkers[i].getPosition());
        }
        map.fitBounds(bounds);
    }

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDyJ68yPVy8ODAq37Cf2eXXy2jfnOJU0Vs",
        authDomain: "kafana-634b4.firebaseapp.com",
        databaseURL: "https://kafana-634b4.firebaseio.com",
        storageBucket: "kafana-634b4.appspot.com",
        messagingSenderId: "603767142522"
    };
    var baza = firebase.initializeApp(config);
    baza.database().ref('/').once('value').then(function(snapshot) {
        var outputHtml = '';
        var result = snapshot.val().dateCode;
        result.forEach(item => {
            outputHtml += `<li class="list-group-item">${item.name} (${item.address}) <span class="fr"><button class="voteButton">+</button> Glasova: ${item.votes}</span></li>`;
            drawMarker(item, map);
        });
        $('.js-listaKafana').html(outputHtml);
    });
});