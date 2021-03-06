// Array filled with an object for each college
var locations = [
	{title: "USC", name: "University of Southern California", category: "Private Schools", displaySchool: ko.observable(true), location: {lat: 34.022352, lng: -118.285117}},
	{title: "UCLA", name: "University of California, Los Angeles", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 34.068921, lng: -118.445181}},
	{title: "Caltech", name: "California Institute of Technology", category: "Private Schools", displaySchool: ko.observable(true), location: {lat: 34.137658, lng: -118.125269}},
	{title: "CSU Fullerton", name: "California State University, Fullerton", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 33.882923, lng: -117.886926}},
	{title: "CSU Long Beach", name: "California State University, Long Beach", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 33.783824, lng:-118.11409}},
	{title: "CSU Northridge", name: "California State University, Northridge", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 34.242595, lng: -118.528069}},
	{title: "CSU Los Angeles", name: "California State University, Los Angeles", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 34.068191, lng: -118.169043}},
	{title: "Cal Poly Pomona", name: "California State Polytechnic University, Pomona", category: "Public Schools", displaySchool: ko.observable(true), location: {lat: 34.056528, lng: -117.821529}},
	{title: "Occidental College", name: "Occidental College", category: "Private Schools", displaySchool: ko.observable(true), location: {lat: 34.127362, lng: -118.210504}},
	{title: "Loyola Marymount University", name: "Loyola Marymount University", category: "Private Schools", displaySchool: ko.observable(true), location: {lat: 33.969818, lng: -118.418497}}
	
];

var map;
var markers = ko.observableArray([]);
// Initializes Map
function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.052234, lng: -118.243685},
		zoom: 20
	});


	var largeInfoWindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// Turns each locations object into a Marker and adds it to the Markers array
	locations.forEach(function(loc) {

		var title = loc.title;
		var position = loc.location;
		var name = loc.name;
		var category = loc.category;
		var displaySchool = loc.displaySchool;

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			name: name,
			category: category,
			displaySchool: displaySchool,
			animation: google.maps.Animation.DROP,
			icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2098d1",
			id: 1
			
		});

		// Pushes Marker to Markers Array
		markers.push(marker);
		bounds.extend(marker.position);

		//Adds Event Listeners to Marker
		marker.addListener("click", function() {
			populateInfoWindow(this, largeInfoWindow);
			toggleBounce(this);
		});



	});
	// Creates an InfoWindow
	function populateInfoWindow(marker, infoWindow) {

		if(infoWindow.marker != marker) {
			infoWindow.marker = marker;
			// Calls the Wikipedia API
			$.when(getWiki(marker.name)).done(function() {
				infoWindow.setContent("<div id='info-window'>" + "<h3 id='info-header'>" + marker.name + "</h3>" + "<p>" + collegeExtract + "</p>" + "</div>");
			});
			infoWindow.open(map, marker);
			infoWindow.addListener("closeclick", function(){
				infoWindow.setMarker = null;
			});
		}
	}
	// Causes selected Marker to bounce
	var prevMarker;
	function toggleBounce(marker) {
		var newMarker = marker;
		if(prevMarker) {
  			if (prevMarker.getAnimation() !== null) {             
      			prevMarker.setAnimation(null);                               
      				newMarker.setAnimation(google.maps.Animation.BOUNCE);
      				prevMarker = newMarker;
  			}
		} else {
		  newMarker.setAnimation(google.maps.Animation.BOUNCE);
		  prevMarker = newMarker;
		}
	}

	map.fitBounds(bounds);
}

// Displays alert if Google Map API fails
function mapErrorHandling() {
	window.alert("Failed to load Google Map");
}

// Uses Wikipedia API to get an extract on each college
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
            collegeExtract += "<p id='attribution'>Content retrieved from Wikipedia. Text is available under the <a href='https://creativecommons.org/licenses/by-sa/3.0/'>Creative Commons Attribution-ShareAlike License</a>.</p>";
            def.resolve();
        }
	}).fail(function(e) {
		collegeExtract = "Failed to load Wikipedia Extract";
		def.resolve();

    });
	return def.promise();

}


var ViewModel = function() {

	var self = this;


	var list = document.getElementById("list");
	list.style.display = "none";
	// Causes List to show up when Hambuger Menu clicked
	this.showList = function() {

		if(list.style.display === "none") {
			list.style.display = "inline-block";
		} else {
			list.style.display = "none";
		}
	};

	// Causes Marker associated with List Item to trigger.
	this.markerClick = function(selected) {
		google.maps.event.trigger(selected, "click");
	};

	this.categories = ko.observableArray(["All Schools", "Public Schools", "Private Schools"]);
	this.selectedCategory = ko.observable();
	// Filters the list items/map markers
	this.filterSchools = function() {
		var selected = this.selectedCategory();

		// Filters Map Markers
		for(var i = 0; i < markers().length; i++) {

			if(selected === "All Schools") {
				markers()[i].setVisible(true);
				markers()[i].displaySchool(true);
			} else if(markers()[i].category === selected) {
				markers()[i].setVisible(true);
				markers()[i].displaySchool(true);

			} else {
				markers()[i].setVisible(false);
				markers()[i].displaySchool(false);

			}
		}

	};


};

ko.applyBindings(new ViewModel());





