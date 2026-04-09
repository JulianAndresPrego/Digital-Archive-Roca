#!/usr/bin/env python3
"""
export_data.py  |  v6
──────────────────────
Regenera js/data.js y data/projects.json a partir de los Excel originales.
Ejecutar desde la raíz del proyecto:

    python scripts/export_data.py

Requiere: pip install pandas openpyxl
"""

import pandas as pd
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def clean_link(v):
    if pd.isna(v):
        return ""
    s = str(v).strip()
    return s if s.lower() not in ('nan', 'none', 'null', '') else ""


def main():
    print("Leyendo Excel...")
    df     = pd.read_excel(os.path.join(BASE, 'data', 'Roca_DB.xlsx'))
    df_img = pd.read_excel(os.path.join(BASE, 'data', 'img_Roca_DB.xlsx'))
    df     = df.merge(df_img, on='Proyecto_Id', how='left')
    print(f"  {len(df)} proyectos leídos")

    records = []
    for _, r in df.iterrows():
        records.append({
            "id":        int(r['Proyecto_Id']),
            "name":      str(r['Proyecto']),
            "ap":        int(r['Año de Proyecto'])    if pd.notna(r['Año de Proyecto'])    else None,
            "ar":        int(r['Año de Realización']) if pd.notna(r['Año de Realización']) else None,
            "si":        str(r['Se realizo el Proyecto']),
            "ciudad":    str(r['Ciudad']),
            "provincia": str(r['Provincia']) if pd.notna(r['Provincia']) else "",
            "pais":      str(r['Pais']).strip(),
            "dest":      str(r['Destino']),
            "desc":      str(r['Descripción']) if pd.notna(r['Descripción']) else "",
            "lat":       float(r['Latitud'])   if pd.notna(r['Latitud'])   else None,
            "lng":       float(r['Longitud'])  if pd.notna(r['Longitud'])  else None,
            "l360":      clean_link(r['Link 360']),
            "lp":        clean_link(r['Link Pagina']),
            "img":       clean_link(r['picture_url']),
        })

    # JSON puro
    json_path = os.path.join(BASE, 'data', 'projects.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print(f"✓ data/projects.json")

    # data.js para el browser
    js_path = os.path.join(BASE, 'js', 'data.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write("/* ══════════════════════════════════════════════════════════════════════\n")
        f.write("   data.js  |  Dataset de obras de Miguel Ángel Roca  |  v6\n")
        f.write("   GENERADO AUTOMÁTICAMENTE por scripts/export_data.py\n")
        f.write("   No editar manualmente.\n")
        f.write("══════════════════════════════════════════════════════════════════════ */\n\n")
        f.write("const projects = ")
        json.dump(records, f, ensure_ascii=False)
        f.write(";\n")
    print(f"✓ js/data.js")

    # Resumen
    total     = len(records)
    realizados= sum(1 for r in records if r['si'] == 'SI')
    print(f"\nResumen:")
    print(f"  Total          {total}")
    print(f"  Realizados     {realizados} ({realizados/total*100:.0f}%)")
    print(f"  No ejecutados  {total-realizados}")
    print(f"  Con imagen     {sum(1 for r in records if r['img'])}")
    print(f"  Con Más Info   {sum(1 for r in records if r['lp'])}")
    print(f"  Con Link 360°  {sum(1 for r in records if r['l360'])}")
    print(f"  Países         {len(set(r['pais'] for r in records))}")


if __name__ == '__main__':
    main()
