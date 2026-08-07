/* NADA.EXE - vanilla 8-bit date quest */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const el = (t, c) => {
    const n = document.createElement(t);
    if (c) n.className = c;
    return n;
  };

  /* ---------------- AUDIO (WebAudio chiptune) ---------------- */
  const Sfx = (() => {
    let ac = null;
    let on = true;
    const ctx = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
    function tone(freq, dur, type, vol, when, slideTo) {
      if (!on) return;
      const a = ctx();
      const t = a.currentTime + (when || 0);
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    }
    function noise(dur, vol) {
      if (!on) return;
      const a = ctx();
      const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = a.createBufferSource();
      s.buffer = buf;
      const g = a.createGain();
      g.gain.value = vol || 0.14;
      s.connect(g).connect(a.destination);
      s.start();
    }
    return {
      toggle() {
        on = !on;
        return on;
      },
      blip: () => tone(660, 0.07, "square", 0.1),
      menu: () => {
        tone(520, 0.05);
        tone(780, 0.06, "square", 0.1, 0.05);
      },
      select: () => {
        tone(880, 0.05);
        tone(1320, 0.08, "square", 0.1, 0.05);
      },
      deny: () => {
        tone(300, 0.35, "sawtooth", 0.14, 0, 60);
        noise(0.25, 0.1);
      },
      boot: () => {
        [262, 330, 392, 523, 659].forEach((f, i) => tone(f, 0.12, "square", 0.12, i * 0.09));
        tone(1046, 0.4, "triangle", 0.12, 0.5);
      },
      victory: () => {
        const seq = [523, 659, 784, 1046, 784, 1046, 1318];
        seq.forEach((f, i) => tone(f, 0.16, "square", 0.13, i * 0.14));
        seq.forEach((f, i) => tone(f / 2, 0.16, "triangle", 0.08, i * 0.14));
      },
      boom: () => {
        noise(0.5, 0.2);
        tone(120, 0.5, "sawtooth", 0.12, 0, 40);
      },
      type: () => tone(1200, 0.02, "square", 0.05),
      save: () => {
        [392, 523, 659].forEach((f, i) => tone(f, 0.2, "triangle", 0.11, i * 0.18));
      },
    };
  })();

  $("#mute").addEventListener("click", function () {
    this.textContent = "SOUND: " + (Sfx.toggle() ? "ON" : "OFF");
  });

  /* ---------------- BACKGROUND ---------------- */
  const starsEl = $("#stars"),
    cloudsEl = $("#clouds"),
    catsEl = $("#cats"),
    fxEl = $("#fx");

  for (let i = 0; i < 60; i++) {
    const s = el("div", "star " + (i % 7 === 0 ? "c" : i % 11 === 0 ? "y" : ""));
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 90 + "%";
    s.style.animationDelay = (Math.random() * 1.2).toFixed(2) + "s";
    starsEl.appendChild(s);
  }
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    const c = el("div", "cloud");
    c.style.top = 20 + Math.random() * 220 + "px";
    c.x = Math.random() * window.innerWidth;
    c.sp = 0.4 + Math.random() * 0.7;
    c.style.transform = "translateX(" + c.x + "px)";
    cloudsEl.appendChild(c);
    clouds.push(c);
  }

  /* ---------------- PIXEL CATS ---------------- */
  const SCALE = 3;
  const catFrames = {};
  Object.keys(SPR.CAT).forEach((k) => (catFrames[k] = SPR.make(SPR.CAT[k], SCALE).toDataURL()));

  const cats = [];
  function spawnCat(forceSit) {
    if (cats.length > 5) return;
    const img = new Image();
    img.className = "cat";
    img.style.width = 12 * SCALE + "px";
    img.style.height = 9 * SCALE + "px";
    img.src = catFrames.walk1;
    const c = {
      node: img,
      x: Math.random() < 0.5 ? -40 : window.innerWidth + 40,
      dir: 0,
      sit: false,
      shock: 0,
      sleep: false,
      wave: false,
      f: 0,
    };
    c.dir = c.x < 0 ? 1 : -1;
    c.sitTimer = forceSit ? 0 : 600 + Math.random() * 900;
    img.style.bottom = 8 + Math.random() * 46 + "px";
    catsEl.appendChild(img);
    cats.push(c);
  }
  for (let i = 0; i < 3; i++) spawnCat();
  setInterval(() => {
    if (Math.random() < 0.6) spawnCat();
  }, 4200);

  let mouseX = window.innerWidth / 2;
  window.addEventListener("pointermove", (e) => (mouseX = e.clientX));

  function shockCats() {
    cats.forEach((c) => (c.shock = 40));
  }

  let tick = 0;
  function loop() {
    tick++;
    if (tick % 6 === 0) {
      // ~10 FPS choppy update
      clouds.forEach((c) => {
        c.x -= c.sp * 4;
        if (c.x < -110) c.x = window.innerWidth + 20;
        c.style.transform = "translateX(" + Math.round(c.x / 4) * 4 + "px)";
      });
      cats.forEach((c, i) => {
        c.f++;
        if (c.shock > 0) {
          c.shock--;
          c.node.src = catFrames.shock;
        } else if (c.sleep) {
          c.node.src = catFrames.sleep;
        } else if (c.wave) {
          c.node.src = c.f % 2 ? catFrames.wave : catFrames.sit;
        } else if (c.sit) {
          c.node.src = catFrames.sit;
          c.dir = mouseX > c.x ? 1 : -1;
          c.sitTimer--;
          if (c.sitTimer < -60) {
            c.sit = false;
            c.sitTimer = 400 + Math.random() * 800;
          }
        } else {
          c.x += c.dir * 5;
          c.node.src = c.f % 2 ? catFrames.walk1 : catFrames.walk2;
          c.sitTimer--;
          if (c.sitTimer <= 0 && Math.random() < 0.05) c.sit = true;
          if (c.x < -60 || c.x > window.innerWidth + 60) {
            c.node.remove();
            cats.splice(i, 1);
            return;
          }
        }
        c.node.style.transform =
          "translateX(" + Math.round(c.x / 4) * 4 + "px) scaleX(" + c.dir + ")";
      });
    }
    requestAnimationFrame(loop);
  }
  loop();

  /* ---------------- PIXEL FX ---------------- */
  const FXC = ["#ff4fbf", "#8b4dff", "#d8b9ff", "#fff8ff", "#4ff0ff", "#ffe14f"];
  function burst(x, y, n, spread) {
    for (let i = 0; i < n; i++) {
      const p = el("div", "confetti");
      p.style.background = FXC[(Math.random() * FXC.length) | 0];
      p.style.left = x + "px";
      p.style.top = y + "px";
      fxEl.appendChild(p);
      let vx = (Math.random() - 0.5) * (spread || 14),
        vy = -Math.random() * 12 - 2,
        px = x,
        py = y,
        life = 60;
      (function step() {
        life--;
        vy += 0.7;
        px += vx;
        py += vy;
        p.style.transform =
          "translate(" + Math.round((px - x) / 4) * 4 + "px," + Math.round((py - y) / 4) * 4 + "px)";
        if (life > 0 && py < window.innerHeight + 60) setTimeout(step, 90);
        else p.remove();
      })();
    }
  }
  function fireworks(times) {
    let i = 0;
    const t = setInterval(() => {
      burst(
        60 + Math.random() * (window.innerWidth - 120),
        60 + Math.random() * (window.innerHeight * 0.6),
        26,
        18,
      );
      Sfx.boom();
      if (++i >= (times || 6)) clearInterval(t);
    }, 420);
  }
  function shake() {
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
  }
  function flash(cb) {
    const f = $("#flash");
    f.classList.remove("go");
    void f.offsetWidth;
    f.classList.add("go");
    setTimeout(cb, 450);
  }

  /* ---------------- SCREENS ---------------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("on"));
    $(id).classList.add("on");
  }

  const state = { date: null, activity: null, time: null };

  /* TITLE */
  $("#startBtn").addEventListener("click", () => {
    Sfx.boot();
    flash(() => {
      show("#s-m1");
      startMission();
    });
  });

  /* MISSION 01 */
  function startMission() {
    $("#m1title").textContent = "MISSION 01";
    $("#m1ask").style.visibility = "hidden";
    $("#m1btns").style.visibility = "hidden";
    setTimeout(() => {
      Sfx.blip();
      $("#m1ask").style.visibility = "visible";
      $("#m1btns").style.visibility = "visible";
    }, 1600);
  }

  const NO_MSGS = [
    "Incorrect decision.",
    "Try again.",
    "System disagreement detected.",
    "That seems unlikely.",
    "Please reconsider.",
    "Calculating...",
    "Confidence decreasing.",
    "The cats are disappointed.",
    "This outcome seems impossible.",
    "Rebooting optimism.",
    "Please press the other button.",
    "Your answer appears corrupted.",
    "Loading better decision...",
    "Still thinking?",
    "Almost there.",
    "Interesting choice.",
    "No has been respectfully ignored.",
    "One more try.",
  ];
  let noCount = 0;
  $("#noBtn").addEventListener("click", () => {
    Sfx.deny();
    shake();
    shockCats();
    $("#m1title").textContent = NO_MSGS[noCount % NO_MSGS.length].toUpperCase();
    noCount++;
    const y = $("#yesBtn"),
      n = $("#noBtn");
    y.style.fontSize = Math.min(12 + noCount * 5, 76) + "px";
    y.style.padding = Math.min(14 + noCount * 5, 60) + "px " + Math.min(18 + noCount * 6, 70) + "px";
    n.style.fontSize = Math.max(12 - noCount * 0.55, 5) + "px";
    n.style.padding = Math.max(14 - noCount, 3) + "px " + Math.max(18 - noCount, 4) + "px";
  });

  $("#yesBtn").addEventListener("click", (e) => {
    Sfx.victory();
    burst(e.clientX, e.clientY, 60, 22);
    fireworks(7);
    for (let i = 0; i < 4; i++) spawnCat();
    flash(() => show("#s-win"));
  });

  $("#winNext").addEventListener("click", () => {
    Sfx.menu();
    show("#s-date");
  });

  /* CALENDAR */
  (function buildCal() {
    const now = new Date();
    const y = now.getFullYear(),
      m = now.getMonth();
    const months = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");
    $("#calMonth").textContent = months[m] + " " + y;
    const cal = $("#cal");
    "S M T W T F S".split(" ").forEach((d) => {
      const c = el("div", "dow");
      c.textContent = d;
      cal.appendChild(c);
    });
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) cal.appendChild(el("div", "dow"));
    for (let d = 1; d <= days; d++) {
      const c = el("div");
      c.textContent = d;
      c.addEventListener("click", () => {
        Sfx.select();
        cal.querySelectorAll("div").forEach((x) => x.classList.remove("sel"));
        c.classList.add("sel");
        state.date = months[m] + " " + d + ", " + y;
        $("#dateNext").style.display = "";
      });
      cal.appendChild(c);
    }
  })();
  $("#dateNext").addEventListener("click", () => {
    Sfx.menu();
    show("#s-act");
  });

  /* ACTIVITIES */
  (function buildActs() {
    const wrap = $("#acts");
    Object.keys(SPR.ICONS).forEach((name) => {
      const b = el("button", "card");
      const cv = SPR.make(SPR.ICONS[name], 4);
      b.appendChild(cv);
      b.appendChild(document.createTextNode(name));
      b.addEventListener("click", (e) => {
        Sfx.select();
        wrap.querySelectorAll(".card").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        state.activity = name;
        const r = b.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 16, 10);
        $("#actNext").style.display = "";
      });
      wrap.appendChild(b);
    });
  })();
  $("#actNext").addEventListener("click", () => {
    Sfx.menu();
    show("#s-time");
  });

  /* TIME */
  (function buildTimes() {
    const wrap = $("#times");
    ["MORNING", "AFTERNOON", "EVENING", "NIGHT"].forEach((t) => {
      const b = el("button");
      b.textContent = t;
      b.addEventListener("click", () => {
        Sfx.menu();
        wrap.querySelectorAll("button").forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        state.time = t;
        $("#timeNext").style.display = "";
      });
      wrap.appendChild(b);
    });
  })();
  $("#timeNext").addEventListener("click", () => {
    Sfx.menu();
    $("#questLog").innerHTML =
      "<b>PLAYER:</b> <span>NADA</span><br>" +
      "<b>PARTNER:</b> <span>ABDULAZIZ</span><br>" +
      "<b>MISSION:</b> <span>" +
      state.activity +
      "</span><br>" +
      "<b>DATE:</b> <span>" +
      state.date +
      "</span><br>" +
      "<b>TIME:</b> <span>" +
      state.time +
      "</span><br>" +
      "<b>REWARD:</b> <span>ONE UNFORGETTABLE DAY.</span><br>" +
      "<b>STATUS:</b> <span>READY</span>";
    show("#s-quest");
  });

  /* ENDING */
  $("#confirmBtn").addEventListener("click", () => {
    Sfx.save();
    fireworks(3);
    $("#fade").classList.add("on");
    setTimeout(() => {
      show("#s-end");
      $("#fade").classList.remove("on");
      document.getElementById("bg").style.filter = "brightness(0.35)";
      typeSeq();
    }, 700);
  });

  function typeLine(text, done) {
    const t = $("#endText");
    let i = 0;
    t.textContent = "";
    (function step() {
      if (i < text.length) {
        t.textContent += text[i++];
        Sfx.type();
        setTimeout(step, 90);
      } else setTimeout(done, 900);
    })();
  }

  function typeSeq() {
    typeLine("SAVING...", () =>
      typeLine("SAVE COMPLETE.", () =>
        typeLine("DATE SUCCESSFULLY SCHEDULED.", () => {
          Sfx.victory();
          gatherCats();
          setTimeout(rollCredits, 3200);
        }),
      ),
    );
  }

  function gatherCats() {
    cats.forEach((c) => {
      c.node.remove();
    });
    cats.length = 0;
    const mid = window.innerWidth / 2;
    const modes = ["wave", "sleep", "jump"];
    modes.forEach((m, i) => {
      spawnCat();
      const c = cats[cats.length - 1];
      c.x = mid - 90 + i * 70;
      c.sit = true;
      c.sitTimer = 99999;
      if (m === "wave") c.wave = true;
      if (m === "sleep") c.sleep = true;
      if (m === "jump") {
        setInterval(() => {
          c.node.style.marginBottom = c.node.style.marginBottom === "18px" ? "0px" : "18px";
        }, 160);
      }
    });
  }

  function rollCredits() {
    const c = $("#credits");
    $("#creditRoll").innerHTML = [
      "NADA.EXE",
      "",
      "CREATED WITH",
      "QUESTIONABLE PERSISTENCE",
      "",
      "SPECIAL THANKS",
      "",
      "NADA",
      "THE PIXEL CATS",
      "THE YES BUTTON",
      "",
      "THE END",
    ]
      .map((l) => "<div>" + l + "</div>")
      .join("");
    c.classList.add("on");
    setTimeout(() => {
      $("#fade").classList.add("on");
      setTimeout(() => {
        c.classList.remove("on");
        document.getElementById("bg").style.filter = "";
        noCount = 0;
        const y = $("#yesBtn"),
          n = $("#noBtn");
        y.style.cssText = "";
        n.style.cssText = "";
        show("#s-title");
        $("#fade").classList.remove("on");
      }, 700);
    }, 17000);
  }
})();
