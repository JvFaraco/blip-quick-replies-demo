# Quick Replies para Blip (demo)

Extensão Chrome (Manifest V3) de respostas rápidas para quem atende no [Blip](https://www.blip.ai/).
Na conversa, digite `/`, escolha uma mensagem com ↑ ↓ e insira com Tab ou Enter.
A extensão só preenche o campo. Quem revisa e envia é o atendente.

> Esta é uma versão de demonstração. A biblioteca que vem junto é fictícia,
> de uma loja online genérica. Troque pelas respostas da sua equipe.

![Biblioteca no tema escuro](docs/biblioteca-escuro.png)

## O que ela faz

- **Atalhos com `/`** no campo de mensagem: busca por atalho, título, categoria ou texto, sem diferenciar acentos.
- **Campos variáveis**: `{{nome}}`, `{{pedido}}` etc. abrem um formulário antes de inserir. Um campo repetido pede um valor só.
- **Funciona em `textarea` e em editor rico** (`contenteditable`), preservando o texto em volta e o Ctrl+Z.
- **Biblioteca editável** (página de opções): criar, editar, duplicar, excluir, exportar e importar JSON, com validação.
- **Popup** para buscar e copiar uma resposta.
- Tema claro e escuro, navegação por teclado, layout que cabe no celular.

## Privacidade

Não tem servidor. A biblioteca fica em `chrome.storage.local`, no navegador de quem usa.
A extensão não registra conversas nem os valores digitados nos campos variáveis.
O content script roda só em `https://*.blip.ai/*`.
Mensagens e campos são inseridos como texto, sem interpretar HTML.

## Instalar (modo desenvolvedor)

1. Clone o repositório.
2. Abra `chrome://extensions`, ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta do projeto.
4. Recarregue a aba do Blip.

Para testar sem o Blip, abra `teste.html` com a extensão carregada.

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `catalogo.js` | Biblioteca padrão (demo) |
| `core.js` | Validação, busca, detecção do atalho, campos variáveis, armazenamento |
| `content.js` | Menu dentro da página (shadow DOM fechado) e inserção no campo |
| `popup.*` | Busca rápida com cópia |
| `biblioteca.*` | Editor da biblioteca |
| `empacotar.py` | Gera o `.zip` em `dist/` com uma lista explícita de arquivos |

## Testes

```bash
npm install
npm test                       # testes unitários (node:test) + navegador (Playwright)
PW_CHANNEL=msedge npm test     # sem Chrome instalado, usa o Edge
```

## Licença

MIT. Fontes Inter e Montserrat sob SIL Open Font License (`vendor/`).
