// Starter packs. Each one is a fictitious library for a kind of team; "geral" is the default on first install.
// {{saudacao}}, {{data}} and {{hora}} are filled automatically. {{empresa}} and {{atendente}} come from the fixed variables.
(() => {
  const pack = (title, description, rows) => ({ title, description, library: rows.map(([shortcut, title, category, body]) => ({ shortcut, title, category, body })) });
  globalThis.QR_PACOTES = {
    geral: pack('Atendimento geral', 'Saudação, espera, transferência, encerramento. Serve para qualquer equipe.', [
      ['saudacao', 'Saudação com nome', 'Atendimento', '{{saudacao}}! Meu nome é {{atendente}} e vou cuidar do seu atendimento. Como posso ajudar?'],
      ['ola', 'Boas-vindas', 'Atendimento', 'Olá! Você está falando com o atendimento da {{empresa}}. Em que posso ajudar?'],
      ['finalizar', 'Oferecer mais ajuda', 'Atendimento', 'Posso ajudar em algo mais? 🙂'],
      ['aguarde', 'Pedir um momento', 'Atendimento', 'Só um momento, por gentileza. Estou verificando e já retorno. 🙂'],
      ['ematendimento', 'Em outro atendimento', 'Atendimento', 'Olá! Estou em outro atendimento no momento. Assim que possível, darei continuidade à sua solicitação.\n\nPor gentileza, aguarde. Agradeço pela paciência! 🙂'],
      ['foradohorario', 'Fora do horário de atendimento', 'Atendimento', 'Olá! Nosso atendimento funciona de segunda a sexta, das 8h às 18h.\n\nSua mensagem ficou registrada e responderemos no próximo horário útil. 🙏'],
      ['dados', 'Pedir dados para localizar o cadastro', 'Atendimento', 'Para localizar seu cadastro, me informe por gentileza seu nome completo e o CPF ou e-mail cadastrado.'],
      ['transferir', 'Transferir para outro setor', 'Atendimento', 'Vou transferir você para o setor responsável. Em instantes um colega dará continuidade ao atendimento.'],
      ['protocolo', 'Informar protocolo', 'Atendimento', 'Seu protocolo de atendimento é {{protocolo}}. Guarde este número para consultas futuras.'],
      ['retorno', 'Prometer retorno', 'Atendimento', 'Vou verificar com a equipe responsável e retorno em até {{prazo}}. Obrigado pela paciência!'],
      ['desculpas', 'Pedir desculpas', 'Atendimento', 'Peço desculpas pelo transtorno. Vou resolver isso o mais rápido possível.'],
      ['avaliacao', 'Pedir avaliação', 'Encerramento', 'Obrigado pelo contato! Se puder, avalie este atendimento na pesquisa que chegará em seguida. Sua opinião ajuda a melhorar o serviço.'],
      ['encerrar', 'Encerrar com despedida', 'Encerramento', 'Fico feliz em ter ajudado! Qualquer dúvida, é só chamar. Tenha um ótimo dia! 🙂'],
      ['semretorno', 'Encerrar por falta de retorno', 'Encerramento', 'Como não tivemos retorno, estamos encerrando esta conversa. Quando quiser, é só nos chamar para continuarmos!'],
    ]),
    ecommerce: pack('Loja online', 'Pedidos, entrega, troca, reembolso e pagamento.', [
      ['numeropedido', 'Solicitar número do pedido', 'Pedidos', 'Por gentileza, envie o número do pedido em texto. Com ele consigo localizar sua compra e acompanhar o atendimento.'],
      ['rastreio', 'Como rastrear o pedido', 'Pedidos', '📦 Como acompanhar a entrega\n\n1. Acesse Minha conta > Meus pedidos.\n2. Escolha o pedido e toque em Rastrear.\n3. O status é atualizado a cada movimentação da transportadora.\n\nO código de rastreio também é enviado por e-mail após o despacho.'],
      ['statuspedido', 'Status do pedido', 'Pedidos', 'O pedido #{{pedido}} está com o status: {{status}}.\n\nPrevisão de entrega: {{previsão}}.'],
      ['prazoentrega', 'Prazo de entrega', 'Pedidos', 'O prazo de entrega começa a contar após a confirmação do pagamento e aparece na página do pedido. Se o prazo passou, me envie o número do pedido para eu verificar com a transportadora.'],
      ['enderecoerrado', 'Alterar endereço de entrega', 'Pedidos', 'Consigo alterar o endereço enquanto o pedido não foi despachado. Por gentileza, envie o endereço completo com CEP.'],
      ['cancelarpedido', 'Cancelar pedido', 'Pedidos', 'Posso cancelar o pedido enquanto ele não foi despachado. Confirma o cancelamento do pedido #{{pedido}}? O estorno segue o prazo da forma de pagamento.'],
      ['trocadevolucao', 'Troca ou devolução', 'Trocas', '🔄 Troca ou devolução em até 7 dias após o recebimento\n\n1. Confirme que o produto está sem sinais de uso e com a embalagem original.\n2. Acesse Minha conta > Meus pedidos > Solicitar troca.\n3. Escolha o motivo e a forma de reembolso.\n4. Imprima a etiqueta de postagem enviada por e-mail.\n5. Leve o pacote a uma agência dos Correios.\n\n✅ Após a conferência do produto, o reembolso ou a troca é liberado em até 5 dias úteis.\n\n⚠️ Itens personalizados não podem ser trocados, exceto em caso de defeito. Em caso de defeito, envie fotos do produto e da embalagem para análise da equipe de qualidade.'],
      ['reembolso', 'Prazo de reembolso', 'Trocas', 'O reembolso é feito na mesma forma de pagamento da compra:\n\n• Cartão de crédito: até 2 faturas.\n• Pix ou boleto: até 5 dias úteis na conta informada.'],
      ['cupom', 'Cupom não aplicado', 'Pagamentos', 'Confira se o cupom está dentro da validade, se o valor mínimo foi atingido e se ele não é cumulativo com outra promoção do carrinho.'],
      ['pagamentopendente', 'Pagamento pendente', 'Pagamentos', 'O pagamento ainda consta como pendente. Boletos levam até 3 dias úteis para compensar; Pix costuma ser confirmado em poucos minutos.'],
    ]),
    suporte: pack('Suporte técnico', 'Chamados, erros, acesso, senha e acompanhamento.', [
      ['chamado', 'Chamado aberto', 'Chamados', 'Abri o chamado {{chamado}} para sua solicitação. Você receberá atualizações por aqui e por e-mail.'],
      ['printerro', 'Pedir captura de tela', 'Diagnóstico', 'Para eu entender melhor, pode enviar uma captura de tela da mensagem de erro e me dizer o que estava fazendo quando ela apareceu?'],
      ['reiniciar', 'Pedir para reiniciar', 'Diagnóstico', 'Vamos tentar o básico primeiro: feche o programa, reinicie o equipamento e tente novamente. Me avise se o problema continuar.'],
      ['versao', 'Perguntar a versão', 'Diagnóstico', 'Qual versão do sistema você está usando? Ela aparece em Ajuda > Sobre. Com essa informação consigo verificar se há correção disponível.'],
      ['limparcache', 'Limpar cache do navegador', 'Diagnóstico', 'Pode limpar o cache do navegador? No Chrome: Ctrl+Shift+Delete, marque "Imagens e arquivos em cache" e confirme. Depois acesse o sistema novamente.'],
      ['acessoremoto', 'Propor acesso remoto', 'Diagnóstico', 'Para agilizar, posso fazer um acesso remoto ao seu computador. Você autoriza? Se sim, me envie o código que aparece no programa de acesso.'],
      ['senha', 'Redefinir senha', 'Acesso', 'Enviei um link de redefinição de senha para o e-mail cadastrado. Ele vale por 30 minutos. Verifique também a caixa de spam.'],
      ['escalado', 'Encaminhado ao time técnico', 'Chamados', 'Encaminhei seu caso ao time técnico com prioridade. A previsão de retorno é de até {{prazo}}. Aviso assim que tiver novidade.'],
      ['resolvido', 'Confirmar resolução', 'Chamados', 'Aplicamos a correção. Pode testar novamente e me confirmar se está funcionando? Se estiver tudo certo, encerro o chamado {{chamado}}.'],
    ]),
    agendamento: pack('Agendamentos', 'Clínicas, salões e serviços com hora marcada.', [
      ['confirmar', 'Confirmar agendamento', 'Agenda', 'Seu horário está confirmado para {{data}} às {{hora}}. Qualquer imprevisto, me avise com antecedência. 🙂'],
      ['disponibilidade', 'Perguntar disponibilidade', 'Agenda', 'Qual dia e período você prefere? Tenho horários pela manhã e à tarde durante a semana.'],
      ['remarcar', 'Remarcar horário', 'Agenda', 'Sem problemas, vamos remarcar. Me diga um novo dia e período de preferência e eu verifico a disponibilidade.'],
      ['cancelar', 'Cancelar horário', 'Agenda', 'Seu horário foi cancelado. Quando quiser agendar novamente, é só me chamar por aqui.'],
      ['lembrete', 'Lembrete de véspera', 'Agenda', 'Passando para lembrar do seu horário amanhã às {{hora}}. Pode confirmar presença? Se precisar remarcar, me avise.'],
      ['endereco', 'Endereço e chegada', 'Orientações', 'Estamos em {{endereco}}. Chegue com 10 minutos de antecedência para o cadastro, por gentileza.'],
      ['documentos', 'O que trazer', 'Orientações', 'No dia, traga um documento com foto e, se tiver, exames ou pedidos anteriores relacionados ao atendimento.'],
      ['atraso', 'Tolerância de atraso', 'Orientações', 'Temos tolerância de 15 minutos de atraso. Após esse tempo, o horário pode precisar ser remarcado para não prejudicar os próximos atendimentos.'],
    ]),
    financeiro: pack('Financeiro e cobrança', 'Boleto, Pix, vencimento, negociação e nota fiscal.', [
      ['segundavia', 'Segunda via do boleto', 'Cobrança', 'Enviei a segunda via do boleto por aqui. Você também pode gerar em Minha conta > Financeiro. O vencimento é {{vencimento}}.'],
      ['pix', 'Pagamento por Pix', 'Cobrança', 'Para pagar por Pix, use a chave {{chavepix}} em nome de {{empresa}} e me envie o comprovante para dar baixa na hora.'],
      ['comprovante', 'Pedir comprovante', 'Cobrança', 'Pode me enviar o comprovante de pagamento? Com ele consigo localizar o pagamento e dar baixa no sistema.'],
      ['baixa', 'Confirmar baixa', 'Cobrança', 'Pagamento localizado e baixado. Obrigado! Seu cadastro está em dia.'],
      ['vencido', 'Aviso de vencimento', 'Cobrança', 'Identificamos um título vencido em {{vencimento}} no valor de {{valor}}. Posso enviar o boleto atualizado para pagamento hoje?'],
      ['negociar', 'Propor negociação', 'Negociação', 'Podemos negociar o valor em aberto. Tenho opções de parcelamento e desconto para pagamento à vista. Qual delas você prefere conhecer?'],
      ['cobrancaindevida', 'Cobrança indevida', 'Cobrança', 'Peço desculpas. Vou verificar a cobrança e, se for indevida, o estorno é feito em até 5 dias úteis. Me envie, por gentileza, o valor e a data do lançamento.'],
      ['notafiscal', 'Nota fiscal', 'Fiscal', 'A nota fiscal é emitida em até 2 dias úteis após a confirmação do pagamento e enviada para o e-mail cadastrado.'],
    ]),
  };
  globalThis.QR_DEFAULTS = QR_PACOTES.geral.library;
})();
