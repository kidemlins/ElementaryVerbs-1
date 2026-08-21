/* ============================================================
   Shared bottom navigation + section menu + service worker.
   Injected on every page. Edit here, all pages follow.
   ============================================================ */
(function () {
  var SECTIONS = [
    { file: "genel.html",      glag: "Ⰰ", name: "The seven cases", desc: "All endings, one page" },
    { file: "daily.html",      glag: "Ⰱ", name: "Everyday talk",   desc: "What you'll actually hear" },
    { file: "padezi.html",     glag: "Ⰲ", name: "Where / where to", desc: "Accusative and locative" },
    { file: "genitiv.html",    glag: "Ⰳ", name: "Genitive",        desc: "Of, from, none of it" },
    { file: "dativ.html",      glag: "Ⰴ", name: "Dative",          desc: "Who you give it to" },
    { file: "imenice.html",    glag: "Ⰵ", name: "Nouns",           desc: "Gender and plurals" },
    { file: "adjectives.html", glag: "Ⰶ", name: "Adjectives",      desc: "50 words that agree" },
    { file: "verbtest.html",   glag: "Ⰷ", name: "Verbs",           desc: "105 verbs, present tense" },
    { file: "conjunctions.html", glag: "Ⰸ", name: "Conjunctions",  desc: "Because, so, however" }
  ];

  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* ---------- bottom bar ---------- */
  var bar = document.createElement("nav");
  bar.className = "eh-navbar";
  bar.innerHTML =
    '<button class="eh-nav-btn" id="eh-back" aria-label="Back">' +
      '<span class="ic">Ⰲ</span><span class="lb">Back</span></button>' +
    '<a class="eh-nav-btn" href="index.html" id="eh-home" aria-label="Home">' +
      '<span class="ic">Ⰰ</span><span class="lb">Home</span></a>' +
    '<button class="eh-nav-btn" id="eh-menu" aria-label="Sections" aria-expanded="false">' +
      '<span class="ic">Ⰱ</span><span class="lb">Sections</span></button>';
  document.body.appendChild(bar);

  /* ---------- menu sheet ---------- */
  var ovl = document.createElement("div");
  ovl.className = "eh-ovl";
  ovl.innerHTML =
    '<div class="eh-sheet" role="dialog" aria-label="Sections">' +
      '<div class="hd"><span>Sections</span>' +
      '<button id="eh-close" aria-label="Close">✕</button></div>' +
      '<div class="grid">' +
        SECTIONS.map(function (s) {
          return '<a class="cell' + (s.file === here ? " here" : "") + '" href="' + s.file + '">' +
            '<span class="glag">' + s.glag + '</span>' +
            '<h2>' + s.name + '</h2><p>' + s.desc + '</p></a>';
        }).join("") +
      '</div></div>';
  document.body.appendChild(ovl);

  /* ---------- behaviour ---------- */
  var back = document.getElementById("eh-back");
  if (here === "index.html" || here === "") {
    back.classList.add("hide");
    document.getElementById("eh-home").classList.add("on");
  } else {
    back.addEventListener("click", function () {
      if (history.length > 1) history.back();
      else location.href = "index.html";
    });
  }

  var btn = document.getElementById("eh-menu");
  function open() { ovl.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
  function close() { ovl.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", open);
  document.getElementById("eh-close").addEventListener("click", close);
  ovl.addEventListener("click", function (e) { if (e.target === ovl) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  /* ---------- offline ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
