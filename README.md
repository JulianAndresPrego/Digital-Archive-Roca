# Miguel Ángel Roca — Archivo Digital

Dashboard interactivo de análisis y visualización del patrimonio arquitectónico de **Miguel Ángel Roca**, desarrollado en el marco del proyecto **FraMMET** (TNE23-00074 — Fragility, Marginality, Mobility, Energy Transition), financiado por el MUR a través del PNRR, con sede en la Universidad de Salerno.

> Julián Andrés Prego · Responsable: Prof. Fernando Fraternali · 2026

---

## Vista previa

El dashboard incluye cuatro vistas principales:

| Vista | Descripción |
|-------|-------------|
| **Inicio** | Portada con estadísticas globales del corpus |
| **Dashboard** | Análisis con 5 gráficos interactivos y filtrado cruzado |
| **Mapa Mundial** | 120 proyectos georeferenciados (tiles Voyager + clustering) |
| **Córdoba** | Zoom urbano con imagen satelital ESRI |

---

## Estructura del proyecto

```
roca-archivo-digital/
│
├── index.html              ← Punto de entrada (abrir en navegador)
│
├── css/
│   └── styles.css          ← Todos los estilos (tema oscuro + paleta viva)
│
├── js/
│   ├── data.js             ← Dataset de los 120 proyectos (generado)
│   └── app.js              ← Lógica: gráficos, mapas, filtros, scheda
│
├── data/
│   ├── Roca_DB.xlsx        ← Base de datos principal (fuente de verdad)
│   ├── img_Roca_DB.xlsx    ← URLs de imágenes por Proyecto_Id
│   └── projects.json       ← Export JSON (generado por export_data.py)
│
├── scripts/
│   └── export_data.py      ← Script para regenerar data.js desde los Excel
│
└── assets/                 ← Recursos estáticos (imágenes locales, si aplica)
```

---

## Cómo usar

### Opción A — Abrir directamente (sin servidor)

```bash
# Simplemente abrir index.html en el navegador
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

> ⚠️ Algunos navegadores bloquean recursos locales con `file://`. Si los mapas no cargan, usar la Opción B.

### Opción B — Servidor local (recomendado)

```bash
# Con Python (sin instalación adicional)
python3 -m http.server 8080

# Luego abrir en el navegador:
# http://localhost:8080
```

### Opción C — GitHub Pages

1. Subir el repositorio a GitHub
2. Ir a **Settings → Pages → Source: main branch / root**
3. El dashboard queda publicado en `https://usuario.github.io/roca-archivo-digital`

---

## Cómo actualizar los datos

Los datos viven en los archivos Excel de `/data/`. El flujo para actualizar es:

```bash
# 1. Editar Roca_DB.xlsx o img_Roca_DB.xlsx en /data/

# 2. Instalar dependencias (primera vez)
pip install pandas openpyxl

# 3. Re-exportar a JS y JSON
python scripts/export_data.py

# 4. Refrescar el navegador — los cambios se reflejan automáticamente
```

---

## Funcionalidades

### Dashboard — Filtrado cruzado
Al hacer clic en cualquier elemento de un gráfico (barra, sector, punto), todos los demás se actualizan para mostrar solo los proyectos que coinciden con ese filtro — igual que en Power BI. Un clic en el mismo elemento o en "✕ Limpiar filtro" vuelve al estado completo.

Dimensiones filtrables:
- **Tipología** (destino): UNC, Banco, Espacio Público, Centro Cultural, etc.
- **País**: Argentina, Bolivia, Sudáfrica, etc.
- **Estado**: Realizados / No ejecutados
- **Década**: 1960s, 1970s, 1980s, 1990s, 2000s, 2010s, 2020s

### Mapas
- **Mapa Mundial**: tiles CartoDB Voyager, clustering automático, popup con imagen
- **Mapa Córdoba**: imagen satelital ESRI + etiquetas oscuras superpuestas
- Al hacer clic en un marcador → se abre la **ficha del proyecto** en el panel lateral con imagen, descripción completa, años y botones de links

### Ficha del proyecto (Scheda)
- Imagen real del proyecto (desde Wix CDN)
- Descripción completa sin truncar
- Botón **"↗ Más Info"** → página oficial en `miguelangelroca.com.ar`
- Botón **"⟳ Link 360°"** → tour virtual (disponible en 2 proyectos)

---

## Tecnologías

| Librería | Versión | Uso |
|----------|---------|-----|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Mapas interactivos |
| [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) | 1.5.3 | Agrupación de marcadores |
| [Chart.js](https://www.chartjs.org/) | 4.4.0 | Gráficos del dashboard |
| [Google Fonts](https://fonts.google.com/) | — | Playfair Display, DM Mono, Crimson Pro |
| CartoDB / ESRI | — | Tiles de mapas (CDN gratuito) |

Sin frameworks JavaScript, sin build tools, sin dependencias npm. Solo HTML + CSS + JS vanilla.

---

## Personalización

### Cambiar colores
Editar las variables CSS en `css/styles.css`, bloque `:root {}`:

```css
:root {
  --bg:    #111009;  /* fondo principal */
  --bg2:   #1a190f;  /* fondo tarjetas */
  --acc:   #F4821A;  /* color de acento (naranja) */
  --acc2:  #F4C820;  /* acento secundario (dorado) */
  --txt:   #ede5d4;  /* texto principal */
  /* ... */
}
```

### Cambiar la paleta de gráficos
En `js/app.js`, modificar el array `PAL`:

```javascript
const PAL = [
  '#F4821A', // naranja terracota
  '#E83060', // coral/fucsia
  '#44B840', // verde vivo
  // ... 18 colores en total
];
```

### Agregar un proyecto manualmente
Editar `js/data.js` y agregar un objeto al array `projects`:

```javascript
{
  "id": 121,
  "name": "Nombre del proyecto",
  "ap": 2024,           // año de proyecto
  "ar": null,           // año de realización (null si no ejecutado)
  "si": "NO",           // "SI" | "NO"
  "ciudad": "Córdoba",
  "provincia": "Córdoba",
  "pais": "Argentina",
  "dest": "Espacio Público",
  "desc": "Descripción del proyecto...",
  "lat": -31.416,
  "lng": -64.185,
  "l360": "",           // URL 360° o cadena vacía
  "lp": "https://...", // URL página del proyecto
  "img": "https://..."  // URL imagen
}
```

---

## Contexto académico

Este trabajo forma parte de la investigación sobre digitalización del patrimonio arquitectónico de Miguel Ángel Roca, en el marco del proyecto:

**TNE23-00074 — Fragility, Marginality, Mobility, Energy Transition (FraMMET)**  
CUP: C96G23000270001  
Financiado por el MUR a través del PNRR — NextGenerationEU  
Dipartimento di Ingegneria Civile, Università degli Studi di Salerno

---

## Licencia

Los datos del dataset son propiedad del archivo de Miguel Ángel Roca y del proyecto FraMMET.  
El código del dashboard puede reutilizarse libremente con atribución.
