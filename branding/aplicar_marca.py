#!/usr/bin/env python3
"""Aplica a marca definida em branding/ em todo o projeto.

Fonte única da marca:
  branding/marca.json      nome, nomes curtos, cores do tema
  branding/logo.svg        logo branco (tela de login, sobre fundo colorido)
  branding/logo-color.svg  logo colorido (menu lateral, cabeçalho, admin)
  branding/icone.png       ícone quadrado, mínimo 512x512 (favicon, PWA, atalhos)

Uso, a partir da raiz do repositório:
  python3 branding/aplicar_marca.py

Requer Pillow para gerar os ícones (pip install Pillow). O script pode ser
executado quantas vezes for preciso: ele reescreve os campos de marca, não
procura um nome antigo para substituir.

Em produção, nome, logos e favicon enviados no admin (Constance "site_name" e
organização principal) continuam tendo prioridade sobre estes valores padrão.
"""

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRANDING = ROOT / "branding"

GENERATED = "Gerado por branding/aplicar_marca.py a partir de branding/marca.json. Não edite à mão."


def load_brand():
    brand = json.loads((BRANDING / "marca.json").read_text(encoding="utf-8"))
    for key in ("nome", "nome_curto", "nome_portal_medico", "cor_tema_paciente", "cor_tema_medico"):
        if not brand.get(key):
            sys.exit(f"marca.json: campo obrigatório ausente: {key}")
    brand.setdefault("mostrar_nome_no_login", True)
    return brand


def sub(path, pattern, value):
    """Troca o trecho entre os grupos 1 e 2 de pattern por value, em path.

    Falha se o campo esperado não existir, para não deixar a marca antiga
    escondida em algum arquivo.
    """
    path = ROOT / path
    text = path.read_text(encoding="utf-8")
    new, n = re.subn(pattern, lambda m: m.group(1) + value + m.group(2), text, flags=re.M)
    if n == 0:
        sys.exit(f"{path.relative_to(ROOT)}: campo não encontrado ({pattern})")
    path.write_text(new, encoding="utf-8")


def js_str(value):
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def xml_escape(value):
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def write_constants(brand):
    ts = (
        f"// {GENERATED}\n"
        f"export const BRAND_NAME = {js_str(brand['nome'])};\n"
        f"export const BRAND_SHOW_NAME_ON_LOGIN = {'true' if brand['mostrar_nome_no_login'] else 'false'};\n"
    )
    for app in ("patient", "practitioner"):
        (ROOT / app / "src/app/core/brand.ts").write_text(ts, encoding="utf-8")

    py = f"# {GENERATED}\nBRAND_NAME = {json.dumps(brand['nome'], ensure_ascii=False)}\n"
    (ROOT / "backend/core/brand.py").write_text(py, encoding="utf-8")


def update_static_files(brand):
    name = brand["nome"]
    name_html = xml_escape(name)
    pract_html = xml_escape(brand["nome_portal_medico"])

    # Título da aba e nome do atalho na tela inicial (antes do Angular carregar).
    for path, title, color in (
        ("patient/src/index.html", name_html, brand["cor_tema_paciente"]),
        ("practitioner/src/index.html", pract_html, brand["cor_tema_medico"]),
    ):
        sub(path, r"(<title>).*?(</title>)", title)
        sub(path, r'(name="apple-mobile-web-app-title" content=")[^"]*(")', title)
        sub(path, r'(name="theme-color" content=")[^"]*(")', color)

    # Manifestos PWA.
    for path, full, short, color in (
        ("patient/src/manifest.webmanifest", name, brand["nome_curto"], brand["cor_tema_paciente"]),
        ("practitioner/public/manifest.webmanifest", brand["nome_portal_medico"], brand["nome_curto"], brand["cor_tema_medico"]),
    ):
        manifest_path = ROOT / path
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.update(name=full, short_name=short, theme_color=color)
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Título padrão das notificações push.
    for path in ("patient/src/custom-sw.js", "practitioner/public/custom-sw.js"):
        sub(path, r"(title: )'[^']*'(,)", js_str(name))
        sub(path, r"(payload\.title \|\| )'[^']*'(;)", js_str(name))

    # Aplicativo nativo do paciente.
    sub("patient/capacitor.config.ts", r"(appName: )'[^']*'(,)", js_str(name))
    strings_xml = "patient/android/app/src/main/res/values/strings.xml"
    sub(strings_xml, r'(<string name="app_name">)[^<]*(</string>)', name_html)
    sub(strings_xml, r'(<string name="title_activity_main">)[^<]*(</string>)', name_html)

    # Nome da organização criada no primeiro boot via Docker.
    sub("docker-compose.yml", r"(TENANT_NAME: \$\{TENANT_NAME:-)[^}]*(\})", name)


def copy_logos():
    targets = {
        "logo.svg": [
            "patient/src/assets/images/logo.svg",
            "practitioner/public/images/logo.svg",
        ],
        "logo-color.svg": [
            "patient/src/assets/images/logo-color.svg",
            "practitioner/public/svg/logo.svg",
            "backend/users/static/users/img/logo-full.svg",
            "backend/statics/users/img/logo-full.svg",
        ],
    }
    for source, dests in targets.items():
        for dest in dests:
            shutil.copyfile(BRANDING / source, ROOT / dest)


def generate_icons():
    try:
        from PIL import Image
    except ImportError:
        sys.exit("Pillow não instalado: pip install Pillow")

    icon = Image.open(BRANDING / "icone.png").convert("RGBA")
    if icon.width < 512 or icon.height < 512:
        print("Aviso: icone.png menor que 512x512, os ícones grandes ficarão borrados.")

    def save(size, dest):
        icon.resize((size, size), Image.LANCZOS).save(ROOT / dest)

    pwa_sizes = (72, 96, 128, 144, 152, 192, 384, 512)
    for folder in ("patient/src/assets/icons", "practitioner/public/icons"):
        for size in pwa_sizes:
            save(size, f"{folder}/icon-{size}x{size}.png")
        save(180, f"{folder}/apple-touch-icon.png")

    save(32, "patient/src/assets/icon/favicon.png")
    save(32, "practitioner/public/favicon-32x32.png")
    save(16, "practitioner/public/favicon-16x16.png")
    for dest in ("patient/src/assets/icon/favicon.ico", "practitioner/public/favicon.ico"):
        icon.save(ROOT / dest, sizes=[(16, 16), (32, 32), (48, 48)])


def main():
    brand = load_brand()
    write_constants(brand)
    update_static_files(brand)
    copy_logos()
    generate_icons()
    print(f"Marca \"{brand['nome']}\" aplicada.")


if __name__ == "__main__":
    main()
