# Boundaries


## Colorado boundaries

### Geocoding services

## Usage

From the www directory, create a symbolic link to the json dir, ala `ln -s ../json ./json`

We use http://mapshaper.org/ to simplify geojson files.

### Adding links to the results

In the case of voter's guides, you'll want to provide links to the guides for the specific races in the matched jurisdictions. This is how you do that.

1. Create a spreadsheet that looks like this below, with these four header rows: `location-type, location-id, title, url` [](screenshots/table-layout-screenshot.png)
    1. Values in location-type must correspond with the names of the geojson boundaries they match to: If you're adding a link that goes with, say, a US House candidate, and your US House geojson is named `us-house.json`, you'd put `us-house` in the spreadsheet.
    1. Values in location-id should correspond to the simplest part of the location name, lowercased. If you're adding a link that goes with U.S. House District 4, put "4" in the spreadsheet. If you're adding a link that goes with Teller County, put "teller" in the spreadsheet. If you're adding a link that goes with Crested Butte, put 'crested butte' in the spreadsheet.
    1. The value in the title will be the linked text, the value in url will be where the linked text clicks through to. If you leave url blank the text will not be linked. Links will be displayed in the order they appear in the spreadsheet.
1. Once your spreadsheet is filled out, convert it to a keyed JSON file. That means a JSON object should look something like what you see in [data/test.json](data/test.json). There are likely command line utilities out there to do this conversion, you could also use https://www.csvjson.com/csv2json
1. Once you have the json, save it in the data directory with a descriptive filename. Are you creating a voter guide for the 2018 election? `2018-general-election.json` is a fine file name. Add it to the repo.
1. Once your json is in the data directory, add it to the javascript config object in your project's index.html. The line will look something like `linker_data: 'data/2018-general-election.json',`, and all together the config object might look like
```js
var config = {
    center_point: [39,-105],
    default_zoom: 7,
    property: 'denverpost',
    simple: 0,
	boundaries: ['us-house', 'state-senate', 'state-house', 'city', 'county'],
	b: {
        'us-house': { name: 'U.S. House', id: 'namelsad' },
        'state-senate': { name: 'State senate district', id: 'district' },
        'state-house': { name: 'State house district', id: 'district' },
        'city': { name: 'City', id: 'name' },
        'county': { name: 'County', id: 'name' },
    },
    linker_data: 'data/2018-general-election.json',
};
```

### Configuring the boundaries list

The boundaries list lives in index.html and is handed off to the app.js on init();.

#### config.b

It's an object that looks something like this:

```js
	b: {
        'us-house-colorado': { name: 'Congressional district', id: 'CongDist' },
        'state-senate': { name: 'State senate', id: 'district' },
    },
```

Each object key corresponds with a filename in the [json](json/) directory. 

Each key's value is an object with two key-value pairs: One, `name`, that is the user-facing description of the boundary. The other, `id`, is...

#### config.boundaries

This object is an array of every `config.b` key that is live on the site.

Using the above example, if you wanted both us-house-colorado and state-senate active, your boundaries key-value pair would look like:

```js
    boundaries: ['us-house-colorado', 'state-senate'],
```

## Notes

To get the unique values of a particular column (assuming you have csvkit installed): `csvcut -c PRE_DIRECT Address_Point.csv | sort -u`

An unclean list of distinct special districts used in elections between 2008 and 2017: http://data.denverpost.com/election/results/district/

U.S. Census Bureau's list of geographic boundaries https://www.census.gov/geo/maps-data/data/tiger-cart-boundary.html

## Sources

* Counties (created 2015, not sure when the boundaries are current as of) http://catalog.civicdashboards.com/dataset/colorado-counties-polygon/resource/c9ddc844-6d01-4c7c-8c98-df932ea94597
* Cities (created 2015, not sure when the boundaries are current as of) http://catalog.civicdashboards.com/dataset/colorado-cities-polygon/resource/688ac390-6809-42e0-989d-58666074468c
* U.S. House - Colorado pulled from http://data.denverpost.com/election/results/president/2016/caucus/dem/

