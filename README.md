<div align="center">

# 🏛️ Miguel Ángel Roca — Archivo Digital

### Dashboard interactivo del patrimonio arquitectónico

[![FraMMET](https://img.shields.io/badge/FraMMET-TNE23--00074-F4821A?style=flat-square)]()
[![PNRR](https://img.shields.io/badge/MUR-PNRR-2060c8?style=flat-square)]()
[![Netlify Status](https://img.shields.io/badge/Netlify-Deploying-00C7B7?style=flat-square&logo=netlify&logoColor=white)]()
[![License](https://img.shields.io/badge/license-academic-F4C820?style=flat-square)]()

*Università degli Studi di Salerno · 2026*

</div>

---

## 📖 Sobre el proyecto

Archivo gráfico digital y museo virtual del arquitecto argentino **Miguel Ángel Roca** (1936–2025), desarrollado en el marco del proyecto **FraMMET** — *Fragility, Marginality, Mobility, Energy Transition* — financiado por el Ministerio de Universidad e Investigación italiano a través del PNRR, con sede en el Dipartimento di Ingegneria Civile de la Universidad de Salerno.

El sitio permite explorar **121 proyectos** del arquitecto a través de análisis dashboard, mapas georreferenciados y fichas detalladas de cada obra.

## ✨ Características

- 📊 **9 gráficos interactivos** con filtrado cruzado multi-dimensional (Tipología · País · Estado · Década · Estrategia Urbana · Tipo)
- 🗺️ **Mapas Leaflet** con 4 capas intercambiables (Estándar · Oscuro · Claro · Satélite)
- 📍 **121 proyectos georreferenciados** — ejecutados en naranja, no ejecutados en azul
- 🎨 **Paleta viva** inspirada en los dibujos arquitectónicos de Roca
- 🔗 **5 links por proyecto** — Más Info · Link 360° · Entrevista · Modelo 3D · Legajo Técnico
- 📱 **Responsive** para desktop, tablet y mobile

## 🛠️ Stack tecnológico

| | |
|---|---|
| 🗺️ **Leaflet** | `1.9.4` — mapas interactivos |
| 🧩 **Leaflet.markercluster** | `1.5.3` — agrupación de marcadores |
| 📈 **Chart.js** | `4.4.0` — gráficos del dashboard |
| 🌊 **chartjs-chart-sankey** | `0.12.1` — diagrama de flujo |
| 🐍 **Python + pandas** | scripts de procesamiento de datos |
| ⚡ **Netlify + GitHub** | hosting + CI/CD |

**Sin frameworks JS · Sin npm · Sin build tools complicados · HTML + CSS + JS vanilla**

## 📂 Estructura del repositorio

```
roca-archivo-digital/
│
├── 📄 index.html                       ← Punto de entrada
├── 📄 README.md
├── 📄 netlify.toml                     ← Configuración de Netlify
├── 📄 .gitignore
│
├── 📁 .github/workflows/
│   └── 🔄 update_data.yml              ← Actualización automática desde Drive
│
├── 📁 css/
│   └── 🎨 styles.css                   ← Tema oscuro · paleta Roca
│
├── 📁 js/
│   ├── 📊 data.js                      ← Dataset (generado automáticamente)
│   └── ⚙️  app.js                      ← Lógica completa (gráficos, mapas, filtros)
│
├── 📁 data/
│   ├── 📗 Roca_DB.xlsx                 ← Base de datos principal
│   ├── 🖼️  img_Roca_DB.xlsx            ← URLs de imágenes
│   └── 📋 projects.json                ← Export JSON (generado)
│
├── 📁 scripts/
│   ├── 🐍 export_data.py               ← Excel → data.js
│   └── 🐍 download_and_build.py        ← Build script para Netlify
│
└── 📁 assets/                          ← Recursos estáticos
```

## 🚀 Deploy

El sitio está publicado en **Netlify** conectado directamente a este repositorio.

**Flujo de actualización automática:**

```
📗 Drive (Excel)  ──→  🔄 GitHub Actions  ──→  📦 data.js commit  ──→  🌐 Netlify deploy
      ↑                       ↑
   editar acá         manual o cada 6h
```

Cada vez que se actualiza el Excel en Google Drive:
1. El workflow de GitHub descarga el archivo y regenera `js/data.js`
2. El commit se pushea automáticamente
3. Netlify detecta el push y redespliega el sitio en ~1 minuto

## 🔧 Actualización de datos

### ⚡ Actualización inmediata (manual)
```
GitHub → Actions → "Actualizar datos desde Google Drive" → Run workflow
```
El sitio queda actualizado en 2 minutos.

### 🔁 Actualización automática
El workflow corre automáticamente cada 6 horas. Para cambiar la frecuencia, editar `.github/workflows/update_data.yml`:
```yaml
- cron: '0 */6 * * *'   # cada 6 horas (actual)
- cron: '0 8 * * *'     # una vez al día a las 8 AM UTC
- cron: '0 */2 * * *'   # cada 2 horas
```

### 💻 Desarrollo local
```bash
# Editar data/Roca_DB.xlsx localmente
python scripts/export_data.py
python3 -m http.server 8080
# Abrir http://localhost:8080
```

## 🎨 Personalización

| ¿Qué quiero cambiar? | ¿Dónde? |
|---|---|
| 🎨 Colores del tema | `css/styles.css` → `:root {}` |
| 🌈 Paleta de gráficos | `js/app.js` → `const PAL` |
| 🔤 Tipografías | `index.html` → Google Fonts import |
| 📊 Agregar un gráfico | `js/app.js` → nueva función `buildXChart()` |

## 🎓 Contexto académico

<table>
<tr>
<td>

**Proyecto:** TNE23-00074 — FraMMET  
**CUP:** C96G23000270001  
**Financiamiento:** MUR / PNRR · NextGenerationEU  
**Institución:** Dipartimento di Ingegneria Civile  
**Universidad:** Università degli Studi di Salerno

</td>
</tr>
</table>

---

<div align="center">

**2026 © Julián Andrés Prego**

</div>
