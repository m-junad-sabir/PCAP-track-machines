GIS Webmap to present the Project information, Progress and Status Grographically.

# Stack for WebGIS only

1. JS
2. CSS
3. HTML
4. Leaflet GIS Mapping

# Features/Functions to Add

## A. UI Sections Main:

1. Header -> Filters and Search in one-line Container
2. Body Container: 

    i. Mapview
    ii. Charts (two)

3. Right Collapsebale Side Panel (Attributes Popup info), Docked Container

## B. Other Features:

    1. Map View includes Layerlist, Legend, Zoom and Scalebar
    2. Search Data (Database interlinked)
    3. Popup info of each feature includes its dataset linked in DB that also includes images
    4. Charts of two type: Pie-chart representing overall grouped number of Machines status and Bar chart representing no of Machines status by Districts 

## C. Layers:

    i. Provincial Boundary
    ii. Districs Boundary
    iii. PIN Point Markers (coming from DB Lat Long)

## D. Filters details:

    1. Filter group no 1: District and Tehsil (with Zoom to Extent)
    2. Filter group no 2: By Machines Status groups (Approved/Rejected/Deferred)
    3. Filter group no 3: By User type group (QIC and DIC)
    4. Filter group no 4: By Date (to date and from date)

## E. Symbology of Layers on Mapview:

    i. Custom SVG Markers for Machines PIN Locations (Color scheme differ by status)
    ii. Districts: Black outline, no fill
    iii. Province: Red outline, no fill