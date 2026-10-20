# Marca

Tudo o que identifica a marca (nome, logo, ícones) sai desta pasta.

| Arquivo | Uso |
| --- | --- |
| `marca.json` | Nome da marca, nome curto, nome do portal do médico, cores do tema, fundo do ícone e se o nome aparece embaixo do logo no login |
| `logo-branco.png` | Logo completo branco, sobre o fundo colorido da tela de login |
| `logo-azul.png` | Logo completo colorido, no admin |
| `marca-azul.png` | Símbolo colorido: menu lateral do médico, cabeçalho do paciente, favicon e ícones do PWA |
| `marca-branca.png` | Símbolo branco, reserva para fundos escuros |

Os logos podem ser PNG com fundo transparente ou SVG com o mesmo nome.

## Trocar a marca

1. Edite `marca.json` e/ou substitua os arquivos de logo, mantendo os nomes.
2. Na raiz do repositório, rode `python3 branding/aplicar_marca.py` (requer Pillow).
3. Faça commit dos arquivos alterados.

O script atualiza título da aba, manifestos PWA, favicons, logos dos dois
front-ends, notificações push, o nome padrão do backend (`site_name`, título do
admin e da API) e o nome do tenant no `docker-compose.yml`.

Em um ambiente já em execução, o nome configurado no admin (Configurações >
`site_name`) e os logos/favicon enviados na organização principal têm
prioridade sobre estes valores padrão.
