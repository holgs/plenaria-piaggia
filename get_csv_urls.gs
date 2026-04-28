// ============================================================
// GET_CSV_URLS.gs
// Google Apps Script — recupera i GID e costruisce i CSV_URLS
// Incolla nello STESSO progetto di crea_form_plenaria.gs
// e clicca ▶ Esegui su questa funzione (non sulla precedente)
// ============================================================

function getCsvUrls() {

  var ssId = "1wbDD08wgY9UX1fzROJUzQYawtRQ021CR8bSpQCF2b-w";
  var ss = SpreadsheetApp.openById(ssId);

  // Rende il foglio leggibile a chiunque abbia il link
  // (necessario per i CSV senza autenticazione)
  var file = DriveApp.getFileById(ssId);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log("✅ Foglio condiviso (chiunque con il link può visualizzare)");
  Logger.log("");

  var sheets = ss.getSheets();
  var csvUrls = {};
  var keyMap = ["d1","d2","d3","d4","d5","d6","d7"];
  var keyIdx = 0;

  Logger.log("Fogli trovati nel foglio di calcolo:");
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var name = sheet.getName();
    var gid = sheet.getSheetId();
    Logger.log("  [" + i + "] " + name + " — GID: " + gid);

    // Salta il foglio di default "Foglio1" se presente e vuoto
    if (name === "Foglio1" && sheet.getLastRow() < 2) {
      Logger.log("      (saltato — foglio vuoto di default)");
      continue;
    }

    if (keyIdx < keyMap.length) {
      var key = keyMap[keyIdx];
      var csvUrl = "https://docs.google.com/spreadsheets/d/" + ssId
                 + "/export?format=csv&gid=" + gid;
      csvUrls[key] = csvUrl;
      keyIdx++;
    }
  }

  Logger.log("");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("Incolla questo nel file PlenariaPiaggia.jsx:");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("");
  Logger.log("const CSV_URLS = {");
  for (var k in csvUrls) {
    Logger.log('  ' + k + ': "' + csvUrls[k] + '",');
  }
  Logger.log("};");
  Logger.log("");
  Logger.log("════════════════════════════════════════════════");
  Logger.log("✅ Fatto! Copia i CSV_URLS nel file .jsx e ricarica la pagina.");
  Logger.log("   La modalità DEMO si disattiverà automaticamente.");
  Logger.log("════════════════════════════════════════════════");
}
