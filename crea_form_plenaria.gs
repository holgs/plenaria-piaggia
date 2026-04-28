// ============================================================
// CREA_FORM_PLENARIA.gs
// Google Apps Script — crea 7 form + 1 foglio raccolta risposte
// ISI Piaggia · Plenaria Corso IA Avanzato
// ============================================================
// ISTRUZIONI:
//   1. Vai su https://script.google.com → "Nuovo progetto"
//   2. Cancella il codice di default, incolla TUTTO questo script
//   3. Clicca su ▶ Esegui (o Ctrl+R)
//   4. La prima volta chiede permessi → Accetta tutto
//   5. Aspetta ~30 secondi → apri il Log (Visualizza → Log)
//   6. Copia i CSV_URLS e i FORM_URLS dal log nel file PlenariaPiaggia.jsx
//   7. Pubblica il foglio sul web (istruzioni alla fine del log)
// ============================================================

function creaFormPlenaria() {

  // ── Crea il foglio raccolta risposte ──
  var ss = SpreadsheetApp.create("Plenaria Piaggia — Risposte");
  var ssId = ss.getId();
  Logger.log("✅ FOGLIO CREATO: " + ss.getUrl());
  Logger.log("   ID foglio: " + ssId);
  Logger.log("");

  // ── Definizione dei 7 form ──
  var forms = [
    {
      key: "d1",
      title: "D1 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "In una parola, com'è stata la tua esperienza con il corso?",
      type: "TEXT"
    },
    {
      key: "d2",
      title: "D2 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Quanto è cambiato il tuo approccio al lavoro? (1 = per niente · 5 = radicalmente)",
      type: "SCALE",
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: "Per niente",
      scaleMaxLabel: "Radicalmente"
    },
    {
      key: "d3",
      title: "D3 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Quale strumento hai usato di più durante il corso?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Claude / Cowork",
        "ChatGPT",
        "Google Gemini",
        "NotebookLM",
        "n8n / automazioni",
        "Nessuno di nuovo"
      ]
    },
    {
      key: "d4",
      title: "D4 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Cosa hai fatto con l'IA durante il corso? (puoi scegliere più opzioni)",
      type: "CHECKBOX",
      options: [
        "Documento di contesto (4D)",
        "Artefatti / vibe coding",
        "Knowledge base / wiki",
        "Skill personalizzata",
        "Workflow automatizzato",
        "Non ho ancora iniziato"
      ]
    },
    {
      key: "d5",
      title: "D5 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Cosa ti ha sorpreso di più durante il corso?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Quanto è semplice da usare",
        "Quanto sa fare da solo",
        "Quanto serve il contesto",
        "Il tempo che ci vuole",
        "I limiti che ha",
        "Non mi ha sorpreso"
      ]
    },
    {
      key: "d6",
      title: "D6 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Qual è la tua principale difficoltà? (puoi scegliere più opzioni)",
      type: "CHECKBOX",
      options: [
        "Manca il tempo",
        "Non so da dove iniziare",
        "Privacy e etica",
        "Resistenza colleghi / dirigenza",
        "Supporto tecnico insufficiente",
        "Non vedo utilità per la mia materia"
      ]
    },
    {
      key: "d7",
      title: "D7 · Plenaria Piaggia",
      desc: "Plenaria di Restituzione — Corso IA Avanzato · IIS Carlo Piaggia",
      question: "Cosa vorresti approfondire nel prossimo anno?",
      type: "MULTIPLE_CHOICE",
      options: [
        "Agenti IA",
        "Automazioni / n8n",
        "Prompt engineering avanzato",
        "Vibe coding",
        "Cowork e skill",
        "Valutazione critica degli output"
      ]
    }
  ];

  var results = {};

  // ── Crea ogni form e collegalo al foglio ──
  for (var i = 0; i < forms.length; i++) {
    var fd = forms[i];
    var form = FormApp.create(fd.title);
    form.setDescription(fd.desc);
    form.setCollectEmail(false);
    form.setLimitOneResponsePerUser(false);
    form.setShowLinkToRespondAgain(true);

    // Aggiunge la domanda giusta
    if (fd.type === "TEXT") {
      form.addTextItem().setTitle(fd.question).setRequired(false);
    }
    else if (fd.type === "SCALE") {
      form.addScaleItem()
        .setTitle(fd.question)
        .setBounds(fd.scaleMin, fd.scaleMax)
        .setLabels(fd.scaleMinLabel, fd.scaleMaxLabel)
        .setRequired(false);
    }
    else if (fd.type === "MULTIPLE_CHOICE") {
      var mcItem = form.addMultipleChoiceItem();
      mcItem.setTitle(fd.question);
      mcItem.setChoiceValues(fd.options);
      mcItem.setRequired(false);
    }
    else if (fd.type === "CHECKBOX") {
      var cbItem = form.addCheckboxItem();
      cbItem.setTitle(fd.question);
      cbItem.setChoiceValues(fd.options);
      cbItem.setRequired(false);
    }

    // Collega al foglio raccolta risposte
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);

    var formUrl = form.getPublishedUrl();
    var formShortUrl = form.shortenFormUrl(formUrl);
    var formEditUrl = form.getEditUrl();

    results[fd.key] = {
      formUrl: formShortUrl,
      editUrl: formEditUrl,
      title: fd.title
    };

    Logger.log("✅ " + fd.key.toUpperCase() + " — " + fd.title);
    Logger.log("   Form risposte: " + formShortUrl);
    Logger.log("   Form modifica: " + formEditUrl);
    Logger.log("");

    Utilities.sleep(1000); // pausa per evitare rate limit
  }

  // ── Log finale con le URL da copiare ──
  Logger.log("════════════════════════════════════════════════");
  Logger.log("STEP 1 — Incolla nel file PlenariaPiaggia.jsx:");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("");
  Logger.log("const FORM_URLS = {");
  for (var k in results) {
    Logger.log('  ' + k + ': "' + results[k].formUrl + '",');
  }
  Logger.log("};");
  Logger.log("");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("STEP 2 — Pubblica il foglio sul web:");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("1. Apri il foglio: " + ss.getUrl());
  Logger.log("2. File → Condividi → Pubblica sul web");
  Logger.log("3. Per OGNI foglio (D1-D7): seleziona il foglio → formato CSV → Pubblica");
  Logger.log("4. Copia ciascun URL e costruisci il CSV_URLS come segue:");
  Logger.log("");
  Logger.log("const CSV_URLS = {");
  Logger.log('  d1: "URL_CSV_D1",  // vedi foglio "Risposte modulo D1..."');
  Logger.log('  d2: "URL_CSV_D2",');
  Logger.log('  d3: "URL_CSV_D3",');
  Logger.log('  d4: "URL_CSV_D4",');
  Logger.log('  d5: "URL_CSV_D5",');
  Logger.log('  d6: "URL_CSV_D6",');
  Logger.log('  d7: "URL_CSV_D7",');
  Logger.log("};");
  Logger.log("");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("✅ FATTO! Apri il foglio per verificare i 7 sheet creati:");
  Logger.log(ss.getUrl());
  Logger.log("════════════════════════════════════════════════");
}
