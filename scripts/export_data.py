#!/usr/bin/env python3
"""
export_data.py  |  v7
Regenera js/data.js y data/projects.json desde los Excel.
MODO LOCAL:    python scripts/export_data.py
MODO CI/CD:   GitHub Actions lo corre automáticamente tras descargar los Excel de Drive.
"""

import pandas as pd, json, os, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def clean(v):
    if pd.isna(v): return ""
    s = str(v).strip()
    return s if s.lower() not in ('nan','none','null','') else ""

def main():
    db_path  = os.path.join(BASE, 'data', 'Roca_DB.xlsx')
    img_path = os.path.join(BASE, 'data', 'img_Roca_DB.xlsx')
    for p in (db_path, img_path):
        if not os.path.exists(p):
            print(f"✗ No se encuentra {p}"); sys.exit(1)

    print("Leyendo Excel...")
    df = pd.read_excel(db_path).merge(pd.read_excel(img_path), on='Proyecto_Id', how='left')
    print(f"  {len(df)} proyectos leídos")

    records = []
    for _, r in df.iterrows():
        records.append({
            "id": int(r['Proyecto_Id']),
            "name": str(r['Proyecto']),
            "ap": int(r['Año de Proyecto']) if pd.notna(r['Año de Proyecto']) else None,
            "ar": int(r['Año de Realización']) if pd.notna(r['Año de Realización']) else None,
            "si": str(r['Se realizo el Proyecto']),
            "ciudad": str(r['Ciudad']),
            "provincia": clean(r['Provincia']),
            "pais": str(r['Pais']).strip(),
            "eu": clean(r['Estrategia Urbana']),
            "tipo": clean(r['Tipo']),
            "dest": str(r['Destino']),
            "desc": str(r['Descripción']) if pd.notna(r['Descripción']) else "",
            "lat": float(r['Latitud'])  if pd.notna(r['Latitud'])  else None,
            "lng": float(r['Longitud']) if pd.notna(r['Longitud']) else None,
            "entrevista": clean(r['Entrevistas']),
            "legajo":     clean(r['Legajo Técnico']),
            "modelo3d":   clean(r['Link Modelo 3D']),
            "l360":       clean(r['Link 360']),
            "lp":         clean(r['Link Pagina']),
            "img":        clean(r['picture_url']),
        })

    with open(os.path.join(BASE,'data','projects.json'),'w',encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    print("✓ data/projects.json")

    with open(os.path.join(BASE,'js','data.js'),'w',encoding='utf-8') as f:
        f.write("/* data.js — GENERADO AUTOMÁTICAMENTE — no editar manualmente */\n\n")
        f.write("const projects = ")
        json.dump(records, f, ensure_ascii=False)
        f.write(";\n")
    print("✓ js/data.js")

    total = len(records)
    real  = sum(1 for r in records if r['si']=='SI')
    print(f"\nTotal: {total}  |  Realizados: {real}  |  Países: {len(set(r['pais'] for r in records))}")

if __name__ == '__main__':
    main()
