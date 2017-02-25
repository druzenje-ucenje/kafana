// https://github.com/BorisMoore/jsrender/blob/master/demos/step-by-step/01_inserting-data.html

$(document).ready(function() {
    'use strict';
    // Module pattern
    var Kafana = function Outer() {
        var databaseResult = null;
        var mapInstance = null;
        var allMarkers = [];
        var $mapDiv = '';
        var $listDiv = '';
        var database = null;
        var mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(44.812827, 20.462383)
        };
        
        var configDatabase = {
            apiKey: "AIzaSyDyJ68yPVy8ODAq37Cf2eXXy2jfnOJU0Vs",
            authDomain: "kafana-634b4.firebaseapp.com",
            databaseURL: "https://kafana-634b4.firebaseio.com",
            storageBucket: "kafana-634b4.appspot.com",
            messagingSenderId: "603767142522"
        };

        function init(options) {
            $mapDiv = $(options.mapDiv);
            $listDiv = $(options.listDiv);
        }

        function start() {
            _drawMap();
            _getDataBase.then(_fillData);
        }

        var _drawMap = function() {
            mapInstance = new google.maps.Map($mapDiv.get(0), mapOptions);
        }

        var _getDataBase = new Promise(function(resolve, reject) {
            database = firebase.initializeApp(configDatabase);
            database.database().ref('/').once('value').then(function(snapshot) {
                var result = snapshot.val().dateCode;
                resolve(result);
            });
        });

        function _fillData(data) {
            databaseResult = data;
            _paintListItems(databaseResult);
            _drawMarkers(databaseResult);
            _fitBounds();
        }

        function _paintListItems (data) {
            var outputHtml = '';
            data.forEach((item, index) => {
                outputHtml += `<li class="list-group-item">${item.name} (${item.address}) 
                    <span class="fr">
                        <button data-key="${index}" class="voteButton js-voteButton">+</button> 
                        Glasova: <span class="js-voteHolder">${item.votes}</span>
                    </span>
                </li>`;
            });
            $listDiv.html(outputHtml);
            _addEventListeners();
        }

        function _drawMarkers(data) {
            data.forEach((item) => {
                var address = item.geo.split(',');
                var x = Number(address[0]);
                var y = Number(address[1]);
                allMarkers.push(new google.maps.Marker({
                    position: new google.maps.LatLng(x, y),
                    map: mapInstance,
                    title: item.name
                }));
            });
        }

        function _fitBounds() {
            var bounds = new google.maps.LatLngBounds();
            for(var i=0; i < allMarkers.length; i++) {
                bounds.extend(allMarkers[i].getPosition());
            }
            mapInstance.fitBounds(bounds);
        }

        function _addEventListeners() {
            function handler(e) {
                $(this).removeClass('js-voteButton');
                _databaseAddVote($(this).data('key'), $(this).parent().find('.js-voteHolder'));
            }
            $listDiv.on('click', '.js-voteButton', handler);
        }

        function _databaseAddVote (keyInDataBase, $votesHolder) {
            var key = database.database().ref(`/dateCode/${keyInDataBase}`);
            key.once('value').then(function(snapshot) {
                var oldValue = snapshot.val().votes;
                key.update({
                    votes: ++oldValue
                });
                $votesHolder.text(oldValue);
            });
        }

        return {
            init: init,
            start: start
        }
    };

    var glavnaKafana = Kafana();
    glavnaKafana.init({
        mapDiv: '.js-mainMap', 
        listDiv: '.js-listaKafana' 
    });
    glavnaKafana.start();

});
