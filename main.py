from bs4 import BeautifulSoup
import urllib.parse 
import requests
import json

def isMarineLife(sciname):
    response = request(f"https://www.fisheries.noaa.gov/species-directory?oq={urllib.parse.quote_plus(sciname)}&field_species_categories_vocab=All&field_region_vocab=All&items_per_page=25").find_all("table", {"class": "table table-hover table-striped"})
    
    if len(response) > 0: 
        return True
    else:
        return False

def request_api(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error requesting API")

def request(url):
    response = requests.get(url)
    if response.status_code == 200:
        return BeautifulSoup(response.content, 'html5lib')
    else:
        print("Error requesting API")

def main():
    state= "Maine"
    county_name = "Washington"
    counties = request_api(f"https://cbdnet.info/arcgis/rest/services/Hosted/2023_SpeciesByCounty/FeatureServer/0/query?where=Name%3D%27{county_name}%27+AND+State%3D%27{state}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&defaultSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&timeReferenceUnknownClient=false&maxRecordCountFactor=&sqlFormat=none&resultType=&datumTransformation=&lodType=geohash&lod=&lodSR=&f=pjson")['features']

    for county in counties:        
        species = request_api(f"https://cbdnet.info/arcgis/rest/services/Hosted/2023_SpeciesByCounty/FeatureServer/1/query?where=st_co%3D%27{county['attributes']['st_co']}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&defaultSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnCentroid=false&timeReferenceUnknownClient=false&maxRecordCountFactor=&sqlFormat=none&resultType=&datumTransformation=&lodType=geohash&lod=&lodSR=&f=pjson")['features']
        for specie in species:
            if isMarineLife(specie['attributes']['sciname']):
                print(specie['attributes']['comname'] + " : " + specie['attributes']['sciname'])
            else:
                print("NOT : " + specie['attributes']['comname'])

main()