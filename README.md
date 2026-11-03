# Quick Replies

Extensão Chrome (Manifest V3) de respostas rápidas para quem atende em chat web: [Blip](https://www.blip.ai/), Zendesk, Intercom, WhatsApp Web, HubSpot ou o sistema da sua empresa.
Na conversa, digite `/`, escolha uma mensagem com ↑ ↓ e insira com Tab ou Enter.
A extensão só preenche o campo. Quem revisa e envia é o atendente.

> Versão de demonstração. As bibliotecas que vêm junto são fictícias. Troque pelas respostas da sua equipe.

![Biblioteca no tema escuro](docs/biblioteca-escuro.png)

## O que ela faz

- **Atalhos com `/`** no campo de mensagem: busca por atalho, título, categoria ou texto, sem diferenciar acentos.
- **Funciona em qualquer site.** Abra a conversa, clique no ícone da extensão e em **Ativar nesta aba**. O site fica salvo e, da próxima vez, o `/` já funciona sozinho. No Blip não precisa ativar.
- **Variáveis automáticas**: `{{saudacao}}` vira "Bom dia", "Boa tarde" ou "Boa noite" conforme a hora; `{{data}}` e `{{hora}}` também.
- **Variáveis fixas**: `{{empresa}}`, `{{atendente}}` ou qualquer outra que você cadastrar uma vez na aba Variáveis e nunca mais digitar.
- **Campos na hora**: qualquer outra variável, como `{{nome}}` ou `{{pedido}}`, abre um formulário curto antes de inserir. Campo repetido pede um valor só.
- **Pacotes de partida** por tipo de equipe: atendimento geral, loja online, suporte técnico, agendamentos, financeiro. Adicione ao seu acervo ou substitua tudo com um clique.
- **Biblioteca editável**: criar, editar, duplicar, excluir, exportar e importar em **JSON ou CSV** (planilha do Excel ou Google Planilhas).
- **Funciona em `textarea` e em editor rico** (`contenteditable`), preservando o texto em volta e o Ctrl+Z.
- **Popup** para buscar e copiar uma resposta já preenchida.
- Tema claro e escuro, navegação por teclado, layout que cabe no celular.

![Pacotes de partida](docs/pacotes-escuro.png)

## Instalar

**Pacote pronto:** baixe o `.zip` da [última release](../../releases/latest), descompacte, abra `chrome://extensions`, ative o **Modo do desenvolvedor** e clique em **Carregar sem compactação** apontando para a pasta `quick-replies`.

**Pelo código:**

1. Clone o repositório.
2. Abra `chrome://extensions`, ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta do projeto.

Funciona também no Edge (`edge://extensions`).

## Como usar em 1 minuto

1. Abra a conversa no seu sistema de atendimento.
2. Clique no ícone da extensão e em **Ativar nesta aba**. Permita o acesso ao site quando o navegador perguntar.
3. Clique no campo de mensagem e digite `/`.
4. Em **Gerenciar biblioteca**, escolha um pacote de partida na aba **Pacotes** e preencha `{{empresa}}` e `{{atendente}}` na aba **Variáveis**.

Para testar sem nenhum sistema, abra a área de teste pelo link **Testar atalhos** na biblioteca.

## Montar a biblioteca a partir de uma planilha

Crie uma planilha com as colunas `atalho`, `titulo`, `categoria` e `mensagem` (cabeçalhos em português ou inglês, separador `;` ou `,`), exporte em CSV e importe na biblioteca. Exporte em CSV para editar em planilha e importar de volta.

## Privacidade

Não tem servidor. Biblioteca, variáveis e lista de sites ficam em `chrome.storage.local`, no navegador de quem usa.
A extensão não registra conversas nem os valores digitados nos campos variáveis.
O conteúdo só roda nos sites que você ativou (e em `*.blip.ai` por padrão); a permissão de cada site é pedida ao navegador na hora de ativar e pode ser removida na aba **Sites**.
Mensagens e campos são inseridos como texto, sem interpretar HTML.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `catalogo.js` | Pacotes de partida (fictícios) e biblioteca padrão |
| `core.js` | Validação, busca, detecção do atalho, variáveis, CSV, sites, armazenamento |
| `content.js` | Menu dentro da página (shadow DOM fechado) e inserção no campo |
| `background.js` | Service worker: registra o menu nos sites salvos |
| `popup.*` | Busca rápida com cópia e **Ativar nesta aba** |
| `biblioteca.*` | Editor da biblioteca: respostas, pacotes, variáveis e sites |
| `empacotar.py` | Gera o `.zip` em `dist/` com uma lista explícita de arquivos |

## Testes

```bash
npm install
npm test                       # testes unitários (node:test) + navegador (Playwright)
PW_CHANNEL=msedge npm test     # sem Chrome instalado, usa o Edge
```

## Licença

MIT. Fontes Inter e Montserrat sob SIL Open Font License (`vendor/`).
