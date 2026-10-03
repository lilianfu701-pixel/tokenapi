import type { LegalTexts } from "./types";

export const de: LegalTexts = {
  chrome: {
    footerLabel: "Rechtliches",
    nav: { terms: "AGB", privacy: "Datenschutz", acceptableUse: "Nutzungsrichtlinie", refund: "Erstattung & Guthaben", contact: "Kontakt" },
    effective: "Gültig ab: {date}",
    contents: "Inhalt",
    translationNotice: "Diese Übersetzung dient nur zur Information. Bei Abweichungen von der [englischen Fassung]({enUrl}) ist die englische Fassung maßgeblich.",
  },

  terms: {
    title: "Nutzungs­bedingungen",
    description: "Bedingungen für das KI-Modell-Gateway von TokenAPI, API-Schlüssel, Prepaid-Guthaben und Abrechnung.",
    intro: "Diese Nutzungsbedingungen (die „Bedingungen“) regeln Ihren Zugang zur Website, API und den zugehörigen Diensten von TokenAPI (der „Dienst“), betrieben von {company} („TokenAPI“, „wir“). Indem Sie ein Konto erstellen, einen API-Schlüssel verwenden oder den Dienst anderweitig nutzen, stimmen Sie diesen Bedingungen zu.",
    sections: [
      {
        h: "1. Voraussetzungen",
        p: [
          "Sie müssen mindestens 18 Jahre alt und in der Lage sein, einen verbindlichen Vertrag zu schließen. Wenn Sie den Dienst im Namen eines Unternehmens oder einer anderen Organisation nutzen, sichern Sie zu, dass Sie berechtigt sind, diese Bedingungen in deren Namen anzunehmen; „Sie“ umfasst dann diese Organisation.",
          "Sie dürfen den Dienst nicht nutzen, wenn Sie Sanktionen unterliegen oder sich in einem Land oder einer Region befinden, in der das anwendbare Recht die Erbringung des Dienstes an Sie untersagt. Sie sind dafür verantwortlich, die für Ihre Nutzung geltenden Exportkontroll- und Sanktionsvorschriften einzuhalten.",
        ],
      },
      {
        h: "2. Der Dienst",
        p: [
          "TokenAPI ist ein API-Gateway, das Ihnen über stabile Modell-IDs (zum Beispiel `tokenapi-pro`) Zugang zu KI-Modellen bietet. Jede Modell-ID wird von einem oder mehreren externen Modellanbietern bedient. Um Qualität und Verfügbarkeit zu sichern, können wir den Anbieter oder das zugrunde liegende Modell einer Modell-ID ändern, Anfragen an Ersatzanbieter weiterleiten sowie Modell-IDs hinzufügen, ändern oder einstellen.",
          "Ausgaben von KI-Modellen werden automatisch erzeugt. Sie können ungenau, unvollständig oder anstößig sein oder Ausgaben ähneln, die für andere erzeugt wurden, und geben nicht unsere Ansichten wieder. Sie sollten Ausgaben prüfen, bevor Sie sich auf sie verlassen.",
        ],
      },
      {
        h: "3. Konten und API-Schlüssel",
        p: [
          "Sie sind dafür verantwortlich, Ihre Zugangsdaten und API-Schlüssel geheim zu halten, und für alle Aktivitäten, die darüber erfolgen. Betten Sie API-Schlüssel nicht in Browser oder mobile Apps ein und geben Sie sie nicht weiter. Wenn Sie vermuten, dass ein Schlüssel offengelegt wurde, informieren Sie uns umgehend unter {supportEmail}; wir können Schlüssel widerrufen oder austauschen, um Sie oder den Dienst zu schützen.",
          "Sie müssen zutreffende Kontoangaben machen und diese aktuell halten.",
        ],
      },
      {
        h: "4. Prepaid-Guthaben, Preise und Abrechnung",
        p: [
          "Der Dienst ist im Voraus zu bezahlen. Sie laden ein Guthaben in US-Dollar auf, und die Nutzung wird zu den Modellpreisen, die zum Zeitpunkt der Anfrage auf der Seite [Modelle](/models) veröffentlicht sind, von diesem Guthaben abgebucht. Wir können die Preise für künftige Nutzung ändern; Änderungen betreffen keine bereits abgeschlossenen Anfragen.",
          "Bevor wir eine Anfrage bearbeiten, reservieren wir die maximal möglichen Kosten dieser Anfrage auf Ihrem Guthaben; nach Abschluss berechnen wir die tatsächliche Nutzung und geben den Rest frei. Anfragen, die fehlschlagen, bevor das Modell zu antworten beginnt, werden nicht berechnet. Wird eine Streaming-Antwort abgebrochen oder unterbrochen, werden nur die bereits erzeugten Tokens berechnet. Die Nutzung wird von unseren Systemen gemessen, und unsere Aufzeichnungen sind Grundlage der Abrechnung, vorbehaltlich des Verfahrens für Abrechnungsfehler in unserer [Erstattungs- und Guthabenrichtlinie](/refund).",
          "Zahlungen werden nicht erstattet, und Guthaben verfällt nach {expiryMonths} Monaten ohne Nutzung und ohne Aufladung, wie in der [Erstattungs- und Guthabenrichtlinie](/refund) beschrieben. Die Preise verstehen sich ohne Steuern; Sie tragen die auf Ihre Käufe anfallenden Steuern, mit Ausnahme von Steuern auf unser Einkommen.",
        ],
      },
      {
        h: "5. Zulässige Nutzung",
        p: [
          "Sie müssen unsere [Nutzungsrichtlinie](/acceptable-use) sowie die Nutzungsrichtlinien der Modellanbieter einhalten, die Ihre Anfragen bedienen. Wir können Anfragen blockieren, Raten begrenzen oder den Zugang sperren, um Missbrauch zu verhindern oder den Dienst zu schützen.",
        ],
      },
      {
        h: "6. Ihre Inhalte",
        p: [
          "Im Verhältnis zwischen Ihnen und uns behalten Sie Ihre Rechte an den von Ihnen übermittelten Eingaben, und soweit Gesetz und die Bedingungen des jeweiligen Modellanbieters es zulassen, gehören die für Sie erzeugten Ausgaben Ihnen. Sie sind für Ihre Eingaben und die Verwendung der Ausgaben verantwortlich, einschließlich der für die Übermittlung von Daten erforderlichen Rechte und Einwilligungen.",
          "Sie räumen uns die Rechte ein, die erforderlich sind, um Ihre Eingaben an Modellanbieter zu übermitteln und Ihnen die Ausgaben zurückzugeben, ausschließlich zur Erbringung des Dienstes. Wir speichern keine Inhalte von Prompts und Antworten; Metadaten von Anfragen bewahren wir wie in der [Datenschutzerklärung](/privacy) beschrieben auf. Modellanbieter verarbeiten Anfragen nach ihren eigenen Bedingungen.",
        ],
      },
      {
        h: "7. Drittanbieter",
        p: [
          "Der Dienst ist auf externe Modellanbieter und Infrastruktur angewiesen, deren Bedingungen und Richtlinien für an sie weitergeleitete Anfragen gelten können. Wir sind nicht für deren Dienste, Ausfälle oder Handlungen verantwortlich, leiten Anfragen aber nach Möglichkeit um Ausfälle herum.",
        ],
      },
      {
        h: "8. Verfügbarkeit und Änderungen",
        p: [
          "Wir bemühen uns, den Dienst verfügbar zu halten, garantieren aber keinen unterbrechungs- oder fehlerfreien Betrieb, sofern wir mit Ihnen nicht schriftlich ein Service-Level vereinbart haben. Wir können Wartungen durchführen und Funktionen oder Modell-IDs ändern, aussetzen oder einstellen. Soweit zumutbar, kündigen wir wesentliche Änderungen vorab an.",
        ],
      },
      {
        h: "9. Sperrung und Kündigung",
        p: [
          "Sie können die Nutzung des Dienstes jederzeit beenden. Wir können Ihren Zugang sperren oder beenden, API-Schlüssel widerrufen oder Anfragen ablehnen, wenn Sie gegen diese Bedingungen verstoßen, für uns oder andere ein Risiko oder eine rechtliche Haftung verursachen, nicht zahlen, unberechtigte Rückbuchungen veranlassen oder wenn das Gesetz es verlangt. Nach Möglichkeit benachrichtigen wir Sie vorher.",
          "Kündigen wir Ihr Konto aus eigenen Gründen und nicht wegen Ihres Verstoßes, erstatten wir Ihnen das ungenutzte Guthaben. In anderen Fällen begründet eine Kündigung keinen Anspruch auf Erstattung, sofern das Gesetz nichts anderes vorschreibt.",
        ],
      },
      {
        h: "10. Gewährleistungsausschluss",
        p: [
          "Soweit gesetzlich zulässig, werden der Dienst und alle Ausgaben „wie besehen“ und „wie verfügbar“ bereitgestellt, ohne jegliche Gewährleistung, insbesondere hinsichtlich Marktgängigkeit, Eignung für einen bestimmten Zweck, Richtigkeit und Nichtverletzung von Rechten. Ausgaben stellen keine fachliche, rechtliche, medizinische oder finanzielle Beratung dar.",
        ],
      },
      {
        h: "11. Haftungsbeschränkung",
        p: [
          "Soweit gesetzlich zulässig, haften wir nicht für indirekte, beiläufige, besondere, Folge- oder Strafschäden oder für entgangenen Gewinn, Umsatz, Datenverlust oder Verlust an Geschäftswert. Unsere Gesamthaftung für alle Ansprüche im Zusammenhang mit dem Dienst ist auf den höheren der folgenden Beträge begrenzt: den Betrag, den Sie in den 12 Monaten vor dem Anspruch an uns gezahlt haben, oder 100 USD.",
          "Nichts in diesen Bedingungen beschränkt eine Haftung, die gesetzlich nicht beschränkt werden kann.",
        ],
      },
      {
        h: "12. Freistellung",
        p: [
          "Sie verteidigen {company} und stellen das Unternehmen frei von Ansprüchen, Schäden und Kosten (einschließlich angemessener Anwaltskosten), die sich aus Ihren Eingaben, Ihrer Verwendung der Ausgaben, Ihrem Verstoß gegen diese Bedingungen oder die Nutzungsrichtlinie oder Ihrer Verletzung von Gesetzen oder Rechten Dritter ergeben.",
        ],
      },
      {
        h: "13. Änderungen dieser Bedingungen",
        p: [
          "Wir können diese Bedingungen aktualisieren. Wir veröffentlichen die neue Fassung mit ihrem Gültigkeitsdatum und informieren Sie über wesentliche Änderungen per E-Mail oder im Dienst. Wenn Sie den Dienst nach dem Gültigkeitsdatum weiter nutzen, akzeptieren Sie die aktualisierten Bedingungen.",
        ],
      },
      {
        h: "14. Anwendbares Recht und Streitbeilegung",
        p: [
          "Diese Bedingungen unterliegen dem Recht des Ortes, an dem der Betreiber des Dienstes niedergelassen ist, unter Ausschluss der Kollisionsnormen. Bevor Sie Ansprüche geltend machen, wenden Sie sich bitte an [{legalEmail}](mailto:{legalEmail}), damit wir versuchen können, die Streitigkeit innerhalb von 30 Tagen einvernehmlich beizulegen. Dieser Abschnitt schränkt zwingende Verbraucherschutzrechte nach dem Recht Ihres Wohnsitzlandes nicht ein.",
        ],
      },
      {
        h: "15. Sprache und Kontakt",
        p: [
          "Wir können Übersetzungen dieser Bedingungen zur Information bereitstellen; bei Abweichungen von der englischen Fassung ist die englische Fassung maßgeblich. Fragen zu diesen Bedingungen: [{legalEmail}](mailto:{legalEmail}).",
        ],
      },
    ],
  },

  privacy: {
    title: "Datenschutz­erklärung",
    description: "Welche personenbezogenen Daten TokenAPI erhebt, wie sie genutzt und weitergegeben werden, wo sie verarbeitet werden und welche Rechte Sie haben.",
    intro: "Diese Datenschutzerklärung erläutert, wie {company} („TokenAPI“, „wir“) personenbezogene Daten erhebt, nutzt und weitergibt, wenn Sie unsere Website und API (der „Dienst“) verwenden. Wir sind der Verantwortliche für die hier beschriebenen personenbezogenen Daten.",
    sections: [
      {
        h: "1. Welche Daten wir erheben",
        list: [
          "Kontodaten: Ihre E-Mail-Adresse, Ihr Name, Ihr Firmenname und die Angaben, die Sie uns bei einer Zugangsanfrage oder Kontaktaufnahme senden.",
          "Abrechnungsdaten: Aufladebeträge, Guthaben, Rechnungen und Transaktionsverlauf. Karten- und Bankdaten werden von unserem Zahlungsdienstleister verarbeitet; wir erhalten nie die vollständige Kartennummer.",
          "Nutzungsmetadaten jeder API-Anfrage: Anfrage-ID, Zeitstempel, API-Schlüssel-ID, die aufgerufene Modell-ID und das bedienende Modell, Token-Anzahl, Kosten, Latenz, Status und Fehlertyp, IP-Adresse und User-Agent.",
          "Website-Analyse: aggregierte Seitenaufrufstatistiken ohne Werbe-Cookies (Vercel Web Analytics und Cloudflare Web Analytics).",
        ],
      },
      {
        h: "2. Inhalte von Prompts und Antworten",
        p: [
          "Wir speichern die Inhalte Ihrer Prompts und der Modellantworten nicht. Die Inhalte laufen über unser Gateway zu dem Modellanbieter, der die Anfrage bedient, und zurück zu Ihnen. Modellanbieter verarbeiten diese Inhalte nach ihren eigenen Bedingungen und Datenschutzrichtlinien, was eine vorübergehende Speicherung zur Missbrauchsüberwachung umfassen kann.",
        ],
      },
      {
        h: "3. Wie wir Daten nutzen",
        list: [
          "Zur Erbringung des Dienstes: Authentifizierung von API-Schlüsseln, Weiterleitung von Anfragen und Durchsetzung von Raten- und Ausgabenlimits.",
          "Zur Abrechnung: Reservieren und Abrechnen von Kosten, Führen Ihres Guthabens und Aufbewahren von Buchhaltungsunterlagen.",
          "Zur Sicherheit: Erkennung von Betrug, Missbrauch und Verstößen gegen die Nutzungsrichtlinie.",
          "Für Support und zur Kommunikation über Ihr Konto sowie über Änderungen des Dienstes oder dieser Erklärung.",
          "Zum Verständnis und zur Verbesserung des Dienstes anhand aggregierter Statistiken.",
          "Zur Erfüllung gesetzlicher Pflichten.",
        ],
      },
      {
        h: "4. Rechtsgrundlagen",
        p: [
          "Soweit die DSGVO oder ein vergleichbares Gesetz gilt, verarbeiten wir personenbezogene Daten zur Erfüllung unseres Vertrags mit Ihnen, auf Grundlage unseres berechtigten Interesses am Betrieb, Schutz und an der Verbesserung des Dienstes, zur Erfüllung gesetzlicher Pflichten und, soweit erforderlich, mit Ihrer Einwilligung.",
        ],
      },
      {
        h: "5. Empfänger der Daten",
        p: [
          "Wir verkaufen keine personenbezogenen Daten. Wir geben sie nur an Dienstleister weiter, die uns beim Betrieb des Dienstes unterstützen, auf Grundlage von Verträgen, die ihre Nutzung beschränken:",
        ],
        list: [
          "KI-Modellanbieter, die Ihre Anfragen verarbeiten, darunter Alibaba Cloud, DeepSeek und Google.",
          "Hosting und Infrastruktur: Vercel (Anwendungshosting), Neon (Datenbank) und Cloudflare (DNS und Website-Analyse).",
          "Unser Zahlungsdienstleister, der Ihre Zahlungen abwickelt.",
          "Berater und Behörden, wenn das Gesetz es verlangt oder zum Schutz unserer Rechte.",
        ],
      },
      {
        h: "6. Internationale Übermittlungen",
        p: [
          "Unsere Dienstleister verarbeiten Daten in mehreren Ländern, darunter die Vereinigten Staaten, China und Singapur, die möglicherweise nicht das gleiche Schutzniveau wie Ihr Land bieten. Soweit erforderlich, setzen wir geeignete Garantien wie Standardvertragsklauseln ein. Anfrageinhalte werden im Land des jeweils bedienenden Modellanbieters verarbeitet.",
        ],
      },
      {
        h: "7. Speicherdauer",
        p: [
          "Kontodaten bewahren wir auf, solange das Konto besteht, und danach für einen angemessenen Zeitraum. Nutzungs- und Abrechnungsdaten werden so lange aufbewahrt, wie es für Buchhaltung, Steuern, Streitbeilegung und Prüfungen erforderlich ist, in der Regel bis zu sieben Jahre. Aggregierte Statistiken, die Sie nicht identifizieren, können länger aufbewahrt werden.",
        ],
      },
      {
        h: "8. Cookies",
        p: [
          "Wir verwenden nur wenige notwendige Cookies: `tokenapi_lang` speichert die gewählte Sprache, und der Administrationsbereich verwendet ein Sitzungs-Cookie für die Anmeldung von Mitarbeitenden. Unsere Analyse verwendet keine Cookies, und wir setzen keine Werbe- oder websiteübergreifenden Tracking-Cookies ein.",
        ],
      },
      {
        h: "9. Sicherheit",
        p: [
          "Wir schützen Daten durch Transportverschlüsselung, gehashte Speicherung von API-Schlüsseln, verschlüsselte Zugangsdaten zu Anbietern, Zugriffskontrollen und Protokollierung. Kein System ist vollkommen sicher; schützen Sie Ihre API-Schlüssel und melden Sie verdächtige Vorfälle an [{supportEmail}](mailto:{supportEmail}).",
        ],
      },
      {
        h: "10. Ihre Rechte",
        p: [
          "Je nach Wohnort haben Sie möglicherweise das Recht auf Auskunft, Berichtigung, Löschung oder Übertragung Ihrer personenbezogenen Daten, das Recht, bestimmten Verarbeitungen zu widersprechen oder sie einzuschränken, sowie das Recht, Ihre Einwilligung zu widerrufen. Zur Ausübung dieser Rechte schreiben Sie an [{privacyEmail}](mailto:{privacyEmail}). Sie können sich auch bei der Datenschutzbehörde Ihres Landes beschweren.",
        ],
      },
      {
        h: "11. Minderjährige",
        p: [
          "Der Dienst richtet sich nicht an Personen unter 18 Jahren, und wir erheben wissentlich keine personenbezogenen Daten von ihnen.",
        ],
      },
      {
        h: "12. Änderungen und Kontakt",
        p: [
          "Wir können diese Erklärung aktualisieren und veröffentlichen die neue Fassung mit ihrem Gültigkeitsdatum. Kontakt: {company}, [{privacyEmail}](mailto:{privacyEmail}).",
        ],
      },
    ],
  },

  acceptableUse: {
    title: "Nutzungs­richtlinie",
    description: "Was bei der Nutzung von TokenAPI verboten ist und wie wir dies durchsetzen.",
    intro: "Diese Richtlinie gilt für alle Nutzer von TokenAPI und ist Bestandteil unserer [Nutzungsbedingungen](/terms). Anfragen unterliegen außerdem den Nutzungsrichtlinien der Modellanbieter, die sie bedienen; sind diese strenger, gelten sie ebenfalls.",
    sections: [
      {
        h: "1. Verbotene Inhalte und Aktivitäten",
        p: ["Sie dürfen den Dienst nicht nutzen und anderen nicht dabei helfen, ihn zu nutzen, um:"],
        list: [
          "gegen Gesetze zu verstoßen oder rechtswidrige Aktivitäten zu ermöglichen;",
          "sexuelle Inhalte mit Minderjährigen oder Inhalte, die Kinder ausbeuten oder gefährden, zu erstellen, zu verbreiten oder anzufordern;",
          "Terrorismus oder gewalttätigen Extremismus zu fördern oder zu unterstützen oder zu Gewalt aufzustacheln;",
          "Menschen zu belästigen, zu bedrohen oder zu schikanieren oder Hass aufgrund geschützter Merkmale zu schüren;",
          "Schadsoftware zu entwickeln oder einzusetzen, in Systeme einzudringen oder die Sicherheit oder Verfügbarkeit eines Netzes oder Dienstes anzugreifen;",
          "Betrug, Phishing, Täuschungsmaschen oder Spam zu betreiben oder sich als Personen oder Organisationen auszugeben, um andere zu täuschen;",
          "biologische, chemische, nukleare oder radiologische Waffen oder andere Waffen mit Massenvernichtungspotenzial zu entwickeln oder zu beschaffen;",
          "irreführende Einflussoperationen oder Desinformationskampagnen durchzuführen, auch im Zusammenhang mit Wahlen;",
          "Rechte des geistigen Eigentums oder die Privatsphäre zu verletzen oder personenbezogene oder sensible Daten ohne Rechtsgrundlage zu erheben oder zu verarbeiten;",
          "vollautomatisierte Entscheidungen mit rechtlicher oder ähnlich erheblicher Wirkung für Menschen (zum Beispiel über Kredit, Beschäftigung, Wohnraum, Gesundheit oder Rechtsfragen) ohne angemessene menschliche Prüfung zu treffen.",
        ],
      },
      {
        h: "2. Missbrauch des Dienstes",
        p: ["Sie dürfen nicht:"],
        list: [
          "Ratenlimits, Ausgabenlimits, Authentifizierung oder Sicherheitsmaßnahmen umgehen, deaktivieren oder stören oder mehrere Konten nutzen, um Limits zu umgehen;",
          "API-Schlüssel weitergeben, verkaufen oder veröffentlichen oder den Dienst ohne unsere schriftliche Zustimmung als eigenständige API weiterverkaufen;",
          "Ausgaben zur Entwicklung konkurrierender Modelle verwenden, wenn die Bedingungen des Modellanbieters dies verbieten;",
          "den Dienst ohne Erlaubnis sondieren, scannen oder Lasttests unterziehen oder die Nutzung durch andere Kunden beeinträchtigen.",
        ],
      },
      {
        h: "3. Durchsetzung",
        p: [
          "Wir können mutmaßliche Verstöße untersuchen und je nach Schwere mit oder ohne Vorankündigung Anfragen blockieren, API-Schlüssel widerrufen oder Konten sperren oder schließen. Soweit gesetzlich vorgeschrieben, melden wir rechtswidrige Inhalte den Behörden. Guthaben von Konten, die wegen Verstößen geschlossen wurden, wird nicht erstattet.",
        ],
      },
      {
        h: "4. Missbrauch melden",
        p: [
          "Melden Sie Missbrauch oder Sicherheitslücken an [{abuseEmail}](mailto:{abuseEmail}). Geben Sie nach Möglichkeit die Anfrage-ID (`x-request-id`) an.",
        ],
      },
    ],
  },

  refund: {
    title: "Erstattungs- und Guthaben­richtlinie",
    description: "Wie Prepaid-Guthaben, Abbuchungen, Erstattungen, Abrechnungsfehler und der Verfall von Guthaben bei TokenAPI funktionieren.",
    intro: "TokenAPI wird über ein Prepaid-Guthaben bezahlt. Diese Richtlinie erläutert, wie Abbuchungen erfolgen, wann Geld erstattet werden kann und wann Guthaben verfällt. Sie ist Bestandteil unserer [Nutzungsbedingungen](/terms).",
    sections: [
      {
        h: "1. Prepaid-Guthaben",
        p: [
          "Aufladungen erfolgen in US-Dollar. Das Guthaben kann nur für die Nutzung von TokenAPI zu den auf der Seite [Modelle](/models) veröffentlichten Modellpreisen verwendet werden. Guthaben ist keine Bankeinlage, wird nicht verzinst und kann weder auf ein anderes Konto übertragen noch in Bargeld umgetauscht werden.",
        ],
      },
      {
        h: "2. So funktionieren Abbuchungen",
        list: [
          "Vor der Ausführung einer Anfrage werden deren maximal mögliche Kosten (Prompt + `max_tokens`) auf Ihrem Guthaben reserviert. Reicht das Guthaben nicht aus, wird die Anfrage abgelehnt und nichts berechnet.",
          "Nach Abschluss der Anfrage werden die tatsächlichen Tokens berechnet, und der Rest der Reservierung wird sofort freigegeben.",
          "Anfragen, die fehlschlagen, bevor das Modell zu antworten beginnt, werden nicht berechnet.",
          "Wird eine Streaming-Antwort abgebrochen oder unterbrochen, werden nur die erzeugten Tokens berechnet.",
        ],
      },
      {
        h: "3. Erstattungen",
        p: [
          "Zahlungen und Aufladungen sind endgültig und werden nicht erstattet, außer wenn das anwendbare Recht eine Erstattung vorschreibt (zum Beispiel aufgrund zwingender Verbraucherschutzrechte) oder wenn wir Ihr Konto aus eigenen Gründen und nicht wegen Ihres Verstoßes schließen; in diesem Fall erstatten wir das ungenutzte Guthaben.",
        ],
      },
      {
        h: "4. Abrechnungsfehler",
        p: [
          "Wenn Sie glauben, dass Ihnen etwas falsch berechnet wurde, wenden Sie sich innerhalb von {disputeDays} Tagen nach der Abbuchung an [{supportEmail}](mailto:{supportEmail}) und geben Sie die betreffenden Anfrage-IDs (`x-request-id`) an. Bestätigt sich der Fehler, schreiben wir den Betrag Ihrem Guthaben gut oder erstatten ihn bei einem Zahlungsfehler auf das ursprüngliche Zahlungsmittel.",
        ],
      },
      {
        h: "5. Verfall von Guthaben",
        p: [
          "Guthaben verfällt, wenn Ihr Konto {expiryMonths} aufeinanderfolgende Monate weder API-Nutzung noch Aufladungen aufweist. Wir benachrichtigen Sie mindestens {noticeDays} Tage vor dem Verfall per E-Mail; jede Nutzung oder Aufladung vor diesem Datum hält das Guthaben aktiv.",
        ],
      },
      {
        h: "6. Rückbuchungen",
        p: [
          "Bitte kontaktieren Sie uns, bevor Sie eine Zahlung bei Ihrer Bank anfechten. Bei einer Rückbuchung können wir das Konto während der Prüfung sperren. Unberechtigte Rückbuchungen können zur Schließung des Kontos führen.",
        ],
      },
      {
        h: "7. Kontoschließung",
        p: [
          "Sie können jederzeit die Schließung Ihres Kontos verlangen. Verbleibendes Guthaben verfällt bei der Schließung, es sei denn, das Gesetz schreibt eine Erstattung vor oder Abschnitt 3 ist anwendbar.",
        ],
      },
    ],
  },

  contact: {
    title: "Kontakt",
    description: "So erreichen Sie TokenAPI: Unternehmensangaben sowie Kontakte für Support, Datenschutz, Missbrauch und Rechtliches.",
    intro: "Wir antworten innerhalb von {days} Werktagen. Betrifft Ihr Anliegen eine bestimmte Anfrage, geben Sie bitte die Anfrage-ID aus dem Antwort-Header `x-request-id` an.",
    companyHeading: "Unternehmen",
    labels: { company: "Betreiber", jurisdiction: "Eingetragen in", address: "Anschrift" },
    channelsHeading: "Kontaktwege",
    channels: [
      { label: "Allgemein & Vertrieb", detail: "API-Schlüssel, Mengenpreise, Partnerschaften.", emailKey: "general" },
      { label: "Support & Abrechnung", detail: "Technische Probleme, Abbuchungen und Guthaben.", emailKey: "support" },
      { label: "Datenschutz", detail: "Anfragen zu Auskunft, Berichtigung und Löschung.", emailKey: "privacy" },
      { label: "Missbrauch & Sicherheit", detail: "Meldung von Missbrauch oder Sicherheitslücken.", emailKey: "abuse" },
      { label: "Rechtliches", detail: "Rechtliche Mitteilungen und Fragen zu den Bedingungen.", emailKey: "legal" },
    ],
    responseNote: "Senden Sie förmliche rechtliche Mitteilungen per E-Mail an die oben genannte Rechtsadresse.",
  },
};
