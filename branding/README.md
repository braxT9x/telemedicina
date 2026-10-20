# Marca

Tudo o que identifica a marca (nome, logo, ícones) sai desta pasta.

| Arquivo | Uso |
| --- | --- |
| `marca.json` | Nome da marca, nome curto, nome do portal do médico, cores do tema e se o nome aparece embaixo do logo no login |
| `logo.svg` | Logo branco, sobre o fundo colorido da tela de login |
| `logo-color.svg` | Logo colorido: menu lateral do médico, cabeçalho do paciente, admin |
| `icone.png` | Ícone quadrado de no mínimo 512x512: favicon da aba e ícones do PWA |

## Trocar a marca

1. Edite `marca.json` e/ou substitua os arquivos de logo e ícone, mantendo os nomes.
2. Na raiz do repositório, rode `python3 branding/aplicar_marca.py` (requer Pillow).
3. Faça commit dos arquivos alterados.

O script atualiza título da aba, manifestos PWA, favicons, logos dos dois
front-ends, notificações push, o nome padrão do backend (`site_name`, título do
admin e da API) e o nome do tenant no `docker-compose.yml`.

Em um ambiente já em execução, o nome configurado no admin (Configurações >
`site_name`) e os logos/favicon enviados na organização principal têm
prioridade sobre estes valores padrão.
