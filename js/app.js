
	var locations = [
		{title: "USC", name: "University of Southern California", location: {lat: 34.022352, lng: -118.285117}},
		{title: "UCLA", name: "University of California, Los Angeles", location: {lat: 34.068921, lng: -118.445181}},
		{title: "Caltech", name: "California Institute of Technology", location: {lat: 34.137658, lng: -118.125269}},
		{title: "CSU Fullerton", name: "California State University, Fullerton", location: {lat: 33.882923, lng: -117.886926}},
		{title: "CSU Long Beach", name: "California State University, Long Beach", location: {lat: 33.783824, lng:-118.11409}},
		{title: "CSU Northridge", name: "California State University, Northridge", location: {lat: 34.242595, lng: -118.528069}},
		{title: "CSU Los Angeles", name: "California State University, Los Angeles", location: {lat: 34.068191, lng: -118.169043}},
		{title: "Cal Poly Pomona", name: "California State Polytechnic University, Pomona", location: {lat: 34.056528, lng: -117.821529}},
		{title: "Occidental College", name: "Occidental College", location: {lat: 34.127362, lng: -118.210504}},
		{title: "Loyola Marymount University", name: "Loyola Marymount University", location: {lat: 33.969818, lng: -118.418497}}
		
	];

	var map;
	var markers = ko.observableArray([]);

function initMap() {
       // TODO: use a constructor to create a new map JS object. You can use the coordinates
       // we used, 40.7413549, -73.99802439999996 or your own!

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.052234, lng: -118.243685},
		zoom: 20
	});


	var largeInfoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	for(var i = 0; i < locations.length; i++) {

		var title = locations[i].title;
		var position = locations[i].location;
		var name = locations[i].name;

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			name: name,
			animation: google.maps.Animation.DROP,
			icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2098d1",
			id: 1
			
		})

		markers.push(marker);
		bounds.extend(marker.position);

		marker.addListener("click", function() {
			populateInfoWindow(this, largeInfoWindow);
		});

	}

	function populateInfoWindow(marker, infoWindow) {

		if(infoWindow.marker != marker) {
			infoWindow.marker = marker;
			$.when(getWiki(marker.name)).done(function() {
				infoWindow.setContent("<div id='info-window'>" + "<h3 id='info-header'>" + marker.name + "</h3>" + "<p>" + collegeExtract + "</p>" + "</div>");
			});
			infoWindow.open(map, marker);
			infoWindow.addListener("closeclick", function(){
				infoWindow.setMarker(null);
			});
		}
	}
	map.fitBounds(bounds);
}
var collegeExtract;
var sentences;
function getWiki(name) {
	var wikiURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + name;
	var def = $.Deferred();
	collegeExtract = "";
	$.ajax( {
        url: wikiURL,
        dataType: "jsonp",
        success: function(response) {
            var results = response.query.pages;
            var propertyName;
            for (var property in results) {
                if (results.hasOwnProperty(property)) {
                 propertyName= property;
                }
            }
            var text = results[propertyName].extract;
            sentences = text.split(".");
            for(var i = 0; i < 7; i++) {
            	collegeExtract += (sentences[i] + ".");
            }
            
            def.resolve();
        }
	})
	return def.promise();


}





var ViewModel = function() {

	var self = this;

	/* this.collegeList = ko.observableArray([]);

	for(var i = 0; i < locations.length; i++) {
		this.collegeList.push(locations[i]);
	} */

	var list = document.getElementById("list");
	list.style.display = "none";

	this.showList = function() {

		if(list.style.display === "none") {
			list.style.display = "inline-block";
		} else {
			list.style.display = "none";
		}

		// locations = "";
	}

	this.markerClick = function(selected) {
		google.maps.event.trigger(selected, "click");
	} 




}
ko.applyBindings(new ViewModel());
