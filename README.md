# Agencia 217 · Centro de recursos

Página web moderna que centraliza documentos, enlaces y recursos de la Agencia 217.
Modo claro y oscuro con toggle persistido en el navegador, buscador, filtros por categoría y diseño responsivo.

🔗 **Sitio en vivo:** https://gustabson.github.io/Agencia217/

---

## Estructura

```
Agencia217/
├── index.html              ← Página principal
├── assets/
│   ├── css/style.css       ← Estilos (claro/oscuro)
│   ├── js/app.js           ← Lógica: toggle, búsqueda, filtros, render
│   ├── js/data.js          ← Lista de documentos, enlaces y recursos
│   └── img/                ← Logo y favicon (SVG)
├── documentos/             ← Subí acá tus PDF, Word, etc.
├── recursos/               ← Imágenes, plantillas, descargables
├── .nojekyll               ← Evita procesamiento Jekyll en GitHub Pages
└── .gitignore
```

## Cómo agregar contenido

### Documentos y recursos

1. Pegá los archivos en `documentos/` o `recursos/`.
2. **Doble-click en `actualizar.bat`** — escanea las carpetas y actualiza `manifest.json`.
3. `git add . && git commit -m "..." && git push`.

El título de cada tarjeta sale del nombre del archivo (los `_` y `-` se reemplazan por
espacios). El ícono se elige según la extensión y el tamaño se muestra solo. Para que el
título quede lindo, **renombrá el archivo antes de copiarlo** (ej: `Reglamento Interno 2026.pdf`).

### Enlaces externos

Editás el archivo [enlaces.json](enlaces.json) en la raíz del repo. Es JSON simple,
copiás un bloque y cambiás los valores:

```json
[
  {
    "title": "AFIP",
    "desc": "Portal de la Administración Federal.",
    "url": "https://www.afip.gob.ar",
    "meta": "Externo"
  }
]
```

Hacés `git push` y aparecen en la sección Enlaces.

> **Tip:** todas las tarjetas (documentos, enlaces y recursos) abren en una pestaña nueva,
> así no perdés la página del centro.

## Publicar en GitHub Pages

Ya tenés el repo `gustabson/Agencia217`. Desde esta carpeta:

```powershell
git init
git add .
git commit -m "Inicial: centro de recursos Agencia 217"
git branch -M main
git remote add origin https://github.com/gustabson/Agencia217.git
git push -u origin main
```

Luego en GitHub:
1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / carpeta `/ (root)` → Save

En unos minutos estará en https://gustabson.github.io/Agencia217/

## Actualizar después

Cada vez que agregues o cambies algo:

```powershell
git add .
git commit -m "Agrego documento X"
git push
```

GitHub Pages se actualiza solo.
