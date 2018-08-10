# Boundaries


## Colorado boundaries

### Geocoding services

## Usage

From the www directory, create a symbolic link to the json dir, ala `ln -s ../json ./json`

We use http://mapshaper.org/ to simplify geojson files.

## Notes

To get the unique values of a particular column (assuming you have csvkit installed): `csvcut -c PRE_DIRECT Address_Point.csv | sort -u`

## Sources

* Counties (2015) http://catalog.civicdashboards.com/dataset/colorado-counties-polygon/resource/c9ddc844-6d01-4c7c-8c98-df932ea94597
* Cities (2015) http://catalog.civicdashboards.com/dataset/colorado-cities-polygon/resource/688ac390-6809-42e0-989d-58666074468c

