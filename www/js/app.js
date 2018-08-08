// LET'S DO THIS
// GEO LAT/LONG LOOKUP OBJECT
var inbox = {};
var lookup = {
    config: {
        property: '',
        center_point: [],
        boundaries: [],
        b: {},
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
        return true;
    },
	wolf_callback: function(path) {
        // The callback function that fires after we download the geojson.
        lookup.wolfy.add(path, inbox.data);
    },
    geolocate: function() {
        var geolocation = {
          lat: this.config.center_point[0],
          lng: this.config.center_point[1]
        };
        var circle = new google.maps.Circle({
          center: geolocation,
          radius: 30
        });
        lookup.autocomplete.setBounds(circle.getBounds());
    },
    ul: document.querySelectorAll('#results ul')[0],
    add_marker: function(lat, lon, id, title) {
        // A wrapper for the map object's add marker.
        // add_marker: function (lat, lon, id, title, desc)
        lookup.marker = m.add_marker(lat, lon, id, title);
    },
    show_results: function() {
        // Get the place details from the autocomplete object.
        place = lookup.autocomplete.getPlace();
        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();
        var result = lookup.wolfy.find({lat: lat, lng: lng});
        lookup.add_marker(lat, lng, 'location', 'hiiii');
        lookup.result = result;
        var k = Object.keys(result);
        // Write the results to the page.
        // Include an option to map them.
        // To map them we'll need to go back to the lookup.wolfy object to get the boundaries.
        for ( var i = 0; i < k.length; i ++ ) {
            console.log(k[i]);
            var key = k[i].replace('json/' + lookup.config.property + '/simple/', '').replace('.json', '');
            var li = document.createElement('li');
            // “result[k[i]][lookup.config.b[key]['id']]” might be the most ridiculous array key gather operation I've done.
            var loc_type = lookup.config.b[key]['name'];
            var loc = 'Not available';
            if ( result[k[i]] !== null ) loc = result[k[i]][lookup.config.b[key]['id']];
            li.textContent = loc_type + ': ' + loc;
            lookup.ul.appendChild(li);
        }
    },
    init_autocomplete: function() {
		// Create the autocomplete object, restricting the search to geographical location types.
		this.autocomplete = new google.maps.places.Autocomplete(
			/** @type {!HTMLInputElement} */(document.getElementById('location-autocomplete')),
			{types: ['geocode']});

		// When the user selects an address from the dropdown, populate the address
		// fields in the form.
		this.autocomplete.addListener('place_changed', lookup.show_results);
    },
	init: function(config) {
        if ( config !== null ) this.update_config(config);

		// Start downloading the boundary files
		// get_json: function(path, obj, callback)
        for ( var i = 0; i < this.config.boundaries.length; i ++ ) {
            utils.get_json('json/' + lookup.config.property + '/simple/' + this.config.boundaries[i] + '.json', inbox, lookup.wolf_callback);
        }
	}
};

// MAP OBJECT
var m = {
    config: {
        center_point: [],
    },
    update_config: function(config) {
        // Take an external config object and update this config object.
        for ( var key in config )
        {
            if ( config.hasOwnProperty(key) )
            {
                this.config[key] = config[key];
            }
        }
        return true;
    },
    map: L.map('locator-map', { minZoom: 9, zoomControl:true, scrollWheelZoom:false }).setView(this.config.center_point, 10),
    markers: [],
    tile: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    add_marker: function (lat, lon, id, title, desc)
    {
        var marker = L.marker(new L.LatLng(lat, lon)).addTo(this.map);
        var content = "<h3><a href='#" + id + "'>" + title + "</a></h3><p>" + desc + "</p>";
        marker.bindPopup(content);
        this.markers.push(marker);
    },
    slugify: function(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-');
    },
    init: function(config) {
        if ( config !== null ) this.update_config(config);
        L.tileLayer(m.tile, {
            attribution: m.attribution,
            maxZoom: 16
        }).addTo(m.map);

        //this.map.fitBounds(this.marker_group);
        //m.map.addLayer(geoLayer);
    }
};

// UTILS
var utils = {
    ap_numerals: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
    months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    ap_months: ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    ap_date: function(date) {
        // Given a date such as "2018-02-03" return an AP style date.
        var this_year = new Date().getFullYear();
        var parts = date.split('-')
        var day = +parts[2];
        var month = this.ap_months[+parts[1] - 1];
        if ( this_year == +parts[0] ) return month + ' ' + day;
        return month + ' ' + day + ', ' + parts[0];
    },
    rando: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for ( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },
    add_zero: function(i) {
        // For values less than 10, return a zero-prefixed version of that value.
        if ( +i < 10 ) return "0" + i;
        return i;
    },
    parse_date_str: function(date) {
        // date is a datetime-looking string such as "2017-07-25"
        // Returns a date object.
        if ( typeof date !== 'string' ) return Date.now();

        var date_bits = date.split(' ')[0].split('-');

        // We do that "+date_bits[1] - 1" because months are zero-indexed.
        var d = new Date(date_bits[0], +date_bits[1] - 1, date_bits[2], 0, 0, 0);
        return d;
    },
    parse_date: function(date) {
        // date is a datetime-looking string such as "2017-07-25"
        // Returns a unixtime integer.
        var d = this.parse_date_str(date);
        return d.getTime();
    },
    days_between: function(from, to) {
        // Get the number of days between two dates. Returns an integer. If to is left blank, defaults to today.
        // Both from and to should be strings 'YYYY-MM-DD'.
        // Cribbed from https://stackoverflow.com/questions/542938/how-do-i-get-the-number-of-days-between-two-dates-in-javascript
        if ( to == null ) to = new Date();
        else to = this.parse_date_str(to);
        from = this.parse_date_str(from);
        var days_diff = Math.floor((from-to)/(1000*60*60*24));
        return days_diff;
    },
    get_json: function(path, obj, callback) {
        // Downloads local json and returns it.
        // Cribbed from http://youmightnotneedjquery.com/
        var request = new XMLHttpRequest();
        request.open('GET', path, true);

        request.onload = function() {
            if ( request.status >= 200 && request.status < 400 ) {
                obj.data = JSON.parse(request.responseText);
                callback(path);
            }
            else {
                console.error('DID NOT LOAD ' + path + request);
                return false;
            }
        };
        request.onerror = function() {};
        request.send();
    },
    add_class: function(el, class_name) {
        // From http://youmightnotneedjquery.com/#add_class
        if ( el.classlist ) el.classList.add(class_name);
        else el.className += ' ' + class_name;
        return el;
    },
    add_js: function(src, callback) {
        var s = document.createElement('script');
        if ( typeof callback === 'function' ) s.onload = function() { callback(); }
        //else console.log("Callback function", callback, " is not a function");
        s.setAttribute('src', src);
        document.getElementsByTagName('head')[0].appendChild(s);
    },
};