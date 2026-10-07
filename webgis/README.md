# PCAP WebGIS — Map View (demo prototype)

Static WebGIS demo for the PCAP Farm Machinery Monitoring System. It shows QIC and DIC records for the Super Seeder on a map of Punjab. It is launched from the **Map View** item in the MIS portal (`app-prototype`) and opens in a new tab.

Stack: HTML, CSS and JavaScript, using Leaflet 1.9 and Chart.js 4 loaded from CDN. There is no build step. All machine data is demo data.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout: header with search and filters, map, charts, right-hand details panel |
| `webgis.css` | Light theme (`#10478f` primary, `#208644` secondary) |
| `webgis.js` | Map, layers, filters, search, charts and details panel. The `CONFIG` block is at the top of the file. |
| `data/machines.json` | Demo dataset: 48 machines with the same field names as the prototype, plus the photo captions |
| `public/QIC/`, `public/DIC/` | 8 demo photos for each inspection type, referenced by `qicPhotos` / `dicPhotos` in the JSON |

## Run locally

The page loads its data with `fetch`, so it has to be served over HTTP. Opening the file directly from disk (`file://`) will not work. From the repository root:

```
npx serve .
```

Then open `/webgis/` for the map, or `/app-prototype/` → MIS portal → **Map View**.

If you deploy the two folders separately, change `WEBGIS_URL` in `app-prototype/app.js` to the map's URL.

## Configure boundary layers

Edit `CONFIG` at the top of `webgis.js`:

| Key | Meaning |
|---|---|
| `PROVINCE_URL` | Province boundary (red outline). Empty for now; while it is empty the layer is skipped. |
| `DISTRICT_URL` | District boundaries (black outline). Currently a public ArcGIS Online GeoJSON item. |
| `TEHSIL_URL` | Tehsil boundaries (black outline). Shown only for the district selected in the filter. |
| `*_FIELD` | Attribute names used to match the District and Tehsil filters to boundary features |

Any URL that returns GeoJSON in WGS84 works, for example a GeoServer WFS request: `.../wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=ws:layer&outputFormat=application/json`. The service must allow cross-origin (CORS) requests from the domain that hosts this page.

## Features

- **Layer list:** OSM or Esri satellite basemap; QIC points, DIC points, province, district and tehsil overlays.
- **Map controls:** legend, zoom and scale bar.
- **Pins:** custom SVG markers. Color shows status (Approved green, Deferred red, Pending amber). The label shows the type: `Q` = QIC, placed at the manufacturer's location; `D` = DIC, placed at the farmer's location.
- **Filters:** District → Tehsil (zooms to the boundary's extent), Status, Type (QIC/DIC), and a From/To date range.
- **Search:** by Machine ID, punched code, farmer name, CNIC or IMEI.
- **Details panel:** clicking a pin or a search result opens the right-hand panel. It shows the full attributes, the QIC and DIC sections with 8 photo thumbnails each (click a thumbnail to enlarge it), and the discrepancy log.
- **Charts:** a pie chart of overall status and a stacked bar chart of status by district. Both follow the active filters.

Note: the District and Tehsil filters use the farmer's district. A QIC pin is placed at the manufacturer's location, so it can appear outside the selected district.
