import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================
// PLENARIA DI RESTITUZIONE — Corso IA Avanzato
// ISI Piaggia · Viareggio · 2 ore
// ============================================================
// SETUP FORM (crea 7 Google Form, uno per domanda):
//   D1 — Risposta breve    → wordcloud (una parola sull'esperienza)
//   D2 — Scala lineare 1–5 → scala (quanto è cambiato il tuo approccio)
//   D3 — Scelta multipla   → barre (strumento più usato)
//   D4 — Caselle controllo → barre (cosa hai fatto con l'IA)
//   D5 — Scelta multipla   → barre (cosa ti ha sorpreso)
//   D6 — Caselle controllo → barre (principale difficoltà)
//   D7 — Scelta multipla   → barre (cosa approfondire)
//
// DOPO AVER CREATO I FORM:
//   1. Pubblica ogni Sheet (File → Condividi → Pubblica sul web → CSV)
//   2. Sostituisci INCOLLA_CSV_DN con l'URL del CSV
//   3. Sostituisci INCOLLA_FORM_DN con l'URL breve del form
//   4. Ricarica la pagina → la modalità DEMO si disattiva automaticamente
// ============================================================

const PUBLISHED_ID = "2PACX-1vQ4PiFwvybWN2UefAUp8TKtNqh-PYI77JbcPKn510-ywy2zYKCrhPPcpDbzq_k1vtPaWYBcBdmyTKm0";
const PUB = (gid) => `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?gid=${gid}&single=true&output=csv`;

const CSV_URLS = {
  d1: PUB(1598829351),  // Form Responses 1 — una parola
  d2: PUB(430050420),   // Form Responses 2 — scala 1-5
  d3: PUB(2028398258),  // Form Responses 3 — strumento usato
  d4: PUB(1416285217),  // Form Responses 4 — cosa hai fatto
  d5: PUB(1735254327),  // Form Responses 5 — cosa ti ha sorpreso
  d6: PUB(124791360),   // Form Responses 6 — difficoltà
  d7: PUB(812338322),   // Form Responses 7 — cosa approfondire
};

const FORM_URLS = {
  d1: "https://forms.gle/kd3tv51G8itf7Ryr9",
  d2: "https://forms.gle/YbujYHjXQCeVk7Vi7",
  d3: "https://forms.gle/ufbRqaK7rZckWg5y8",
  d4: "https://forms.gle/PsxNvmvcTtAXKm5Z7",
  d5: "https://forms.gle/SsBeaKB5YCdruB4BA",
  d6: "https://forms.gle/uPpuQg7YDSr8MKqA8",
  d7: "https://forms.gle/F2drMchvMoToYrkM7",
};

const COVER_FORM_URL = FORM_URLS.d1;
const POLL_INTERVAL = 3000;

const C = {
  navy: "#1B3A5C", orange: "#E8732C", cream: "#FFF8F0", white: "#FEFCF9",
  lightNavy: "#2A5580", paleOrange: "#FDEBD3", gold: "#F5A623", teal: "#2A9D8F",
  coral: "#E76F51", purple: "#7B2D8E", green: "#2E7D32", dark: "#1a1a2e",
  bars: ["#E8732C","#2A9D8F","#1B3A5C","#E76F51","#7B2D8E","#F5A623","#2E7D32","#4A90D9"],
};

// ============================================================
// DATA LAYER
// ============================================================
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  return lines.slice(1).map(line => {
    const cols = []; let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  });
}

function useSheetData(url) {
  const [rows, setRows] = useState([]);
  const fetchData = useCallback(async () => {
    if (!url || url.includes("INCOLLA")) return;
    try {
      const sep = url.includes("?") ? "&" : "?";
      const res = await fetch(url + sep + "t=" + Date.now());
      const text = await res.text();
      const newRows = parseCSV(text);
      setRows(prev => newRows.length >= prev.length ? newRows : prev);
    } catch (e) { /* silent */ }
  }, [url]);
  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchData]);
  return rows;
}

function useAllPollData() {
  const d1 = useSheetData(CSV_URLS.d1);
  const d2 = useSheetData(CSV_URLS.d2);
  const d3 = useSheetData(CSV_URLS.d3);
  const d4 = useSheetData(CSV_URLS.d4);
  const d5 = useSheetData(CSV_URLS.d5);
  const d6 = useSheetData(CSV_URLS.d6);
  const d7 = useSheetData(CSV_URLS.d7);
  return {
    d1: d1.map(r => r[1] || ""),
    d2: d2.map(r => r[1] || ""),
    d3: d3.map(r => r[1] || ""),
    d4: d4.map(r => r[1] || ""),
    d5: d5.map(r => r[1] || ""),
    d6: d6.map(r => r[1] || ""),
    d7: d7.map(r => r[1] || ""),
  };
}

function generateDemoData() {
  const pools = {
    d1: ["crescita","sorpresa","curiosità","soddisfazione","entusiasmo","evoluzione","scoperta","sfida","utile","potente","confusione","pratico","lento","divertente","costruttivo","crescita","curiosità","soddisfazione","entusiasmo","utile"],
    d2: ["3","4","5","4","3","5","4","4","3","5","4","3","4","4","2","5","3","4","4","3"],
    d3: ["Claude / Cowork","ChatGPT","Google Gemini","ChatGPT","Claude / Cowork","NotebookLM","ChatGPT","Google Gemini","Claude / Cowork","n8n / automazioni","ChatGPT","Google Gemini"],
    d4: ["Documento di contesto (4D)","Artefatti / vibe coding","Documento di contesto (4D)","Knowledge base / wiki","Skill personalizzata","Artefatti / vibe coding","Documento di contesto (4D)","Non ho ancora iniziato","Artefatti / vibe coding","Workflow automatizzato"],
    d5: ["Quanto serve il contesto","Quanto sa fare da solo","Quanto è semplice da usare","Il tempo che ci vuole","Quanto sa fare da solo","Quanto serve il contesto","I limiti che ha","Quanto è semplice da usare","Quanto sa fare da solo","Quanto serve il contesto"],
    d6: ["Manca il tempo","Non so da dove iniziare","Manca il tempo","Privacy e etica","Manca il tempo","Supporto tecnico insufficiente","Non so da dove iniziare","Resistenza colleghi / dirigenza","Manca il tempo","Privacy e etica"],
    d7: ["Agenti IA","Prompt engineering avanzato","Agenti IA","Automazioni / n8n","Cowork e skill","Vibe coding","Agenti IA","Automazioni / n8n","Prompt engineering avanzato","Agenti IA"],
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const n = 18 + Math.floor(Math.random() * 12);
  const result = {};
  Object.entries(pools).forEach(([k, pool]) => {
    result[k] = Array.from({ length: n }, () => pick(pool));
  });
  return result;
}

// ============================================================
// QR CODE
// ============================================================
function QRCode({ url, size = 160 }) {
  if (!url || url.includes("INCOLLA")) {
    return <div style={{width:size,height:size,borderRadius:16,background:"#f0ede8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.navy+"88",fontFamily:"'DM Sans',sans-serif",textAlign:"center",padding:12}}>QR Code<br/>dopo setup</div>;
  }
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=FFFAF5&color=1B3A5C&margin=8`;
  return <img src={qr} alt="QR" style={{width:size,height:size,borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}} />;
}

// ============================================================
// VISUALIZATIONS
// ============================================================
function WordCloud({ words }) {
  const wc = useMemo(() => {
    const c = {};
    words.forEach(w => { const k = w.toLowerCase().trim(); if (k) c[k] = (c[k] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 35);
  }, [words]);
  if (!wc.length) return <EmptyViz />;
  const mx = wc[0]?.[1] || 1;
  const colors = [C.navy, C.orange, C.teal, C.coral, C.purple, C.gold, C.green, C.lightNavy];
  return (
    <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",gap:"10px 18px",padding:"20px 10px",minHeight:240}}>
      {wc.map(([w, cnt], i) => {
        const r = cnt / mx, sz = Math.max(16, Math.min(58, 16 + r * 42));
        return <span key={w} style={{fontSize:sz,fontWeight:r>.5?800:600,color:colors[i%colors.length],opacity:.5+r*.5,fontFamily:"'Playfair Display',Georgia,serif",display:"inline-block",animation:`fadeUp .5s ease ${i*.04}s both`}}>
          {w}{cnt > 1 && <sup style={{fontSize:sz*.3,opacity:.5,marginLeft:2}}>{cnt}</sup>}
        </span>;
      })}
    </div>
  );
}

function BarChart({ data, options }) {
  const counts = useMemo(() => {
    const c = {}; options.forEach(o => c[o] = 0);
    data.forEach(d => {
      const v = d.trim();
      if (!v) return;
      const parts = v.includes(";") ? v.split(";").map(s => s.trim()) :
                    v.includes(",") ? v.split(",").map(s => s.trim()) : [v];
      parts.forEach(part => {
        const m = options.find(o => o.toLowerCase() === part.toLowerCase() || part.toLowerCase().includes(o.toLowerCase().slice(0, 12)));
        if (m) c[m]++;
      });
    });
    return options.map(o => ({ label: o, count: c[o] || 0 }));
  }, [data, options]);
  const total = counts.reduce((s, c) => s + c.count, 0);
  const mx = Math.max(...counts.map(c => c.count), 1);
  if (!total) return <EmptyViz />;
  return (
    <div style={{padding:"8px 16px",maxWidth:700,margin:"0 auto",width:"100%"}}>
      {counts.map((item, i) => {
        const pct = total > 0 ? (item.count / total * 100) : 0;
        return <div key={item.label} style={{marginBottom:10,animation:`fadeUp .4s ease ${i*.06}s both`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:600,color:C.navy,fontFamily:"'DM Sans',sans-serif",maxWidth:"68%",lineHeight:1.3}}>{item.label}</span>
            <span style={{fontSize:18,fontWeight:800,color:C.bars[i%C.bars.length],fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{item.count} <span style={{fontSize:11,fontWeight:400,opacity:.5}}>({pct.toFixed(0)}%)</span></span>
          </div>
          <div style={{height:24,background:"#f0ede8",borderRadius:12,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:12,background:`linear-gradient(135deg,${C.bars[i%C.bars.length]},${C.bars[i%C.bars.length]}CC)`,width:`${item.count/mx*100}%`,transition:"width .8s cubic-bezier(.34,1.56,.64,1)"}}/>
          </div>
        </div>;
      })}
      <div style={{textAlign:"center",marginTop:8,fontSize:12,color:C.navy,opacity:.4}}>{total} risposte</div>
    </div>
  );
}

function ScaleChart({ data }) {
  const counts = useMemo(() => {
    const c = {1:0,2:0,3:0,4:0,5:0};
    data.forEach(d => { const n = parseInt(d); if (n >= 1 && n <= 5) c[n]++; });
    return c;
  }, [data]);
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  const mx = Math.max(...Object.values(counts), 1);
  const avg = total > 0 ? (Object.entries(counts).reduce((s, [k, v]) => s + parseInt(k) * v, 0) / total).toFixed(1) : "—";
  const colors = ["#2E7D32","#66BB6A","#FDD835","#FF9800","#E53935"];
  const labels = ["Per niente","Poco","Così così","Abbastanza","Molto"];
  if (!total) return <EmptyViz />;
  return (
    <div style={{textAlign:"center",padding:"10px 20px"}}>
      <div style={{fontSize:76,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1,marginBottom:2}}>{avg}</div>
      <div style={{fontSize:13,color:C.navy,opacity:.4,marginBottom:20,fontFamily:"'DM Sans',sans-serif"}}>media su {total} voti</div>
      <div style={{display:"flex",justifyContent:"center",gap:12,alignItems:"flex-end",minHeight:150}}>
        {[1,2,3,4,5].map((n, i) => {
          const h = mx > 0 ? (counts[n] / mx) * 120 + 16 : 16;
          return <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,animation:`fadeUp .5s ease ${i*.1}s both`}}>
            <span style={{fontSize:15,fontWeight:800,color:colors[i]}}>{counts[n]}</span>
            <div style={{width:50,height:h,borderRadius:8,background:`linear-gradient(180deg,${colors[i]},${colors[i]}BB)`,transition:"height .8s cubic-bezier(.34,1.56,.64,1)"}}/>
            <span style={{fontSize:22,fontWeight:900,color:C.navy}}>{n}</span>
            <span style={{fontSize:10,color:C.navy,opacity:.35,maxWidth:52,textAlign:"center",lineHeight:1.2}}>{labels[i]}</span>
          </div>;
        })}
      </div>
    </div>
  );
}

function EmptyViz() {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:180,gap:10}}>
    <div style={{width:48,height:48,borderRadius:"50%",background:C.paleOrange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,animation:"pulse 2s ease-in-out infinite"}}>📡</div>
    <p style={{fontSize:16,color:C.navy,opacity:.4,fontFamily:"'DM Sans',sans-serif"}}>In attesa delle risposte...</p>
  </div>;
}

// ============================================================
// SLIDE DEFINITIONS — struttura 2 ore
// ============================================================
// TEMPO INDICATIVO:
//   Cover + percorso + riassunto     → 10 min
//   Poll D1 wordcloud + discussione  → 10 min
//   Poll D2 scala                    →  5 min
//   --- PARTE 2: La vostra IA ---
//   Poll D3 + D4                     → 10 min
//   Condivisione dal vivo            → 20 min
//   Poll D5 sorprese                 →  8 min
//   --- PARTE 3: Resistenze ---
//   Poll D6 difficoltà               → 10 min
//   Discussione aperta               → 15 min
//   --- PARTE 4: Prossimi passi ---
//   Poll D7 approfondimenti          →  7 min
//   Idee + azione + chiusura         → 10 min  (pausa caffè: ~5 min nel mezzo)
// ============================================================

const SLIDES = [
  // ── APERTURA ──────────────────────────────────────────────
  { type: "cover" },

  { type: "content", icon: "🗓️", title: "Agenda · 2 ore", bullets: [
    "🎯  Apertura — Percorso e bilancio personale (20 min)",
    "🔍  La vostra IA — Strumenti, pratiche e sorprese (35 min)",
    "⚖️  Le resistenze — Difficoltà e discussione aperta (25 min)",
    "🚀  Prossimi passi — Dove andiamo da qui (20 min)",
    "🌍  Lo scenario globale — AI Index 2026 + scuola (15 min)",
    "✨  Chiusura (5 min)",
  ]},

  { type: "section", icon: "🗺️", title: "Il percorso",
    subtitle: "Tre sessioni per costruire un sistema" },

  { type: "content", icon: "📚", title: "Cosa abbiamo fatto\ninsieme", bullets: [
    "📌  Sessione 1 — Il metodo: Cold Start, framework 4D, Documento di Contesto Didattico",
    "   «Insegnare all'IA chi siete» — dal prompt generico al prompt che vi conosce",
    "📌  Sessione 2 — Costruire: vibe coding, Artifacts, Canvas, micro-strumenti su misura",
    "   «Dal chiedere al costruire» — senza scrivere codice, solo descrivendo cosa volete",
    "📌  Sessione 3 — Il sistema: knowledge base, skill, agenti autonomi",
    "   «Dal costruire al delegare» — un collaboratore IA che conosce la vostra pratica",
  ]},

  // ── POLL 1 — PAROLA ───────────────────────────────────────
  { type: "poll", pollType: "wordcloud", pollKey: "d1", icon: "💬",
    title: "In una parola:\ncom'è stata\nla tua esperienza?",
    subtitle: "Nessuna risposta giusta o sbagliata.",
    instruction: "Scansiona e scrivi una parola." },

  { type: "discussion", icon: "🗣️",
    title: "2 minuti con il vicino",
    prompt: "Dite ad alta voce la parola che avete scritto e spiegate perché.",
    subprompts: [
      "Cosa c'è dietro quella parola?",
      "È cambiata rispetto a come vi aspettavate che sarebbe stato il corso?",
    ],
    timer: "2 min · poi condivisione in plenaria" },

  // ── POLL 2 — SCALA ───────────────────────────────────────
  { type: "poll", pollType: "scale", pollKey: "d2", icon: "📈",
    title: "Quanto è cambiato\nil tuo approccio\nal lavoro?",
    subtitle: "1 = per niente · 5 = radicalmente",
    instruction: "Sii onesto/a — non ci sono risposte sbagliate." },

  // ── PARTE 2: LA VOSTRA IA ─────────────────────────────────
  { type: "section", icon: "🔍", title: "La vostra IA",
    subtitle: "Strumenti, pratiche e sorprese" },

  // ── POLL 3 — STRUMENTO ───────────────────────────────────
  { type: "poll", pollType: "bars", pollKey: "d3", icon: "🛠️",
    title: "Quale strumento\nhai usato di più\ndurante il corso?",
    subtitle: "Un solo strumento — il principale.",
    instruction: "Scansiona e rispondi.",
    options: [
      "Claude / Cowork",
      "ChatGPT",
      "Google Gemini",
      "NotebookLM",
      "n8n / automazioni",
      "Nessuno di nuovo",
    ]},

  // ── POLL 4 — COSA HAI FATTO ───────────────────────────────
  { type: "poll", pollType: "bars", pollKey: "d4", icon: "🏗️",
    title: "Cosa hai fatto\ncon l'IA durante\nil corso?",
    subtitle: "Puoi scegliere più opzioni (checkbox).",
    instruction: "Seleziona tutto ciò che hai provato.",
    options: [
      "Documento di contesto (4D)",
      "Artefatti / vibe coding",
      "Knowledge base / wiki",
      "Skill personalizzata",
      "Workflow automatizzato",
      "Non ho ancora iniziato",
    ]},

  // ── CONDIVISIONE DAL VIVO ─────────────────────────────────
  { type: "content", icon: "🎤", title: "Condivisione dal vivo",
    bullets: [
      "Chi vuole mostrare cosa ha costruito? (screen share o racconto)",
      " ",
      "🔴  Cosa avevi in mente quando hai iniziato ad usarlo?",
      "🟡  Cosa ha funzionato esattamente come speravi?",
      "🟢  Cosa ti ha sorpreso — in positivo o in negativo?",
      " ",
      "Nessuna aspettativa di perfezione: gli esperimenti che non funzionano insegnano di più.",
    ],
    footnote: "⏱  15 minuti · 3–4 persone · poi poll" },

  // ── POLL 5 — SORPRESE ────────────────────────────────────
  { type: "poll", pollType: "bars", pollKey: "d5", icon: "✨",
    title: "Cosa ti ha\nsorpreso di più?",
    subtitle: "La prima cosa che ti viene in mente.",
    instruction: "Una sola risposta.",
    options: [
      "Quanto è semplice da usare",
      "Quanto sa fare da solo",
      "Quanto serve il contesto",
      "Il tempo che ci vuole",
      "I limiti che ha",
      "Non mi ha sorpreso",
    ]},

  // ── PARTE 3: RESISTENZE ───────────────────────────────────
  { type: "section", icon: "⚖️", title: "Le resistenze",
    subtitle: "Lo diciamo ad alta voce" },

  // ── POLL 6 — DIFFICOLTÀ ───────────────────────────────────
  { type: "poll", pollType: "bars", pollKey: "d6", icon: "🧱",
    title: "Qual è la tua\nprincipale difficoltà?",
    subtitle: "Checkbox: seleziona tutto ciò che si applica.",
    instruction: "Onestà totale. Serve per capire come aiutarvi.",
    options: [
      "Manca il tempo",
      "Non so da dove iniziare",
      "Privacy e etica",
      "Resistenza colleghi / dirigenza",
      "Supporto tecnico insufficiente",
      "Non vedo utilità per la mia materia",
    ]},

  { type: "discussion", icon: "🗣️",
    title: "Discussione aperta",
    prompt: "Parliamo delle difficoltà che avete indicato. Chi vuole iniziare?",
    subprompts: [
      "C'è qualcosa che avete provato a risolvere? Come?",
      "C'è qualcosa che la scuola potrebbe fare per aiutare?",
      "C'è qualcosa che potete fare voi domani mattina?",
    ],
    timer: "15 min · moderazione aperta" },

  // ── PARTE 4: PROSSIMI PASSI ───────────────────────────────
  { type: "section", icon: "🚀", title: "Prossimi passi",
    subtitle: "Dove andiamo da qui" },

  // ── POLL 7 — APPROFONDIRE ────────────────────────────────
  { type: "poll", pollType: "bars", pollKey: "d7", icon: "🎯",
    title: "Cosa vorresti\napprofondire\nnel prossimo anno?",
    subtitle: "Aiuta a pianificare la prossima formazione.",
    instruction: "Una sola risposta — la priorità.",
    options: [
      "Agenti IA",
      "Automazioni / n8n",
      "Prompt engineering avanzato",
      "Vibe coding",
      "Cowork e skill",
      "Valutazione critica degli output",
    ]},

  // ── SCENARIO GLOBALE ─────────────────────────────────────
  { type: "section", icon: "🌍", title: "Lo scenario globale",
    subtitle: "Dove siamo arrivati e dove sta andando l'IA" },

  { type: "videos", icon: "🎬",
    title: "Un anno di salto quantico",
    subtitle: "Stessa celebrazione, IA completamente diversa",
    videos: [
      { year: "2025", label: "Capodanno Cinese 2025", url: "https://youtu.be/Fw_dSNxhhY4?si=fP0ZdabsiGJ93EJN" },
      { year: "2026", label: "Capodanno Cinese 2026", url: "https://youtu.be/mUmlv814aJo?si=rIZchOtiypfQyK-p" },
    ]},

  { type: "ideas", icon: "📊", area: "Stanford AI Index 2026 — I numeri", color: C.orange, ideas: [
    { t: "Coding: 60% → 100% in un anno", d: "Su un benchmark chiave di programmazione, le prestazioni hanno quasi raddoppiato in 12 mesi" },
    { t: "Agenti AI: 12% → 66%", d: "Di successo su task reali. In un anno. Falliscono ancora 1 su 3 — ma la direzione è chiara" },
    { t: "GenAI: adozione più rapida della storia", d: "53% globale in tre anni — più veloce di PC e internet. Valore mediano per utente triplicato nel 2026" },
    { t: "Investimenti USA: 285,9 mld$ (23x Cina)", d: "Ma i ricercatori AI verso gli USA sono calati dell'89% dal 2017. Denaro c'è, talenti no" },
  ]},

  { type: "ideas", icon: "🧭", area: "Stanford AI Index 2026 — Il quadro", color: C.purple, ideas: [
    { t: "La jagged frontier", d: "Medaglia d'oro alle Olimpiadi di matematica. Ma legge un orologio analogico solo il 50% delle volte. Geniale e stupida allo stesso tempo" },
    { t: "Gap USA-Cina: solo 2,7 punti", d: "I due paesi si sono alternati in testa. La concentrazione tecnologica è globale, non più unipolare" },
    { t: "Infrastruttura fragile", d: "5.427 data center USA (10x qualsiasi altro paese). Quasi tutti i chip AI avanzati: una sola fonderia, TSMC, in Taiwan" },
    { t: "50 punti di scarto", d: "73% degli esperti prevede impatto positivo sull'AI. Solo il 23% del pubblico concorda. Due pianeti diversi" },
  ]},

  { type: "ideas", icon: "🏫", area: "AI e Scuola — Il paradosso (Stanford 2026)", color: C.coral, ideas: [
    { t: "80% degli studenti usa AI ogni giorno", d: "Era il 40% nel 2023. A livello K-12 tra il 50% e l'84%. L'AI è già dentro le classi, con o senza permesso" },
    { t: "Solo il 6% trova le policy chiare", d: "La metà delle scuole non ha ancora una policy AI. Le istituzioni reagiscono più lentamente della pratica reale" },
    { t: "CS cala, AI cresce", d: "Iscrizioni a informatica -11%. Master in AI +17%. Non è un declino STEM: è una riallocazione verso l'AI" },
    { t: "L'AI entra in tre tempi", d: "Prima come strumento → poi come oggetto di studio → solo dopo come disciplina. Un ordine anomalo rispetto a tutte le rivoluzioni precedenti" },
  ]},

  { type: "ideas", icon: "🚀", area: "AI e Scuola — Le opportunità", color: C.teal, ideas: [
    { t: "Formazione docenti: gap enorme", d: "Nessuno standard nazionale, qualità dipende dalle risorse locali. Lo spazio per chi forma i docenti è immenso — e urgente" },
    { t: "Tre livelli da tenere distinti", d: "AI in education (usare strumenti) ≠ AI literacy (capire come funziona) ≠ AI education (costruire sistemi). Confonderli è il rischio principale" },
    { t: "L'apprendimento si disintermedia", d: "Skill AI crescono più velocemente fuori dalla scuola (corsi, certificati, lavoro). La scuola può scegliere di guidare o seguire" },
    { t: "Equità come priorità progettuale", d: "Gap persistente per genere, etnia, reddito. Chi forma i docenti può amplificare o ridurre queste disuguaglianze sistemiche" },
  ]},

  { type: "bigtext", icon: "✨",
    text: "Non serve essere esperti.\nServe essere curiosi.",
    subtitle: "E voi lo siete già dimostrato." },

  { type: "closing" },
];

// ============================================================
// SLIDE RENDERERS
// ============================================================
function CoverSlide() {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",gap:12}}>
    <div style={{fontSize:15,fontWeight:600,color:C.orange,letterSpacing:".15em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .6s ease .1s both"}}>ISI Piaggia · Viareggio</div>
    <h1 style={{fontSize:50,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.1,maxWidth:740,margin:"8px 0",letterSpacing:"-.02em",animation:"fadeUp .6s ease .2s both"}}>Plenaria di Restituzione<br/>Corso IA Avanzato</h1>
    <div style={{width:80,height:4,borderRadius:2,background:C.orange,margin:"8px 0",animation:"fadeUp .6s ease .3s both"}}/>
    <p style={{fontSize:19,color:C.navy,opacity:.5,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .6s ease .4s both"}}>Condivisione · Bilancio · Prossimi passi · 2 ore</p>
    <p style={{fontSize:16,fontWeight:700,color:C.navy,opacity:.7,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .6s ease .45s both"}}>prof. Holger Ferrero</p>
    <div style={{marginTop:16,animation:"fadeUp .6s ease .5s both"}}>
      <QRCode url={COVER_FORM_URL} size={155} />
      <p style={{fontSize:12,color:C.navy,opacity:.35,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Scansiona per partecipare ai sondaggi</p>
    </div>
  </div>;
}

function ContentSlide({ slide }) {
  return <div style={{display:"flex",flexDirection:"column",justifyContent:"center",height:"100%",padding:"0 56px",maxWidth:920,margin:"0 auto"}}>
    <div style={{fontSize:44,marginBottom:8,animation:"fadeUp .4s ease both"}}>{slide.icon}</div>
    <h2 style={{fontSize:38,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,whiteSpace:"pre-line",marginBottom:24,letterSpacing:"-.02em",animation:"fadeUp .5s ease .1s both"}}>{slide.title}</h2>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {slide.bullets.map((b, i) => (
        <p key={i} style={{fontSize:19,color:b.trim()===""?"transparent":C.navy,opacity:b.startsWith("  ")?0.5:0.8,fontFamily:"'DM Sans',sans-serif",fontWeight:b.startsWith("  ")?400:500,paddingLeft:b.startsWith("  ")?18:0,lineHeight:1.4,animation:`fadeUp .4s ease ${.12+i*.06}s both`}}>{b}</p>
      ))}
    </div>
    {slide.footnote && <p style={{marginTop:24,fontSize:14,color:C.orange,fontWeight:600,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .5s ease .7s both"}}>{slide.footnote}</p>}
  </div>;
}

function BigTextSlide({ slide }) {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",padding:"0 40px"}}>
    <div style={{fontSize:54,marginBottom:14,animation:"fadeUp .5s ease both"}}>{slide.icon}</div>
    <h2 style={{fontSize:48,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,whiteSpace:"pre-line",maxWidth:820,letterSpacing:"-.02em",animation:"fadeUp .6s ease .1s both"}}>{slide.text}</h2>
    {slide.subtitle && <p style={{fontSize:22,color:C.navy,opacity:.5,marginTop:20,fontFamily:"'DM Sans',sans-serif",maxWidth:600,animation:"fadeUp .5s ease .3s both"}}>{slide.subtitle}</p>}
  </div>;
}

function SectionSlide({ slide }) {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center"}}>
    <div style={{fontSize:62,marginBottom:14,animation:"fadeUp .5s ease both"}}>{slide.icon}</div>
    <h2 style={{fontSize:54,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",letterSpacing:"-.02em",animation:"fadeUp .6s ease .15s both"}}>{slide.title}</h2>
    <p style={{fontSize:23,color:C.orange,fontWeight:600,marginTop:8,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .5s ease .3s both"}}>{slide.subtitle}</p>
  </div>;
}

// Slide dedicata alla discussione tra colleghi
function DiscussionSlide({ slide }) {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",padding:"0 50px"}}>
    <div style={{fontSize:54,marginBottom:14,animation:"fadeUp .4s ease both"}}>{slide.icon}</div>
    <h2 style={{fontSize:40,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,marginBottom:20,letterSpacing:"-.02em",animation:"fadeUp .5s ease .1s both"}}>{slide.title}</h2>
    <div style={{background:`${C.orange}12`,border:`2px solid ${C.orange}30`,borderRadius:18,padding:"24px 40px",maxWidth:760,marginBottom:20,animation:"fadeUp .5s ease .2s both"}}>
      <p style={{fontSize:22,fontWeight:600,color:C.navy,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,margin:0}}>{slide.prompt}</p>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:680}}>
      {slide.subprompts.map((sp, i) => (
        <p key={i} style={{fontSize:17,color:C.navy,opacity:.65,fontFamily:"'DM Sans',sans-serif",animation:`fadeUp .4s ease ${.3+i*.08}s both`}}>→ {sp}</p>
      ))}
    </div>
    <div style={{marginTop:24,padding:"8px 20px",background:C.navy,borderRadius:20,animation:"fadeUp .4s ease .6s both"}}>
      <p style={{fontSize:14,color:C.orange,fontWeight:700,fontFamily:"'DM Sans',sans-serif",margin:0}}>⏱ {slide.timer}</p>
    </div>
  </div>;
}

function PollSlide({ slide, pollData }) {
  const colData = pollData[slide.pollKey] || [];
  const formUrl = FORM_URLS[slide.pollKey] || COVER_FORM_URL;
  const totalResponses = colData.length;
  return <div style={{display:"flex",height:"100%",gap:0}}>
    <div style={{width:"34%",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"18px 20px",textAlign:"center",borderRight:`2px solid ${C.navy}0A`}}>
      <div style={{fontSize:38,marginBottom:8}}>{slide.icon}</div>
      <h2 style={{fontSize:24,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,whiteSpace:"pre-line",marginBottom:8,letterSpacing:"-.01em"}}>{slide.title}</h2>
      <p style={{fontSize:13,color:C.navy,opacity:.45,marginBottom:18,fontFamily:"'DM Sans',sans-serif"}}>{slide.subtitle}</p>
      <QRCode url={formUrl} size={150} />
      <p style={{fontSize:13,color:C.orange,fontWeight:700,marginTop:10,fontFamily:"'DM Sans',sans-serif"}}>{slide.instruction}</p>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"10px 16px",overflow:"auto"}}>
      <div style={{fontSize:12,fontWeight:600,color:C.navy,opacity:.3,textAlign:"right",marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>{totalResponses} risposte · live</div>
      {slide.pollType === "wordcloud" && <WordCloud words={colData} />}
      {slide.pollType === "bars"      && <BarChart data={colData} options={slide.options} />}
      {slide.pollType === "scale"     && <ScaleChart data={colData} />}
    </div>
  </div>;
}

function IdeasSlide({ slide }) {
  return <div style={{display:"flex",flexDirection:"column",justifyContent:"center",height:"100%",padding:"0 50px",maxWidth:960,margin:"0 auto"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,animation:"fadeUp .4s ease both"}}>
      <span style={{fontSize:34}}>{slide.icon}</span>
      <h2 style={{fontSize:34,fontWeight:900,color:slide.color,fontFamily:"'Playfair Display',Georgia,serif"}}>{slide.area}</h2>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 22px"}}>
      {slide.ideas.map((idea, i) => (
        <div key={i} style={{padding:"16px 18px",borderRadius:14,background:slide.color+"0A",borderLeft:`4px solid ${slide.color}`,animation:`fadeUp .4s ease ${.1+i*.06}s both`}}>
          <p style={{fontSize:17,fontWeight:700,color:C.navy,margin:"0 0 5px",fontFamily:"'DM Sans',sans-serif"}}>{idea.t}</p>
          <p style={{fontSize:14,color:C.navy,opacity:.55,margin:0,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{idea.d}</p>
        </div>
      ))}
    </div>
  </div>;
}

function VideosSlide({ slide }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const embedIds = ["Fw_dSNxhhY4", "mUmlv814aJo"];
  const accentColors = [C.navy, C.orange];

  if (activeIdx !== null) {
    const v = slide.videos[activeIdx];
    return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 32px",textAlign:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
        <span style={{fontSize:22,fontWeight:700,color:accentColors[activeIdx],fontFamily:"'DM Sans',sans-serif",letterSpacing:".1em",textTransform:"uppercase"}}>{v.year} — {v.label}</span>
        <button onClick={(e)=>{e.stopPropagation();setActiveIdx(null);}} style={{background:`${C.navy}15`,border:"none",borderRadius:20,padding:"4px 14px",fontSize:13,fontWeight:700,color:C.navy,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ chiudi</button>
      </div>
      <iframe
        src={`https://www.youtube.com/embed/${embedIds[activeIdx]}?autoplay=1`}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        style={{width:"min(860px,90%)",height:"min(480px,55vh)",borderRadius:18,border:`2px solid ${accentColors[activeIdx]}40`,boxShadow:"0 12px 48px rgba(0,0,0,0.18)"}}
      />
      <div style={{display:"flex",gap:16,marginTop:16}}>
        {slide.videos.map((_, i) => (
          <button key={i} onClick={(e)=>{e.stopPropagation();setActiveIdx(i);}} style={{padding:"6px 20px",borderRadius:20,border:`2px solid ${accentColors[i]}`,background:i===activeIdx?accentColors[i]:"transparent",color:i===activeIdx?"white":accentColors[i],fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all .2s"}}>
            ▶ {slide.videos[i].year}
          </button>
        ))}
      </div>
    </div>;
  }

  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",padding:"0 44px",textAlign:"center"}}>
    <div style={{fontSize:44,marginBottom:8,animation:"fadeUp .4s ease both"}}>{slide.icon}</div>
    <h2 style={{fontSize:38,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,marginBottom:6,letterSpacing:"-.02em",animation:"fadeUp .5s ease .1s both"}}>{slide.title}</h2>
    <p style={{fontSize:17,color:C.navy,opacity:.5,fontFamily:"'DM Sans',sans-serif",marginBottom:36,animation:"fadeUp .4s ease .2s both"}}>{slide.subtitle}</p>
    <div style={{display:"flex",gap:28,justifyContent:"center"}}>
      {slide.videos.map((v, i) => (
        <button key={i} onClick={(e)=>{e.stopPropagation();setActiveIdx(i);}}
          style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"28px 40px",background:i===0?`${C.navy}08`:`${C.orange}10`,borderRadius:22,border:`2px solid ${accentColors[i]}40`,cursor:"pointer",animation:`fadeUp .5s ease ${.2+i*.15}s both`,transition:"transform .2s,box-shadow .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 36px ${accentColors[i]}30`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:accentColors[i]}}>{v.year}</div>
          <div style={{width:90,height:90,borderRadius:"50%",background:accentColors[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,color:"white",boxShadow:`0 6px 24px ${accentColors[i]}50`}}>▶</div>
          <p style={{fontSize:16,fontWeight:700,color:C.navy,fontFamily:"'DM Sans',sans-serif",margin:0,maxWidth:200}}>{v.label}</p>
          <p style={{fontSize:12,color:accentColors[i],fontWeight:600,fontFamily:"'DM Sans',sans-serif",margin:0}}>Clicca per guardare</p>
        </button>
      ))}
    </div>
    <p style={{fontSize:13,color:C.navy,opacity:.3,marginTop:24,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .4s ease .6s both"}}>Confrontate la differenza in un anno</p>
  </div>;
}

function ClosingSlide() {
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",textAlign:"center",gap:14}}>
    <div style={{fontSize:62,animation:"fadeUp .5s ease both"}}>🙏</div>
    <h2 style={{fontSize:48,fontWeight:900,color:C.navy,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.15,letterSpacing:"-.02em",animation:"fadeUp .6s ease .1s both"}}>Grazie.</h2>
    <p style={{fontSize:22,color:C.navy,opacity:.5,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .5s ease .2s both"}}>Il corso finisce. La sperimentazione no.</p>
    <div style={{width:80,height:4,borderRadius:2,background:C.orange,margin:"8px 0",animation:"fadeUp .5s ease .3s both"}}/>
    <p style={{fontSize:20,color:C.orange,fontWeight:700,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .5s ease .4s both"}}>ISI Piaggia · Viareggio</p>
    <p style={{fontSize:16,fontWeight:600,color:C.navy,opacity:.6,fontFamily:"'DM Sans',sans-serif",animation:"fadeUp .5s ease .5s both"}}>prof. Holger Ferrero</p>
  </div>;
}

// ============================================================
// MAIN APP
// ============================================================
export default function PlenariaPiaggia() {
  const [current, setCurrent] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [demoPollData, setDemoPollData] = useState(() => generateDemoData());
  const livePollData = useAllPollData();

  useEffect(() => {
    if (!demoMode) return;
    const iv = setInterval(() => setDemoPollData(generateDemoData()), 4000);
    return () => clearInterval(iv);
  }, [demoMode]);

  const pollData = demoMode ? demoPollData : livePollData;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault(); setCurrent(c => Math.min(c + 1, SLIDES.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault(); setCurrent(c => Math.max(c - 1, 0));
      } else if (e.key === "d" || e.key === "D") { setDemoMode(d => !d); }
      else if (e.key === "Home") { setCurrent(0); }
      else if (e.key === "End") { setCurrent(SLIDES.length - 1); }
      else if (e.key === "f" || e.key === "F") { document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const slide = SLIDES[current];

  const renderSlide = () => {
    switch (slide.type) {
      case "cover":      return <CoverSlide />;
      case "content":    return <ContentSlide slide={slide} />;
      case "bigtext":    return <BigTextSlide slide={slide} />;
      case "section":    return <SectionSlide slide={slide} />;
      case "discussion": return <DiscussionSlide slide={slide} />;
      case "poll":       return <PollSlide slide={slide} pollData={pollData} />;
      case "ideas":      return <IdeasSlide slide={slide} />;
      case "videos":     return <VideosSlide slide={slide} />;
      case "closing":    return <ClosingSlide />;
      default: return null;
    }
  };

  // Pallino di colore per tipo slide
  const dotColor = (s, isActive) => {
    if (isActive) return C.orange;
    if (s.type === "section") return `${C.navy}55`;
    if (s.type === "poll") return `${C.teal}55`;
    if (s.type === "discussion") return `${C.coral}55`;
    return `${C.navy}22`;
  };

  return (
    <div
      style={{width:"100vw",height:"100vh",overflow:"hidden",background:`linear-gradient(170deg,${C.cream} 0%,${C.white} 50%,white 100%)`,position:"relative",fontFamily:"'DM Sans',sans-serif",cursor:"none"}}
      onClick={(e) => {
        const x = e.clientX / window.innerWidth;
        if (x > 0.65) setCurrent(c => Math.min(c + 1, SLIDES.length - 1));
        else if (x < 0.35) setCurrent(c => Math.max(c - 1, 0));
      }}
    >
      <div style={{position:"absolute",top:-100,right:-100,width:350,height:350,borderRadius:"50%",background:C.paleOrange,opacity:.3,filter:"blur(80px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-60,left:-60,width:250,height:250,borderRadius:"50%",background:`${C.navy}0D`,filter:"blur(60px)",pointerEvents:"none"}}/>

      {/* Progress bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`${C.navy}11`,zIndex:100}}>
        <div style={{height:"100%",background:C.orange,width:`${((current+1)/SLIDES.length)*100}%`,transition:"width .4s ease",borderRadius:"0 2px 2px 0"}}/>
      </div>

      {/* Header */}
      <div style={{position:"absolute",top:12,left:24,right:24,display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:50,opacity:.6}}>
        <span style={{fontSize:10,fontWeight:600,color:C.navy}}>ISI Piaggia · Corso IA Avanzato · Sessione conclusiva · prof. Holger Ferrero</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {demoMode && <span style={{background:C.orange,color:"white",padding:"2px 10px",borderRadius:12,fontSize:11,fontWeight:700}}>DEMO</span>}
          <span style={{fontSize:12,color:C.navy}}>{current+1}/{SLIDES.length}</span>
        </div>
      </div>

      {/* Slide content */}
      <div key={current} style={{position:"absolute",top:36,left:0,right:0,bottom:36,display:"flex",flexDirection:"column"}}>
        {renderSlide()}
      </div>

      {/* Navigation dots */}
      <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,zIndex:50}}>
        {SLIDES.map((s, i) => (
          <div key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} style={{
            width:current===i?24:6, height:6, borderRadius:3, cursor:"pointer",
            background:dotColor(s, current===i), transition:"all .3s ease"
          }}/>
        ))}
      </div>

      {current === 0 && <div style={{position:"absolute",bottom:24,right:24,fontSize:11,color:C.navy,opacity:.2,zIndex:50}}>
        ← → naviga · F fullscreen · D demo
      </div>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.05)} }
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.navy}22;border-radius:2px}
      `}</style>
    </div>
  );
}
