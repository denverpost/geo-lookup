# Boundaries


## Colorado boundaries

### Geocoding services

## Usage

From the www directory, create a symbolic link to the json dir, ala `ln -s ../json ./json`

We use http://mapshaper.org/ to simplify geojson files.

## Notes

To get the unique values of a particular column (assuming you have csvkit installed): `csvcut -c PRE_DIRECT Address_Point.csv | sort -u`
