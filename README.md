# Miguel Ángel Roca — Archivo Digital

Dashboard interactivo de análisis y visualización del patrimonio arquitectónico de **Miguel Ángel Roca**, en el marco del proyecto **FraMMET** (TNE23-00074), financiado por el MUR a través del PNRR.

> Julián Andrés Prego · Prof. Fernando Fraternali · 2026

---

## Estructura del proyecto

```
roca-archivo-digital/
│
├── index.html                  ← Punto de entrada (no tocar para actualizar datos)
│
├── css/
│   └── styles.css              ← Estilos — tema oscuro + paleta viva
│
├── js/
│   ├── data.js                 ← Dataset generado ★ ESTE ES EL QUE CAMBIA
│   └── app.js                  ← Lógica completa (gráficos, mapas, filtros)
│
├── data/
│   ├── Roca_DB.xlsx            ← Fuente de verdad ★ editar acá los datos
│   ├── img_Roca_DB.xlsx        ← URLs de imágenes por Proyecto_Id
│   └── projects.json           ← Export JSON (generado junto con data.js)
│
├── scripts/
│   └── export_data.py          ← Script que regenera data.js desde el Excel
│
└── assets/                     ← Recursos estáticos (favicon, imágenes locales)
```

---

## ¿Cómo actualizar los datos?

El flujo es simple: **editar el Excel → correr el script → hacer push**.

```bash
# 1. Editar datos en el Excel (modificar filas, completar campos vacíos, etc.)
#    data/Roca_DB.xlsx  ←  datos principales
#    data/img_Roca_DB.xlsx  ←  URLs de imágenes (columna picture_url)

# 2. Regenerar data.js y projects.json automáticamente
python scripts/export_data.py

# 3. Commit y push — el dashboard en producción se actualiza solo
git add js/data.js data/projects.json
git commit -m "datos: descripción del cambio"
git push
```

> No es necesario tocar `index.html`, `app.js` ni `styles.css`.

### Campos editables en Roca_DB.xlsx

| Columna | Descripción |
|---------|-------------|
| `Proyecto_Id` | ID único — no modificar |
| `Proyecto` | Nombre del proyecto |
| `Año de Proyecto` | Año de inicio/diseño |
| `Año de Realización` | Año de construcción (vacío si no ejecutado) |
| `Se realizo el Proyecto` | `SI` o `NO` |
| `Ciudad` / `Provincia` / `Pais` | Ubicación |
| `Estrategia Urbana` | Ciudad Universitaria / Córdoba 91 / etc. |
| `Tipo` | Institución / Viviendas / Oficinas y Corporativos / Espacios Urbanos / Comerciales |
| `Destino` | Tipología específica (Banco, UNC, Espacio Público, etc.) |
| `Descripción` | Texto descriptivo completo |
| `Latitud` / `Longitud` | Coordenadas WGS84 |
| `Entrevistas` | URL YouTube u otro |
| `Legajo Técnico` | URL del legajo (puede quedar vacío) |
| `Link Modelo 3D` | URL del modelo 3D |
| `Link 360` | URL del tour 360° |
| `Link Pagina` | URL en miguelangelroca.com.ar |

---

## Cómo usar localmente

```bash
# Con Python — desde la raíz del proyecto
python3 -m http.server 8080
# Abrir http://localhost:8080
```

> Abrir `index.html` directo con `file://` puede bloquear recursos en algunos navegadores.

## Publicar en Netlify (recomendado — URL sin usuario)

1. Crear cuenta en [netlify.com](https://netlify.com)
2. Conectar el repositorio de GitHub
3. En **Site settings → Change site name** elegir la URL deseada
4. Cada `git push` actualiza automáticamente el sitio publicado

## Publicar en GitHub Pages

```bash
# En GitHub: Settings → Pages → Branch: main / root
# URL resultante: https://org.github.io/roca-archivo-digital/
```

---

## Funcionalidades — v7

### Dashboard analítico

| Gráfico | Descripción | Filtrable |
|---------|-------------|-----------|
| Top 10 Tipologías | Barras horizontales por cantidad | ✓ |
| Por País | Donut con porcentajes | ✓ |
| Realizados vs No ejecutados | Barras comparativas | ✓ |
| Por Década | Línea proyectados vs realizados | ✓ |
| Estrategias Urbanas | Barras apiladas realizados/proyectados | ✓ |
| Matriz de Intensidad | Heatmap décadas × top 10 tipologías | — |
| Sankey País × Tipología | Flujos (países con >1 proyecto) | — |

### Filtrado cruzado multi-dimensional
Clic en cualquier elemento agrega ese filtro. Se combinan: Tipología + País + Estado + Década + Estrategia Urbana. Chips individuales con `✕` para quitar cada filtro.

### Mapas interactivos — 4 capas
- **Ejecutados** → marcador naranja con halo
- **No ejecutados** → marcador azul con halo
- Switcher de capas: Estándar · Oscuro · Claro · Satélite

### Ficha del proyecto — 5 botones de links
Más Info · Link 360° · Entrevista · Modelo 3D · Legajo Técnico
(se activan solo si el proyecto tiene el link)

---

## Tecnologías

| Librería | Versión | Uso |
|----------|---------|-----|
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Mapas |
| [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) | 1.5.3 | Clustering |
| [Chart.js](https://www.chartjs.org/) | 4.4.0 | Gráficos |
| [chartjs-chart-sankey](https://github.com/kurkle/chartjs-chart-sankey) | 0.12.1 | Diagrama Sankey |

Sin frameworks, sin build tools, sin npm. HTML + CSS + JS vanilla.

---

## Contexto académico

**TNE23-00074 — Fragility, Marginality, Mobility, Energy Transition (FraMMET)**
CUP: C96G23000270001 · MUR / PNRR · NextGenerationEU
Dipartimento di Ingegneria Civile, Università degli Studi di Salerno
