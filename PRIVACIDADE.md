# Política de privacidade — Quick Replies

Última atualização: 3 de novembro de 2026.

## O que a extensão faz

Quick Replies insere respostas prontas no campo de mensagem de chats web quando o usuário digita `/` e escolhe uma resposta. É só isso. Quem revisa e envia a mensagem é o usuário.

## Dados

A extensão **não coleta, não transmite e não vende** nenhum dado pessoal.

- A biblioteca de respostas, as variáveis fixas, a lista de sites ativados e o link da planilha da equipe ficam gravados apenas no navegador do usuário, em `chrome.storage.local`.
- A extensão não lê nem registra as conversas, o conteúdo das páginas ou os valores digitados nos campos variáveis.
- Não há servidor próprio, conta, login, cookies, anúncios nem ferramentas de análise.

## Acesso à rede

O único acesso à rede é baixar a planilha da equipe que o próprio usuário conectou na aba **Equipe**, no endereço que ele informou. Esse download acontece ao conectar, ao abrir o navegador e a cada 30 minutos, e pode ser desligado a qualquer momento em **Desconectar**.

## Permissões

| Permissão | Para quê |
| --- | --- |
| `storage` | Guardar a biblioteca e as configurações no navegador. |
| `activeTab` e `scripting` | Inserir o menu de respostas na aba atual quando o usuário clica em **Ativar nesta aba**. |
| `alarms` | Atualizar a planilha da equipe a cada 30 minutos. |
| Acesso a `*.blip.ai` | Site padrão onde o menu abre sem precisar ativar. |
| Acesso opcional a outros sites | Pedido ao navegador somente quando o usuário ativa a extensão naquele site. Pode ser removido na aba **Sites**. |

## Código aberto

O código completo está em https://github.com/JvFaraco/blip-quick-replies-demo, sob licença MIT.

## Contato

Dúvidas: abra uma issue no repositório acima.
