/* Reusable pixel-art sprite sheets: tiny string maps rendered to canvases. */
(function () {
  const PAL = {
    ".": null,
    K: "#2b0b3a",
    W: "#fff8ff",
    P: "#ff4fbf",
    U: "#8b4dff",
    L: "#d8b9ff",
    C: "#4ff0ff",
    Y: "#ffe14f",
    G: "#3fdd5a",
    B: "#8a5a2b",
    R: "#ff3b3b",
  };

  // 12x9 cats, several frames
  const CAT = {
    walk1: [
      "..K.......K.",
      "..KK.....KK.",
      ".KWWKKKKKWWK",
      ".KWPWWWWWPWK",
      ".KWWKWWKWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWKK",
      "..K..K.K..K.",
      "............",
    ],
    walk2: [
      "..K.......K.",
      "..KK.....KK.",
      ".KWWKKKKKWWK",
      ".KWPWWWWWPWK",
      ".KWWKWWKWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWKK",
      ".K..KK...K..",
      "............",
    ],
    sit: [
      "..K.......K.",
      "..KK.....KK.",
      ".KWWKKKKKWWK",
      ".KWCWWWWWCWK",
      ".KWWKWWKWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWWK",
      ".KKKKKKKKKKK",
    ],
    shock: [
      "..K.......K.",
      ".KKK.....KKK",
      ".KWWKKKKKWWK",
      ".KWYWWWWWYWK",
      ".KWWKWWKWWWK",
      ".KWWWKKKWWWK",
      ".KWWWKKKWWWK",
      ".KWWWWWWWWKK",
      "..K..K.K..K.",
    ],
    sleep: [
      "............",
      "............",
      ".KKKKKKKKKK.",
      ".KWWWWWWWWK.",
      ".KWKKWWKKWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWWK",
      ".KKKKKKKKKKK",
      "............",
    ],
    wave: [
      "..K.......KY",
      "..KK.....KKY",
      ".KWWKKKKKWWK",
      ".KWPWWWWWPWK",
      ".KWWKWWKWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWWK",
      ".KWWWWWWWWWK",
      ".KKKKKKKKKKK",
    ],
  };

  const ICONS = {
    PICNIC: ["RRRRWWRR", "WWRRWWRR", "RRRRWWRR", "..GGGG..", ".GYYYYG.", ".GYYYYG.", "..GGGG..", "........"],
    "MOVIE NIGHT": ["KKKKKKKK", "KWKKKKWK", "KKKKKKKK", "KWWWWWWK", "KWWWWWWK", "KKKKKKKK", "KWKKKKWK", "KKKKKKKK"],
    SHOPPING: ["..K..K..", ".KKKKKK.", "KPPPPPPK", "KPWPPWPK", "KPPPPPPK", "KPWPPWPK", "KPPPPPPK", "KKKKKKKK"],
    DINNER: ["..W..W..", "W.W..W.W", "W.W..WWW", "WWW..W..", ".W...W..", ".W...W..", ".W...W..", "........"],
    ARCADE: ["KKKKKKKK", "KCCCCCCK", "KCKKKKCK", "KCCCCCCK", "KKYKKYKK", "KKKKKKKK", "KUUUUUUK", "KKKKKKKK"],
    COFFEE: ["........", "..W..W..", ".WWWWWW.", ".WBBBBWW", ".WBBBBW.", ".WBBBBW.", "..WWWW..", "........"],
    BOWLING: ["...W....", "..WWW...", "..WPW...", "..WWW...", ".KKKK...", "KKKKKK..", "KKKKKK..", ".KKKK..."],
    "ICE CREAM": ["..PPP...", ".PPPPP..", ".PPPPP..", "..YYY...", "..YYY...", "...Y....", "...Y....", "........"],
    SURPRISE: ["..YYYY..", ".YY..YY.", "....YY..", "...YY...", "...Y....", "........", "...Y....", "........"],
  };

  const HEART = ["..PP.PP.", ".PPPPPPP", ".PPPPPPP", "..PPPPP.", "...PPP..", "....P...", "........", "........"];

  function draw(ctx, map, scale, ox, oy) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const c = PAL[map[y][x]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(ox + x * scale, oy + y * scale, scale, scale);
      }
    }
  }

  function make(map, scale) {
    const cv = document.createElement("canvas");
    cv.width = map[0].length * scale;
    cv.height = map.length * scale;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    draw(ctx, map, scale, 0, 0);
    return cv;
  }

  window.SPR = { PAL, CAT, ICONS, HEART, make, draw };
})();
