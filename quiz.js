/* ============================================================
   Shared quiz engine.
   A page provides window.QUIZ = { sections:[], bank:[], perRound:20 }
   Item shape: { s, en, hr:[before, after], o:[...], c, w }
   An empty hr means the options are whole sentences.
   ============================================================ */
(function () {
  var cfg = window.QUIZ;
  if (!cfg) return;

  var KEYS = ["A", "B", "C", "D", "E"];
  var GLAG = ["Ⰰ", "Ⰱ", "Ⰲ", "Ⰳ", "Ⰴ", "Ⰵ", "Ⰶ", "Ⰷ", "Ⰸ", "Ⰹ"];
  var perRound = Math.min(cfg.perRound || 20, cfg.bank.length);

  var root = document.getElementById("quiz");
  var round = [], idx = 0, score = 0, answered = false;
  var missed = [], per = [];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* shuffle options too, tracking where the right answer lands */
  function prepare(item) {
    var pairs = item.o.map(function (text, i) { return { text: text, ok: i === item.c }; });
    pairs = shuffle(pairs);
    return {
      src: item,
      opts: pairs.map(function (p) { return p.text; }),
      c: pairs.findIndex(function (p) { return p.ok; })
    };
  }

  function start() {
    round = shuffle(cfg.bank).slice(0, perRound).map(prepare);
    idx = 0; score = 0; missed = [];
    per = cfg.sections.map(function () { return { ok: 0, total: 0 }; });
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    var q = round[idx];
    var item = q.src;

    var sentence;
    if (item.hr && item.hr.length) {
      sentence = '<p class="target">' + item.hr[0] +
        '<u></u>' + (item.hr[1] || "") + "</p>";
    } else {
      sentence = "";
    }

    root.innerHTML =
      '<div class="quizbar">' +
        '<span class="count">' + (idx + 1) + " / " + round.length + "</span>" +
        '<span class="score">' + score + " correct</span>" +
      "</div>" +
      '<div class="progress"><i style="width:' + (idx / round.length * 100) + '%"></i></div>' +
      '<div class="qcard">' +
        '<p class="prompt">' + item.en + "</p>" +
        sentence +
        '<div class="opts" id="opts"></div>' +
        '<div id="why"></div>' +
      "</div>" +
      '<div class="btnrow" id="btnrow"></div>';

    var box = document.getElementById("opts");
    q.opts.forEach(function (text, i) {
      var b = document.createElement("button");
      b.className = "opt";
      b.type = "button";
      b.innerHTML = '<span class="key">' + KEYS[i] + "</span><span>" + text + "</span>";
      b.addEventListener("click", function () { answer(i); });
      box.appendChild(b);
    });
  }

  function answer(i) {
    if (answered) return;
    answered = true;

    var q = round[idx], item = q.src;
    var right = i === q.c;
    if (right) score++;
    else missed.push(q);

    if (per[item.s]) {
      per[item.s].total++;
      if (right) per[item.s].ok++;
    }

    var btns = document.querySelectorAll("#opts .opt");
    btns.forEach(function (b, j) {
      b.disabled = true;
      if (j === q.c) b.classList.add("correct");
      else if (j === i) b.classList.add("wrong");
      else b.classList.add("dim");
    });

    /* fill the blank in with the right answer */
    var u = root.querySelector(".target u");
    if (u) { u.textContent = q.opts[q.c]; u.className = "fill"; }

    document.getElementById("why").innerHTML = '<div class="why">' + item.w + "</div>";
    document.querySelector(".score").textContent = score + " correct";

    var row = document.getElementById("btnrow");
    row.innerHTML = '<button class="btn" id="next">' +
      (idx + 1 < round.length ? "Next" : "See results") + "</button>";
    document.getElementById("next").addEventListener("click", next);
    document.getElementById("next").focus();
  }

  function next() {
    idx++;
    if (idx < round.length) renderQuestion();
    else results();
  }

  function results() {
    var pct = Math.round(score / round.length * 100);
    var verdict =
      pct >= 90 ? "Sjajno. Move on to the next case." :
      pct >= 70 ? "Solid. Run it once more to lock it in." :
      pct >= 50 ? "Getting there. The endings need another pass." :
                  "Worth reading the reference page before the next round.";

    var bars = cfg.sections.map(function (name, i) {
      var p = per[i];
      if (!p.total) return "";
      return "<tr><th>" + name + "</th><td>" + p.ok + " / " + p.total + "</td></tr>";
    }).join("");

    var review = missed.length
      ? '<h3 class="sub">What slipped</h3><ul class="talk">' +
        missed.map(function (q) {
          var it = q.src;
          var line = (it.hr && it.hr.length)
            ? it.hr[0] + "<u>" + q.opts[q.c] + "</u>" + (it.hr[1] || "")
            : q.opts[q.c];
          return '<li><span class="hr">' + line + '</span>' +
                 '<span class="en">' + it.en + "</span></li>";
        }).join("") + "</ul>"
      : "";

    root.innerHTML =
      '<div class="card">' +
        '<div class="result">' +
          '<div class="glag">' + GLAG[Math.min(Math.floor(pct / 10), 9)] + "</div>" +
          '<p class="big">' + pct + "%</p>" +
          '<p class="of">' + score + " of " + round.length + "</p>" +
          '<p class="verdict">' + verdict + "</p>" +
        "</div>" +
        (bars ? '<h3 class="sub">By topic</h3><div class="scroll"><table><tbody>' + bars + "</tbody></table></div>" : "") +
        review +
        '<div class="btnrow">' +
          '<button class="btn" id="again">New round</button>' +
          '<a class="btn ghost" href="index.html">Home</a>' +
        "</div>" +
      "</div>";

    document.getElementById("again").addEventListener("click", start);
  }

  /* keyboard: A–E to answer, Enter/Space to advance */
  document.addEventListener("keydown", function (e) {
    if (!round.length) return;
    if (!answered) {
      var k = KEYS.indexOf(e.key.toUpperCase());
      var btns = document.querySelectorAll("#opts .opt");
      if (k > -1 && k < btns.length) { e.preventDefault(); btns[k].click(); }
    } else if (e.key === "Enter" || e.key === " ") {
      var n = document.getElementById("next");
      if (n) { e.preventDefault(); n.click(); }
    }
  });

  start();
})();
