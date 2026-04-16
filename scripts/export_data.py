#!/usr/bin/env python3
"""
export_data.py  |  v7
═══════════════════════════════════════════════════════════════════════
Regenera js/data.js y data/projects.json a partir de los Excel.

FLUJO DE USO:
  1. Editar data/Roca_DB.xlsx (modificar datos existentes)
  2. python scripts/export_data.py
  3. git add js/data.js data/projects.json
  4. git commit -m "datos: descripción del cambio"
  5. git push → el dashboard en producción se actualiza solo

NOTA: Para agregar columnas nuevas al dataset, editar también:
  · Esta función main() para incluir el nuevo campo
  · js/app.js si el campo debe usarse en gráficos o scheda

Requiere: pip install pandas openpyxl
═══════════════════════════════════════════════════════════════════════
"""

import pandas as pd
import json
import os
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clean(v):
    """Devuelve string limpio o vacío si el valor no es válido."""
    if pd.isna(v):
        return ""
    s = str(v).strip()
    return s if s.lower() not in ('nan', 'none', 'null', '') else ""


def main():
    db_path  = os.path.join(BASE, 'data', 'Roca_DB.xlsx')
    img_path = os.path.join(BASE, 'data', 'img_Roca_DB.xlsx')

    if not os.path.exists(db_path):
        print(f"✗ No se encuentra {db_path}")
        sys.exit(1)

    print("Leyendo Excel...")
    df     = pd.read_excel(db_path)
    df_img = pd.read_excel(img_path)
    df     = df.merge(df_img, on='Proyecto_Id', how='left')
    print(f"  {len(df)} proyectos leídos")

    records = []
    for _, r in df.iterrows():
        records.append({
            # ── Identificación ────────────────────────────────────────
            "id":        int(r['Proyecto_Id']),
            "name":      str(r['Proyecto']),
            # ── Temporal ──────────────────────────────────────────────
            "ap":        int(r['Año de Proyecto'])    if pd.notna(r['Año de Proyecto'])    else None,
            "ar":        int(r['Año de Realización']) if pd.notna(r['Año de Realización']) else None,
            "si":        str(r['Se realizo el Proyecto']),
            # ── Geografía ─────────────────────────────────────────────
            "ciudad":    str(r['Ciudad']),
            "provincia": clean(r['Provincia']),
            "pais":      str(r['Pais']).strip(),
            "lat":       float(r['Latitud'])  if pd.notna(r['Latitud'])  else None,
            "lng":       float(r['Longitud']) if pd.notna(r['Longitud']) else None,
            # ── Clasificación ─────────────────────────────────────────
            "eu":        clean(r['Estrategia Urbana']),
            "tipo":      clean(r['Tipo']),
            "dest":      str(r['Destino']),
            # ── Contenido ─────────────────────────────────────────────
            "desc":      str(r['Descripción']) if pd.notna(r['Descripción']) else "",
            # ── Links ─────────────────────────────────────────────────
            "entrevista": clean(r['Entrevistas']),
            "legajo":     clean(r['Legajo Técnico']),
            "modelo3d":   clean(r['Link Modelo 3D']),
            "l360":       clean(r['Link 360']),
            "lp":         clean(r['Link Pagina']),
            "img":        clean(r['picture_url']),
        })

    # ── Exportar JSON puro ───────────────────────────────────────────────────
    json_path = os.path.join(BASE, 'data', 'projects.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"✓ data/projects.json")

    # ── Exportar data.js para el browser ────────────────────────────────────
    js_path = os.path.join(BASE, 'js', 'data.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write("/* ══════════════════════════════════════════════════════════\n")
        f.write("   data.js | Dataset de obras de Miguel Ángel Roca | v7\n")
        f.write("   GENERADO AUTOMÁTICAMENTE — no editar manualmente.\n")
        f.write("   Para actualizar: python scripts/export_data.py\n")
        f.write("   Campos: id · name · ap · ar · si · ciudad · provincia · pais\n")
        f.write("           eu · tipo · dest · desc · lat · lng\n")
        f.write("           entrevista · legajo · modelo3d · l360 · lp · img\n")
        f.write("══════════════════════════════════════════════════════════ */\n\n")
        f.write("const projects = ")
        json.dump(records, f, ensure_ascii=False)
        f.write(";\n")
    print(f"✓ js/data.js")

    # ── Estadísticas ─────────────────────────────────────────────────────────
    total      = len(records)
    realizados = sum(1 for r in records if r['si'] == 'SI')
    print(f"\nResumen:")
    print(f"  Total              {total}")
    print(f"  Realizados         {realizados} ({realizados/total*100:.0f}%)")
    print(f"  No ejecutados      {total - realizados}")
    print(f"  Con imagen         {sum(1 for r in records if r['img'])}")
    print(f"  Con Más Info       {sum(1 for r in records if r['lp'])}")
    print(f"  Con Entrevista     {sum(1 for r in records if r['entrevista'])}")
    print(f"  Con Modelo 3D      {sum(1 for r in records if r['modelo3d'])}")
    print(f"  Con Link 360°      {sum(1 for r in records if r['l360'])}")
    print(f"  Con Estrategia     {sum(1 for r in records if r['eu'])}")
    print(f"  Países             {len(set(r['pais'] for r in records))}")


if __name__ == '__main__':
    main()
