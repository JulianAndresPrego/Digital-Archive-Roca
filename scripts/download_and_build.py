#!/usr/bin/env python3
"""
download_and_build.py
═══════════════════════════════════════════════════════════════════
Script de build para OPCIÓN B (solo Netlify, sin GitHub Actions).
Netlify lo ejecuta automáticamente en cada redespliegue.

Lee las IDs de Google Drive desde variables de entorno de Netlify:
  ROCA_DB_DRIVE_ID   → ID del Roca_DB.xlsx en Drive
  IMG_DB_DRIVE_ID    → ID del img_Roca_DB.xlsx en Drive

Configuralas en Netlify:
  Site settings → Environment variables → Add variable
═══════════════════════════════════════════════════════════════════
"""

import os, sys, requests, subprocess

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def download_drive(file_id, dest):
    """Descarga un archivo público de Google Drive."""
    print(f"Descargando {os.path.basename(dest)}...")
    url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
    r = requests.get(url, allow_redirects=True, timeout=60)
    if r.status_code != 200:
        print(f"  ERROR HTTP {r.status_code}")
        sys.exit(1)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'wb') as f:
        f.write(r.content)
    print(f"  ✓ {len(r.content)/1024:.0f} KB")


def main():
    db_id  = os.environ.get('ROCA_DB_DRIVE_ID')
    img_id = os.environ.get('IMG_DB_DRIVE_ID')

    if not db_id or not img_id:
        print("ERROR: Variables de entorno ROCA_DB_DRIVE_ID e IMG_DB_DRIVE_ID no configuradas.")
        print("Configurarlas en Netlify: Site settings → Environment variables")
        sys.exit(1)

    # 1. Descargar Excel desde Google Drive
    download_drive(db_id,  os.path.join(BASE, 'data', 'Roca_DB.xlsx'))
    download_drive(img_id, os.path.join(BASE, 'data', 'img_Roca_DB.xlsx'))

    # 2. Regenerar data.js y projects.json
    print("\nRegenerando data.js...")
    result = subprocess.run(
        [sys.executable, os.path.join(BASE, 'scripts', 'export_data.py')],
        capture_output=True, text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print("ERROR:", result.stderr)
        sys.exit(1)

    print("\n✓ Build completado. Netlify publicará el sitio actualizado.")


if __name__ == '__main__':
    main()
