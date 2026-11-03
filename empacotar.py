"""Gera pacote de distribuição com uma lista explícita de arquivos públicos.

Sem argumentos: zip com a pasta quick-replies/ dentro, para carregar sem compactação.
Com --loja: zip com o manifest.json na raiz, formato exigido pela Chrome Web Store.
"""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
FILES = (
    "manifest.json", "catalogo.js", "core.js", "content.js", "background.js",
    "popup.html", "popup.js", "biblioteca.html", "biblioteca.js",
    "ui.css", "portal.css", "theme.js", "teste.html", "README.md",
    "biblioteca-padrao.json", "vendor/inter-latin-wght.woff2",
    "vendor/montserrat-latin-wght.woff2", "vendor/LICENSE-inter.txt",
    "vendor/LICENSE-montserrat.txt",
    "icons/icon-16.png", "icons/icon-32.png", "icons/icon-48.png",
    "icons/icon-128.png", "icons/icone.svg", "LICENSE",
)

if __name__ == "__main__":
    subprocess.run([
        "node", "-e",
        "require('./catalogo.js');require('node:fs').writeFileSync('biblioteca-padrao.json',JSON.stringify({version:1,library:QR_DEFAULTS},null,2)+'\\n');",
    ], cwd=ROOT, check=True)
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    loja = "--loja" in sys.argv[1:]
    output = ROOT / "dist" / f"quick-replies-{'loja-' if loja else ''}{manifest['version']}.zip"
    output.parent.mkdir(exist_ok=True)
    with ZipFile(output, "w", ZIP_DEFLATED) as package:
        for name in FILES:
            package.write(ROOT / name, name if loja else f"quick-replies/{name}")
    with ZipFile(output) as package:
        assert package.testzip() is None
        assert len(package.namelist()) == len(FILES)
    print(output)
