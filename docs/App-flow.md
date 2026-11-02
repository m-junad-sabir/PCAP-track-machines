# Application Flow

## Field QIC workflow
The field app supports QIC activity sign-in and the complete QIC inspection journey:

1. Intimation
2. Lot and firm
3. Eligibility gate
4. Worksheet for technical specification compliance
5. Certificate check
6. Geo-tagged photos
7. Sign-off

QIC inspections are saved locally and synchronized through the API. Field sign-in includes a hide/show password control.

## Dashboard flow

The dashboard provides:

- overview metrics and machine lifecycle
- QIC record review, filtered Excel/PDF exports, individual record PDF downloads, and photo/worksheet ZIP downloads
- DIC record listing, Excel/PDF exports, and uploaded-file ZIP downloads
- discrepancies
- reports
- machine-type configuration reference
- master-data staff CRUD
- map view

The dashboard login uses a full-window PCAP agricultural background, a controlled glass-blur overlay, and a centered sign-in card. It also includes a hide/show password control and the NESPAK “developed by” logo.

PCAP administrators and system administrators can create, update, reactivate, deactivate, and assign staff from Master data. Staff records can be assigned QIC and/or DIC activities and multiple districts from a searchable, alphabetized checkbox list. Password fields for add and edit operations include hide/show controls.

Master Data also maintains QIC certificate reference rows. Administrators enter the exact allottee, CNIC, mailing address, tehsil, Unique ID, punched 7-digit code, and tracker IMEI. Machine/implement ID is not collected or displayed in the dashboard or field app; the database uses the Unique ID internally as the certificate storage key. Updated rows are supplied to the field app and appear in the QIC certificate cross-check.

Master Data displays staff directly without a staff accordion. Staff can be viewed through All, QIC, and DIC category buttons, while the staff table uses the available panel space. The QIC certificate section starts without a district list; selecting a district immediately displays only that district's certificate records. Certificate Unique IDs must begin with the selected district short code, such as `OKR` for Okara. The field-app lookup also returns the district name and short code, where it is displayed alongside the downloaded QIC certificate and in certificate selection.

## API flow

The API implements authentication, QIC synchronization and review, GIS locations, QIC/DIC Excel and PDF reports, attachment downloads, DIC record listing, and administrator staff CRUD across these domain areas:

- assignments, audit, auth, and users
- certificates and discrepancies
- DIC, QIC, and TPV
- GIS and uploads
- manufacturers, reports, surveys, and synchronization
