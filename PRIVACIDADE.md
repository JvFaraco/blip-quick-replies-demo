# Política de privacidade — Quick Replies

Última atualização: 10 de novembro de 2026. [English version below](#privacy-policy--quick-replies).

## O que a extensão faz

Quick Replies insere respostas prontas no campo de mensagem de chats web quando o usuário digita `/` e escolhe uma resposta. É só isso. Quem revisa e envia a mensagem é o usuário.

## Dados

A extensão **não coleta, não transmite e não vende** dados pessoais. Nada do que ela lê ou guarda sai do navegador do usuário.

**O que ela lê, só no próprio navegador:**

- O texto do campo de mensagem em que o usuário está digitando, nos sites que ele ativou, para reconhecer o atalho (`/` seguido de letras) e trocá-lo pela resposta escolhida. Esse texto não é guardado nem enviado a lugar nenhum.
- O endereço da aba aberta, só quando o usuário clica em **Ativar nesta aba**, para guardar o site (por exemplo `https://atendimento.exemplo.com/*`) e abrir o menu ali da próxima vez.

**O que ela guarda, em `chrome.storage.local`, no navegador do usuário:**

- A biblioteca de respostas e uma cópia da versão anterior, usada pelo botão **Desfazer**.
- As variáveis fixas que o usuário cadastrou, como `{{empresa}}` e `{{atendente}}`.
- A lista de sites ativados.
- O link da planilha da equipe, se houver, com a data da última sincronização e a última mensagem de erro.

Os valores digitados nos campos variáveis na hora de inserir uma resposta (por exemplo `{{nome}}`) não são guardados. A extensão não lê as conversas, o histórico de navegação nem outras partes das páginas.

Não há servidor próprio, conta, login, cookies, anúncios nem ferramentas de análise. O botão **Copiar** do popup coloca a resposta na área de transferência do sistema, a pedido do usuário.

## Acesso à rede

O único acesso à rede é baixar a planilha da equipe que o próprio usuário conectou na aba **Equipe**, no endereço `https` que ele informou. O download acontece ao conectar, ao clicar em **Sincronizar agora**, ao abrir o navegador e a cada 30 minutos. A requisição não leva cookies nem dados do usuário; como em qualquer acesso a um site, o servidor da planilha (normalmente o Google) recebe o endereço IP e os cabeçalhos comuns do navegador. A sincronização para quando o usuário clica em **Desconectar**.

A extensão não baixa nem executa código remoto: a planilha é lida como texto (CSV ou JSON) e validada antes de entrar na biblioteca.

## Permissões

| Permissão | Para quê |
| --- | --- |
| `storage` | Guardar a biblioteca e as configurações no navegador. |
| `activeTab` | Saber o endereço da aba e inserir o menu nela quando o usuário clica em **Ativar nesta aba**. |
| `scripting` | Inserir o menu de respostas na aba ativada e registrá-lo nos sites que o usuário salvou, para que o `/` funcione sozinho da próxima vez. |
| `alarms` | Atualizar a planilha da equipe a cada 30 minutos. |
| Acesso a `*.blip.ai` | Site padrão onde o menu abre sem precisar ativar. |
| Acesso opcional a outros sites | Pedido ao navegador somente quando o usuário ativa a extensão naquele site, e só para aquele site. Pode ser removido na aba **Sites**. |

## Como apagar os dados

- **Sites** → remover um site tira a permissão e o menu daquele site.
- **Equipe** → **Desconectar** apaga o link da planilha e para a sincronização.
- Desinstalar a extensão apaga tudo o que ela guardou no navegador.

## Uso limitado

O uso das informações tratadas pela extensão segue a [Política de Dados do Usuário da Chrome Web Store](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), incluindo os requisitos de Uso Limitado: os dados servem apenas para a função única descrita acima, não são transferidos a terceiros, não são usados para publicidade nem para avaliar crédito, e ninguém lê esses dados.

## Código aberto

O código completo está em https://github.com/JvFaraco/blip-quick-replies-demo, sob licença MIT.

## Contato

Dúvidas: abra uma issue no repositório acima.

---

# Privacy policy — Quick Replies

Last updated: November 10, 2026.

## What the extension does

Quick Replies inserts canned replies into the message box of web chats when the user types `/` and picks a reply. That is all it does. The user reviews and sends the message.

## Data

The extension **does not collect, transmit or sell** personal data. Nothing it reads or stores leaves the user's browser.

**What it reads, inside the browser only:**

- The text of the message box the user is typing in, on sites the user enabled, to recognize the shortcut (`/` followed by letters) and replace it with the chosen reply. This text is neither stored nor sent anywhere.
- The address of the open tab, only when the user clicks **Ativar nesta aba** (Enable on this tab), to remember the site (for example `https://support.example.com/*`) and open the menu there next time.

**What it stores, in `chrome.storage.local`, in the user's browser:**

- The reply library and a copy of the previous version, used by the **Desfazer** (Undo) button.
- Fixed variables the user saved, such as `{{empresa}}` (company) and `{{atendente}}` (agent).
- The list of enabled sites.
- The team spreadsheet link, if any, with the last sync time and last error message.

Values typed into variable fields when inserting a reply (for example `{{nome}}`) are not stored. The extension does not read conversations, browsing history or other parts of web pages.

There is no server, account, login, cookies, ads or analytics. The popup's **Copy** button places the reply on the system clipboard at the user's request.

## Network access

The only network access is downloading the team spreadsheet the user connected in the **Equipe** (Team) tab, from the `https` address the user entered. The download runs on connect, on **Sincronizar agora** (Sync now), at browser startup and every 30 minutes. The request carries no cookies or user data; as with any web request, the spreadsheet's server (usually Google) receives the IP address and standard browser headers. Syncing stops when the user clicks **Desconectar** (Disconnect).

The extension does not download or run remote code: the spreadsheet is read as text (CSV or JSON) and validated before it enters the library.

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Keep the library and settings in the browser. |
| `activeTab` | Read the tab address and insert the menu into it when the user clicks **Ativar nesta aba**. |
| `scripting` | Insert the reply menu into the enabled tab and register it on the sites the user saved, so `/` works there by itself next time. |
| `alarms` | Refresh the team spreadsheet every 30 minutes. |
| Access to `*.blip.ai` | Default site where the menu works without enabling. |
| Optional access to other sites | Requested from the browser only when the user enables the extension on that site, and only for that site. Can be removed in the **Sites** tab. |

## Deleting data

- **Sites** → removing a site revokes the permission and the menu on that site.
- **Equipe** → **Desconectar** deletes the spreadsheet link and stops syncing.
- Uninstalling the extension deletes everything it stored in the browser.

## Limited Use

The use of information handled by this extension complies with the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), including the Limited Use requirements: data is used only for the single purpose described above, is not transferred to third parties, is not used for advertising or creditworthiness, and no human reads it.

## Open source

The full source code is at https://github.com/JvFaraco/blip-quick-replies-demo, under the MIT license.

## Contact

Questions: open an issue in the repository above.
