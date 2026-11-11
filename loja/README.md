# Pacote da Chrome Web Store

Tudo o que o painel do desenvolvedor da Chrome Web Store pede, pronto para copiar e enviar. As imagens são geradas por `npm run loja` (Playwright) a partir da [demo do GitHub Pages](../docs/index.html) e das páginas da extensão.

> Os limites abaixo seguem a documentação da Chrome Web Store conhecida até a preparação deste pacote. Confira no painel na hora de enviar: ele recusa o que estiver fora do formato.

## 1. Pacote

Baixe o `quick-replies-loja-<versão>.zip` da [última release](https://github.com/JvFaraco/blip-quick-replies-demo/releases/latest), gerado pelo workflow a cada tag (`python empacotar.py --loja`: `manifest.json` na raiz do zip, como a loja exige).

## 2. Listagem (aba "Store listing")

| Campo | PT-BR | EN |
| --- | --- | --- |
| Nome | Quick Replies | Quick Replies |
| Resumo (máx. 132 caracteres; vem do `description` do manifest) | Respostas rápidas para atendimento em qualquer chat web. Digite / para escolher uma mensagem e revisar antes de enviar. (119) | Canned replies for customer support in any web chat. Type / to pick a message, then review it before you send. (110) |
| Descrição detalhada (máx. 16.000) | [`descricao-pt-BR.txt`](descricao-pt-BR.txt) | [`descricao-en.txt`](descricao-en.txt) |
| Categoria (sugestão) | Produtividade › Comunicação | Productivity › Communication |
| Idioma | Português (Brasil) | English |

**Sobre o inglês:** a loja só abre uma listagem por idioma quando o pacote traz `_locales/<idioma>/messages.json` com aquele idioma. Hoje o manifest tem nome e descrição fixos em português, então a listagem em inglês exige um passo a mais, que muda o pacote (e não foi feito aqui para não alterar a extensão): criar `_locales/pt_BR` e `_locales/en`, trocar `name` e `description` do manifest por `__MSG_nome__` e `__MSG_descricao__` e definir `"default_locale": "pt_BR"`. Até lá, use a descrição em inglês como segundo bloco da descrição em português, se quiser alcançar quem procura em inglês.

### Imagens

| Arquivo | Tamanho | Onde vai |
| --- | --- | --- |
| [`icone-loja-128.png`](icone-loja-128.png) | 128×128, arte de 96×96 com 16 px transparentes em volta | Store icon |
| [`capturas/1-menu.png`](capturas/1-menu.png) | 1280×800 | Screenshot 1: o `/` abre o menu na conversa |
| [`capturas/2-campos.png`](capturas/2-campos.png) | 1280×800 | Screenshot 2: campo variável preenchido antes de inserir |
| [`capturas/3-pacotes-na-conversa.png`](capturas/3-pacotes-na-conversa.png) | 1280×800 | Screenshot 3: pacote "Loja online" em uso |
| [`capturas/4-biblioteca.png`](capturas/4-biblioteca.png) | 1280×800 | Screenshot 4: editor da biblioteca |
| [`capturas/5-equipe.png`](capturas/5-equipe.png) | 1280×800 | Screenshot 5: planilha da equipe |
| [`promo-pequeno-440x280.png`](promo-pequeno-440x280.png) | 440×280 | Small promo tile |
| [`promo-marquee-1400x560.png`](promo-marquee-1400x560.png) | 1400×560 | Marquee promo tile (opcional) |

Capturas e banners são PNG sem transparência. Todas as empresas, pessoas e mensagens são fictícias.

### Links

- Site: `https://jvfaraco.github.io/blip-quick-replies-demo/` (depois de ligar o GitHub Pages, ver o README principal)
- Suporte: `https://github.com/JvFaraco/blip-quick-replies-demo/issues`

## 3. Privacidade (aba "Privacy practices")

O painel é em inglês; as respostas vão em inglês, com a tradução ao lado.

**Single purpose / Finalidade única**

> Insert canned replies into the message box of web chats: the user types "/" in the message box, picks a reply from a menu and reviews it before sending.
>
> Inserir respostas prontas no campo de mensagem de chats web: o usuário digita "/" no campo, escolhe uma resposta no menu e a revisa antes de enviar.

**Permission justifications / Justificativas**

| Permissão | Justification (EN) | Justificativa (PT-BR) |
| --- | --- | --- |
| `storage` | Stores the user's reply library, fixed variables, enabled sites and team spreadsheet link locally in chrome.storage.local. Nothing is sent to a server. | Guarda localmente a biblioteca, as variáveis fixas, os sites ativados e o link da planilha da equipe. Nada vai para servidor. |
| `activeTab` | When the user clicks "Ativar nesta aba" in the popup, reads the active tab's address to remember that site and inserts the reply menu into that tab. | Quando o usuário clica em "Ativar nesta aba", lê o endereço da aba para lembrar o site e insere o menu nela. |
| `scripting` | Injects the reply menu (the extension's own packaged content script) into the tab the user enabled, and registers it on the sites the user saved so "/" works there on later visits. | Injeta o menu (script da própria extensão) na aba ativada e o registra nos sites salvos pelo usuário. |
| `alarms` | Refreshes the team reply spreadsheet the user connected every 30 minutes. | Atualiza a planilha da equipe a cada 30 minutos. |
| Host `https://*.blip.ai/*` | Blip is the support chat the extension was built for; the reply menu works there without the user enabling each page. | O Blip é o chat para o qual a extensão nasceu; o menu funciona ali sem ativar. |
| Optional hosts `https://*/*`, `http://*/*` | Requested at runtime only for the single site the user chooses to enable with "Ativar nesta aba", because support teams use many different chat tools. Users can revoke each site in the Sites tab. Never requested in bulk. | Pedido na hora, só para o site que o usuário ativa, porque cada equipe usa um sistema de chat diferente. Pode ser removido na aba Sites. |

**Remote code / Código remoto:** No, I am not using remote code. A planilha da equipe é lida como dado (CSV/JSON validado), não como código.

**Data usage / Uso de dados:** nenhuma categoria marcada. A extensão lê o texto do campo de mensagem (categoria *Website content*) e o endereço da aba ao ativar, mas só no navegador, sem guardar o texto e sem transmitir nada. Se o revisor entender que leitura local conta como tratamento, marque **Website content** e explique: "Read locally to detect the typed shortcut; never stored or transmitted."

Categorias do painel, para conferência: Personally identifiable information, Health information, Financial and payment information, Authentication information, Personal communications, Location, Web history, User activity, Website content.

**Certificações (marcar as três):**

- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL:** `https://github.com/JvFaraco/blip-quick-replies-demo/blob/main/PRIVACIDADE.md` (português e inglês no mesmo arquivo).

## 4. Antes de enviar

- [ ] `npm test` passou na CI.
- [ ] A versão do `manifest.json` foi aumentada, a tag `v<versão>` foi criada e a release tem o zip `quick-replies-loja-<versão>.zip`.
- [ ] O zip abre em `chrome://extensions` → Carregar sem compactação (depois de descompactar) e o `/` funciona no Blip e num site ativado.
- [ ] Imagens regeneradas com `npm run loja` se a interface mudou.
- [ ] Revisão aprofundada: o acesso opcional a `https://*/*` costuma levar a uma revisão mais demorada. A justificativa acima explica o pedido site a site.
