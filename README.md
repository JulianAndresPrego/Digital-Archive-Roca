<div align="center">

# 🏛️ Miguel Ángel Roca — Digital Archive

### Interactive dashboard of an architectural heritage

[![FraMMET](https://img.shields.io/badge/FraMMET-TNE23--00074-F4821A?style=flat-square)]()
[![PNRR](https://img.shields.io/badge/MUR-PNRR-2060c8?style=flat-square)]()
[![Netlify Status](https://img.shields.io/badge/Netlify-Deploying-00C7B7?style=flat-square&logo=netlify&logoColor=white)]()
[![License](https://img.shields.io/badge/license-academic-F4C820?style=flat-square)]()

*Julián Andrés Prego · Prof. Fernando Fraternali - Prof. Carla Ferreyra · Università degli Studi di Salerno · 2026*

</div>

---

## 📖 About

Digital graphic archive and virtual museum of Argentine architect **Miguel Ángel Roca** (1936–2025), developed within the **FraMMET** project — *Fragility, Marginality, Mobility, Energy Transition* — funded by the Italian Ministry of University and Research through the PNRR, hosted at the Department of Civil Engineering of the University of Salerno.

The site allows exploration of **121 projects** through an analytical dashboard, georeferenced maps, and detailed project sheets.

## ✨ Features

- 📊 **9 interactive charts** with multi-dimensional cross-filtering (Typology · Country · Status · Decade · Urban Strategy · Type)
- 🗺️ **Leaflet maps** with 4 switchable tile layers (Standard · Dark · Light · Satellite)
- 📍 **121 georeferenced projects** — built in orange, unbuilt in blue
- 🎨 **Custom dark theme** inspired by Roca's architectural drawings
- 🔗 **5 external links per project** — More Info · 360° Tour · Interview · 3D Model · Technical File
- 📱 **Responsive** for desktop, tablet and mobile

## 🛠️ Tech stack

| | |
|---|---|
| 🗺️ **Leaflet** | `1.9.4` — interactive maps |
| 🧩 **Leaflet.markercluster** | `1.5.3` — marker clustering |
| 📈 **Chart.js** | `4.4.0` — dashboard charts |
| 🌊 **chartjs-chart-sankey** | `0.12.1` — flow diagram |
| 🐍 **Python + pandas** | data processing scripts |
| ⚡ **Netlify + GitHub** | hosting + CI/CD |

**No JS frameworks · No npm · No build tools · Plain HTML + CSS + JavaScript**

## 📂 Repository structure

```
roca-archivo-digital/
│
├── 📄 index.html                       ← Entry point
├── 📄 README.md
├── 📄 netlify.toml                     ← Netlify configuration
├── 📄 .gitignore
│
├── 📁 .github/workflows/
│   └── 🔄 update_data.yml              ← Automatic update from Google Drive
│
├── 📁 css/
│   └── 🎨 styles.css                   ← Dark theme · Roca palette
│
├── 📁 js/
│   ├── 📊 data.js                      ← Dataset (auto-generated)
│   └── ⚙️  app.js                      ← Full logic (charts, maps, filters)
│
├── 📁 data/
│   ├── 📗 Roca_DB.xlsx                 ← Main database ★ source of truth
│   ├── 🖼️  img_Roca_DB.xlsx            ← Image URLs by project ID
│   └── 📋 projects.json                ← JSON export (auto-generated)
│
├── 📁 scripts/
│   ├── 🐍 export_data.py               ← Excel → data.js
│   └── 🐍 download_and_build.py        ← Netlify-only build script
│
└── 📁 assets/                          ← Static resources
```

## 🚀 Deploy

The site is published on **Netlify** connected directly to this repository.

**Automatic update flow:**

```
📗 Drive (Excel)  ──→  🔄 GitHub Actions  ──→  📦 data.js commit  ──→  🌐 Netlify deploy
      ↑                       ↑
   edit here           manual or every 6h
```

Every time the Excel is updated in Google Drive:
1. The GitHub Actions workflow downloads the file and regenerates `js/data.js`
2. The commit is pushed automatically
3. Netlify detects the push and redeploys the site in ~1 minute

## 🔧 Updating data

### ⚡ Immediate update (manual)
```
GitHub → Actions → "Actualizar datos desde Google Drive" → Run workflow
```
The site updates in about 2 minutes.

### 🔁 Automatic update
The workflow runs automatically every 6 hours. To change the frequency, edit `.github/workflows/update_data.yml`:
```yaml
- cron: '0 */6 * * *'   # every 6 hours (current)
- cron: '0 8 * * *'     # once a day at 8 AM UTC
- cron: '0 */2 * * *'   # every 2 hours
```

### 💻 Local development
```bash
# Edit data/Roca_DB.xlsx locally
python scripts/export_data.py
python3 -m http.server 8080
# Open http://localhost:8080
```

## ⚙️ Initial setup (one time only)

**1.** Upload both Excel files to Google Drive and share them as *"Anyone with the link — Viewer"*. Copy the file ID from each URL:
```
https://drive.google.com/file/d/ ► THIS_IS_THE_ID ◄ /view
```

**2.** In the GitHub repository: **Settings → Secrets → Actions → New repository secret**

| Secret | Value |
|--------|-------|
| `ROCA_DB_DRIVE_ID` | ID of `Roca_DB.xlsx` in Drive |
| `IMG_DB_DRIVE_ID`  | ID of `img_Roca_DB.xlsx` in Drive |

**3.** In [netlify.com](https://netlify.com): New site → Import from Git → select this repo → Publish directory: `.` → choose site name.

## 🎨 Customization

| What to change | Where |
|---|---|
| 🎨 Theme colors | `css/styles.css` → `:root {}` |
| 🌈 Chart palette | `js/app.js` → `const PAL` |
| 🔤 Fonts | `index.html` → Google Fonts import |
| 📊 Add a new chart | `js/app.js` → new `buildXChart()` function |

## 🎓 Academic context

<table>
<tr>
<td>

**Project:** TNE23-00074 — FraMMET  
**CUP:** C96G23000270001  
**Funding:** MUR / PNRR · NextGenerationEU  
**Department:** Dipartimento di Ingegneria Civile (DCIV)  
**University:** Università degli Studi di Salerno

</td>
</tr>
</table>

---

<div align="center">

**2026 © Julián Andrés Prego**

</div>
