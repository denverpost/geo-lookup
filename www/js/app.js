// LET'S DO THIS
// GEO LOOKUP-TO-ARTICLE LINK & TEXT MANAGER OBJECT
// This lets us, once we get the results for a lookup,
// append linked text items below each matching boundary.
var linker = {
    config: {
        linker_data: '',
        path: '',
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
    data: {},
    markup: {},
    return_markup: function(type, id) {
        // Look in the markup object for a matching type & id,
        // if there's a match return the <li>'s wrapped in a <ul>.
        var m = linker.markup;
        id = id.toLowerCase();
        if ( m.hasOwnProperty(type) && m[type].hasOwnProperty(id) ) {
            return '<ul>' + m[type][id] + '</ul>';
        }
        return '';
    },
    collate: function() {
        // Loop through the data array and build the markup for the links.
        // We put the markup in a nested object that is, at the end here, assigned to linker.markup.
        //
        // This is what one object we loop through might look like:
        // {location-type: "state-house", location-id: 23, title: "State House District 23 voter's guide", url: "http://www.denverpost.com/"}
        // And this is what that object would be turned into by this loop:
        // { 'state-house': { '23': '<li><a href="http://www.denverpost.com/">State House District 23 voter's guide</a></li>' } }
        var l = linker.data.length;
        var m = {};
        for ( var i = 0; i < l; i ++ ) {
            var r = linker.data[i];
            var type = r['location-type'];
            var id = r['location-id'].toString();
            if ( !m.hasOwnProperty(type) ) m[type] = {};
            if ( !m[type].hasOwnProperty(id) ) m[type][id] = '';

            if ( r['url'] !== '' ) m[type][id] += '<li><a href="' + r['url'] + '" target="_top">' + r['title'] + '</a></li>';
            else m[type][id] += '<li>' + r['title'] + '</li>';
        }
        linker.markup = m;
    },
	init: function(config) {
        if ( config !== null ) this.update_config(config);

        if ( this.config.linker_data !== '' ) utils.get_json(this.config.path + this.config.linker_data, linker, linker.collate);
        else utils.get_json(this.config.path + 'data/test.json', linker, linker.collate);
        linker.collate();
    }
};

// GEO LAT/LONG LOOKUP OBJECT
var inbox = {};
var lookup = {
    config: {
        property: '',
        center_point: [],
        boundaries: [],
        b: {},
        border_colors: [
            '#FFBE00',
            '#BEFF00',
            '#00BEFF',
            '#FF00BE',
            '#BE00FF',
            '#306A00',
            '#6A0020',
            '#01384A'
        ],
        path: '',
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
        lookup.add_marker(lat, lng, 'location', '');
        lookup.result = result;
        // Make the results visible.
        document.getElementById('results').classList.remove('hide');

        
        // Write the results to the page.
        // Include an option to map them.
        // To map them we'll need to go back to the lookup.wolfy object to get the boundaries.
        var k = Object.keys(result);
        m.boundaries = {};
        for ( var i = 0; i < k.length; i ++ ) {
            // PLACE NAMES: This part of the loop gets and writes the place names to the page.
            // The complicated part is the getting of the place name. A lot of the lift in this code
            // is around communicating and organizing the geojson.
            console.log(k[i]);
            var key = k[i].replace(lookup.config.path + 'json/' + lookup.config.property + '/simple/', '').replace('.json', '');
            var li = document.createElement('li');
            var loc_type = lookup.config.b[key]['name'];
            // “result[k[i]][lookup.config.b[key]['id']]” is an intense array key collation operation
            var id_field_name = lookup.config.b[key]['id'];
            var color = lookup.config.border_colors[i];

            var loc = 'Not available';
            if ( result[k[i]] !== null ) loc = result[k[i]][id_field_name];
            li.textContent = loc_type + ': ' + loc;
            li.setAttribute('style', 'color: ' + color + ';');
            lookup.ul.appendChild(li);
            
            // Look if there are related links to add
            if ( typeof linker !== 'undefined' ) {
                // Make the loc value more machine-readable
                var loc_id = loc.toString().replace(', CO', '').replace(' County', '').replace(' ', '-');
                var markup = linker.return_markup(key, loc_id);
                if ( markup !== '' ) {
                    li = document.createElement('li');
                    li.setAttribute('class', 'sublist');
                    li.innerHTML = markup;
                    lookup.ul.appendChild(li);
                }
            }
            
            // PLACE BOUNDARIES: This part of the loop gets the place boundaries 
            var boundaries = lookup.wolfy.layers[k[i]];
            var len = boundaries.length;

            m.boundaries[key] = L.geoJSON().addTo(m.map);
            for ( var j = 0; j < len; j ++ ) {
                // If the id value matches the location (var named loc)
                // we established earlier, we have a match.
                if ( boundaries[j]['properties'][id_field_name] == loc ) {
                    console.log(boundaries[j]);
                    m.boundaries[key].addData(boundaries[j]).setStyle({ fillColor: color, color: color });
                }
            }
        }
        // Zoom to the outer borders of the largest object **TODO **HARD-CODED
        m.map.fitBounds(m.boundaries['us-house'].getBounds());
        //m.map.setZoom(m.map.getZoom() - 3);
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
            utils.get_json(this.config.path + 'json/' + lookup.config.property + '/simple/' + this.config.boundaries[i] + '.json', inbox, lookup.wolf_callback);
        }
	}
};

// LEAFLET MAP OBJECT
var m = {
    config: {
        center_point: [],
        default_zoom: 10,
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
    map: L.map('locator-map', { minZoom: 6, zoomControl:true, scrollWheelZoom:false }).setView(this.config.center_point, this.config.default_zoom),
    markers: [],
    tile: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    add_marker: function(lat, lon, id, title, desc)
    {
        var marker = L.marker(new L.LatLng(lat, lon)).addTo(this.map);
        var content = "<h3><a href='#" + id + "'>" + title + "</a></h3><p>" + desc + "</p>";
        marker.bindPopup(content);
        this.markers.push(marker);
    },
    add_boundary: function(geometry, slug) {
        // Given a geometry object, create a layer and add that boundary to the layer.
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

function init_app() {
    m.init(config);
	lookup.init(config);
	linker.init(config);
}
