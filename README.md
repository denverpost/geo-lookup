# Boundaries


## Colorado boundaries

### Geocoding services

## Usage

From the www directory, create a symbolic link to the json dir, ala `ln -s ../json ./json`

We use http://mapshaper.org/ to simplify geojson files.

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

