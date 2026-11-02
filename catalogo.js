// Fictitious demo library for a generic online store. Replace it with your own team's replies.
(() => {
  const rows = [
    ["finalizar", "Oferecer mais ajuda", "Atendimento", "Posso ajudar em algo mais? 🙂"],
    ["ana", "Iniciar atendimento: Ana", "Atendimento", "Atendimento iniciado por Ana"],
    ["bruno", "Iniciar atendimento: Bruno", "Atendimento", "Atendimento iniciado por Bruno"],
    ["saudacao", "Saudação com nome", "Atendimento", "Olá! Meu nome é {{nome}} e vou cuidar do seu atendimento."],
    ["numeropedido", "Solicitar número do pedido", "Pedidos", "Por gentileza, envie o número do pedido em texto. Com ele consigo localizar sua compra e acompanhar o atendimento."],
    ["ematendimento", "Em outro atendimento", "Atendimento", "Olá! Estou em outro atendimento no momento. Assim que possível, darei continuidade à sua solicitação.\n\nPor gentileza, aguarde. Agradeço pela paciência! 🙂"],
    ["foradohorario", "Fora do horário de atendimento", "Atendimento", "Olá! Nosso atendimento funciona de segunda a sexta, das 8h às 18h.\n\nSua mensagem ficou registrada e responderemos no próximo horário útil. 🙏"],
    ["rastreio", "Como rastrear o pedido", "Pedidos", "📦 Como acompanhar a entrega\n\n1. Acesse Minha conta > Meus pedidos.\n2. Escolha o pedido e toque em Rastrear.\n3. O status é atualizado a cada movimentação da transportadora.\n\nO código de rastreio também é enviado por e-mail após o despacho."],
    ["statuspedido", "Status do pedido", "Pedidos", "O pedido #{{pedido}} está com o status: {{status}}.\n\nPrevisão de entrega: {{previsão}}."],
    ["trocadevolucao", "Troca ou devolução", "Trocas", "🔄 Troca ou devolução em até 7 dias após o recebimento\n\n1. Confirme que o produto está sem sinais de uso e com a embalagem original.\n2. Acesse Minha conta > Meus pedidos > Solicitar troca.\n3. Escolha o motivo e a forma de reembolso.\n4. Imprima a etiqueta de postagem enviada por e-mail.\n5. Leve o pacote a uma agência dos Correios.\n\n✅ Após a conferência do produto, o reembolso ou a troca é liberado em até 5 dias úteis.\n\n⚠️ Itens personalizados não podem ser trocados, exceto em caso de defeito. Em caso de defeito, envie fotos do produto e da embalagem para análise da equipe de qualidade em cópia."],
    ["reembolso", "Prazo de reembolso", "Trocas", "O reembolso é feito na mesma forma de pagamento da compra:\n\n• Cartão de crédito: até 2 faturas.\n• Pix ou boleto: até 5 dias úteis na conta informada."],
    ["enderecoerrado", "Alterar endereço de entrega", "Pedidos", "Consigo alterar o endereço enquanto o pedido não foi despachado. Por gentileza, envie o endereço completo com CEP."],
    ["cupom", "Cupom não aplicado", "Pagamentos", "Confira se o cupom está dentro da validade, se o valor mínimo foi atingido e se ele não é cumulativo com outra promoção do carrinho."],
    ["pagamentopendente", "Pagamento pendente", "Pagamentos", "O pagamento ainda consta como pendente. Boletos levam até 3 dias úteis para compensar; Pix costuma ser confirmado em poucos minutos."],
    ["avaliacao", "Pedir avaliação", "Atendimento", "Obrigado pelo contato! Se puder, avalie este atendimento na pesquisa que chegará em seguida. Sua opinião ajuda a melhorar o serviço."],
    ["semretorno", "Encerrar por falta de retorno", "Atendimento", "Como não tivemos retorno, estamos encerrando esta conversa. Quando quiser, é só nos chamar para continuarmos!"],
  ];
  globalThis.QR_DEFAULTS = rows.map(([shortcut, title, category, body]) => ({ shortcut, title, category, body }));
})();
