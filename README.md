# Miguel Ángel Roca — Archivo Digital

Dashboard interactivo de análisis y visualización del patrimonio arquitectónico de **Miguel Ángel Roca**, desarrollado en el marco del proyecto **FraMMET** (TNE23-00074), financiado por el MUR a través del PNRR, con sede en la Universidad de Salerno.

> Julián Andrés Prego · Prof. Fernando Fraternali · 2026

---

## Estructura del proyecto

```
roca-archivo-digital/
│
├── index.html                  ← Punto de entrada
│
├── css/
│   └── styles.css              ← Estilos (tema oscuro + paleta viva)
│
├── js/
│   ├── data.js                 ← Dataset 120 proyectos (generado)
│   └── app.js                  ← Toda la lógica comentada por sección
│
├── data/
│   ├── Roca_DB.xlsx            ← Base de datos principal ★ fuente de verdad
│   ├── img_Roca_DB.xlsx        ← URLs de imágenes por Proyecto_Id
│   └── projects.json           ← Export JSON (generado)
│
├── scripts/
│   └── export_data.py          ← Regenera data.js desde los Excel
│
└── assets/                     ← Recursos estáticos locales (favicon, etc.)
```

---

## Cómo usar

### Abrir localmente (recomendado)

```bash
# Con Python — desde la raíz del proyecto
python3 -m http.server 8080
# Abrir http://localhost:8080
```

> Abrir `index.html` directo con `file://` puede bloquear recursos en algunos navegadores.

### Publicar en Netlify (opción más simple)

1. Crear cuenta en [netlify.com](https://netlify.com)
2. Arrastrar la carpeta `roca-archivo-digital/` a la pantalla de Netlify
3. En **Site settings → Change site name** elegir la URL deseada

### Publicar en GitHub Pages

```bash
git init && git add . && git commit -m "init"
git remote add origin https://github.com/org/roca-archivo-digital.git
git push -u origin main
# Activar Pages en Settings → Pages → Branch: main / root
```

---

## Funcionalidades — v6

### Dashboard analítico

| Gráfico | Descripción | Filtrable |
|---------|-------------|-----------|
| Top 10 Tipologías | Barras horizontales ordenadas por cantidad | ✓ |
| Por País | Donut con porcentajes | ✓ |
| Realizados vs No ejecutados | Barras comparativas | ✓ |
| Por Década | Línea proyectados vs realizados | ✓ |
| Matriz de Intensidad | Heatmap décadas × top 10 tipologías | — |
| Sankey País × Tipología | Flujos (países con >1 proyecto) | — |

### Filtrado cruzado multi-dimensional

Clic en cualquier elemento de un gráfico agrega ese filtro. Se pueden combinar varios simultáneamente (ej. Tipología **UNC** + País **Argentina** + Realizados **SI**). Cada filtro activo aparece como chip individual con su botón `✕` para quitarlo de forma independiente.

### Mapas interactivos

**4 capas seleccionables** en ambos mapas mediante el switcher en esquina superior izquierda:

| Capa | Descripción |
|------|-------------|
| Estándar | CartoDB Voyager — cálido y detallado |
| Oscuro | CartoDB Dark Matter |
| Claro | CartoDB Light |
| Satélite | ESRI World Imagery + etiquetas |

El mapa mundial arranca en *Estándar* y Córdoba en *Satélite*. Al hacer clic en un marcador aparece un **icono pulsante dorado** y se abre la ficha del proyecto con imagen real, descripción completa y botones de links activos.

---

## Actualizar los datos

```bash
# 1. Editar data/Roca_DB.xlsx o data/img_Roca_DB.xlsx

# 2. Instalar dependencias (solo primera vez)
pip install pandas openpyxl

# 3. Regenerar
python scripts/export_data.py

# 4. Refrescar el navegador
```

---

## Personalización rápida

### Colores del tema
Editar variables en `css/styles.css` → bloque `:root {}`:
```css
:root {
  --bg:   #111009;   /* fondo principal */
  --acc:  #F4821A;   /* acento naranja */
  --acc2: #F4C820;   /* acento dorado */
  /* ... */
}
```

### Paleta de gráficos
Editar `const PAL = [...]` en `js/app.js`.

### Agregar un proyecto manualmente
Agregar un objeto al array en `js/data.js` (o mejor: editar el Excel y re-exportar).

---

## Tecnologías

| Librería | Versión | Uso |
|----------|---------|-----|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Mapas |
| [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) | 1.5.3 | Clustering |
| [Chart.js](https://www.chartjs.org/) | 4.4.0 | Gráficos |
| [chartjs-chart-sankey](https://github.com/kurkle/chartjs-chart-sankey) | 0.12.1 | Diagrama Sankey |
| CartoDB / ESRI | — | Tiles de mapa |

Sin frameworks, sin build tools, sin npm. HTML + CSS + JS vanilla.

---

## Contexto académico

**TNE23-00074 — Fragility, Marginality, Mobility, Energy Transition (FraMMET)**  
CUP: C96G23000270001 · MUR / PNRR · NextGenerationEU  
Dipartimento di Ingegneria Civile, Università degli Studi di Salerno
