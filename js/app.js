	// Array filled with an object for each college
	var locations = [
		{title: "USC", name: "University of Southern California", category: "private", location: {lat: 34.022352, lng: -118.285117}},
		{title: "UCLA", name: "University of California, Los Angeles", category: "public", location: {lat: 34.068921, lng: -118.445181}},
		{title: "Caltech", name: "California Institute of Technology", category: "private", location: {lat: 34.137658, lng: -118.125269}},
		{title: "CSU Fullerton", name: "California State University, Fullerton", category: "public", location: {lat: 33.882923, lng: -117.886926}},
		{title: "CSU Long Beach", name: "California State University, Long Beach", category: "public", location: {lat: 33.783824, lng:-118.11409}},
		{title: "CSU Northridge", name: "California State University, Northridge", category: "public", location: {lat: 34.242595, lng: -118.528069}},
		{title: "CSU Los Angeles", name: "California State University, Los Angeles", category: "public", location: {lat: 34.068191, lng: -118.169043}},
		{title: "Cal Poly Pomona", name: "California State Polytechnic University, Pomona", category: "public", location: {lat: 34.056528, lng: -117.821529}},
		{title: "Occidental College", name: "Occidental College", category: "private", location: {lat: 34.127362, lng: -118.210504}},
		{title: "Loyola Marymount University", name: "Loyola Marymount University", category: "private", location: {lat: 33.969818, lng: -118.418497}}
		
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
	for(var i = 0; i < locations.length; i++) {

		var title = locations[i].title;
		var position = locations[i].location;
		var name = locations[i].name;
		var category = locations[i].category;

		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			name: name,
			category: category,
			animation: google.maps.Animation.DROP,
			icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|2098d1",
			id: 1
			
		})

		// Pushes Marker to Markers Array
		markers.push(marker);
		bounds.extend(marker.position);

		//Adds Event Listeners to Marker
		marker.addListener("click", function() {
			populateInfoWindow(this, largeInfoWindow);
			toggleBounce(this);
		});



	}
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
  			if (prevMarker.getAnimation() != null) {             
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

// Uses Wikipedia API to get an extract on each college
var collegeExtract;
var sentences;
function getWiki(name) {
	var wikiURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + name;
	var def = $.Deferred();
	collegeExtract = "";

	var wikiRequestTimeout = setTimeout(function() {
		collegeExtract = "Failed to load Wikipedia Extract"
	}, 8000);

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
            
            clearTimeout(wikiRequestTimeout);
            def.resolve();
        }
	})
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
	}

	// Causes Marker associated with List Item to trigger.
	this.markerClick = function(selected) {
		google.maps.event.trigger(selected, "click");
	} 


}

ko.applyBindings(new ViewModel());


// Filters the list items/map markers
filterSchools = function() {

	var selected = document.getElementById("school-select").selectedIndex;

	selected = document.getElementsByTagName("option")[selected].value;

	// Filters Map Markers
	for(var i = 0; i < markers().length; i++) {

		if(selected === "all") {
			markers()[i].setVisible(true);
		} else if(markers()[i].category == selected) {
			markers()[i].setVisible(true);
		} else {
			markers()[i].setVisible(false);
		}
	}

	var listItem = document.getElementsByClassName("list-item");
	// Fliters List Items
	for(var i = 0; i < listItem.length; i++) {
		if(selected === "all") {
			listItem[i].style.display = "inline";
		} else if(listItem[i].value == selected) {
			listItem[i].style.display = "inline";
		} else {
			listItem[i].style.display = "none";
		}
	}

}
