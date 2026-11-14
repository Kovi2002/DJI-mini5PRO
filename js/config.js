/* ============================================================
   KoviFly — NASTAVITVE (edina datoteka, ki jo urejaš ročno)
   Vse, kar je null, se na strani NE prikaže (oz. piše "Cena po dogovoru").
   Vrednosti vpiši med narekovaje, npr.  operatorId: "SVN1234567890ab"
============================================================ */
window.KOVIFLY = {
  /* [VPIŠEM SAM] Okvirne cene paketov v EUR (samo številka, npr. 150) → prikaže "od 150 €" */
  prices: {
    foto: null,
    video: null,
    celota: null
  },

  /* [VPIŠEM SAM] Registracija in zavarovanje — prikaže se v sekciji Oprema in varnost */
  uas: {
    operatorId: null,   // registrska številka operaterja UAS (CAA / EU)
    pilotCert: null,    // npr. "A1/A3"
    insurance: null     // npr. "Zavarovalnica X, polica št. …"
  },

  /* [VPIŠEM SAM] Podatki za Pravno obvestilo in Politiko zasebnosti */
  business: {
    legalName: null,    // npr. "Luka Kovačič s.p." ali ime in priimek
    address: null,      // naslov
    taxId: null         // davčna / matična številka (če obstaja)
  }
};

/* Izpolni elemente [data-cfg] in [data-price] — deluje na vseh straneh */
(function () {
  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? null : o[k]; }, window.KOVIFLY);
  }
  function apply() {
    var en = document.documentElement.lang === "en";
    document.querySelectorAll("[data-cfg]").forEach(function (el) {
      var v = get(el.getAttribute("data-cfg"));
      if (v == null || v === "") return;
      var t = el.querySelector("[data-cfg-text]") || el;
      t.textContent = v;
      el.hidden = false;
    });
    document.querySelectorAll("[data-price]").forEach(function (el) {
      var v = get("prices." + el.getAttribute("data-price"));
      if (typeof v === "number" && v > 0) el.textContent = en ? "from €" + v : "od " + v + " €";
    });
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
