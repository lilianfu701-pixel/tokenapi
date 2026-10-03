import type { LegalTexts } from "./types";

export const fr: LegalTexts = {
  chrome: {
    footerLabel: "Mentions légales",
    nav: { terms: "Conditions", privacy: "Confidentialité", acceptableUse: "Utilisation acceptable", refund: "Remboursements et solde", contact: "Contact" },
    effective: "En vigueur le : {date}",
    contents: "Sommaire",
    translationNotice: "Cette traduction est fournie à titre indicatif. En cas de divergence avec la [version anglaise]({enUrl}), la version anglaise prévaut.",
  },

  terms: {
    title: "Conditions d’utilisation",
    description: "Conditions régissant la passerelle de modèles d’IA TokenAPI, les clés d’API, le solde prépayé et la facturation.",
    intro: "Les présentes Conditions d’utilisation (les « Conditions ») régissent votre accès au site web, à l’API et aux services associés de TokenAPI (le « Service »), exploités par {company} (« TokenAPI », « nous »). En créant un compte, en utilisant une clé d’API ou en utilisant le Service de toute autre manière, vous acceptez les présentes Conditions.",
    sections: [
      {
        h: "1. Conditions d’accès",
        p: [
          "Vous devez avoir au moins 18 ans et être en mesure de conclure un contrat ayant force obligatoire. Si vous utilisez le Service pour le compte d’une société ou d’une autre organisation, vous déclarez être habilité à accepter les présentes Conditions en son nom, et « vous » désigne également cette organisation.",
          "Vous ne pouvez pas utiliser le Service si vous faites l’objet de sanctions ou si vous vous trouvez dans un pays ou une région où la loi applicable interdit de vous fournir le Service. Il vous appartient de respecter les lois sur le contrôle des exportations et les sanctions applicables à votre utilisation.",
        ],
      },
      {
        h: "2. Le Service",
        p: [
          "TokenAPI est une passerelle d’API qui vous donne accès à des modèles d’IA au moyen d’identifiants de modèle stables (par exemple `tokenapi-pro`). Chaque identifiant est servi par un ou plusieurs fournisseurs de modèles tiers. Pour maintenir la qualité et la disponibilité, nous pouvons changer le fournisseur ou le modèle sous-jacent d’un identifiant, acheminer les requêtes vers des fournisseurs de secours, et ajouter, modifier ou retirer des identifiants.",
          "Les réponses des modèles d’IA sont générées automatiquement. Elles peuvent être inexactes, incomplètes ou choquantes, ou ressembler à des réponses générées pour d’autres personnes, et ne reflètent pas nos opinions. Il vous appartient de les évaluer avant de vous y fier.",
        ],
      },
      {
        h: "3. Comptes et clés d’API",
        p: [
          "Vous êtes responsable de la confidentialité des identifiants de votre compte et de vos clés d’API, ainsi que de toute activité effectuée avec eux. N’intégrez pas de clés d’API dans un navigateur ou une application mobile et ne les partagez pas. Si vous pensez qu’une clé a été divulguée, prévenez-nous immédiatement à {supportEmail} ; nous pouvons révoquer ou renouveler des clés pour vous protéger ou protéger le Service.",
          "Vous devez fournir des informations de compte exactes et les tenir à jour.",
        ],
      },
      {
        h: "4. Solde prépayé, prix et facturation",
        p: [
          "Le Service est prépayé. Vous approvisionnez un solde en dollars américains, et l’utilisation est débitée de ce solde selon le prix de chaque modèle publié sur la page [modèles](/models) au moment de la requête. Nous pouvons modifier les prix de l’utilisation future ; les modifications n’affectent pas les requêtes déjà traitées.",
          "Avant de traiter une requête, nous bloquons sur votre solde le coût maximal possible de cette requête ; une fois la requête terminée, nous facturons l’utilisation réelle et libérons le reste. Les requêtes qui échouent avant que le modèle ne commence à répondre ne sont pas facturées. Si une réponse en streaming est annulée ou interrompue, seuls les tokens générés sont facturés. L’utilisation est mesurée par nos systèmes et nos enregistrements servent de base à la facturation, sous réserve de la procédure relative aux erreurs de facturation prévue par notre [Politique de remboursement et de solde](/refund).",
          "Les paiements ne sont pas remboursables et le solde expire après {expiryMonths} mois sans utilisation ni rechargement, comme décrit dans la [Politique de remboursement et de solde](/refund). Les prix s’entendent hors taxes ; vous êtes redevable des taxes applicables à vos achats, à l’exception des impôts sur nos revenus.",
        ],
      },
      {
        h: "5. Utilisation acceptable",
        p: [
          "Vous devez respecter notre [Politique d’utilisation acceptable](/acceptable-use) ainsi que les politiques d’utilisation des fournisseurs de modèles qui traitent vos requêtes. Nous pouvons bloquer des requêtes, limiter le débit ou suspendre l’accès afin de prévenir les abus ou de protéger le Service.",
        ],
      },
      {
        h: "6. Votre contenu",
        p: [
          "Entre vous et nous, vous conservez vos droits sur les entrées que vous soumettez et, dans la mesure permise par la loi et par les conditions du fournisseur de modèles concerné, les réponses générées pour vous vous appartiennent. Vous êtes responsable de vos entrées et de l’usage que vous faites des réponses, y compris de disposer des droits et consentements nécessaires pour soumettre des données.",
          "Vous nous accordez les droits nécessaires pour transmettre vos entrées aux fournisseurs de modèles et vous renvoyer les réponses, uniquement afin de fournir le Service. Nous ne conservons pas le contenu des invites ni des réponses ; nous conservons les métadonnées des requêtes comme décrit dans la [Politique de confidentialité](/privacy). Les fournisseurs de modèles traitent les requêtes selon leurs propres conditions.",
        ],
      },
      {
        h: "7. Fournisseurs tiers",
        p: [
          "Le Service repose sur des fournisseurs de modèles et d’infrastructure tiers, dont les conditions et politiques peuvent s’appliquer aux requêtes qui leur sont acheminées. Nous ne sommes pas responsables de leurs services, pannes ou actes, mais nous contournons les pannes lorsque c’est possible.",
        ],
      },
      {
        h: "8. Disponibilité et modifications",
        p: [
          "Nous nous efforçons de maintenir le Service disponible, mais nous ne garantissons pas un fonctionnement ininterrompu ou sans erreur, sauf engagement de niveau de service convenu par écrit avec vous. Nous pouvons effectuer des opérations de maintenance et modifier, suspendre ou retirer des fonctionnalités ou des identifiants de modèle. Lorsque c’est raisonnablement possible, nous vous informerons à l’avance des changements importants.",
        ],
      },
      {
        h: "9. Suspension et résiliation",
        p: [
          "Vous pouvez cesser d’utiliser le Service à tout moment. Nous pouvons suspendre ou résilier votre accès, révoquer des clés d’API ou refuser des requêtes si vous enfreignez les présentes Conditions, créez un risque ou une responsabilité juridique pour nous ou pour autrui, ne payez pas, effectuez des rétrofacturations injustifiées, ou si la loi l’exige. Lorsque c’est possible, nous vous préviendrons à l’avance.",
          "Si nous résilions votre compte pour convenance et non en raison d’un manquement de votre part, nous vous rembourserons le solde non utilisé. Dans les autres cas, la résiliation n’ouvre droit à aucun remboursement, sauf si la loi l’exige.",
        ],
      },
      {
        h: "10. Exclusion de garanties",
        p: [
          "Dans toute la mesure permise par la loi, le Service et toutes les réponses sont fournis « en l’état » et « selon disponibilité », sans garantie d’aucune sorte, notamment de qualité marchande, d’adéquation à un usage particulier, d’exactitude et d’absence de contrefaçon. Les réponses ne constituent pas un conseil professionnel, juridique, médical ou financier.",
        ],
      },
      {
        h: "11. Limitation de responsabilité",
        p: [
          "Dans toute la mesure permise par la loi, nous ne sommes pas responsables des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs, ni de la perte de bénéfices, de chiffre d’affaires, de données ou de clientèle. Notre responsabilité totale pour l’ensemble des réclamations liées au Service est limitée au plus élevé des deux montants suivants : les sommes que vous nous avez versées au cours des 12 mois précédant la réclamation, ou 100 USD.",
          "Aucune disposition des présentes Conditions ne limite une responsabilité qui ne peut être limitée par la loi.",
        ],
      },
      {
        h: "12. Indemnisation",
        p: [
          "Vous défendrez et indemniserez {company} contre toute réclamation, tout dommage et toute dépense (y compris des honoraires d’avocat raisonnables) découlant de vos entrées, de votre utilisation des réponses, de votre violation des présentes Conditions ou de la Politique d’utilisation acceptable, ou de votre violation de la loi ou des droits de tiers.",
        ],
      },
      {
        h: "13. Modification des Conditions",
        p: [
          "Nous pouvons mettre à jour les présentes Conditions. Nous publierons la nouvelle version avec sa date d’entrée en vigueur et vous informerons des changements importants par e-mail ou dans le Service. En continuant à utiliser le Service après cette date, vous acceptez les Conditions mises à jour.",
        ],
      },
      {
        h: "14. Droit applicable et litiges",
        p: [
          "Les présentes Conditions sont régies par le droit du lieu d’établissement de l’exploitant du Service, sans égard à ses règles de conflit de lois. Avant toute réclamation, contactez-nous à [{legalEmail}](mailto:{legalEmail}) afin que nous puissions tenter de résoudre le litige à l’amiable dans un délai de 30 jours. Le présent article ne limite pas les droits impératifs de protection des consommateurs dont vous bénéficiez en vertu de la loi de votre pays de résidence.",
        ],
      },
      {
        h: "15. Langue et contact",
        p: [
          "Nous pouvons fournir des traductions des présentes Conditions à titre indicatif ; en cas de divergence avec la version anglaise, la version anglaise prévaut. Questions sur les présentes Conditions : [{legalEmail}](mailto:{legalEmail}).",
        ],
      },
    ],
  },

  privacy: {
    title: "Politique de confidentialité",
    description: "Les données personnelles que TokenAPI collecte, leur utilisation et leur partage, le lieu de leur traitement et vos droits.",
    intro: "La présente Politique de confidentialité explique comment {company} (« TokenAPI », « nous ») collecte, utilise et partage des données personnelles lorsque vous utilisez notre site web et notre API (le « Service »). Nous sommes le responsable du traitement des données personnelles décrites ici.",
    sections: [
      {
        h: "1. Données collectées",
        list: [
          "Données de compte : votre adresse e-mail, votre nom, le nom de votre société et les informations que vous nous envoyez lorsque vous demandez un accès ou nous contactez.",
          "Données de facturation : montants rechargés, solde, factures et historique des transactions. Les données de carte et de compte bancaire sont traitées par notre prestataire de paiement ; nous ne recevons jamais le numéro de carte complet.",
          "Métadonnées d’utilisation de chaque requête à l’API : ID de requête, horodatage, ID de clé d’API, identifiant de modèle appelé et modèle ayant répondu, nombre de tokens, coût, latence, statut et type d’erreur, adresse IP et user agent.",
          "Mesure d’audience du site web : statistiques agrégées de pages vues, collectées sans cookies publicitaires (Vercel Web Analytics et Cloudflare Web Analytics).",
        ],
      },
      {
        h: "2. Contenu des invites et des réponses",
        p: [
          "Nous ne conservons pas le contenu de vos invites ni des réponses des modèles. Le contenu transite par notre passerelle jusqu’au fournisseur de modèles qui traite la requête, puis vous est renvoyé. Les fournisseurs de modèles traitent ce contenu selon leurs propres conditions et politiques de confidentialité, ce qui peut inclure une conservation temporaire pour la surveillance des abus.",
        ],
      },
      {
        h: "3. Utilisation des données",
        list: [
          "Fournir le Service : authentifier les clés d’API, acheminer les requêtes et appliquer les limites de débit et de dépenses.",
          "Facturer : bloquer et régler les montants, tenir votre solde et conserver les écritures comptables.",
          "Assurer la sécurité : détecter la fraude, les abus et les violations de la Politique d’utilisation acceptable.",
          "Fournir une assistance et vous informer au sujet de votre compte et des modifications du Service ou de la présente politique.",
          "Comprendre et améliorer le Service grâce à des statistiques agrégées.",
          "Respecter nos obligations légales.",
        ],
      },
      {
        h: "4. Bases juridiques",
        p: [
          "Lorsque le RGPD ou une loi similaire s’applique, nous traitons les données personnelles pour exécuter notre contrat avec vous, sur la base de notre intérêt légitime à exploiter, protéger et améliorer le Service, pour respecter nos obligations légales et, lorsque cela est requis, avec votre consentement.",
        ],
      },
      {
        h: "5. Destinataires des données",
        p: [
          "Nous ne vendons pas de données personnelles. Nous ne les partageons qu’avec des prestataires qui nous aident à exploiter le Service, dans le cadre de contrats qui en limitent l’usage :",
        ],
        list: [
          "les fournisseurs de modèles d’IA qui traitent vos requêtes, notamment Alibaba Cloud, DeepSeek et Google ;",
          "l’hébergement et l’infrastructure : Vercel (hébergement de l’application), Neon (base de données) et Cloudflare (DNS et mesure d’audience du site) ;",
          "notre prestataire de paiement, qui traite vos paiements ;",
          "des conseillers professionnels et des autorités, lorsque la loi l’exige ou pour protéger nos droits.",
        ],
      },
      {
        h: "6. Transferts internationaux",
        p: [
          "Nos prestataires traitent des données dans plusieurs pays, dont les États-Unis, la Chine et Singapour, qui peuvent ne pas offrir le même niveau de protection que votre pays. Lorsque cela est nécessaire, nous mettons en place des garanties appropriées telles que les clauses contractuelles types. Le contenu des requêtes est traité dans le pays du fournisseur de modèles qui les traite.",
        ],
      },
      {
        h: "7. Durée de conservation",
        p: [
          "Nous conservons les données de compte tant que le compte est actif, puis pendant une durée raisonnable. Les enregistrements d’utilisation et de facturation sont conservés aussi longtemps que nécessaire à des fins comptables, fiscales, de gestion des litiges et d’audit, en général jusqu’à sept ans. Les statistiques agrégées qui ne vous identifient pas peuvent être conservées plus longtemps.",
        ],
      },
      {
        h: "8. Cookies",
        p: [
          "Nous n’utilisons que quelques cookies essentiels : `tokenapi_lang` mémorise la langue choisie, et l’espace d’administration utilise un cookie de session pour la connexion du personnel. Notre mesure d’audience n’utilise pas de cookies, et nous n’utilisons ni cookies publicitaires ni cookies de suivi intersites.",
        ],
      },
      {
        h: "9. Sécurité",
        p: [
          "Nous protégeons les données par le chiffrement en transit, le stockage haché des clés d’API, le chiffrement des identifiants des fournisseurs, le contrôle d’accès et la journalisation. Aucun système n’est totalement sûr ; protégez vos clés d’API et signalez tout incident suspect à [{supportEmail}](mailto:{supportEmail}).",
        ],
      },
      {
        h: "10. Vos droits",
        p: [
          "Selon votre lieu de résidence, vous pouvez disposer du droit d’accéder à vos données personnelles, de les rectifier, de les effacer ou de les exporter, de vous opposer à certains traitements ou de les limiter, et de retirer votre consentement. Pour exercer ces droits, écrivez à [{privacyEmail}](mailto:{privacyEmail}). Vous pouvez également introduire une réclamation auprès de l’autorité de protection des données de votre pays.",
        ],
      },
      {
        h: "11. Mineurs",
        p: [
          "Le Service ne s’adresse pas aux personnes de moins de 18 ans et nous ne collectons pas sciemment leurs données personnelles.",
        ],
      },
      {
        h: "12. Modifications et contact",
        p: [
          "Nous pouvons mettre à jour la présente politique et publierons la nouvelle version avec sa date d’entrée en vigueur. Contact : {company}, [{privacyEmail}](mailto:{privacyEmail}).",
        ],
      },
    ],
  },

  acceptableUse: {
    title: "Politique d’utilisation acceptable",
    description: "Ce qui est interdit lors de l’utilisation de TokenAPI et comment nous le faisons respecter.",
    intro: "La présente politique s’applique à tous les utilisateurs de TokenAPI et fait partie de nos [Conditions d’utilisation](/terms). Les requêtes sont également soumises aux politiques d’utilisation des fournisseurs de modèles qui les traitent ; lorsqu’elles sont plus strictes, elles s’appliquent aussi.",
    sections: [
      {
        h: "1. Contenus et activités interdits",
        p: ["Vous ne pouvez pas utiliser le Service, ni aider d’autres personnes à l’utiliser, pour :"],
        list: [
          "enfreindre la loi ou faciliter des activités illégales ;",
          "créer, diffuser ou solliciter des contenus sexuels impliquant des mineurs, ou tout contenu exploitant ou mettant en danger des enfants ;",
          "promouvoir ou soutenir le terrorisme ou l’extrémisme violent, ou inciter à la violence ;",
          "harceler, menacer ou intimider des personnes, ou promouvoir la haine fondée sur des caractéristiques protégées ;",
          "développer ou utiliser des logiciels malveillants, s’introduire dans des systèmes ou porter atteinte à la sécurité ou à la disponibilité d’un réseau ou d’un service ;",
          "commettre des fraudes, de l’hameçonnage, des escroqueries ou du spam, ou usurper l’identité de personnes ou d’organisations pour tromper autrui ;",
          "développer ou se procurer des armes biologiques, chimiques, nucléaires ou radiologiques, ou d’autres armes capables de causer des pertes humaines massives ;",
          "mener des opérations d’influence trompeuses ou des campagnes de désinformation, y compris liées à des élections ;",
          "porter atteinte à des droits de propriété intellectuelle ou à la vie privée, ou collecter ou traiter des données personnelles ou sensibles sans base juridique ;",
          "prendre des décisions entièrement automatisées produisant des effets juridiques ou des effets similaires significatifs pour des personnes (par exemple en matière de crédit, d’emploi, de logement, de santé ou de droit) sans contrôle humain approprié.",
        ],
      },
      {
        h: "2. Abus du Service",
        p: ["Vous ne pouvez pas :"],
        list: [
          "contourner, désactiver ou perturber les limites de débit, les plafonds de dépenses, l’authentification ou les mesures de sécurité, ni utiliser plusieurs comptes pour échapper aux limites ;",
          "partager, vendre ou publier des clés d’API, ni revendre le Service en tant qu’API autonome sans notre accord écrit ;",
          "utiliser les réponses pour développer des modèles concurrents lorsque les conditions du fournisseur de modèles l’interdisent ;",
          "sonder, scanner ou soumettre le Service à des tests de charge sans autorisation, ni perturber l’utilisation des autres clients.",
        ],
      },
      {
        h: "3. Mesures d’application",
        p: [
          "Nous pouvons enquêter sur les violations présumées et, selon leur gravité, bloquer des requêtes, révoquer des clés d’API, ou suspendre ou fermer des comptes, avec ou sans préavis. Lorsque la loi l’exige, nous signalons les contenus illicites aux autorités. Le solde des comptes fermés pour violation n’est pas remboursé.",
        ],
      },
      {
        h: "4. Signaler un abus",
        p: [
          "Signalez les abus ou les failles de sécurité à [{abuseEmail}](mailto:{abuseEmail}). Indiquez l’ID de requête (`x-request-id`) si vous l’avez.",
        ],
      },
    ],
  },

  refund: {
    title: "Politique de remboursement et de solde",
    description: "Fonctionnement chez TokenAPI du solde prépayé, des débits, des remboursements, des erreurs de facturation et de l’expiration du solde.",
    intro: "TokenAPI se paie au moyen d’un solde prépayé. La présente politique explique comment les débits sont effectués, quand un remboursement est possible et quand le solde expire. Elle fait partie de nos [Conditions d’utilisation](/terms).",
    sections: [
      {
        h: "1. Solde prépayé",
        p: [
          "Les rechargements se font en dollars américains. Le solde ne peut servir qu’à l’utilisation de TokenAPI aux prix par modèle publiés sur la page [modèles](/models). Le solde n’est pas un dépôt bancaire, ne produit pas d’intérêts et ne peut être ni transféré vers un autre compte ni échangé contre des espèces.",
        ],
      },
      {
        h: "2. Fonctionnement des débits",
        list: [
          "Avant l’exécution d’une requête, son coût maximal possible (invite + `max_tokens`) est bloqué sur votre solde. Si le solde est insuffisant, la requête est refusée et rien n’est facturé.",
          "Une fois la requête terminée, les tokens réellement consommés sont facturés et le reste du montant bloqué est immédiatement libéré.",
          "Les requêtes qui échouent avant que le modèle ne commence à répondre ne sont pas facturées.",
          "Si une réponse en streaming est annulée ou interrompue, seuls les tokens générés sont facturés.",
        ],
      },
      {
        h: "3. Remboursements",
        p: [
          "Les paiements et rechargements sont définitifs et ne sont pas remboursables, sauf lorsque la loi applicable impose un remboursement (par exemple en vertu de droits impératifs de protection des consommateurs) ou lorsque nous fermons votre compte pour convenance et non en raison d’un manquement de votre part, auquel cas nous remboursons le solde non utilisé.",
        ],
      },
      {
        h: "4. Erreurs de facturation",
        p: [
          "Si vous pensez avoir été facturé par erreur, contactez [{supportEmail}](mailto:{supportEmail}) dans les {disputeDays} jours suivant le débit, en indiquant les ID de requête concernés (`x-request-id`). Si l’erreur est confirmée, nous recréditerons le montant sur votre solde ou, en cas d’erreur de paiement, sur le moyen de paiement d’origine.",
        ],
      },
      {
        h: "5. Expiration du solde",
        p: [
          "Le solde expire si votre compte reste {expiryMonths} mois consécutifs sans utilisation de l’API ni rechargement. Nous vous préviendrons par e-mail au moins {noticeDays} jours avant l’expiration ; toute utilisation ou tout rechargement avant cette date maintient le solde actif.",
        ],
      },
      {
        h: "6. Rétrofacturations",
        p: [
          "Contactez-nous avant de contester un paiement auprès de votre banque. En cas de rétrofacturation, nous pouvons suspendre le compte pendant son examen. Les rétrofacturations injustifiées peuvent entraîner la fermeture du compte.",
        ],
      },
      {
        h: "7. Fermeture du compte",
        p: [
          "Vous pouvez demander la fermeture de votre compte à tout moment. Le solde restant est perdu à la fermeture, sauf si la loi impose un remboursement ou si l’article 3 s’applique.",
        ],
      },
    ],
  },

  contact: {
    title: "Contact",
    description: "Comment joindre TokenAPI : informations sur la société et contacts pour l’assistance, la confidentialité, les abus et les questions juridiques.",
    intro: "Nous répondons sous {days} jours ouvrés. Si votre demande concerne une requête précise, indiquez l’ID de requête figurant dans l’en-tête de réponse `x-request-id`.",
    companyHeading: "Société",
    labels: { company: "Exploité par", jurisdiction: "Immatriculée à", address: "Adresse" },
    channelsHeading: "Contacts",
    channels: [
      { label: "Général et commercial", detail: "Clés d’API, tarifs sur volume, partenariats.", emailKey: "general" },
      { label: "Assistance et facturation", detail: "Problèmes techniques, débits et solde.", emailKey: "support" },
      { label: "Confidentialité", detail: "Demandes d’accès, de rectification et d’effacement des données.", emailKey: "privacy" },
      { label: "Abus et sécurité", detail: "Signalement d’abus ou de vulnérabilités.", emailKey: "abuse" },
      { label: "Juridique", detail: "Notifications et questions sur les conditions.", emailKey: "legal" },
    ],
    responseNote: "Adressez les notifications juridiques formelles par e-mail à l’adresse juridique indiquée ci-dessus.",
  },
};
