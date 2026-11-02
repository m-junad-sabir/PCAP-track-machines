# Seed Login Credentials

All seeded field credentials are stored in PostgreSQL by `apps/api/src/database/seed.ts`.

The demo password for every seeded account is:

```text
pcap123
```

Change or replace demo credentials before deployment.

## QIC Engineers

| Username | Full name | Role | District assignments |
|---|---|---|---|
| `qic01` | Dr. Muhammad Ashraf | `field_engineer` | Faisalabad |
| `qic02` | Abdul Aleem | `field_engineer` | Multan, Lodhran |
| `qic03` | Ishtiaq Ali | `field_engineer` | Vehari |
| `qic04` | Muhammad Akram | `field_engineer` | Kasur |
| `qic05` | Rizwan ur Rehman | `field_engineer` | Lahore |
| `qic06` | Mohsin Masood | `field_engineer` | Okara |
| `qic07` | Abdul Mannan Ghaffar | `field_engineer` | Gujranwala, Hafizabad, Gujrat |
| `qic08` | Muhammad Zubair | `field_engineer` | Sialkot |

Shared accounts also have the `DIC` activity when the person appears in both QIC and DIC lists.

## DIC Engineers

DIC-only staff use the following fixed usernames:

| Username | Full name | Role | District assignments |
|---|---|---|---|
| `dic01` | Dr. Alamgir Akhter Khan | `field_engineer` | M/Garh, Kot Adu, Layyah |
| `dic02` | Abdul Waheed Zafar | `field_engineer` | Sargodha |
| `dic03` | Ghulam Siddique | `field_engineer` | Khanewal |
| `dic04` | Dr. Usama Bin Ajmal | `field_engineer` | D.G. Khan, Rajanpur |
| `dic05` | Mian Haroon Ahmad | `field_engineer` | Mandi B. Din, Wazirabad |
| `dic06` | Muhammad Ahmed | `field_engineer` | Jhang, Chiniot |
| `dic07` | Amir Nazir | `field_engineer` | Sheikhupura, Nankana |
| `dic08` | Muhammad Naeem | `field_engineer` | Sahiwal, Pakpattan |
| `dic09` | Altaf Hussain | `field_engineer` | Rahimyar Khan |
| `dic10` | Shah Rasool | `field_engineer` | Bahawalnagar |
| `dic11` | Faizan Khan | `field_engineer` | Narowal |
| `dic12` | Abdul Ghaffar | `field_engineer` | Toba Tek Singh |
| `dic13` | Abid Hussain Jaffery | `field_engineer` | Khushab, Bakhar, Mianwali, Jhelum |
| `dic14` | Abid Ali | `field_engineer` | Bahawalpur |

These people also appear in the QIC list and use their existing QIC account with both activities:

| Username | Full name | District assignments |
|---|---|---|
| `qic01` | Dr. Muhammad Ashraf | Faisalabad |
| `qic02` | Abdul Aleem | Multan, Lodhran |
| `qic03` | Ishtiaq Ali | Vehari |
| `qic04` | Muhammad Akram | Kasur |
| `qic05` | Rizwan ur Rehman | Lahore |
| `qic06` | Mohsin Masood | Okara |
| `qic07` | Abdul Mannan Ghaffar | Gujranwala, Hafizabad, Gujrat |
| `qic08` | Muhammad Zubair | Sialkot |

## Dashboard Accounts

| Username | Full name | Role |
|---|---|---|
| `lead01` | Project Lead (demo) | `project_lead` |
| `admin01` | PCAP Admin (demo) | `pcap_admin` |
| `sysadmin01` | System Administrator (demo) | `system_admin` |

Administration and system-administrator dashboard users are responsible for creating additional QIC and DIC staff.

The Master Data staff screen supports adding or editing staff, assigning QIC/DIC activities, assigning searchable and alphabetized districts, changing passwords, and deactivating or reactivating accounts. Password fields in login and staff forms include hide/show controls.
