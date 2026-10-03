import type { LegalTexts } from "./types";

export const pt: LegalTexts = {
  chrome: {
    footerLabel: "Legal",
    nav: { terms: "Termos", privacy: "Privacidade", acceptableUse: "Uso aceitável", refund: "Reembolsos e saldo", contact: "Contato" },
    effective: "Em vigor desde: {date}",
    contents: "Conteúdo",
    translationNotice: "Esta tradução é fornecida apenas para referência. Em caso de divergência com a [versão em inglês]({enUrl}), prevalece a versão em inglês.",
  },

  terms: {
    title: "Termos de serviço",
    description: "Termos que regem o gateway de modelos de IA da TokenAPI, as chaves de API, o saldo pré-pago e a cobrança.",
    intro: "Estes Termos de serviço (os \"Termos\") regem o seu acesso e uso do site, da API e dos serviços relacionados da TokenAPI (o \"Serviço\"), operados por {company} (\"TokenAPI\", \"nós\"). Ao criar uma conta, usar uma chave de API ou utilizar o Serviço de qualquer outra forma, você concorda com estes Termos.",
    sections: [
      {
        h: "1. Elegibilidade",
        p: [
          "Você deve ter pelo menos 18 anos e capacidade para celebrar um contrato vinculante. Se usar o Serviço em nome de uma empresa ou outra organização, você declara ter autoridade para aceitar estes Termos em nome dela, e \"você\" inclui essa organização.",
          "Você não pode usar o Serviço se estiver sujeito a sanções ou se estiver em um país ou região onde a lei aplicável proíba a prestação do Serviço a você. Você é responsável por cumprir as leis de controle de exportação e de sanções aplicáveis ao seu uso.",
        ],
      },
      {
        h: "2. O Serviço",
        p: [
          "A TokenAPI é um gateway de API que dá acesso a modelos de IA por meio de IDs de modelo estáveis (por exemplo, `tokenapi-pro`). Cada ID de modelo é atendido por um ou mais provedores de modelos terceiros. Para manter a qualidade e a disponibilidade, podemos trocar o provedor ou o modelo subjacente de um ID, encaminhar solicitações a provedores de contingência e adicionar, alterar ou descontinuar IDs de modelo.",
          "As respostas dos modelos de IA são geradas automaticamente. Elas podem ser imprecisas, incompletas ou ofensivas, ou semelhantes a respostas geradas para outras pessoas, e não representam nossas opiniões. Você deve avaliá-las antes de confiar nelas.",
        ],
      },
      {
        h: "3. Contas e chaves de API",
        p: [
          "Você é responsável por manter em sigilo as credenciais da conta e as chaves de API, e por toda atividade realizada com elas. Não incorpore chaves de API em navegadores ou aplicativos móveis nem as compartilhe. Se acreditar que uma chave vazou, avise-nos imediatamente em {supportEmail}; podemos revogar ou trocar chaves para proteger você ou o Serviço.",
          "Você deve fornecer informações de conta corretas e mantê-las atualizadas.",
        ],
      },
      {
        h: "4. Saldo pré-pago, preços e cobrança",
        p: [
          "O Serviço é pré-pago. Você adiciona saldo em dólares americanos, e o uso é debitado desse saldo pelo preço de cada modelo publicado na página de [modelos](/models) no momento da solicitação. Podemos alterar os preços do uso futuro; as alterações não afetam solicitações já concluídas.",
          "Antes de processar uma solicitação, reservamos do seu saldo o custo máximo possível dela; ao final, cobramos o uso real e liberamos o restante. Solicitações que falham antes de o modelo começar a responder não são cobradas. Se uma resposta em streaming for cancelada ou interrompida, apenas os tokens gerados são cobrados. O uso é medido pelos nossos sistemas, e nossos registros são a base da cobrança, sujeito ao procedimento de erros de cobrança da nossa [Política de reembolso e saldo](/refund).",
          "Os pagamentos não são reembolsáveis e o saldo expira após {expiryMonths} meses sem uso nem recarga, conforme descrito na [Política de reembolso e saldo](/refund). Os preços não incluem impostos; você é responsável pelos impostos aplicáveis às suas compras, exceto os impostos sobre a nossa renda.",
        ],
      },
      {
        h: "5. Uso aceitável",
        p: [
          "Você deve cumprir nossa [Política de uso aceitável](/acceptable-use) e as políticas de uso dos provedores de modelos que atendem às suas solicitações. Podemos bloquear solicitações, limitar a taxa ou suspender o acesso para evitar abusos ou proteger o Serviço.",
        ],
      },
      {
        h: "6. Seu conteúdo",
        p: [
          "Entre você e nós, você mantém seus direitos sobre as entradas que envia e, na medida permitida pela lei e pelos termos do provedor de modelos aplicável, as respostas geradas para você pertencem a você. Você é responsável pelas suas entradas e pelo uso das respostas, incluindo ter os direitos e consentimentos necessários para enviar quaisquer dados.",
          "Você nos concede os direitos necessários para transmitir suas entradas aos provedores de modelos e devolver as respostas a você, exclusivamente para prestar o Serviço. Não armazenamos o conteúdo de prompts e respostas; mantemos os metadados das solicitações conforme descrito na [Política de privacidade](/privacy). Os provedores de modelos tratam as solicitações de acordo com seus próprios termos.",
        ],
      },
      {
        h: "7. Provedores terceiros",
        p: [
          "O Serviço depende de provedores de modelos e de infraestrutura de terceiros, cujos termos e políticas podem se aplicar às solicitações encaminhadas a eles. Não somos responsáveis por seus serviços, falhas ou atos, mas, sempre que possível, contornamos as falhas no roteamento.",
        ],
      },
      {
        h: "8. Disponibilidade e alterações",
        p: [
          "Buscamos manter o Serviço disponível, mas não garantimos que funcione sem interrupções ou erros, salvo se acordarmos com você um nível de serviço por escrito. Podemos realizar manutenção e modificar, suspender ou descontinuar recursos ou IDs de modelo. Quando for razoavelmente possível, avisaremos com antecedência sobre mudanças relevantes.",
        ],
      },
      {
        h: "9. Suspensão e encerramento",
        p: [
          "Você pode deixar de usar o Serviço a qualquer momento. Podemos suspender ou encerrar seu acesso, revogar chaves de API ou recusar solicitações se você violar estes Termos, criar risco ou responsabilidade legal para nós ou para terceiros, deixar de pagar, fizer estornos injustificados ou se a lei exigir. Sempre que possível, avisaremos antes.",
          "Se encerrarmos sua conta por conveniência, e não por violação sua, reembolsaremos o saldo não utilizado. Nos demais casos, o encerramento não dá direito a reembolso, salvo exigência legal.",
        ],
      },
      {
        h: "10. Isenção de garantias",
        p: [
          "Na máxima extensão permitida pela lei, o Serviço e todas as respostas são fornecidos \"no estado em que se encontram\" e \"conforme disponíveis\", sem garantias de qualquer tipo, incluindo as de comercialização, adequação a uma finalidade específica, exatidão e não violação. As respostas não constituem aconselhamento profissional, jurídico, médico ou financeiro.",
        ],
      },
      {
        h: "11. Limitação de responsabilidade",
        p: [
          "Na máxima extensão permitida pela lei, não seremos responsáveis por danos indiretos, incidentais, especiais, consequentes ou punitivos, nem por perda de lucros, receitas, dados ou reputação. Nossa responsabilidade total por todas as reclamações relacionadas ao Serviço limita-se ao maior entre: o valor que você nos pagou nos 12 meses anteriores à reclamação ou US$ 100.",
          "Nada nestes Termos limita uma responsabilidade que não possa ser limitada por lei.",
        ],
      },
      {
        h: "12. Indenização",
        p: [
          "Você defenderá e indenizará {company} contra reclamações, danos e despesas (incluindo honorários advocatícios razoáveis) decorrentes das suas entradas, do seu uso das respostas, da sua violação destes Termos ou da Política de uso aceitável, ou da sua violação da lei ou de direitos de terceiros.",
        ],
      },
      {
        h: "13. Alterações destes Termos",
        p: [
          "Podemos atualizar estes Termos. Publicaremos a nova versão com sua data de vigência e avisaremos você sobre mudanças relevantes por e-mail ou no Serviço. Ao continuar usando o Serviço após essa data, você aceita os Termos atualizados.",
        ],
      },
      {
        h: "14. Lei aplicável e resolução de disputas",
        p: [
          "Estes Termos são regidos pelas leis do local em que o operador do Serviço estiver estabelecido, sem considerar suas regras de conflito de leis. Antes de apresentar qualquer reclamação, entre em contato conosco em [{legalEmail}](mailto:{legalEmail}) para que possamos tentar resolver a disputa de forma amigável em até 30 dias. Nada nesta seção limita os direitos obrigatórios de proteção ao consumidor previstos nas leis do seu país de residência.",
        ],
      },
      {
        h: "15. Idioma e contato",
        p: [
          "Podemos oferecer traduções destes Termos para referência; se uma tradução divergir da versão em inglês, prevalece a versão em inglês. Dúvidas sobre estes Termos: [{legalEmail}](mailto:{legalEmail}).",
        ],
      },
    ],
  },

  privacy: {
    title: "Política de privacidade",
    description: "Quais dados pessoais a TokenAPI coleta, como os usa e compartilha, onde são tratados e quais são os seus direitos.",
    intro: "Esta Política de privacidade explica como {company} (\"TokenAPI\", \"nós\") coleta, usa e compartilha dados pessoais quando você usa nosso site e nossa API (o \"Serviço\"). Somos o controlador dos dados pessoais descritos aqui.",
    sections: [
      {
        h: "1. Dados que coletamos",
        list: [
          "Dados da conta: seu e-mail, nome, nome da empresa e as informações que você nos envia ao solicitar acesso ou entrar em contato.",
          "Dados de cobrança: valores de recarga, saldo, faturas e histórico de transações. Os dados de cartão e de conta bancária são tratados pelo nosso processador de pagamentos; nunca recebemos o número completo do cartão.",
          "Metadados de uso de cada solicitação à API: ID da solicitação, data e hora, ID da chave de API, o ID de modelo chamado e o modelo que atendeu, contagem de tokens, custo, latência, status e tipo de erro, endereço IP e user agent.",
          "Análise do site: estatísticas agregadas de visualizações de página, coletadas sem cookies de publicidade (Vercel Web Analytics e Cloudflare Web Analytics).",
        ],
      },
      {
        h: "2. Conteúdo de prompts e respostas",
        p: [
          "Não armazenamos o conteúdo dos seus prompts nem das respostas dos modelos. O conteúdo passa pelo nosso gateway até o provedor de modelos que atende a solicitação e volta para você. Os provedores de modelos tratam esse conteúdo de acordo com seus próprios termos e políticas de privacidade, o que pode incluir retenção temporária para monitoramento de abusos.",
        ],
      },
      {
        h: "3. Como usamos os dados",
        list: [
          "Para prestar o Serviço: autenticar chaves de API, encaminhar solicitações e aplicar limites de taxa e de gastos.",
          "Para cobrar: reservar e liquidar valores, manter seu saldo e guardar registros contábeis.",
          "Para manter a segurança: detectar fraudes, abusos e violações da Política de uso aceitável.",
          "Para prestar suporte e nos comunicar com você sobre sua conta e sobre mudanças no Serviço ou nesta política.",
          "Para entender e melhorar o Serviço por meio de estatísticas agregadas.",
          "Para cumprir obrigações legais.",
        ],
      },
      {
        h: "4. Bases legais",
        p: [
          "Quando o GDPR, a LGPD ou lei semelhante se aplica, tratamos dados pessoais para executar nosso contrato com você, com base em nosso legítimo interesse em operar, proteger e melhorar o Serviço, para cumprir obrigações legais e, quando exigido, com o seu consentimento.",
        ],
      },
      {
        h: "5. Com quem compartilhamos os dados",
        p: [
          "Não vendemos dados pessoais. Só os compartilhamos com prestadores que nos ajudam a operar o Serviço, mediante contratos que limitam seu uso:",
        ],
        list: [
          "Provedores de modelos de IA que processam suas solicitações, incluindo Alibaba Cloud, DeepSeek e Google.",
          "Hospedagem e infraestrutura: Vercel (hospedagem da aplicação), Neon (banco de dados) e Cloudflare (DNS e análise do site).",
          "Nosso processador de pagamentos, que processa seus pagamentos.",
          "Consultores profissionais e autoridades, quando exigido por lei ou para proteger nossos direitos.",
        ],
      },
      {
        h: "6. Transferências internacionais",
        p: [
          "Nossos prestadores tratam dados em vários países, incluindo Estados Unidos, China e Singapura, que podem não oferecer o mesmo nível de proteção do seu país. Quando necessário, adotamos salvaguardas adequadas, como cláusulas contratuais padrão. O conteúdo das solicitações é tratado no país do provedor de modelos que as atende.",
        ],
      },
      {
        h: "7. Retenção",
        p: [
          "Mantemos os dados da conta enquanto ela estiver ativa e por um período razoável depois. Os registros de uso e de cobrança são mantidos pelo tempo necessário para fins contábeis, fiscais, de resolução de disputas e de auditoria, geralmente até sete anos. Estatísticas agregadas que não identificam você podem ser mantidas por mais tempo.",
        ],
      },
      {
        h: "8. Cookies",
        p: [
          "Usamos apenas alguns cookies essenciais: `tokenapi_lang` lembra o idioma escolhido, e a área administrativa usa um cookie de sessão para o login da equipe. Nossa análise não usa cookies, e não usamos cookies de publicidade nem de rastreamento entre sites.",
        ],
      },
      {
        h: "9. Segurança",
        p: [
          "Protegemos os dados com criptografia em trânsito, armazenamento de chaves de API com hash, credenciais de provedores criptografadas, controle de acesso e registro de logs. Nenhum sistema é totalmente seguro; proteja suas chaves de API e informe qualquer incidente suspeito para [{supportEmail}](mailto:{supportEmail}).",
        ],
      },
      {
        h: "10. Seus direitos",
        p: [
          "Dependendo de onde você mora, você pode ter o direito de acessar, corrigir, excluir ou exportar seus dados pessoais, de se opor a determinados tratamentos ou restringi-los e de retirar o consentimento. Para exercer esses direitos, escreva para [{privacyEmail}](mailto:{privacyEmail}). Você também pode apresentar uma reclamação à autoridade de proteção de dados do seu país.",
        ],
      },
      {
        h: "11. Menores",
        p: [
          "O Serviço não se destina a menores de 18 anos, e não coletamos intencionalmente seus dados pessoais.",
        ],
      },
      {
        h: "12. Alterações e contato",
        p: [
          "Podemos atualizar esta política e publicaremos a nova versão com sua data de vigência. Contato: {company}, [{privacyEmail}](mailto:{privacyEmail}).",
        ],
      },
    ],
  },

  acceptableUse: {
    title: "Política de uso aceitável",
    description: "O que é proibido ao usar a TokenAPI e como aplicamos essas regras.",
    intro: "Esta política se aplica a todos os usuários da TokenAPI e faz parte dos nossos [Termos de serviço](/terms). As solicitações também estão sujeitas às políticas de uso dos provedores de modelos que as atendem; quando forem mais rigorosas, elas também se aplicam.",
    sections: [
      {
        h: "1. Conteúdos e atividades proibidos",
        p: ["Você não pode usar o Serviço, nem ajudar outras pessoas a usá-lo, para:"],
        list: [
          "violar a lei ou facilitar atividades ilegais;",
          "criar, distribuir ou solicitar conteúdo sexual envolvendo menores, ou qualquer conteúdo que explore ou coloque crianças em perigo;",
          "promover ou apoiar o terrorismo ou o extremismo violento, ou incitar a violência;",
          "assediar, ameaçar ou intimidar pessoas, ou promover o ódio com base em características protegidas;",
          "desenvolver ou usar malware, invadir sistemas ou atacar a segurança ou a disponibilidade de qualquer rede ou serviço;",
          "praticar fraude, phishing, golpes ou spam, ou se passar por pessoas ou organizações para enganar terceiros;",
          "desenvolver ou obter armas biológicas, químicas, nucleares ou radiológicas, ou outras armas capazes de causar vítimas em massa;",
          "realizar operações de influência enganosas ou campanhas de desinformação, inclusive relacionadas a eleições;",
          "violar direitos de propriedade intelectual ou de privacidade, ou coletar ou tratar dados pessoais ou sensíveis sem base legal;",
          "tomar decisões totalmente automatizadas que produzam efeitos jurídicos ou igualmente significativos para pessoas (por exemplo, de crédito, emprego, moradia, saúde ou jurídicas) sem revisão humana adequada.",
        ],
      },
      {
        h: "2. Abuso do Serviço",
        p: ["Você não pode:"],
        list: [
          "contornar, desativar ou interferir em limites de taxa, limites de gastos, autenticação ou medidas de segurança, nem usar várias contas para escapar de limites;",
          "compartilhar, vender ou publicar chaves de API, nem revender o Serviço como API independente sem nosso acordo por escrito;",
          "usar as respostas para desenvolver modelos concorrentes quando os termos do provedor de modelos proibirem;",
          "sondar, varrer ou realizar testes de carga no Serviço sem permissão, nem interferir no uso de outros clientes.",
        ],
      },
      {
        h: "3. Aplicação",
        p: [
          "Podemos investigar suspeitas de violação e, conforme a gravidade, bloquear solicitações, revogar chaves de API ou suspender ou encerrar contas, com ou sem aviso prévio. Quando a lei exigir, comunicaremos conteúdo ilegal às autoridades. O saldo de contas encerradas por violação não é reembolsado.",
        ],
      },
      {
        h: "4. Denunciar abusos",
        p: [
          "Denuncie abusos ou vulnerabilidades de segurança para [{abuseEmail}](mailto:{abuseEmail}). Inclua o ID da solicitação (`x-request-id`), se tiver.",
        ],
      },
    ],
  },

  refund: {
    title: "Política de reembolso e saldo",
    description: "Como funcionam na TokenAPI o saldo pré-pago, as cobranças, os reembolsos, os erros de cobrança e a expiração do saldo.",
    intro: "A TokenAPI é paga com saldo pré-pago. Esta política explica como as cobranças são feitas, quando é possível devolver dinheiro e quando o saldo expira. Ela faz parte dos nossos [Termos de serviço](/terms).",
    sections: [
      {
        h: "1. Saldo pré-pago",
        p: [
          "As recargas são feitas em dólares americanos. O saldo só pode ser usado para o consumo da TokenAPI pelos preços por modelo publicados na página de [modelos](/models). O saldo não é um depósito bancário, não rende juros e não pode ser transferido para outra conta nem trocado por dinheiro.",
        ],
      },
      {
        h: "2. Como as cobranças funcionam",
        list: [
          "Antes de uma solicitação ser executada, seu custo máximo possível (prompt + `max_tokens`) é reservado do saldo. Se o saldo não for suficiente, a solicitação é recusada e nada é cobrado.",
          "Quando a solicitação termina, os tokens reais são cobrados e o restante da reserva é liberado imediatamente.",
          "Solicitações que falham antes de o modelo começar a responder não são cobradas.",
          "Se uma resposta em streaming for cancelada ou interrompida, apenas os tokens gerados são cobrados.",
        ],
      },
      {
        h: "3. Reembolsos",
        p: [
          "Pagamentos e recargas são definitivos e não reembolsáveis, exceto quando a lei aplicável exigir reembolso (por exemplo, por direitos obrigatórios de proteção ao consumidor) ou quando encerrarmos sua conta por conveniência, e não por violação sua, caso em que reembolsaremos o saldo não utilizado.",
        ],
      },
      {
        h: "4. Erros de cobrança",
        p: [
          "Se você acreditar que foi cobrado por engano, escreva para [{supportEmail}](mailto:{supportEmail}) em até {disputeDays} dias após a cobrança, informando os IDs de solicitação correspondentes (`x-request-id`). Se confirmarmos o erro, devolveremos o valor ao seu saldo ou, em caso de erro de pagamento, ao meio de pagamento original.",
        ],
      },
      {
        h: "5. Expiração do saldo",
        p: [
          "O saldo expira se a sua conta passar {expiryMonths} meses consecutivos sem uso da API e sem recargas. Avisaremos você por e-mail pelo menos {noticeDays} dias antes da expiração; qualquer uso ou recarga antes dessa data mantém o saldo ativo.",
        ],
      },
      {
        h: "6. Estornos",
        p: [
          "Entre em contato conosco antes de contestar um pagamento com o seu banco. Se houver um estorno, podemos suspender a conta durante a análise. Estornos injustificados podem levar ao encerramento da conta.",
        ],
      },
      {
        h: "7. Encerramento da conta",
        p: [
          "Você pode pedir o encerramento da sua conta a qualquer momento. O saldo restante é perdido no encerramento, salvo se a lei exigir reembolso ou se aplicar a seção 3.",
        ],
      },
    ],
  },

  contact: {
    title: "Contato",
    description: "Como falar com a TokenAPI: dados da empresa e canais de suporte, privacidade, abusos e assuntos jurídicos.",
    intro: "Respondemos em até {days} dias úteis. Se a sua dúvida for sobre uma solicitação específica, inclua o ID da solicitação do cabeçalho de resposta `x-request-id`.",
    companyHeading: "Empresa",
    labels: { company: "Operado por", jurisdiction: "Registrada em", address: "Endereço" },
    channelsHeading: "Canais",
    channels: [
      { label: "Geral e vendas", detail: "Chaves de API, preços por volume, parcerias.", emailKey: "general" },
      { label: "Suporte e cobrança", detail: "Problemas técnicos, cobranças e saldo.", emailKey: "support" },
      { label: "Privacidade", detail: "Pedidos de acesso, correção e exclusão de dados.", emailKey: "privacy" },
      { label: "Abusos e segurança", detail: "Denúncia de abusos ou vulnerabilidades.", emailKey: "abuse" },
      { label: "Jurídico", detail: "Notificações e dúvidas sobre os termos.", emailKey: "legal" },
    ],
    responseNote: "Envie notificações jurídicas formais por e-mail para o endereço jurídico indicado acima.",
  },
};
