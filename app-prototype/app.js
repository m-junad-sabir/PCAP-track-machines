/* ============================================================================
 * PCAP Farm Machinery Monitoring: prototype (app.js)
 *
 * This file draws every screen of the prototype: the Field Engineer app, the MIS portal and
 * the Web GIS map. It uses plain JavaScript only (no framework, no build step).
 *
 * HOW IT WORKS
 *   1. The state object S (section 5) remembers where the user is and what they typed.
 *   2. render() redraws the screen by calling app() or mis(), which return HTML strings.
 *   3. Buttons in that HTML call the functions in this file (for example onclick="next()"),
 *      which change S and call render() again.
 *
 * FINDING YOUR WAY
 *   Sections are numbered and listed below. Search "N." (for example "8.") to jump to one.
 *    1 Utilities          2 Configuration       3 Master data        4 Sample machines
 *    5 App state          6 Shared helpers      7 Launcher / sign-in 8 Form wizard (QIC, DIC)
 *    9 Defer lot         10 Sampling sheet     11 MIS portal        12 Web GIS      13 Start-up
 *
 * COMMON EDITS
 *   - Change a form question or option ... section 2 (GATE, QX, DX, LOTS, RSN, QP, DP)
 *   - Add or remove a wizard step ........ WZ (section 2) and step(), can(), auto() (section 8)
 *   - Add a manufacturer ................. FM (section 3)
 *   - Add a Field Engineer or district ... QFE / DFE (section 3)
 *   - Change colours or spacing .......... style.css
 *
 * SHORT NAMES (kept short because they appear inside the HTML strings)
 *   S state   M machines   FM / FIRMS manufacturers   D() read an answer   I F SEL CK inputs
 *   mch() chosen machine   cur() current step id      QIC / DIC = the two inspection forms
 *
 * PROTOTYPE ONLY: sample data, demo password, fake GPS and the "Autofill demo" button
 * stand in for the database, real login, phone GPS and camera of the production system.
 * ============================================================================ */

/* ============================================================================
 * 1. UTILITIES
 * Small helper functions used by every screen.
 * ============================================================================ */

/**
 * Tiny helpers used everywhere.
 * $(selector)  shortcut for document.querySelector
 * esc(text)    makes text safe inside an HTML attribute (escapes double quotes)
 * D(key)       reads one form answer from S.d (returns "" when empty)
 */
const $ = (s) => document.querySelector(s),
  esc = (s) => String(s == null ? "" : s).replace(/"/g, "&quot;"),
  D = (k) => (S.d[k] == null ? "" : S.d[k]);

/* ============================================================================
 * 2. CONFIGURATION
 * Edit these lists to change what the forms ask. Nothing else needs to change for simple edits.
 * ============================================================================ */

/* ---- Photos required ---- */

/**
 * Photos required for a QIC inspection, in the order shown in the app.
 * The app expects exactly 8 photos (see can() and auto()).
 */
const QP = [
  "Sign board of manufacturing firm",
  "Machine with tracker under mast frame (nobody beside it)",
  "UID plate with FE signature",
  "Punched 7-digit code",
  "Decoded UID-plate QR (farmer, father, CNIC, mobile, implement, firm, district)",
  "Decoded tracker QR (farmer, CNIC, implement)",
  "Decoded tracker QR (location + lat/long of firm)",
  "QIC members with manufacturer, in front of machine",
];

/**
 * Photos required for a DIC verification, in the order shown in the app (8 photos).
 */
const DP = [
  "CNIC card of farmer or nominee (both sides)",
  "Machine with tracker under mast (farmer/nominee beside it)",
  "UID plate with FE signature",
  "Punched 7-digit code",
  "Decoded UID-plate QR",
  "Decoded tracker QR (farmer, CNIC, implement)",
  "Decoded tracker QR (location + lat/long of farmer)",
  "DIC members with farmer, in front of machine",
];

/* ---- Eligibility / tamper gates ---- */

/**
 * Eligibility (QIC) and tamper (DIC) checks. Every box must be ticked before Continue works.
 * Edit a sentence to change a check. Items can be added or removed; the screen adapts automatically.
 */
const GATE = {
  QIC: [
    "UID plate with QR code is installed",
    "7-digit punched code is present and same as digits on UID plate (after Y01, before SS1/1)",
    "Tracking device installed under the mast frame",
  ],
  DIC: [
    "UID plate is NOT tampered (not re-riveted; QIC-stage FE signature in natural flow)",
    "7-digit punched code is NOT tampered (no digit ground or re-punched)",
    "Tracking device is installed under the mast frame",
  ],
};

/* ---- Certificate cross-check ---- */

/**
 * Certificate cross-check fields for QIC.
 * Each row: [key, label, function returning the certificate value, [sources to compare with]].
 * Add a source name to get one more comparison dropdown; nothing else needs to change.
 */
const QX = [
  [
    "name",
    "Farmer name",
    (m) => m.farmer,
    ["Printed on UID plate", "Decoded UID-plate QR", "Decoded tracker QR"],
  ],
  ["cnic", "CNIC number", (m) => m.cnic, ["Decoded UID-plate QR", "Decoded tracker QR"]],
  [
    "mid",
    "Machine ID",
    (m) => m.id,
    ["Printed on UID plate", "Decoded tracker QR", "Inspection report (col. 5)"],
  ],
  ["imei", "Tracker IMEI", (m) => m.imei, ["Label on tracking device"]],
];

/**
 * Certificate cross-check fields for DIC (also checks the mailing address against the CNIC card).
 */
const DX = [
  [
    "name",
    "Farmer name",
    (m) => m.farmer,
    ["CNIC card", "UID plate", "Decoded UID QR", "Decoded tracker QR"],
  ],
  ["cnic", "CNIC number", (m) => m.cnic, ["CNIC card", "Decoded UID QR", "Decoded tracker QR"]],
  ["addr", "Mailing address", (m) => m.addr, ["CNIC card", "Decoded tracker QR"]],
  ["mid", "Machine ID", (m) => m.id, ["UID plate", "Decoded tracker QR"]],
  ["imei", "Tracker IMEI", (m) => m.imei, ["Label on tracking device"]],
];

/**
 * CMP: choices offered for each comparison in the cross-check (only "Matches" counts as OK).
 * XR: reasons offered when a cross-check mismatch is raised.
 */
const CMP = ["Matches", "Does not match", "Not legible"],
  XR = [
    "Farmer name differs",
    "CNIC differs",
    "Address differs",
    "Machine ID differs",
    "IMEI differs",
    "Punched code differs",
    "Other",
  ];

/* ---- Workflow steps ---- */

/**
 * Steps of each wizard, in order: [step id, title shown on screen].
 * Each id is handled in three places: step() draws it, can() decides when Continue is allowed,
 * and auto() fills it with demo data. To add a step, add an id here and a branch in those three functions.
 */
const WZ = {
  QIC: [
    ["intim", "Intimation"],
    ["lot", "Lot and firm"],
    ["gate", "Eligibility gate"],
    ["sheet", "Sampling sheet"],
    ["x", "Certificate check"],
    ["ph", "Geo-tagged photos"],
    ["sign", "Sign-off"],
  ],
  DIC: [
    ["intim", "Intimation"],
    ["head", "Verification header"],
    ["gate", "Tamper gate"],
    ["chain", "Chain of custody"],
    ["x", "Certificate check"],
    ["hand", "Handover"],
    ["ph", "Geo-tagged photos"],
    ["sign", "Sign-off"],
  ],
};

/* ---- Dropdown options ---- */

/**
 * Lot sizes offered in the "Size of lot offered" dropdown.
 */
const LOTS = [
  "10",
  "20",
  "25",
  "50",
  "75",
  "100",
  
];

/**
 * Standard reasons offered when a lot or machine is deferred.
 */
const RSN = [
  "Blade hardness below HRC 40",
  "Dimensions out of specification",
  "Welding / paint quality poor",
  "Parameter missing or not as per spec",
  "UID / tracker mismatch",
  "Other",
];

/* ---- Other constants ---- */

/**
 * Date written on new records in this demo (a real build would use the current date).
 */
const T0 = "2026-09-28";

/**
 * Demo password shared by every account. Prototype only: the real build uses server-side authentication.
 */
const PW = "pcap123";

/* ============================================================================
 * 3. MASTER DATA
 * Real project data taken from the PCAP files: manufacturers, FE deployment and districts.
 * In the real build this lives in the database.
 * ============================================================================ */

/* ---- Pre-qualified manufacturers ---- */

/**
 * Which QIC division each manufacturer district belongs to (from the QIC deployment sheet).
 */
const DIV = {
  Lahore: "Lahore",
  Kasur: "Lahore",
  Okara: "Lahore",
  Gujranwala: "Gujranwala",
  Hafizabad: "Gujranwala",
  Sialkot: "Sialkot",
  Faisalabad: "Faisalabad",
  Vehari: "Multan",
  Multan: "Multan",
};

/**
 * Pre-qualified manufacturers (source: List of Pre-qualified Manufacturers).
 * Each row: [name, district, place, latitude, longitude]. GPS values are approximate placeholders.
 */
const FM = [
  ["Agro-Ten Khan and Sons", "Lahore", "Lahore", 31.52, 74.36],
  ["Al Inayat & Sons", "Lahore", "Lahore", 31.47, 74.3],
  ["R.K. Engineering", "Kasur", "Kasur", 31.12, 74.45],
  ["Madina Zari Engineers", "Okara", "Lahore Road, Okara", 30.81, 73.45],
  ["Ittefaq Zari Industry", "Okara", "Lahore Road, Okara", 30.82, 73.47],
  ["New Faisal Zari Industry", "Okara", "Okara", 30.8, 73.43],
  ["Sarwar Zarai Industry", "Okara", "Okara", 30.79, 73.46],
  ["Rehman Agro Engineers", "Okara", "Lahore Road, Okara", 30.83, 73.44],
  ["Madina Zari Industry", "Okara", "Depalpur, Okara", 30.67, 73.65],
  ["Usmania Zari Engineering", "Okara", "Okara", 30.81, 73.42],
  ["AH International", "Gujranwala", "Noshehra Virkan, Gujranwala", 31.99, 73.97],
  ["Al Qasim Agri. Engg", "Gujranwala", "Noshehra Virkan, Gujranwala", 31.98, 73.99],
  ["Bahawal Engg", "Gujranwala", "Kamoke, Gujranwala", 31.97, 74.22],
  ["Ranja Construction", "Gujranwala", "Noshehra Virkan, Gujranwala", 31.97, 73.98],
  ["Umar Agri. Industry", "Gujranwala", "GT Road, Gujranwala", 32.16, 74.19],
  ["Noor Ahmad International", "Hafizabad", "Hafizabad", 32.07, 73.69],
  ["Saman Sarwar Zari Alat", "Hafizabad", "Hafizabad", 32.08, 73.68],
  ["Prime Fazlia", "Hafizabad", "Hafizabad", 32.06, 73.7],
  ["Cheema Agro Services", "Sialkot", "Daska, Sialkot", 32.32, 74.35],
  ["New Afzal Agro Center", "Sialkot", "Daska, Sialkot", 32.33, 74.36],
  ["MN Industry", "Sialkot", "Daska, Sialkot", 32.31, 74.34],
  ["Green Land Engrs", "Sialkot", "Daska, Sialkot", 32.32, 74.33],
  ["Sattar and Co.", "Sialkot", "Daska, Sialkot", 32.34, 74.35],
  ["Super Hamdarad Agro Engg", "Sialkot", "Daska, Sialkot", 32.33, 74.37],
  ["Amjad Brothers", "Faisalabad", "Faisalabad", 31.42, 73.08],
  ["Supreme Agri Implements", "Faisalabad", "Faisalabad", 31.4, 73.1],
  ["Niaz and Sons Zari", "Vehari", "Vehari", 30.05, 72.35],
  ["Agri Tech Industries Pvt. Ltd.", "Multan", "Multan", 30.16, 71.52],
];

/**
 * Lookup built from FM, keyed by manufacturer name: [division, place, latitude (text), longitude (text), district].
 * Do not edit this one; change FM instead.
 */
const FIRMS = Object.fromEntries(
  FM.map((f) => [f[0], [DIV[f[1]], f[2], "" + f[3], "" + f[4], f[1]]]),
);

/**
 * Convener titles shown on screen. The source files give no names, so the role and place are shown.
 */
const convQ = (d) => "Director Agri. Engineering, " + d + " Division",
  convD = (d) => "Deputy Director Agri. Engineering, " + d;

/* ---- Field Engineer deployment and login accounts ---- */

/**
 * Field Engineers deployed for QIC duty (source: Deployment of FEs for QIC duty).
 * Each row: [FE name, [[district, number of manufacturers], ...]].
 */
const QFE = [
  ["Dr. Muhammad Ashraf", [["Faisalabad", 2]]],
  ["Abdul Aleem", [["Multan", 1]]],
  ["Ishtiaq Ali", [["Vehari", 1]]],
  ["Muhammad Akram", [["Kasur", 1]]],
  ["Rizwan ur Rehman", [["Lahore", 2]]],
  ["Mohsin Masood", [["Okara", 7]]],
  [
    "Abdul Mannan Ghaffar",
    [
      ["Gujranwala", 5],
      ["Hafizabad", 3],
    ],
  ],
  ["Muhammad Zubair", [["Sialkot", 6]]],
];

/**
 * Field Engineers deployed for DIC duty (source: Deployment of FEs for DIC duty).
 * Each row: [FE name, [[district, machines to verify], ...]]. 22 FEs, 35 districts, 5,000 machines.
 */
const DFE = [
  ["Dr. Muhammad Ashraf", [["Faisalabad", 102]]],
  [
    "Dr. Alamgir Akhter Khan",
    [
      ["Muzaffargarh", 56],
      ["Kot Addu", 14],
      ["Layyah", 24],
    ],
  ],
  ["Abdul Waheed Zafar", [["Sargodha", 203]]],
  [
    "Abdul Aleem",
    [
      ["Multan", 46],
      ["Lodhran", 35],
    ],
  ],
  ["Ghulam Siddique", [["Khanewal", 82]]],
  ["Muhammad Akram", [["Kasur", 203]]],
  [
    "Dr. Usama Bin Ajmal",
    [
      ["Dera Ghazi Khan", 96],
      ["Rajanpur", 64],
    ],
  ],
  [
    "Abdul Mannan Ghaffar",
    [
      ["Gujranwala", 388],
      ["Hafizabad", 412],
      ["Gujrat", 86],
    ],
  ],
  [
    "Mian Haroon Ahmad",
    [
      ["Mandi Bahauddin", 170],
      ["Wazirabad", 222],
    ],
  ],
  ["Rizwan ur Rehman", [["Lahore", 53]]],
  [
    "Muhammad Ahmed",
    [
      ["Jhang", 241],
      ["Chiniot", 113],
    ],
  ],
  [
    "Amir Nazir",
    [
      ["Sheikhupura", 427],
      ["Nankana Sahib", 202],
    ],
  ],
  [
    "Muhammad Naeem",
    [
      ["Sahiwal", 83],
      ["Pakpattan", 154],
    ],
  ],
  ["Mohsin Masood", [["Okara", 254]]],
  ["Altaf Hussain", [["Rahim Yar Khan", 90]]],
  ["Shah Rasool", [["Bahawalnagar", 247]]],
  ["Faizan Khan", [["Narowal", 232]]],
  ["Abdul Ghaffar", [["Toba Tek Singh", 114]]],
  ["Ishtiaq Ali", [["Vehari", 127]]],
  [
    "Abid Hussain Jaffery",
    [
      ["Khushab", 58],
      ["Bhakkar", 24],
      ["Mianwali", 29],
      ["Jhelum", 10],
    ],
  ],
  ["Abid Ali", [["Bahawalpur", 39]]],
  ["Muhammad Zubair", [["Sialkot", 300]]],
];

/**
 * Turns a deployment list into login accounts: qic01, qic02, ... or dic01, dic02, ...
 * Each account: { u: username, n: FE name, d: assigned districts }.
 */
const mkU = (L, p) =>
  L.map((f, i) => ({ u: p + String(i + 1).padStart(2, "0"), n: f[0], d: f[1] }));

/**
 * Demo login accounts for each module. Usernames are listed on the sign-in screen; the password is PW.
 */
const USERS = {
  qic: mkU(QFE, "qic"),
  dic: mkU(DFE, "dic"),
  survey: [{ u: "survey01", n: "Survey Field Engineer", d: [] }],
  tpv: [{ u: "tpv01", n: "TPV Field Engineer", d: [] }],
};

/**
 * Name of the FE assigned to a district for QIC / DIC duty (used when creating sample records).
 */
const qfeFor = (d) => (QFE.find((f) => f[1].some((y) => y[0] == d)) || [""])[0],
  dfeFor = (d) => (DFE.find((f) => f[1].some((y) => y[0] == d)) || [""])[0];

/* ---- Districts ---- */

/**
 * District centres [latitude, longitude] (approximate). Used to place sample farmers on the map.
 * The keys are also the list of the 35 DIC districts.
 */
const DC = {
  Faisalabad: [31.418, 73.079],
  Muzaffargarh: [30.074, 71.193],
  "Kot Addu": [30.47, 70.967],
  Layyah: [30.961, 70.939],
  Sargodha: [32.083, 72.671],
  Multan: [30.157, 71.524],
  Lodhran: [29.539, 71.633],
  Khanewal: [30.301, 71.932],
  Kasur: [31.116, 74.45],
  "Dera Ghazi Khan": [30.056, 70.634],
  Rajanpur: [29.104, 70.325],
  Gujranwala: [32.162, 74.188],
  Hafizabad: [32.071, 73.688],
  Gujrat: [32.574, 74.075],
  "Mandi Bahauddin": [32.586, 73.491],
  Wazirabad: [32.443, 74.12],
  Lahore: [31.52, 74.358],
  Jhang: [31.269, 72.318],
  Chiniot: [31.72, 72.978],
  Sheikhupura: [31.713, 73.985],
  "Nankana Sahib": [31.449, 73.707],
  Sahiwal: [30.666, 73.108],
  Pakpattan: [30.343, 73.389],
  Okara: [30.808, 73.446],
  "Rahim Yar Khan": [28.42, 70.297],
  Bahawalnagar: [29.95, 73.1],
  Narowal: [32.101, 74.78],
  "Toba Tek Singh": [30.972, 72.483],
  Vehari: [30.045, 72.352],
  Khushab: [32.297, 72.351],
  Bhakkar: [31.627, 71.065],
  Mianwali: [32.577, 71.526],
  Jhelum: [32.934, 73.731],
  Bahawalpur: [29.395, 71.683],
  Sialkot: [32.494, 74.531],
};

/**
 * The 35 DIC district names (the keys of DC).
 */
const DIST35 = Object.keys(DC);

/* ============================================================================
 * 4. SAMPLE MACHINES
 * Demo records so every screen has something to show. Replace with API data in the real build.
 * ============================================================================ */

/**
 * Sample farmer names [farmer, father] used to generate demo machines.
 */
const FN2 = [
  ["Muhammad Aslam", "Rehmat Ullah"],
  ["Riaz Ahmad", "Nazir Ahmad"],
  ["Ghulam Nabi", "Allah Ditta"],
  ["Tahir Mehmood", "Mehmood Akhtar"],
  ["Zahid Iqbal", "Iqbal Hussain"],
  ["Shahid Ali", "Ghulam Rasool"],
  ["Imran Khan", "Sher Khan"],
  ["Naveed Anjum", "Anjum Butt"],
  ["Mazhar Abbas", "Abbas Ali"],
  ["Khalid Hussain", "Hussain Bakhsh"],
  ["Sajid Nawaz", "Nawaz Din"],
  ["Waqas Ahmad", "Ahmad Yar"],
  ["Arshad Mehmood", "Muhammad Bakhsh"],
  ["Faisal Raza", "Raza Ali"],
  ["Asif Javed", "Javed Iqbal"],
  ["Nadeem Akhtar", "Akhtar Ali"],
];

/**
 * Creates one machine record. A machine is filled in first by QIC, then by DIC.
 *   id, code          machine ID and 7-digit punched code
 *   farmer, father, cnic, contact, addr, tehsil, dist   the allottee (dist = farmer's district)
 *   div, firm, imei   QIC division, manufacturer, tracker IMEI
 *   qicNo, qicStatus, qicDate, qicFE, lat, lng   QIC result and GPS of the firm
 *   sheet, sheetName  sampling sheet image uploaded at QIC (JPG data)
 *   dicNo, dicStatus, dicDate, dicFE, dlat, dlng DIC result and GPS of the farmer
 *   reason, open, log reason if deferred, open discrepancy flag, history entries
 */
const mkM = (firm, fd, i) => {
  const f = FIRMS[firm],
    n = FN2[i % FN2.length],
    code = 3641715 + i;
  return {
    id: "Y01-" + code + "-SS1/1",
    code: "" + code,
    farmer: n[0],
    father: n[1],
    cnic: String(3520200000000 + i * 1234567),
    contact: "0300-12345" + (10 + i),
    addr: "Chak " + (10 + i) + ", " + fd,
    tehsil: fd,
    dist: fd,
    div: f[0],
    firm,
    imei: "356938035643" + (800 + i),
    qicNo: "",
    qicStatus: "",
    qicDate: "",
    qicFE: "",
    lat: "",
    lng: "",
    dicNo: "",
    dicStatus: "",
    dicDate: "",
    dicFE: "",
    dlat: "",
    dlng: "",
    reason: "",
    open: false,
    log: [],
  };
};

/**
 * All machine records. In the real build these come from the database through the API; here they are sample data.
 */
const M = [];

/**
 * Sample machines that already went through QIC (some also through DIC).
 * Each row: [manufacturer, farmer district, QIC status, DIC status ("" = not delivered yet)].
 */
[
  ["Amjad Brothers", "Faisalabad", "Approved", "Approved"],
  ["Supreme Agri Implements", "Jhang", "Approved", "Approved"],
  ["Agri Tech Industries Pvt. Ltd.", "Multan", "Approved", ""],
  ["Niaz and Sons Zari", "Vehari", "Approved", "Approved"],
  ["Umar Agri. Industry", "Gujranwala", "Approved", ""],
  ["AH International", "Hafizabad", "Deferred", ""],
  ["Madina Zari Engineers", "Okara", "Approved", "Approved"],
  ["R.K. Engineering", "Kasur", "Approved", ""],
  ["Cheema Agro Services", "Sialkot", "Approved", "Deferred"],
  ["Al Inayat & Sons", "Lahore", "Approved", ""],
  ["Noor Ahmad International", "Narowal", "Approved", "Approved"],
  ["Al Qasim Agri. Engg", "Sheikhupura", "Approved", ""],
  ["Supreme Agri Implements", "Faisalabad", "Approved", ""],
].forEach((a, i) => {
  const m = mkM(a[0], a[1], i),
    dd = (n) => "2026-09-" + String(n).padStart(2, "0");
  Object.assign(m, {
    qicNo: "QIC-" + (101 + i),
    qicStatus: a[2],
    qicDate: dd(4 + i),
    qicFE: qfeFor(FIRMS[a[0]][4]),
  });
  if (a[3])
    Object.assign(m, {
      dicNo: "DIC-" + (201 + i),
      dicStatus: a[3],
      dicDate: dd(12 + i),
      dicFE: dfeFor(a[1]),
    });
  if (a[2] == "Deferred") {
    m.reason = "UID plate and tracker QR mismatch";
    m.open = true;
    m.log.push({
      t: dd(4 + i),
      who: "FE " + m.qicFE,
      m: "Entire lot deferred at step 'Certificate check': UID / tracker mismatch",
    });
  }
  if (a[3] == "Deferred") {
    m.reason = "UID plate tampering suspected";
    m.open = true;
    m.log.push({ t: dd(12 + i), who: "FE " + m.dicFE, m: "DIC deferred: tamper check failed" });
  }
  M.push(m);
});

/**
 * One machine awaiting QIC for every pre-qualified manufacturer.
 */
FM.forEach((f, j) => M.push(mkM(f[0], DIST35[(j * 7 + 3) % 35], 13 + j)));

/**
 * Adds GPS positions: the firm location for QIC, and the farmer's district centre for DIC.
 */
M.forEach((m, i) => {
  const f = FIRMS[m.firm];
  if (m.qicStatus) {
    m.lat = (+f[2] + (((i * 37) % 10) - 5) / 1000).toFixed(5);
    m.lng = (+f[3] + (((i * 53) % 10) - 5) / 1000).toFixed(5);
  }
  const c = DC[m.dist];
  if (m.dicStatus && c) {
    m.dlat = (c[0] + (((i * 29) % 10) - 5) / 100).toFixed(5);
    m.dlng = (c[1] + (((i * 41) % 10) - 5) / 100).toFixed(5);
  }
});

/* ============================================================================
 * 5. APP STATE
 * Everything the screens need to remember lives in this one object.
 * ============================================================================ */

/**
 * Application state: one object that every screen is drawn from.
 *   tab, view     "app" or "mis"; view = current MIS page (dash, qic, dic, disc, rep, cfg, master, gis)
 *   mod, sub      module chosen on the launcher (qic, dic, survey, tpv) and survey type (base, mid, end)
 *   auth, user    signed in?, and the Field Engineer account
 *   lu, lp, lerr  typed username, password and the sign-in error text
 *   mode, step    form in progress ("QIC" or "DIC") and the index of the current step in WZ
 *   d             all answers of the form in progress, read with D("key") and written by inputs
 *   defer         true while the "Defer complete lot" panel is open
 *   sel, rep, lb  MIS: selected machine id, report tab, machine whose sampling sheet is open
 *   g             map: layers (lay), filters (div, st), zoom (z), centre (cx, cy), selected item (sel)
 */
let S = {
  user: null,
  lb: null,
  g: {
    lay: { out: 1, dis: 1, rte: 1, mfr: 1, del: 1 },
    div: "",
    st: "",
    z: 1,
    cx: 300,
    cy: 290,
    sel: null,
  },
  mod: null,
  sub: null,
  auth: false,
  defer: false,
  lu: "",
  lp: "",
  lerr: "",
  tab: "app",
  view: "dash",
  mode: null,
  step: 0,
  d: {},
  sel: null,
  rep: "qs",
};

/* ============================================================================
 * 6. SHARED HELPERS
 * Screen switching, input builders and small utilities used by the FE app and the MIS portal.
 * ============================================================================ */

/* ---- Screen drawing ---- */

/**
 * Shows a short pop-up message at the bottom of the screen for about 3 seconds.
 */
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.style.display = "block";
  clearTimeout(toast.h);
  toast.h = setTimeout(() => (t.style.display = "none"), 2800);
}

/**
 * Switches between the FE app and the MIS portal (top bar buttons).
 */
function tab(t) {
  S.tab = t;
  render(1);
}

/**
 * Redraws the whole screen from the state S: FE app or MIS portal, depending on S.tab.
 * Scroll position is kept unless "top" is true. Call it after changing S.
 */
function render(top) {
  const b = $(".body"),
    sc = b && !top ? b.scrollTop : 0;
  $("#t-app").className = S.tab == "app" ? "on" : "";
  $("#t-mis").className = S.tab == "mis" ? "on" : "";
  $("#root").innerHTML = S.tab == "app" ? app() : mis();
  const nb = $(".body");
  if (nb) nb.scrollTop = sc;
  paint();
}

/**
 * Enables or disables the Continue button after every keystroke, using can().
 */
function paint() {
  const b = $("#nx");
  if (b) b.disabled = !can();
}

/* ---- Form field builders ---- */

/**
 * Text input linked to S.d[key]. Typing updates the answer without redrawing the screen.
 * I(key, placeholder, extraAttributes)
 */
const I = (k, ph, ex) =>
  `<input type=text ${ex || ""} placeholder="${esc(ph || "")}" value="${esc(D(k))}" oninput="S.d['${k}']=this.value;paint()">`;

/**
 * A label plus a text input: F(label, key, placeholder, extraAttributes).
 */
const F = (l, k, ph, ex) => `<label class=fl>${l}</label>` + I(k, ph, ex);

/**
 * Dropdown linked to S.d[key]: SEL(key, [options]). Choosing an option redraws the screen.
 */
const SEL = (k, o) =>
  `<select onchange="S.d['${k}']=this.value;render()">
      <option value="">Select…</option>${o.map((x) => `<option ${D(k) == x ? "selected" : ""}>${x}</option>`).join("")}
    </select>`;

/**
 * Checkbox linked to S.d[key]: CK(key, label text).
 */
const CK = (k, l) =>
  `<label class=chk>
      <input type=checkbox ${S.d[k] ? "checked" : ""} onchange="S.d['${k}']=this.checked;render()">${l}</label>`;

/* ---- Current form ---- */

/**
 * Id of the current wizard step (for example "lot" or "sheet"), taken from WZ.
 */
const cur = () => WZ[S.mode][S.step][0];

/**
 * The machine record chosen in the current form (S.d.mid), or undefined.
 */
const mch = () => M.find((m) => m.id == S.d.mid);

/**
 * Fake GPS fix (near Lahore) used when a demo photo is "captured". A real build reads the phone GPS.
 */
function gps() {
  return {
    la: (31.52 + Math.random() / 100).toFixed(5),
    lo: (74.35 + Math.random() / 100).toFixed(5),
    t: new Date().toTimeString().slice(0, 5),
  };
}

/**
 * Manufacturer chosen on the "Lot and firm" step: stores it with its division and approximate GPS.
 */
function setFirm(v) {
  const f = FIRMS[v];
  S.d.firm = v;
  if (f) {
    S.d.div = f[0];
    S.d.lat = f[2];
    S.d.lon = f[3];
  }
  render();
}

/**
 * Cross-check shortcut: sets comparisons to "Matches".
 * allm("*") fills the whole certificate; allm(key, count) fills the first "count" sources of one field.
 */
function allm(k, n) {
  if (k == "*") {
    (S.mode == "QIC" ? QX : DX).forEach(([kk, l, c, src]) =>
      src.forEach((s, j) => (S.d[`x_${kk}_${j}`] = "Matches")),
    );
    S.d.x_cp = "Matches UID plate code";
  } else for (let j = 0; j < n; j++) S.d[`x_${k}_${j}`] = "Matches";
  render();
}

/**
 * Captures a GPS position into S.d[latKey] and S.d[lonKey].
 * QIC "lat": the firm's location; DIC "dla": the farmer's district centre; both with a tiny random offset.
 */
function cap(a, b) {
  const g = gps();
  let la = g.la,
    lo = g.lo;
  const j = (k) => (Math.random() - 0.5) / k;
  if (a == "lat" && FIRMS[S.d.firm]) {
    la = (+FIRMS[S.d.firm][2] + j(500)).toFixed(5);
    lo = (+FIRMS[S.d.firm][3] + j(500)).toFixed(5);
  } else if (a == "dla" && mch() && DC[mch().dist]) {
    const c = DC[mch().dist];
    la = (c[0] + j(20)).toFixed(5);
    lo = (c[1] + j(20)).toFixed(5);
  }
  S.d[a] = la;
  S.d[b] = lo;
  render();
}

/* ============================================================================
 * 7. FIELD APP: LAUNCHER AND SIGN-IN
 * First screen (four modules), survey-type list and the sign-in page.
 * ============================================================================ */

/**
 * Module titles used on the sign-in and module screens.
 */
const MODN = {
  qic: "QIC · Quality Inspection",
  dic: "DIC · Delivery Verification",
  survey: "Socio Economic Survey",
  tpv: "Rental Subsidy TPV",
};

/**
 * Survey type titles.
 */
const SUBN = { base: "Baseline survey", mid: "Midline survey", end: "Endline survey" };

/**
 * Launcher: a module was tapped. Survey goes to the survey-type list; the others go to sign-in.
 */
function pickMod(k) {
  S.mod = k;
  S.sub = null;
  S.auth = false;
  S.lerr = "";
  S.lu = "";
  S.lp = "";
  render(1);
}

/**
 * Survey-type list: a survey type was tapped; goes to sign-in.
 */
function pickSub(k) {
  S.sub = k;
  render(1);
}

/**
 * Back button on the sign-in screen.
 */
function backLogin() {
  if (S.mod == "survey") S.sub = null;
  else S.mod = null;
  render(1);
}

/**
 * Checks the typed username and password against USERS. QIC and DIC start their form straight away.
 */
function login() {
  const u = USERS[S.mod].find((x) => x.u == S.lu.trim());
  if (u && S.lp == PW) {
    S.user = u;
    S.auth = true;
    S.lerr = "";
    S.mode = null;
    if (S.mod == "qic") go("QIC");
    else if (S.mod == "dic") go("DIC");
    else render(1);
  } else {
    S.lerr = "Invalid username or password";
    render();
  }
}

/**
 * Signs out and returns to the launcher, clearing the form in progress.
 */
function logout() {
  S.mod = null;
  S.sub = null;
  S.auth = false;
  S.user = null;
  S.mode = null;
  S.defer = false;
  S.d = {};
  S.lu = "";
  S.lp = "";
  render(1);
}

/**
 * Draws the Field App phone screen. One of: launcher, survey-type list, sign-in, module home,
 * the QIC/DIC wizard, or the "form pending" screen for surveys and TPV. Returns an HTML string.
 */
function app() {
  let inner = "",
    title = "PCAP Field App",
    right = "<small>NESPAK · PCAP</small>";
  const out = `<button class="btn alt sm" onclick="logout()">Logout</button>`;
  if (!S.mod) {
    inner =
      `<h3>Select activity</h3>
        <p class=note>Choose your assignment, then sign in.</p>` +
      [
        ["qic", "QIC", "Quality inspection at manufacturer's premises"],
        ["dic", "DIC", "Delivery verification at farmer's premises"],
        ["survey", "Socio Economic Survey", "Baseline · Midline · Endline"],
        ["tpv", "Rental Subsidy TPV", "Third-party verification of rental subsidy"],
      ]
        .map(
          (x) =>
            `<button class=opt onclick="pickMod('${x[0]}')">
                <span>${x[1]}<br><small class=note style="font-weight:400">${x[2]}</small></span><span>›</span>
              </button>`,
        )
        .join("");
  } else if (S.mod == "survey" && !S.sub) {
    inner =
      `<h3>Socio Economic Survey</h3>
        <p class=note>Select survey type.</p>` +
      [
        ["base", "Baseline survey", "5,000 farmers before delivery"],
        ["mid", "Midline survey", "500 farmers after 1 year of use"],
        ["end", "Endline survey", "500 farmers after 2 years of use"],
      ]
        .map(
          (x) =>
            `<button class=opt onclick="pickSub('${x[0]}')">
                <span>${x[1]}<br><small class=note style="font-weight:400">${x[2]}</small></span><span>›</span>
              </button>`,
        )
        .join("") +
      `<button class="btn alt" onclick="S.mod=null;render(1)">Back</button>`;
  } else if (!S.auth) {
    title = "Sign in";
    const nm = S.mod == "survey" ? SUBN[S.sub] : MODN[S.mod],
      us = USERS[S.mod];
    inner = `<h3>${nm}</h3>
      <p class=note>Enter your credentials to continue.</p>
      <label class=fl>Username</label>
      <input type=text autocomplete=off value="${esc(S.lu)}" oninput="S.lu=this.value">
      <label class=fl>Password</label>
      <input type=password value="${esc(S.lp)}" oninput="S.lp=this.value" onkeydown="if(event.key=='Enter')login()">${S.lerr ? `<div class=alert>${S.lerr}</div>` : ""}<div class=row style="margin-top:14px">
        <button class="btn alt" style="width:35%" onclick="backLogin()">Back</button>
        <button class=btn onclick="login()">Sign in</button>
      </div>
      <div class=info style="margin-top:14px">Demo login: <b>${us[0].u}</b> / <b>${PW}</b>${
        us.length > 1
          ? `<details style="margin-top:6px">
          <summary style="font-size:13px;font-weight:400;cursor:pointer">All demo accounts (${us.length})</summary>${us.map((x) => `<div style="font-size:12px;margin-top:2px">${x.u} · ${x.n} · ${x.d.map((y) => y[0]).join(", ")}</div>`).join("")}
        </details>`
          : ""
      }<br><span style="font-size:12px">Prototype only. Real build uses server-side authentication with role-based access.</span>
      </div>`;
  } else {
    right = out;
    if (S.mode) {
      const w = WZ[S.mode];
      title = S.mode + " · " + (S.mode == "QIC" ? "at manufacturer" : "at farmer");
      inner =
        `<div class=stp>
            ${w.map((_, i) => `<i class="${i <= S.step ? "d" : ""}"></i>`).join("")}
          </div>
          <div class=row>
            <h3>${S.step + 1}/${w.length} ${w[S.step][1]}</h3>${S.defer ? "" : `<button class="btn alt sm" onclick="auto()">Autofill demo</button>`}
          </div>` + (S.defer ? deferPanel() : step() + nav() + (S.mode == "QIC" ? deferBtn() : ""));
    } else if (S.mod == "qic" || S.mod == "dic") {
      const q = S.mod == "qic";
      title = MODN[S.mod];
      inner = `<div class=card>
          <span class=note>Signed in as</span><br><b>${S.user.n}</b> · ${S.user.u}</div>
        <button class=btn onclick="go('${q ? "QIC" : "DIC"}')">Start new ${q ? "QIC inspection" : "DIC verification"}</button>
        <div class=card style="margin-top:12px">
          <span class=note>${q ? "Pre-qualified manufacturers assigned to you" : "Districts assigned to you"}</span>${S.user.d
            .map(
              (x) => `<div class=row style="margin-top:6px">
            <span>${x[0]}</span><span class=tag>${x[1]} ${q ? (x[1] == 1 ? "manufacturer" : "manufacturers") : "machines"}</span>
          </div>`,
            )
            .join("")}
        </div>
        <div class=card>
          <span class=note>Machine type</span><br><b>Super Seeder</b>
        </div>
        <h4>Upload status</h4>
        <span class=note>Synced 14 · Pending 2 · Failed 0</span>`;
    } else {
      const nm = S.mod == "survey" ? SUBN[S.sub] : MODN[S.mod];
      title = S.mod == "survey" ? "Socio Economic Survey" : "Rental Subsidy TPV";
      const tg =
        S.mod == "tpv"
          ? "1,000 farmers · Rs. 5,000/acre, ceiling 25 acres"
          : { base: "5,000 farmers", mid: "500 farmers", end: "500 farmers" }[S.sub];
      inner = `<div class=card>
          <span class=note>Signed in as</span><br><b>${S.user.n}</b> · ${S.user.u}</div>
        <div class=card>
          <div class=row>
            <b>${nm}</b><span class="tag w">Form pending</span>
          </div>
          <span class=note>Target: ${tg}</span>
        </div>
        <div class=info>Questionnaire not yet defined with PCAP. This module will follow the same pattern as QIC/DIC: login, assignment list, dropdown-first form, offline sync.</div>
        <button class=btn disabled>Start new record</button>`;
    }
  }
  return `<div class=phone>
      <div class=bar>
        <span>${title}</span>${right}</div>
      <div class=body>${inner}</div>
    </div>${S.auth ? `<p class=note style="text-align:center">Submissions appear in the MIS portal. “Autofill demo” fills a step with sample values.</p>` : ""}`;
}

/* ============================================================================
 * 8. FIELD APP: FORM WIZARD (QIC AND DIC)
 * The step-by-step forms. Steps are listed in WZ; step() draws them and can() checks them.
 * ============================================================================ */

/**
 * Starts a new QIC or DIC form: go("QIC") or go("DIC").
 */
function go(m) {
  S.mode = m;
  S.step = 0;
  S.defer = false;
  S.d = { date: T0 };
  render(1);
}

/**
 * Returns the HTML of the current wizard step. One block per step id (see WZ):
 * intim, lot, head, gate, sheet, x (certificate check), chain, hand, ph (photos), sign.
 */
function step() {
  const c = cur(),
    m = S.mode,
    d = S.d;
  // Step "intim": Intimation: how the meeting was notified
  if (c == "intim")
    return `<p class=note>Form in which meeting notification was received</p>
      ${SEL("imode", ["Official letter / meeting notice", "E-mail", "WhatsApp", "Handwritten memo with official stamp", "Telephone call", "Voice message"])}${CK("iproof", "Notice / proof sent to PM/TL")}${CK("isame", m == "QIC" ? "Manufacturer is in the convener's division" : "Farmer is in the convener's district")}`;
  // Step "lot": Lot and firm (QIC): manufacturer, lot size and GPS
  if (c == "lot") {
    const f = FIRMS[d.firm],
      fl = FM.filter((x) => S.user.d.some((y) => y[0] == x[1]));
    return (
      `<div class=card>
          <span class=note>Your assignment</span><br>${S.user.d.map((y) => y[0] + " (" + y[1] + ")").join(" · ")}</div>
        <div class=card style="margin-top:8px">
          <b>Pre-qualified manufacturers by district</b>${wtbl(
            ["District", "Number of pre-qualified manufacturers", "Manufacturer locations"],
            manufacturerDistrictRows([...new Set(fl.map((x) => x[1]))]),
            "firm-summary",
          )}
        </div>
        <label class=fl>Manufacturer (pre-qualified)</label>
        <select onchange="setFirm(this.value)">
          <option value="">Select…</option>${fl.map((x) => `<option ${d.firm == x[0] ? "selected" : ""}>${x[0]}</option>`).join("")}
        </select>` +
      (f
        ? `<div class=card style="margin-top:8px">
            <span class=note>Auto-filled</span><br>${f[1]}<br><span class=note>${f[4]} district · ${f[0]} division</span><br><span class=note>Convener: ${convQ(f[0])}</span>
          </div>`
        : "") +
      `<label class=fl>Size of lot offered</label>${SEL("lot", LOTS)}<button class="btn alt" style="margin-top:8px" onclick="cap('lat','lon')">Capture GPS location of Firm</button>${d.lat ? `<p class=note>GPS: ${d.lat}, ${d.lon}</p>` : ""}`
    );
  }
  // Step "head": Verification header (DIC): district and machine to verify
  if (c == "head") {
    const dl = S.user.d.map((y) => y[0]),
      pool = M.filter((x) => x.qicStatus == "Approved" && !x.dicStatus && x.dist == d.dist),
      as = S.user.d.find((y) => y[0] == d.dist);
    if (d.mid && mch() && mch().dist != d.dist) d.mid = "";
    return (
      `<label class=fl>District (assigned to you)</label>${SEL("dist", dl)}` +
      (d.dist
        ? `<div class=card style="margin-top:8px">
            <span class=note>Convener</span><br>${convD(d.dist)}<br><span class=note>${as ? as[1] + " machines to be verified in this district" : ""}</span>
          </div>`
        : "") +
      `<label class=fl>Machine to verify</label>
        <select onchange="S.d.mid=this.value;render()">
          <option value="">${d.dist ? (pool.length ? "Select…" : "No machine awaiting verification") : "Select a district first"}</option>${pool.map((x) => `<option value="${x.id}" ${d.mid == x.id ? "selected" : ""}>${x.id} · ${x.farmer}</option>`).join("")}
        </select>` +
      (mch()
        ? `<div class=card style="margin-top:8px">
            <span class=note>Auto-filled from QIC record</span><br>${mch().farmer} s/o ${mch().father}<br>${mch().addr}<br><span class=note>Manufacturer: ${mch().firm}</span>
          </div>`
        : "")
    );
  }
  // Step "gate": Eligibility gate (QIC) / tamper gate (DIC)
  if (c == "gate") {
    const ok = GATE[m].every((_, i) => d["g" + i]);
    return (
      `<p class=note>${m == "QIC" ? "A machine is not entertained if any parameter doesnot complies or checked." : "A machine is not entertained if tampering is found."}</p>` +
      GATE[m].map((g, i) => CK("g" + i, g)).join("") +
      (ok
        ? `<div class=info style="background:var(--gl);color:var(--g)">Machine is eligible.</div>`
        : `<div class=alert>Blocked. Inform the convener.</div>`)
    );
  }
  // Step "sheet": Sampling sheet (QIC): JPG upload
  if (c == "sheet")
    return (
      `<p class=note>Sampling and the technical worksheet are recorded on the paper sampling sheet. Take a clear photo of the completed, signed sheet and upload it as a JPG/PNG/JPEG.</p>` +
      (d.sheet
        ? `<div class=card>
            <img src="${d.sheet}" alt="Sampling sheet preview" style="width:100%;border:1px solid var(--line);border-radius:6px">
            <div class=row style="margin-top:6px">
              <span class=note>${esc(d.sheetName)} · ${d.sheetKB} KB</span>
              <button class="btn alt sm" onclick="S.d.sheet=null;render()">Remove</button>
            </div>
          </div>`
        : `<div class=card>
            <label class=fl>Sampling sheet (JPG)</label>
            <input type=file accept="image/jpeg,image/png" onchange="onSheet(this)">
            <button class="btn alt" style="margin-top:8px" onclick="useDemoSheet()">Use a sample image (demo)</button>
          </div>`) +
      `<div class=info>The admin can view and download this image from the MIS portal.</div>`
    );
  // Step "x": Certificate cross-check
  if (c == "x") return xstep();
  // Step "chain": Chain of custody (DIC)
  if (c == "chain") {
    const q = mch();
    return (
      `<div class=card>
          <span class=note>QIC record from central database</span><br><b>${q.id}</b><br>Inspected ${q.qicDate} by FE ${q.qicFE} · ${q.qicNo}<br>Punched code at QIC: <b>${q.code}</b>
          <div class=g2 style="margin-top:6px">
            <div class=card style="margin:0;text-align:center">
              <small>QIC photo: UID plate + FE signature</small>
            </div>
            <div class=card style="margin:0;text-align:center">
              <small>QIC photo: code ${q.code}</small>
            </div>
          </div>
        </div>` +
      CK("c0", "FE signature on UID plate matches QIC photo (natural flow)") +
      CK("c1", "Punched code matches QIC image") +
      CK("c2", "UID plate not re-riveted") +
      (d.c0 && d.c1 && d.c2
        ? ""
        : `<div class=alert>Any mismatch: machine not entertained. Defer.</div>`)
    );
  }
  // Step "hand": Handover (DIC): who received the machine
  if (c == "hand") {
    const r = d.recv || "",
      nom = r[0] == "N";
    return (
      `<label class=fl>Machine received by</label>${SEL("recv", ["Allottee farmer (present)", "Nominee with WhatsApp/written authorization", "Nominee, no authorization; convener authorizes under signature"])}` +
      (nom
        ? `<div class=row style="margin-top:8px">
            <span class=note>Receiver details</span>
            <button class="btn alt sm" onclick="S.d.rname='Abdul Rehman';S.d.rcnic='3520211111111';render()">Scan CNIC</button>
          </div>${d.rname ? `<div class=card>${d.rname} · ${d.rcnic}</div>` : `<div class=g2 style="margin-top:6px">${I("rname", "Name")}${I("rcnic", "CNIC 13 digits", "inputmode=numeric")}</div>`}<label class=fl>Relation with allottee</label>${SEL("rrel", ["Son", "Brother", "Father", "Relative", "Employee / other"])}`
        : "") +
      (r.includes("WhatsApp")
        ? CK("rauth", "Authorization copy obtained from convener") +
          CK("rsent", "Copy sent to the group")
        : "") +
      (r.includes("convener")
        ? CK("rconv", "Convener has signed that receiver is authorized") +
          `<div class=info>Mandatory: geo-tagged photo of receiver's CNIC (photo 1).</div>`
        : "") +
      `<button class="btn alt" style="margin-top:8px" onclick="cap('dla','dlo')">Capture farmer location (tracker QR)</button>${d.dla ? `<p class=note>GPS: ${d.dla}, ${d.dlo}</p>` : ""}`
    );
  }
  // Step "ph": Geo-tagged photos (8)
  if (c == "ph") {
    const P = m == "QIC" ? QP : DP,
      n = P.filter((_, i) => d["p" + i]).length;
    return `<p class=note>Tap to capture with GPS. ${n}/8 taken.</p>
      <div class=ph>
        ${P.map((p, i) => {
          const g = d["p" + i];
          return `<button class="${g ? "d" : ""}" onclick="S.d['p${i}']=S.d['p${i}']?null:gps();render()">
          <b>${i + 1}.</b> ${p}${g ? `<br><small>✓ ${g.la}N, ${g.lo}E · ${g.t}</small>` : ""}</button>`;
        }).join("")}
      </div>`;
  }
  // Step "sign": Sign-off and certificate number
  if (c == "sign") return signStep();
  return "";
}

/**
 * Certificate cross-check screen. Each source is compared with the downloaded certificate and answered with CMP.
 * QIC: pick the machine (certificate row) of the chosen manufacturer. Mismatches ask for a reason and a confirmation.
 */
function xstep() {
  const D2 = S.mode == "QIC" ? QX : DX,
    q = S.mode == "QIC";
  let h = "";
  if (q)
    h += `<label class=fl>Certificate row (machine) to cross-check</label>
      <select onchange="S.d.mid=this.value;render()">
        <option value="">Select…</option>${M.filter((x) => !x.qicStatus && x.firm == S.d.firm)
          .map(
            (x) =>
              `<option value="${x.id}" ${S.d.mid == x.id ? "selected" : ""}>${x.id} · ${x.farmer}</option>`,
          )
          .join("")}
      </select>`;
  const m = mch();
  if (!m) return h + `<div class=alert>Select a machine.</div>`;
  h += `<div class=card style="margin-top:8px">
      <span class=note>Downloaded ${S.mode} certificate</span><br>1 ${m.farmer} · 2 ${m.cnic}<br>3 ${m.addr} · 4 ${m.tehsil}<br>5 ${m.id} · 6 ${m.imei}</div>
    <div class=g2>
      <button class="btn alt sm" onclick="allm('*')">Everything matches</button>
      <button class="btn alt sm" onclick="auto(1)">Demo: IMEI mismatch</button>
    </div>
    <p class=note>For each source, compare with the certificate and choose. Tehsil is ignored${q ? "; mailing address cannot be verified at QIC." : "."}</p>`;
  D2.forEach(([k, l, c, src]) => {
    h +=
      `<div class=card>
          <div class=row>
            <b>${l}</b>
            <button class="btn alt sm" onclick="allm('${k}',${src.length})">All match</button>
          </div>
          <span class=note>Certificate: ${c(m)}</span>` +
      src.map((s, j) => `<label class=fl>${s}</label>${SEL(`x_${k}_${j}`, CMP)}`).join("") +
      `</div>`;
  });
  h += `<div class=card>
      <b>7-digit punched code</b><br><span class=note>Machine code vs digits on UID plate (after Y01, before SS1/1)</span>${SEL("x_cp", ["Matches UID plate code", "Does not match", "Missing"])}
    </div>`;
  const x = xres();
  if (x.mis)
    h += `<div class=alert>${x.mis} mismatch(es). ${q ? "Inform the QIC convener; he corrects on the portal, or notes it on the certificate under signature and the machine is approved." : "The DIC convener cannot correct the certificate; he records it under signature and the machine is approved."}
      </div>
      <label class=fl>Discrepancy</label>${SEL("xnote", XR)}${q ? CK("xinf", "QIC convener informed") : CK("xsigned", "DIC convener has signed the note")}`;
  return h;
}

/**
 * Counts cross-check answers: mis = answers that are not "Matches", inc = questions still unanswered.
 */
function xres() {
  const m = mch();
  if (!m) return { mis: 0, inc: 1 };
  let mis = 0,
    inc = 0;
  (S.mode == "QIC" ? QX : DX).forEach(([k, l, c, src]) =>
    src.forEach((s, j) => {
      const v = D(`x_${k}_${j}`);
      if (!v) inc++;
      else if (v != "Matches") mis++;
    }),
  );
  const p = D("x_cp");
  if (!p) inc++;
  else if (p[0] != "M" || p.startsWith("Missing")) mis++;
  return { mis, inc };
}

/**
 * Sign-off screen: decision (Pass/Defer or Approved/Deferred), reason if deferred, certificate number and signatures.
 */
function signStep() {
  const q = S.mode == "QIC",
    P = q ? ["Pass", "Defer"] : ["Approved", "Deferred"],
    x = xres();
  return (
    (x.mis
      ? `<div class=info>${x.mis} cross-check mismatch(es) will be flagged in the MIS.</div>`
      : "") +
    `<label class=fl>Committee decision</label>
      <div class=seg>
        ${P.map((v) => `<button class="c ${S.d.res == v ? "on" : ""}" onclick="S.d.res='${v}';render()">${v}</button>`).join("")}
      </div>` +
    (/Def/.test(S.d.res || "")
      ? `<label class=fl>Reason for deferment</label>${SEL("reason", RSN)}`
      : "") +
    F(
      q ? "QIC certificate # (only typed entry)" : "DIC certificate # (only typed entry)",
      "cno",
      "e.g. 305",
      "inputmode=numeric",
    ) +
    CK("sign", "Hand written document uploaded and is correct") +
    (q ? CK("phys", "All machines have UID plates, tracker device, and 7 digit punch code") : "") +
    CK("wa", "All UID plates are signed by FE") +
    `<p class=note>Summary and progress reports are generated automatically (Excel only).</p>`
  );
}

/**
 * Returns true when the current step is complete, which enables the Continue button.
 * Add a rule here whenever a step gets a new required field.
 */
function can() {
  const c = cur(),
    m = S.mode,
    d = S.d;
  // Step "intim": Intimation: how the meeting was notified
  if (c == "intim") return d.imode && d.iproof;
  // Step "lot": Lot and firm (QIC): manufacturer, lot size and GPS
  if (c == "lot") return d.firm && d.lot && d.lat && d.lon;
  // Step "head": Verification header (DIC): district and machine to verify
  if (c == "head") return d.dist && d.mid;
  // Step "gate": Eligibility gate (QIC) / tamper gate (DIC)
  if (c == "gate") return GATE[m].every((_, i) => d["g" + i]);
  // Step "sheet": Sampling sheet (QIC): JPG upload
  if (c == "sheet") return !!d.sheet;
  // Step "x": Certificate cross-check
  if (c == "x") {
    const x = xres();
    if (x.inc) return false;
    return x.mis == 0 || (d.xnote && (m == "QIC" ? d.xinf : d.xsigned));
  }
  // Step "chain": Chain of custody (DIC)
  if (c == "chain") return d.c0 && d.c1 && d.c2;
  // Step "hand": Handover (DIC): who received the machine
  if (c == "hand") {
    const r = d.recv;
    if (!r || !d.dla) return false;
    if (r[0] == "A") return true;
    if (!d.rname || !/^\d{13}$/.test(d.rcnic || "") || !d.rrel) return false;
    return r.includes("WhatsApp") ? d.rauth && d.rsent : d.rconv && d.p0;
  }
  // Step "ph": Geo-tagged photos (8)
  if (c == "ph") return Array.from({ length: 8 }).every((_, i) => d["p" + i]);
  // Step "sign": Sign-off and certificate number
  if (c == "sign")
    return d.res && d.cno && d.sign && (m == "DIC" || d.phys) && (!/Def/.test(d.res) || d.reason);
}

/**
 * Back and Continue buttons. The last step shows "Submit" instead of "Continue".
 */
function nav() {
  const l = S.step == WZ[S.mode].length - 1;
  return `<div class=row style="margin-top:14px">
      <button class="btn alt" style="width:35%" onclick="back()">${S.step ? "Back" : "Cancel"}</button>
      <button id=nx class=btn ${can() ? "" : "disabled"} onclick="next()">${l ? "Submit" : "Continue"}</button>
    </div>`;
}

/**
 * Back button: previous step, or leave the form when on the first step.
 */
function back() {
  if (!S.step) S.mode = null;
  else S.step--;
  render(1);
}

/**
 * Continue button: next step, or submit() on the last step.
 */
function next() {
  if (!can()) return;
  if (S.step < WZ[S.mode].length - 1) {
    S.step++;
    return render(1);
  }
  submit();
}

/**
 * Saves the finished form into the machine record (QIC or DIC fields) and returns to the module home.
 * In the real build this is where the record is sent to the API.
 */
function submit() {
  const m = mch(),
    q = S.mode == "QIC",
    x = xres(),
    ok = /Pass|Approved/.test(S.d.res),
    me = S.user.n;
  if (q)
    Object.assign(m, {
      qicNo: "QIC-" + S.d.cno,
      qicStatus: ok ? "Approved" : "Deferred",
      qicDate: S.d.date,
      qicFE: me,
      lat: S.d.lat,
      lng: S.d.lon,
      firm: S.d.firm,
      div: S.d.div,
      reason: S.d.reason || "",
      sheet: S.d.sheet,
      sheetName: S.d.sheetName,
    });
  else
    Object.assign(m, {
      dicNo: "DIC-" + S.d.cno,
      dicStatus: ok ? "Approved" : "Deferred",
      dicDate: S.d.date,
      dicFE: me,
      dlat: S.d.dla,
      dlng: S.d.dlo,
      reason: S.d.reason || m.reason,
      recv: S.d.recv,
    });
  if (x.mis) {
    m.open = true;
    m.log.push({
      t: T0,
      who: "FE " + me,
      m:
        S.mode +
        " cross-check: " +
        x.mis +
        " mismatch(es) flagged" +
        (!q && S.d.xnote ? " — " + S.d.xnote : ""),
    });
  }
  toast(x.mis ? "Submitted with discrepancy flag" : "Submitted · synced to central database");
  S.mode = null;
  render(1);
}

/**
 * Demo helper: fills the current step with sample data. auto(1) makes the cross-check show an IMEI mismatch.
 * Used by the "Autofill demo" button and by the tests; remove it for production.
 */
function auto(mis) {
  const c = cur(),
    q = S.mode == "QIC",
    d = S.d,
    mine = (x) => S.user.d.some((y) => y[0] == x[1]);
  // Step "intim": Intimation: how the meeting was notified
  if (c == "intim") Object.assign(d, { imode: "WhatsApp", iproof: true });
  // Step "lot": Lot and firm (QIC): manufacturer, lot size and GPS
  if (c == "lot") {
    const f =
      FM.find((x) => mine(x) && M.some((m) => !m.qicStatus && m.firm == x[0])) || FM.find(mine);
    setFirm(f[0]);
    d.lot = "250";
  }
  // Step "head": Verification header (DIC): district and machine to verify
  if (c == "head") {
    const dd =
        S.user.d
          .map((y) => y[0])
          .find((x) => M.some((m) => m.qicStatus == "Approved" && !m.dicStatus && m.dist == x)) ||
        S.user.d[0][0],
      m = M.find((m) => m.qicStatus == "Approved" && !m.dicStatus && m.dist == dd);
    d.dist = dd;
    if (m) d.mid = m.id;
  }
  // Step "gate": Eligibility gate (QIC) / tamper gate (DIC)
  if (c == "gate") GATE[S.mode].forEach((_, i) => (d["g" + i] = true));
  // Step "sheet": Sampling sheet (QIC): JPG upload
  if (c == "sheet") useDemoSheet();
  // Step "x": Certificate cross-check
  if (c == "x") {
    if (!d.mid) {
      const m = M.find((x) => !x.qicStatus && x.firm == d.firm);
      if (m) d.mid = m.id;
    }
    allm("*");
    if (mis) {
      d.x_imei_0 = "Does not match";
      d.xnote = "IMEI differs";
    }
  }
  // Step "chain": Chain of custody (DIC)
  if (c == "chain") d.c0 = d.c1 = d.c2 = true;
  // Step "hand": Handover (DIC): who received the machine
  if (c == "hand") {
    const m = mch();
    const cc = m && DC[m.dist] ? DC[m.dist] : [30.1575, 71.5249];
    Object.assign(d, {
      recv: "Allottee farmer (present)",
      dla: cc[0].toFixed(5),
      dlo: cc[1].toFixed(5),
    });
  }
  // Step "ph": Geo-tagged photos (8)
  if (c == "ph") for (let i = 0; i < 8; i++) d["p" + i] = gps();
  // Step "sign": Sign-off and certificate number
  if (c == "sign")
    Object.assign(d, {
      res: q ? "Pass" : "Approved",
      cno: "" + (300 + Math.floor(Math.random() * 90)),
      sign: true,
      phys: true,
      wa: true,
    });
  render();
}

/* ============================================================================
 * 9. FIELD APP: DEFER COMPLETE LOT
 * Red button on every QIC step: if anything does not match, the inspector defers the whole lot.
 * ============================================================================ */

/**
 * Red "Information mismatch: defer complete lot" button shown on every QIC step.
 */
function deferBtn() {
  return `<button class="btn dfr" style="margin-top:12px" onclick="S.defer=true;render(1)">⚠ Information mismatch: defer complete lot</button>`;
}

/**
 * Panel opened by the defer button: shows the step, the manufacturer and a reason dropdown.
 */
function deferPanel() {
  const d = S.d,
    f = d.firm || d.dfirm,
    fl = FM.filter((x) => S.user.d.some((y) => y[0] == x[1])).map((x) => x[0]);
  return `<div class=alert>
      <b>Defer the complete lot?</b><br>Use this if any information does not match (UID plate, punched code, tracker, certificate or specification). The whole lot is recorded as Deferred and flagged in the MIS.</div>
    <label class=fl>Raised at step</label>
    <div class=card>${WZ.QIC[S.step][1]}</div>
    <label class=fl>Manufacturer / lot</label>${d.firm ? `<div class=card>${d.firm}${d.lot ? " · lot of " + d.lot : ""}</div>` : SEL("dfirm", fl)}<label class=fl>Reason for deferment</label>${SEL("dreason", RSN)}<div class=row style="margin-top:12px">
      <button class="btn alt" style="width:40%" onclick="S.defer=false;render(1)">Cancel</button>
      <button class="btn dfr" ${d.dreason && f ? "" : "disabled"} onclick="deferLot()">Confirm deferral</button>
    </div>`;
}

/**
 * Confirms the deferral: every machine of the chosen manufacturer still awaiting QIC is marked Deferred,
 * flagged as an open discrepancy and logged. The uploaded sampling sheet (if any) is attached.
 */
function deferLot() {
  const d = S.d,
    f = d.firm || d.dfirm,
    st = WZ.QIC[S.step][1],
    me = S.user.n,
    ms = M.filter((m) => !m.qicStatus && m.firm == f),
    no = "QIC-D" + Math.floor(100 + Math.random() * 900);
  ms.forEach((m) => {
    Object.assign(m, {
      qicNo: no,
      qicStatus: "Deferred",
      qicDate: T0,
      qicFE: me,
      reason: d.dreason,
      div: FIRMS[f][0],
      sheet: d.sheet || m.sheet,
      sheetName: d.sheetName || m.sheetName,
    });
    m.open = true;
    m.log.push({
      t: T0,
      who: "FE " + me,
      m: "Entire lot deferred at step '" + st + "': " + d.dreason,
    });
  });
  toast(ms.length ? "Lot deferred · flagged in MIS" : "No pending machines for this manufacturer");
  S.defer = false;
  S.d = {};
  S.mode = null;
  render(1);
}

/* ============================================================================
 * 10. SAMPLING SHEET (JPG)
 * The FE uploads a photo of the paper sampling sheet; the admin views and downloads it in the MIS.
 * ============================================================================ */

/**
 * Draws a fake sampling-sheet photo on a canvas and returns it as JPG data. Demo only: stands in for the FE's photo.
 */
function demoSheet(firm, m) {
  try {
    const c = document.createElement("canvas");
    c.width = 720;
    c.height = 940;
    const g = c.getContext("2d");
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, 720, 940);
    g.fillStyle = "#1c2620";
    g.font = "bold 22px sans-serif";
    g.fillText("SAMPLING SHEET · Super Seeder", 30, 44);
    g.font = "14px sans-serif";
    g.fillStyle = "#65706a";
    g.fillText("Demo image: stands in for the photo uploaded by the FE", 30, 68);
    g.fillStyle = "#1c2620";
    g.font = "16px sans-serif";
    g.fillText("Manufacturer: " + (firm || "-"), 30, 104);
    g.fillText("Lot / machine: " + (m ? m.id : "-"), 30, 128);
    g.strokeStyle = "#9aa69f";
    g.lineWidth = 1;
    const n = 13;
    for (let i = 0; i <= n; i++) {
      g.beginPath();
      g.moveTo(30, 160 + i * 50);
      g.lineTo(690, 160 + i * 50);
      g.stroke();
    }
    [30, 90, 330, 530, 690].forEach((x) => {
      g.beginPath();
      g.moveTo(x, 160);
      g.lineTo(x, 160 + n * 50);
      g.stroke();
    });
    g.font = "bold 14px sans-serif";
    g.fillText("No.", 40, 190);
    g.fillText("Unique ID", 100, 190);
    g.fillText("Farmer / district", 340, 190);
    g.fillText("Result", 540, 190);
    g.font = "italic 17px cursive";
    for (let i = 1; i < n; i++) {
      const y = 190 + i * 50;
      g.fillText(String(i), 44, y);
      g.fillText("Y01-37" + String(1000 + i * 19) + "-SS1/1", 100, y);
      g.fillText(FN2[i % FN2.length][0], 340, y);
      g.fillText(i == 7 ? "Not OK" : "OK", 540, y);
    }
    g.fillText("Signed: ______________   Convener: ______________", 30, 900);
    return c.toDataURL("image/jpeg", 0.7);
  } catch (e) {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ";
  }
}

/**
 * "Use a sample image" button on the Sampling sheet step.
 */
function useDemoSheet() {
  S.d.sheet = demoSheet(S.d.firm);
  S.d.sheetName = "sampling-sheet-demo.jpg";
  S.d.sheetKB = Math.max(1, Math.round((S.d.sheet.length * 0.75) / 1024));
  render();
}

/**
 * File chooser on the Sampling sheet step: reads the chosen photo, shrinks it to at most 1600 px and stores it as JPG in S.d.sheet.
 */
function onSheet(inp) {
  const f = inp.files && inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 1600 / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
      const u = c.toDataURL("image/jpeg", 0.8);
      S.d.sheet = u;
      S.d.sheetName = f.name.replace(/\.[^.]+$/, "") + ".jpg";
      S.d.sheetKB = Math.round((u.length * 0.75) / 1024);
      render();
    };
    im.onerror = () => toast("Could not read that image");
    im.src = r.result;
  };
  r.readAsDataURL(f);
}

/**
 * Returns the sampling sheet image of a machine. Older sample records get a demo image the first time they are viewed.
 */
function sheetOf(m) {
  if (!m.sheet && m.qicStatus) {
    m.sheet = demoSheet(m.firm, m);
    m.sheetName = "sampling-sheet-" + m.qicNo + ".jpg";
    m.sheetDemo = 1;
  }
  return m.sheet;
}

/**
 * Thumbnail with View and Download buttons, shown in the MIS record details.
 */
function sheetBlock(m) {
  const u = sheetOf(m);
  return u
    ? `<img src="${u}" alt="Sampling sheet" style="width:100%;cursor:zoom-in;border:1px solid var(--line);border-radius:6px" onclick="viewSheet('${m.id}')">
      <div class=filters style="margin-top:6px">
        <button class="btn alt sm" onclick="viewSheet('${m.id}')">View</button>
        <button class="btn sm" onclick="dl('${m.id}')">Download JPG</button>
      </div>${m.sheetDemo ? `<span class=note>Demo image for this sample record</span>` : `<span class=note>${esc(m.sheetName || "")}</span>`}`
    : `<span class=note>Not uploaded</span>`;
}

/**
 * Opens the full-size sampling sheet viewer (lightbox) for a machine.
 */
function viewSheet(id) {
  S.lb = id;
  render(1);
}

/**
 * Downloads the sampling sheet as a JPG file. Some preview sandboxes block downloads and show a message instead.
 */
function dl(id) {
  const m = M.find((x) => x.id == id);
  if (!m) return;
  const u = sheetOf(m);
  if (!u) return toast("No sampling sheet uploaded for this record");
  try {
    const a = document.createElement("a");
    a.href = u;
    a.download = m.sheetName || "sampling-sheet-" + m.qicNo + ".jpg";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Downloading " + (m.sheetName || "sampling sheet") + " (JPG)");
  } catch (e) {
    toast("Download is blocked in this preview; it works in the real build");
  }
}

/**
 * HTML of the full-size sampling sheet viewer (empty when no sheet is open).
 */
function lightbox() {
  if (!S.lb) return "";
  const m = M.find((x) => x.id == S.lb);
  if (!m) return "";
  const u = sheetOf(m);
  return `<div class=lbx onclick="S.lb=null;render(1)">
      <div class=lbc onclick="event.stopPropagation()">
        <div class=row>
          <b>Sampling sheet · ${m.qicNo} · ${m.firm}</b><span class=filters style="margin:0">
            <button class="btn sm" onclick="dl('${m.id}')">Download JPG</button>
            <button class="btn alt sm" onclick="S.lb=null;render(1)">Close</button>
          </span>
        </div>
        <img src="${u}" alt="Sampling sheet">
      </div>
    </div>`;
}

/* ============================================================================
 * 11. MIS PORTAL
 * Dashboard, records, discrepancies, reports, configuration and master data. Each page is a function.
 * ============================================================================ */

/**
 * MIS navigation pills: [view id, label]. Each id needs a function in the table inside mis().
 */
const NAV = [
  ["dash", "Dashboard"],
  ["qic", "QIC records"],
  ["dic", "DIC records"],
  ["disc", "Discrepancies"],
  ["rep", "Reports"],
  ["cfg", "Machine-type config"],
  ["master", "Master data"],
];

/**
 * Draws the MIS portal: navigation pills, the selected page, and the sampling sheet viewer.
 * The Map view button opens the Web GIS (see openGis).
 */
function mis() {
  if (S.view == "gis") return gis();
  return (
    `<div class=nav>
        ${NAV.map((n) => `<button class="${S.view == n[0] ? "on" : ""}" onclick="S.view='${n[0]}';S.sel=null;render(1)">${n[1]}</button>`).join("")}<button class="mapbtn" onclick="openGis()">${PIN}Map view</button>
      </div>` +
    { dash, qic: () => rec("qic"), dic: () => rec("dic"), disc, rep, cfg, master }[S.view]() +
    lightbox()
  );
}

/**
 * Small coloured status tag: green = Approved, red = Deferred, amber = anything else (for example Under review).
 */
const tg = (x) =>
  x
    ? `<span class="tag ${x == "Approved" ? "" : x == "Deferred" ? "r" : "w"}">${x}</span>`
    : `<span class="tag w">—</span>`;

/**
 * Dashboard page: counters, latest machines (QIC to DIC) and machines per division.
 */
function dash() {
  const a = M.filter((m) => m.qicStatus == "Approved").length,
    d = M.filter((m) => m.dicStatus == "Approved").length,
    ds = [...new Set(M.map((m) => m.div))],
    mx = Math.max(...ds.map((x) => M.filter((m) => m.div == x).length));
  return `<div class=kpis>
      <div class=kpi>
        <b>${M.length}</b>Machines tracked</div>
      <div class=kpi>
        <b>${M.filter((m) => m.qicStatus).length}</b>QIC inspected (${a} approved)</div>
      <div class=kpi>
        <b>${a - d}</b>Awaiting delivery</div>
      <div class=kpi>
        <b>${d}</b>DIC approved</div>
      <div class=kpi>
        <b>${M.filter((m) => m.open).length}</b>Open discrepancies</div>
    </div>
<div class=grid>
      <div class=card>
        <h3>Machine lifecycle (Inspected → Delivered)</h3>
        <div class=tw>
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                <th>Farmer</th>
                <th>District</th>
                <th>Firm</th>
                <th>QIC</th>
                <th>DIC</th>
                <th>
                </th>
              </tr>
            </thead>
            <tbody>
              ${M.filter((m) => m.qicStatus)
                .slice(0, 12)
                .map(
                  (m) =>
                    `<tr class=clk onclick="S.view='qic';S.sel='${m.id}';render(1)">
                <td>${m.id}</td>
                <td>${m.farmer}</td>
                <td>${m.dist}</td>
                <td>${m.firm}</td>
                <td>${tg(m.qicStatus)}</td>
                <td>${tg(m.dicStatus)}</td>
                <td>${m.open ? `<span class="tag r">flag</span>` : ""}</td>
              </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
<div class=card>
        <h3>Machines by division</h3>
        <div class=bars>
          ${ds
            .map((x) => {
              const n = M.filter((m) => m.div == x).length;
              return `<div>
            <span style="width:${(n / mx) * 60}%;min-width:14px"></span>${x} (${n})</div>`;
            })
            .join("")}
        </div>
        <p class=note>Targets: 5,000 machines · 35 districts · 5 QIC divisions · 28 firms</p>
      </div>
    </div>`;
}

/**
 * QIC records (rec("qic")) or DIC records (rec("dic")): a table plus details of the selected row.
 */
function rec(w) {
  const q = w == "qic",
    list = M.filter((m) => (q ? m.qicStatus : m.dicStatus)),
    s = M.find((m) => m.id == S.sel),
    st = (m) => tg(q ? m.qicStatus : m.dicStatus),
    no = (m) => (q ? m.qicNo : m.dicNo),
    dt = (m) => (q ? m.qicDate : m.dicDate),
    fe = (m) => (q ? m.qicFE : m.dicFE),
    sh = (m) =>
      `<td>
          <a class=lnk onclick="event.stopPropagation();viewSheet('${m.id}')">View</a> · <a class=lnk onclick="event.stopPropagation();dl('${m.id}')">Download</a>
        </td>`;
  const hd = q
    ? ["Machine", "Farmer", "Division", "Status", "Sampling sheet", "Cert #", "Date", "FE"]
    : ["Machine", "Farmer", "District", "Cert #", "Status", "Date", "FE"];
  const row = (m) =>
    q
      ? `<td>${m.id}</td>
        <td>${m.farmer}</td>
        <td>${m.div}</td>
        <td>${st(m)}</td>${sh(m)}<td>${no(m)}</td>
        <td>${dt(m)}</td>
        <td>${fe(m)}</td>`
      : `<td>${m.id}</td>
        <td>${m.farmer}</td>
        <td>${m.dist}</td>
        <td>${no(m)}</td>
        <td>${st(m)}</td>
        <td>${dt(m)}</td>
        <td>${fe(m)}</td>`;
  return `<div class=grid>
      <div class=card>
        <h3>${q ? "QIC records" : "DIC records"} <span class=note>(${list.length})</span>
        </h3>
        <div class=tw>
          <table>
            <thead>
              <tr>${hd.map((x) => `<th>${x}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${list.map((m) => `<tr class="clk ${m.id == S.sel ? "sel" : ""}" onclick="S.sel='${m.id}';render(1)">${row(m)}</tr>`).join("") || "<tr><td>No records</td></tr>"}
            </tbody>
          </table>
        </div>
      </div>${
        s
          ? det(s)
          : `<div class=card>
        <span class=note>Select a record to see the linked QIC → DIC chain, certificate columns, sampling sheet and log.</span>
      </div>`
      }
    </div>`;
}

/**
 * Details panel for one machine: certificate columns, GPS, sampling sheet (QIC) and the discrepancy log.
 */
function det(m) {
  return `<div class=card>
      <div class=row>
        <h3>${m.id}</h3>
        <button class="btn alt sm" onclick="gisFocus('${m.id}')">View on map</button>
      </div>
      <span class=note>Chain of custody: ${m.qicStatus ? "QIC " + m.qicDate : "not inspected"} → ${m.dicStatus ? "DIC " + m.dicDate : "not verified"}</span>
      <h4>Certificate (6 columns)</h4>
      <table>
        ${[
          ["Allottee", m.farmer],
          ["CNIC", m.cnic],
          ["Mailing address", m.addr],
          ["Tehsil", m.tehsil],
          ["Machine ID", m.id],
          ["Tracker IMEI", m.imei],
          ["Manufacturer", m.firm],
          ["QIC FE", m.qicFE || "—"],
          ["DIC FE", m.dicFE || "—"],
          ["Punched code", m.code],
          ["QIC GPS (firm)", m.lat ? m.lat + ", " + m.lng : "—"],
          ["DIC GPS (farmer)", m.dlat ? m.dlat + ", " + m.dlng : "—"],
          ["Reason (if deferred)", m.reason || "—"],
        ]
          .map(
            (r) => `<tr>
          <td>${r[0]}</td>
          <td class=wrap>${r[1]}</td>
        </tr>`,
          )
          .join("")}
      </table>${m.qicStatus ? `<h4>Sampling sheet (JPG uploaded by FE)</h4>${sheetBlock(m)}` : ""}<h4>Discrepancy / correction log</h4>${m.log.length ? m.log.map((l) => `<div class=note>${l.t} · ${l.who}: ${l.m}</div>`).join("") : `<span class=note>No entries</span>`}
    </div>`;
}

/**
 * Discrepancies page: open cases with buttons for how they were resolved.
 */
function disc() {
  const l = M.filter((m) => m.open);
  return `<div class=card>
      <h3>Open discrepancies (${l.length})</h3>${
        l
          .map(
            (m) => `<div class=card>
        <b>${m.id}</b> · ${m.farmer}<br>${m.log.slice(-1)[0].m}<div class=filters style="margin-top:8px">
          <button class="btn alt sm" onclick="res('${m.id}','QIC convener corrected the record on the departmental portal')">Corrected by QIC convener</button>
          <button class="btn alt sm" onclick="res('${m.id}','Convener noted it on the certificate under signature; machine approved')">Noted under convener signature</button>
        </div>
      </div>`,
          )
          .join("") || `<span class=note>No open discrepancies.</span>`
      }<p class=note>QIC discrepancies are corrected by the QIC convener; DIC discrepancies are recorded as a signed note. Nothing is overwritten; each action is appended to the log.</p>
    </div>`;
}

/**
 * Resolves a discrepancy: adds a log entry and clears the open flag.
 */
function res(id, t) {
  const m = M.find((x) => x.id == id);
  m.log.push({ t: "2026-09-28", who: "Project Lead", m: t });
  m.open = false;
  toast("Resolution logged");
  render(1);
}

/**
 * Reports page: QIC summary, DIC summary and the two 15-column progress reports. Excel export only.
 */
function rep() {
  const T = [
      ["qs", "QIC summary"],
      ["ds", "DIC summary"],
      ["qp", "QIC progress (15 col.)"],
      ["dp", "DIC progress (15 col.)"],
    ],
    w = S.rep;
  let h = `<div class=card>
      <div class=filters>
        ${T.map((t) => `<button class="btn sm ${w == t[0] ? "" : "alt"}" onclick="S.rep='${t[0]}';render(1)">${t[1]}</button>`).join("")}<select>
          <option>Monthly</option>
          <option>Quarterly</option>
          <option>Annual</option>
        </select>
        <button class="btn sm" onclick="toast('Excel (.xlsx) export only, as per SOP. No PDF or image.')">Export Excel</button>
      </div>`;
  const cnt = (a, f) => [...new Set(a.map(f))].length;
  if (w == "qs") {
    const ds = [...new Set(M.filter((m) => m.qicStatus).map((m) => m.div))];
    h += tbl(
      [
        "Sr.",
        "Division",
        "QIC meetings held",
        "Inspected",
        "Approved",
        "Deferred",
        "Reason for deferment",
      ],
      ds.map((d, i) => {
        const a = M.filter((m) => m.qicStatus && m.div == d);
        return [
          i + 1,
          d,
          cnt(a, (m) => m.qicDate + m.firm),
          a.length,
          a.filter((m) => m.qicStatus == "Approved").length,
          a.filter((m) => m.qicStatus == "Deferred").length,
          a
            .map((m) => m.reason)
            .filter((x) => x)
            .join("; ") || "—",
        ];
      }),
    );
  }
  if (w == "ds") {
    const ds = [...new Set(M.filter((m) => m.dicStatus).map((m) => m.dist))];
    h += tbl(
      [
        "Sr.",
        "District",
        "DIC meetings held",
        "Verified",
        "Approved",
        "Deferred",
        "Reason for deferment",
      ],
      ds.map((d, i) => {
        const a = M.filter((m) => m.dicStatus && m.dist == d);
        return [
          i + 1,
          d,
          cnt(a, (m) => m.dicDate),
          a.length,
          a.filter((m) => m.dicStatus == "Approved").length,
          a.filter((m) => m.dicStatus == "Deferred").length,
          a
            .map((m) => m.reason)
            .filter((x) => x)
            .join("; ") || "—",
        ];
      }),
    );
  }
  if (w == "qp")
    h += tbl(
      [
        "Sr. No",
        "Division",
        "District",
        "Firm Name",
        "Farmer Name",
        "CNIC",
        "Contact No.",
        "QIC Certificate #",
        "Status of Inspection",
        "Unique ID",
        "GIS Lat.",
        "GIS Lng.",
        "Punched Code",
        "Inspection Date",
        "Name of FE",
      ],
      M.filter((m) => m.qicStatus).map((m, i) => [
        i + 1,
        m.div,
        m.dist,
        m.firm,
        m.farmer,
        m.cnic,
        m.contact,
        m.qicNo,
        m.qicStatus,
        m.id,
        m.lat,
        m.lng,
        m.code,
        m.qicDate,
        m.qicFE,
      ]),
    );
  if (w == "dp")
    h += tbl(
      [
        "Sr. No",
        "District",
        "Farmer Name",
        "Father Name",
        "CNIC #",
        "Address",
        "Contact No.",
        "DIC Certificate #",
        "Status of Verification",
        "Unique ID",
        "GPS Lat.",
        "GPS Lng.",
        "Punched Code",
        "Inspection Date",
        "Name of FE",
      ],
      M.filter((m) => m.dicStatus).map((m, i) => [
        i + 1,
        m.dist,
        m.farmer,
        m.father,
        m.cnic,
        m.addr,
        m.contact,
        m.dicNo,
        m.dicStatus,
        m.id,
        m.dlat,
        m.dlng,
        m.code,
        m.dicDate,
        m.dicFE,
      ]),
    );
  return (
    h +
    `<p class=note>Built from live records. Progress reports export as Excel only.</p>
      </div>`
  );
}

/**
 * Builds a simple table: tbl([column titles], [rows]). Cells stay on one line.
 */
function tbl(h, r) {
  return `<div class=tw>
      <table>
        <thead>
          <tr>${h.map((x) => `<th>${x}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${r.map((a) => `<tr>${a.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") || "<tr><td>No data</td></tr>"}
        </tbody>
      </table>
    </div>`;
}

/**
 * Machine-type configuration page: workflow steps and required photos for Super Seeder.
 */
function cfg() {
  return `<div class=card>
      <div class=row>
        <h3>Super Seeder · v2</h3>
        <button class="btn alt sm" onclick="toast('New machine types need their own approved specification from PCAP')">+ Add machine type</button>
      </div>
      <p class=note>Machine types are configuration data. The QIC sampling sheet is uploaded as a JPG image, so no sampling or checklist data entry is needed in the app.</p>
    </div>
<div class=grid>
      <div class=card>
        <h3>QIC workflow (${WZ.QIC.length} steps)</h3>
        <ol>
          ${WZ.QIC.map((x) => `<li>${x[1]}${x[0] == "sheet" ? " <span class=tag>JPG upload</span>" : ""}</li>`).join("")}
        </ol>
        <h3>DIC workflow (${WZ.DIC.length} steps)</h3>
        <ol>${WZ.DIC.map((x) => `<li>${x[1]}</li>`).join("")}</ol>
      </div>
<div class=card>
        <h3>Required photos</h3>
        <b>QIC</b>
        <ol>${QP.map((p) => `<li class=note>${p}</li>`).join("")}</ol>
        <b>DIC</b>
        <ol>${DP.map((p) => `<li class=note>${p}</li>`).join("")}</ol>
      </div>
    </div>`;
}

/**
 * Same as tbl() but cell text may wrap (used for long lists).
 */
function wtbl(h, r, className = "") {
  return `<div class="tw ${className}">
      <table>
        <thead>
          <tr>${h.map((x) => `<th>${x}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${r.map((a) => `<tr>${a.map((c) => `<td class=wrap>${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function manufacturerDistrictRows(districts = [...new Set(FM.map((f) => f[1]))]) {
  return [...districts]
    .sort((a, b) => a.localeCompare(b))
    .map((district) => {
      const firms = FM.filter((f) => f[1] == district);
      return [
        district,
        firms.length,
        firms.map((f) => `${f[0]} — ${f[2]}`).join("; "),
      ];
    });
}

/**
 * Master data page: pre-qualified manufacturers, QIC deployment and DIC deployment.
 */
function master() {
  const tot = DFE.reduce((a, f) => a + f[1].reduce((b, y) => b + y[1], 0), 0);
  return `<div class=grid>
      <div class=card>
        <h3>Pre-qualified manufacturers by district</h3>${wtbl(
          ["District", "Number of pre-qualified manufacturers", "Manufacturer locations"],
          manufacturerDistrictRows(),
          "firm-summary",
        )}
        <h3>Pre-qualified manufacturers (${FM.length})</h3>${wtbl(
          ["Sr.", "Manufacturer", "Place", "District", "Division", "QIC FE"],
          FM.map((f, i) => [i + 1, f[0], f[2], f[1], DIV[f[1]], qfeFor(f[1])]),
        )}
      </div>
<div>
        <div class=card>
          <h3>QIC deployment (${QFE.length} FEs)</h3>${wtbl(
            ["Field Engineer", "District (manufacturers)"],
            QFE.map((f) => [f[0], f[1].map((y) => y[0] + " (" + y[1] + ")").join(", ")]),
          )}
        </div>
<div class=card>
          <h3>DIC deployment (${DFE.length} FEs, ${DIST35.length} districts)</h3>${wtbl(["Field Engineer", "District (machines)"], DFE.map((f) => [f[0], f[1].map((y) => y[0] + " (" + y[1] + ")").join(", ")]).concat([["<b>Total</b>", "<b>" + tot.toLocaleString("en-US") + " machines</b>"]]))}
        </div>
      </div>
    </div>
    <p class=note>Source: Deployment of FEs for QIC duty, Deployment of FEs for DIC duty, and List of Pre-qualified Manufacturers. Manufacturer GPS positions are approximate placeholders.</p>`;
}

/* ============================================================================
 * 12. WEB GIS (MAP VIEW)
 * Opened from the "Map view" button in the MIS. Draws locations from the machine records.
 * ============================================================================ */

/**
 * Map projection. px(longitude) and py(latitude) convert a position to x/y inside the 600 x 560 map.
 * LON0 and LAT1 are the top-left corner; change them (and the scale numbers) to show a different area.
 */
const LON0 = 69.3,
  LAT1 = 34.1,
  px = (lo) => 80 + (lo - LON0) * 70.3,
  py = (la) => 10 + (LAT1 - la) * 82;

/**
 * Schematic outline of Punjab as "longitude,latitude" pairs. Replace with real boundaries in the real build.
 */
const OUTL =
  "72.2,33.9 73.1,33.95 73.55,33.75 73.6,33.3 73.8,33.1 74.2,32.95 74.55,32.8 74.7,32.4 74.9,32.05 74.65,31.75 74.6,31.4 74.55,31.05 74.0,30.95 73.9,30.35 73.4,29.95 72.8,29.05 72.0,28.5 71.1,28.05 70.6,27.85 70.1,27.75 69.6,28.4 69.5,29.2 69.9,29.9 70.2,30.6 70.1,31.3 70.5,31.9 71.0,32.4 71.4,32.9 72.0,33.5"
    .split(" ")
    .map((p) => p.split(",").map(Number));

/**
 * Map-pin icon on the "Map view" button.
 */
const PIN = `<svg width=14 height=14 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round style="vertical-align:-2px;margin-right:6px" aria-hidden=true>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/>
    <circle cx=12 cy=10 r=2.5 />
  </svg>`;

/**
 * Map view button: opens the Web GIS portal inside the MIS page.
 */
function openGis() {
  S.view = "gis";
  render(1);
}

/**
 * Opens the map zoomed to one machine (the "View on map" button in record details).
 */
function gisFocus(id) {
  const m = M.find((x) => x.id == id);
  if (!m) return;
  S.view = "gis";
  const del = m.dicStatus && m.dlat;
  S.g.sel = del ? { t: "m", k: id } : { t: "f", k: m.firm };
  const la = del ? m.dlat : FIRMS[m.firm] ? FIRMS[m.firm][2] : m.lat,
    lo = del ? m.dlng : FIRMS[m.firm] ? FIRMS[m.firm][3] : m.lng;
  if (la) {
    S.g.z = 4;
    S.g.cx = px(+lo);
    S.g.cy = py(+la);
  }
  render(1);
}

/**
 * Selects a marker on the map. gSel("f", firmName) = manufacturer, gSel("m", machineId) = delivered machine.
 */
function gSel(t, k) {
  S.g.sel = { t, k };
  render(1);
}

/**
 * Turns a map layer on or off (out, dis, rte, mfr, del).
 */
function gLay(k) {
  S.g.lay[k] = S.g.lay[k] ? 0 : 1;
  render(1);
}

/**
 * Zoom: gZ(1.5) zooms in, gZ(1 / 1.5) zooms out (limits 1 to 6).
 */
function gZ(f) {
  S.g.z = Math.min(6, Math.max(1, S.g.z * f));
  render(1);
}

/**
 * Resets zoom, centre and selection.
 */
function gReset() {
  Object.assign(S.g, { z: 1, cx: 300, cy: 290, sel: null });
  render(1);
}

/**
 * Centres the map on a latitude/longitude at zoom 4.
 */
function gTo(la, lo) {
  Object.assign(S.g, { z: 4, cx: px(+lo), cy: py(+la) });
  render(1);
}

/**
 * Leaves the map and opens a machine in the MIS records: gOpen(machineId, "qic" or "dic").
 */
function gOpen(id, w) {
  S.view = w;
  S.sel = id;
  render(1);
}

/**
 * HTML of the details card for the selected marker (manufacturer or delivered machine).
 */
function ginfo() {
  const g = S.g.sel;
  if (!g)
    return `<h3>Details</h3>
      <span class=note>Click a manufacturer or delivered machine on the map.</span>`;
  if (g.t == "f") {
    const f = FIRMS[g.k],
      ms = M.filter((m) => m.firm == g.k && m.qicStatus);
    return `<h3>${g.k}</h3>
      <div class=note>${f[1]}</div>
      <table>
        ${[
          ["Division", f[0]],
          ["GPS (tracker QR at QIC)", f[2] + ", " + f[3]],
          ["Machines inspected", ms.length],
          ["QIC approved", ms.filter((m) => m.qicStatus == "Approved").length],
          ["QIC deferred", ms.filter((m) => m.qicStatus == "Deferred").length],
          ["Open discrepancies", ms.filter((m) => m.open).length],
        ]
          .map(
            (r) => `<tr>
          <td>${r[0]}</td>
          <td>${r[1]}</td>
        </tr>`,
          )
          .join("")}
      </table>
      <div class=filters style="margin-top:8px">
        <button class="btn alt sm" onclick="gTo(${f[2]},${f[3]})">Zoom here</button>${ms.length ? `<button class="btn sm" onclick="gOpen('${ms[0].id}','qic')">Open QIC record</button>` : ""}
      </div>`;
  }
  const m = M.find((x) => x.id == g.k);
  if (!m) return "";
  return `<h3>${m.id}</h3>
    <div class=note>${m.farmer} · ${m.dist}</div>
    <table>
      ${[
        ["Manufacturer", m.firm],
        ["QIC", tg(m.qicStatus) + " " + m.qicDate],
        ["DIC", tg(m.dicStatus) + " " + m.dicDate],
        ["Manufacturer GPS", m.lat + ", " + m.lng],
        ["Farmer GPS (tracker QR at DIC)", m.dlat + ", " + m.dlng],
        ["Open discrepancy", m.open ? "Yes" : "No"],
      ]
        .map(
          (r) => `<tr>
        <td>${r[0]}</td>
        <td class=wrap>${r[1]}</td>
      </tr>`,
        )
        .join("")}
    </table>
    <div class=filters style="margin-top:8px">
      <button class="btn alt sm" onclick="gTo(${m.dlat},${m.dlng})">Zoom here</button>
      <button class="btn sm" onclick="gOpen('${m.id}','dic')">Open record in MIS</button>
    </div>`;
}

/**
 * Draws the Web GIS page: SVG map (outline, district centres, routes, manufacturers, delivered machines),
 * layer and filter panel, and the details card. Positions come from the machine records.
 */
function gis() {
  const g = S.g,
    L = g.lay,
    z = g.z;
  const fm = M.filter(
    (m) =>
      (!g.div || m.div == g.div) &&
      (!g.st || (g.st == "Flagged" ? m.open : m.qicStatus == g.st || m.dicStatus == g.st)),
  );
  const fg = {};
  fm.filter((m) => m.qicStatus && FIRMS[m.firm]).forEach((m) => {
    (fg[m.firm] = fg[m.firm] || []).push(m);
  });
  const dl = fm.filter((m) => m.dicStatus && m.dlat && m.dlng);
  const vw = 600 / z,
    vh = 560 / z,
    vx = Math.min(600 - vw, Math.max(0, g.cx - vw / 2)),
    vy = Math.min(560 - vh, Math.max(0, g.cy - vh / 2));
  const col = (x) => (x == "Approved" ? "var(--g)" : x == "Deferred" ? "var(--r)" : "var(--w)");
  let sv = `<svg viewBox="${vx} ${vy} ${vw} ${vh}" width="100%" role="img" aria-label="Schematic map of Punjab with manufacturer and delivery locations" style="display:block;background:var(--card);border:1px solid var(--line);border-radius:10px">`;
  if (L.out)
    sv += `<polygon points="${OUTL.map((p) => px(p[0]).toFixed(1) + "," + py(p[1]).toFixed(1)).join(" ")}" fill="var(--gl)" stroke="var(--g)" stroke-width="${1.5 / z}" stroke-linejoin="round"/>`;
  if (L.dis)
    Object.entries(DC).forEach(([n, c]) => {
      sv += `<circle cx="${px(c[1])}" cy="${py(c[0])}" r="${2.5 / z}" fill="var(--mut)"/>${z >= 2 ? `<text x="${px(c[1]) + 5 / z}" y="${py(c[0]) + 3.5 / z}" font-size="${11 / z}" fill="var(--mut)">${n}</text>` : ""}`;
    });
  if (L.rte)
    dl.forEach((m) => {
      const f = FIRMS[m.firm],
        x1 = f ? px(+f[3]) : px(+m.lng),
        y1 = f ? py(+f[2]) : py(+m.lat);
      sv += `<line x1="${x1}" y1="${y1}" x2="${px(+m.dlng)}" y2="${py(+m.dlat)}" stroke="${col(m.dicStatus)}" stroke-width="${1.5 / z}" stroke-dasharray="${5 / z} ${4 / z}" opacity=".7"/>`;
    });
  if (L.mfr)
    Object.entries(fg).forEach(([n, ms]) => {
      const f = FIRMS[n],
        x = px(+f[3]),
        y = py(+f[2]),
        bad = ms.some((m) => m.qicStatus == "Deferred"),
        fl = ms.some((m) => m.open),
        sz = 12 / z,
        sel = g.sel && g.sel.t == "f" && g.sel.k == n;
      sv += `<g onclick="gSel('f','${n}')" style="cursor:pointer">
          ${sel ? `<rect x="${x - sz}" y="${y - sz}" width="${sz * 2}" height="${sz * 2}" rx="${3 / z}" fill="none" stroke="var(--ink)" stroke-width="${1.5 / z}"/>` : ""}<rect x="${x - sz / 2}" y="${y - sz / 2}" width="${sz}" height="${sz}" rx="${2 / z}" fill="${bad ? "var(--r)" : "var(--g)"}" stroke="${fl ? "var(--w)" : "var(--card)"}" stroke-width="${(fl ? 2.5 : 1.5) / z}"/>
          <text x="${x + 10 / z}" y="${y - 8 / z}" font-size="${11 / z}" font-weight="600" fill="var(--ink)">${n.length > 20 ? n.slice(0, 19) + "…" : n} (${ms.length})</text>
        </g>`;
    });
  if (L.del)
    dl.forEach((m) => {
      const x = px(+m.dlng),
        y = py(+m.dlat),
        sel = g.sel && g.sel.t == "m" && g.sel.k == m.id;
      sv += `<g onclick="gSel('m','${m.id}')" style="cursor:pointer">
          ${sel ? `<circle cx="${x}" cy="${y}" r="${10 / z}" fill="none" stroke="var(--ink)" stroke-width="${1.5 / z}"/>` : ""}<circle cx="${x}" cy="${y}" r="${6 / z}" fill="${col(m.dicStatus)}" stroke="${m.open ? "var(--w)" : "var(--card)"}" stroke-width="${(m.open ? 2.5 : 1.5) / z}"/>${z >= 2 ? `<text x="${x + 9 / z}" y="${y + 4 / z}" font-size="${11 / z}" fill="var(--ink)">${m.farmer}</text>` : ""}
        </g>`;
    });
  sv += `</svg>`;
  return `<div class=gishead>
      <b>PCAP Web GIS portal</b><span style="opacity:.85;font-size:13px">Opened from the MIS portal · Super Seeder</span>
      <button class="btn sm" onclick="S.view='dash';render(1)">← Back to MIS portal</button>
    </div>
<div class=gisg>
      <div class=card style="padding:10px">
        <div class=filters style="margin-bottom:8px">
          <button class="btn alt sm" onclick="gZ(1.5)">Zoom +</button>
          <button class="btn alt sm" onclick="gZ(1/1.5)">Zoom −</button>
          <button class="btn alt sm" onclick="gReset()">Reset</button>
          <span class=note>${Object.keys(fg).length} manufacturers · ${dl.length} delivered machines</span>
        </div>${sv}
<div class=lg>
          <span><i style="background:var(--g)"></i>Approved</span><span><i style="background:var(--r)"></i>Deferred</span><span><i style="border:2px solid var(--w)"></i>Open discrepancy</span><span><i style="background:var(--mut)"></i>Square = manufacturer, circle = delivered</span>
        </div>
      </div>
<div>
        <div class=card>
          <h3>Layers</h3>${[
            ["out", "Province outline"],
            ["dis", "District centres"],
            ["rte", "Delivery routes"],
            ["mfr", "Manufacturers (QIC)"],
            ["del", "Delivered machines (DIC)"],
          ]
            .map(
              ([k, l]) =>
                `<label class=chk style="padding:3px 0">
            <input type=checkbox ${L[k] ? "checked" : ""} onchange="gLay('${k}')">${l}</label>`,
            )
            .join("")}
        </div>
<div class=card>
          <h3>Filters</h3>
          <label class=fl>Division</label>
          <select onchange="S.g.div=this.value;render(1)">
            <option value="">All divisions</option>${["Faisalabad", "Gujranwala", "Lahore", "Multan", "Sialkot"].map((x) => `<option ${g.div == x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
          <label class=fl>Status</label>
          <select onchange="S.g.st=this.value;render(1)">
            <option value="">All statuses</option>${["Approved", "Deferred", "Flagged"].map((x) => `<option ${g.st == x ? "selected" : ""}>${x}</option>`).join("")}
          </select>
        </div>
<div class=card>${ginfo()}</div>
<p class=note>Points come from the tracker-QR GPS captured by the FE at QIC (manufacturer) and DIC (farmer). This prototype draws a schematic outline; the real portal uses a proper basemap and district boundaries.</p>
      </div>
    </div>`;
}

/* ============================================================================
 * 13. START-UP
 * ============================================================================ */

/**
 * Start-up: draws the first screen (the launcher).
 */
render(1);