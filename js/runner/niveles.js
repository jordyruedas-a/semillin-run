/* =========================================================
   SEMILLÍN RUN · NIVELES (14 mundos × 6 problemas)
   Cada mundo es un tema práctico del curso (apuntes del profesor de
   Modelado y Simulación de Sistemas Dinámicos) y tiene 6 problemas;
   al entrar se elige uno al azar. Cada problema es una variante de un
   ejemplo o ejercicio de clase: mismo procedimiento, misma fórmula y
   mismo formato de tabla, con otros datos.
   El juego da los datos (semilla, números rectangulares, α, λ…) y el
   jugador resuelve la tabla celda por celda eligiendo el tubo correcto.
   Los textos usan $…$ para las fórmulas (KaTeX en el juego y ecuaciones
   de Word en los documentos); \$ es un signo de pesos.
   Este archivo solo contiene datos y cálculos: se puede probar en Node.
   ========================================================= */
(function (raiz) {
  "use strict";
  var T = String.raw;

  /* ---------- Formato ---------- */
  function rd(v, d) { var p = Math.pow(10, d === undefined ? 6 : d); return Math.round(v * p) / p; }
  function fx(v, d) { if (typeof v !== "number") return String(v); var s = rd(v, d === undefined ? 6 : d).toString(); return s === "-0" ? "0" : s; }
  function f5(v) { return v.toFixed(5); }
  function pesos(v) { return "\\$" + v.toFixed(2); }
  function suma(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
  function fr(a, b) { return T`$\frac{${a}}{${b}}$`; }
  function pct(a) { return fx(a * 100, 2) + "\\%"; }

  /* Tubo falso: el primer error típico cuyo texto no coincide con la respuesta. */
  function falso(ok, dec, cands) {
    var t = fx(ok, dec);
    for (var i = 0; i < (cands || []).length; i++) { var c = cands[i]; if (typeof c === "number" && isFinite(c) && fx(c, dec) !== t) return c; }
    return rd(ok + (Math.abs(ok) >= 1 ? 1 : 0.1), dec === undefined ? 6 : dec);
  }

  /* Paso del juego.
     t: título · fg: fórmula de clase (es lo único que se muestra al preguntar) · f: sustitución (se muestra al acertar)
     pide: lo que se calcula · ok: respuesta · mal / males: tubo falso (error típico)
     fila(s): renglones que se agregan a la tabla al acertar · ver: columnas visibles antes de acertar · col: celda que se pide
     pon: [[renglón, columna, valor]] celdas de renglones ya existentes · seg: segundos base · tabla: tabla del botón Tablas */
  function P(o) {
    if (o.fila && !Array.isArray(o.fila[0])) o.filas = [o.fila]; else o.filas = o.fila || [];
    delete o.fila;
    o.tipo = typeof o.ok === "number" ? "num" : "opcion";
    if (o.seg) o.seg = TIEMPO[o.seg] || o.seg;
    if (o.tipo === "num" && o.mal === undefined) o.mal = falso(o.ok, o.dec, o.males);
    delete o.males;
    o.okTxt = o.tipo === "num" ? (o.pesos ? pesos(o.ok) : fx(o.ok, o.dec)) : o.ok;
    o.malTxt = typeof o.mal === "number" ? (o.pesos ? pesos(o.mal) : fx(o.mal, o.dec)) : o.mal;
    return o;
  }
  /* Pregunta del jefe final: q, tubo correcto, tubo falso, fórmula o regla de clase, tabla que abre el botón Tablas. */
  /* Segundos base de cada celda: 30 s las sencillas y hasta 3 min las más largas (antes de sumar las monedas). */
  var TIEMPO = { 25: 30, 30: 30, 35: 45, 40: 60, 45: 60, 50: 75, 55: 90, 60: 90, 70: 120, 75: 120, 80: 150, 90: 180 };
  function J(q, ok, mal, fg, tabla) { return { q: q, ok: ok, mal: mal, fg: fg, tabla: tabla }; }
  function conFilas(q, filas) { q.filas = filas; return q; }

  /* ---------- Tablas del curso (TablasPE.pdf) ---------- */
  var Z_TABLA = 1.96;                                                   /* Z(0.475), α = 5 % */
  var CHI = { "0.05": [0, 3.84, 5.99, 7.81, 9.49], "0.025": [0, 5.02, 7.38, 9.35, 11.14], "0.01": [0, 6.63, 9.21, 11.34, 13.28] };
  var COL_CHI = { "0.05": "0.050", "0.025": "0.025", "0.01": "0.010" };
  var KS10 = { "0.1": 0.368, "0.05": 0.409, "0.01": 0.486 };           /* d(α, 10) */
  function chi(a, nu) { return CHI[String(a)][nu]; }

  var NIVELES = [];
  function mundo(o, variantes) {
    o.variantes = variantes.map(function (v, k) { v.prob = k + 1; return v; });
    NIVELES.push(o);
  }

  /* =========================================================
     GENERADORES CONGRUENCIALES (ProbGeneradores.pdf)
     Se llena la tabla hasta que Xn+1 regresa a X0; en cada renglón se pide el número rectangular.
     ========================================================= */
  function generador(g) {
    var mixto = g.tipo === "mixto", m = g.m, x = g.x0, n = 0, pasos = [], PE = m / 4;
    var fg = (mixto ? T`$X_{n+1} = (aX_n + C) \bmod m$` : T`$X_{n+1} = aX_n \bmod m$`) + T`; para $X_{n+1}$ se toma el numerador del quebrado y el número rectangular es $\dfrac{X_{n+1}}{m}$`;
    if (!mixto) pasos.push(P({ t: "Período esperado", fg: T`$PE = \dfrac{m}{4}$`, f: T`$PE = \dfrac{${m}}{4} = ${PE}$: en ${PE} cálculos se debe llegar a $X_{n+1} = ${g.x0}$`, pide: "el período esperado $PE$", ok: PE, males: [m / 2, m], seg: 25 }));
    do {
      n++;
      var num = g.a * x + (mixto ? g.c : 0), ent = Math.floor(num / m), X1 = num % m;
      var arriba = mixto ? T`(${g.a})(${x}) + ${g.c}` : T`(${g.a})(${x})`;
      var cuenta = T`\dfrac{${arriba}}{${m}} = \dfrac{${num}}{${m}}` + (ent ? (X1 ? T` = ${ent} + \dfrac{${X1}}{${m}}` : T` = ${ent} + 0`) : "");
      var mal = ent !== X1 ? ent : (X1 + 1) % m;
      pasos.push(P({ t: T`renglón $n = ${n}$ ($X_n = ${x}$)`, fg: fg,
        f: T`$${cuenta}$ → $X_{n+1} = ${X1}$ → número rectangular $= \dfrac{${X1}}{${m}}$`,
        pide: T`el número rectangular de $n = ${n}$`, ok: fr(X1, m), mal: fr(mal, m),
        fila: [String(n), String(x), "$" + cuenta + "$", String(X1), fr(X1, m)], ver: [0, 1], col: 4, seg: mixto ? 30 : 35 }));
      x = X1;
    } while (x !== g.x0 && n < 40);
    var esp = mixto ? m : PE, ok = n === esp, sim = mixto ? "m" : "PE";
    var regla = T`Si $n = ${sim}$ y $X_n = X_{n+1}$: el período es completo y los números rectangulares son aceptados`;
    var concl = ok ? T`Como $n = ${sim} = ${esp}$ y $X_n = X_{n+1}$: los números rectangulares son aceptados y el período es completo.`
      : T`Como $n = ${n} \ne ${sim} = ${esp}$: los números rectangulares son rechazados y el período es incompleto.`;
    return {
      g: g, periodo: n, datosZona: mixto ? T`$a = ${g.a}$, $X_0 = ${g.x0}$, $C = ${g.c}$, $m = ${m}$` : T`$a = ${g.a}$, $X_0 = ${g.x0}$, $m = ${m}$`, esperado: esp, acepta: ok,
      enunciado: T`Se desea generar números rectangulares con un generador congruencial ${mixto ? "mixto" : "multiplicativo"}. Los valores para este generador son: ` +
        (mixto ? T`$a = ${g.a}$, $X_0 = ${g.x0}$, $C = ${g.c}$ y $m = ${m}$.` : T`$a = ${g.a}$, $X_0 = ${g.x0}$ y $m = ${m}$.`) +
        T` Llena la tabla hasta que $X_{n+1}$ regrese a $X_0 = ${g.x0}$ y determina si el período es completo y si los números rectangulares son aceptados.`,
      cols: ["$n$", "$X_n$", mixto ? T`$(aX_n + C) \bmod m$` : T`$aX_n \bmod m$`, "$X_{n+1}$", "# Rectangular"],
      pasos: pasos,
      jefe: [J("¿Cómo es el período del generador?", ok ? "Completo" : "Incompleto", ok ? "Incompleto" : "Completo", regla),
        J("Entonces, los números rectangulares son…", ok ? "Aceptados" : "Rechazados", ok ? "Rechazados" : "Aceptados", regla)],
      resumen: (mixto ? "" : T`$PE = \frac{${m}}{4} = ${PE}$. `) + T`Se hicieron $n = ${n}$ cálculos hasta llegar a $X_{n+1} = ${g.x0}$. ` + concl
    };
  }
  mundo({ id: "m02", nombre: "Generador congruencial mixto", unidad: "Números rectangulares", tema: 1, tipo: "lcg", fuente: "ProbGeneradores.pdf (ejemplo a = 7, X0 = 7, C = 7, m = 10)" }, [
    { tipo: "mixto", a: 7, x0: 7, c: 1, m: 10 }, { tipo: "mixto", a: 5, x0: 1, c: 3, m: 8 }, { tipo: "mixto", a: 3, x0: 5, c: 7, m: 10 },
    { tipo: "mixto", a: 7, x0: 2, c: 5, m: 9 }, { tipo: "mixto", a: 7, x0: 1, c: 3, m: 10 }, { tipo: "mixto", a: 5, x0: 3, c: 7, m: 8 }
  ].map(generador));
  mundo({ id: "m03", nombre: "Generador congruencial multiplicativo", unidad: "Números rectangulares", tema: 2, tipo: "lcg", fuente: "ProbGeneradores.pdf (ejemplo a = 5, X0 = 5, m = 32)" }, [
    { tipo: "mult", a: 3, x0: 7, m: 32 }, { tipo: "mult", a: 7, x0: 3, m: 32 }, { tipo: "mult", a: 11, x0: 5, m: 16 },
    { tipo: "mult", a: 13, x0: 3, m: 32 }, { tipo: "mult", a: 9, x0: 5, m: 32 }, { tipo: "mult", a: 9, x0: 7, m: 32 }
  ].map(generador));

  /* =========================================================
     PRUEBAS ESTADÍSTICAS (PPromedios, PKS, PF, PSeries, PDistancias, PPoker, TablasPE)
     Conjuntos de 10 números: ejercicios de Ejer.PEStadísticas.pdf y variantes mínimas de los ejemplos de clase.
     ========================================================= */
  var EJ_B = [0.10461, 0.95554, 0.73704, 0.52861, 0.68777, 0.66591, 0.30231, 0.21704, 0.97599, 0.63379];
  var EJ_C = [0.43315, 0.31422, 0.43031, 0.15452, 0.71427, 0.71189, 0.33095, 0.91259, 0.76316, 0.50552];
  var POKER_K = [0.69910, 0.85385, 0.89889, 0.00024, 0.73827, 0.33468, 0.11970, 0.96178, 0.63121, 0.62167];
  function cambia(base, cambios) { var d = base.slice(); Object.keys(cambios).forEach(function (i) { d[i] = cambios[i]; }); return d; }
  var CL_A = [0.03991, 0.38555, 0.17546, 0.32643, 0.69572, 0.24122, 0.61196, 0.30532, 0.03788, 0.48228];
  var CL_D = [0.03315, 0.01422, 0.43031, 0.05452, 0.71407, 0.01189, 0.33096, 0.90593, 0.86316, 0.50452];

  function enunPrueba(nombre, a, extra) {
    return T`Considerando una $\alpha = ${pct(a)}$` + (extra || "") + T`, se tienen los siguientes números rectangulares ($N = 10$). Aplica la prueba de ${nombre} y determina si los números rectangulares son aceptados o rechazados.`;
  }
  function conclJ(acepta, est, tab) {
    return J(T`Compara $${est}$ con el valor de tablas $${tab}$. ¿Los números rectangulares son…?`, acepta ? "Aceptados" : "Rechazados", acepta ? "Rechazados" : "Aceptados",
      T`Si $${est} < ${tab}$, los números rectangulares son aceptados; si es mayor, son rechazados`);
  }
  function conclTxt(acepta) { return acepta ? "Los números rectangulares son aceptados." : "Los números rectangulares son rechazados."; }
  function pasoChi(a, nu, extraFg, fila, col) {
    var v = chi(a, nu), otra = chi(a, nu === 1 ? 3 : 1);
    return P({ t: "Valor de tablas", fg: T`$X^2_{\alpha,\,${extraFg}}$ en la tabla $X^2$`, f: T`$X^2_{${fx(a)},\,${nu}}$: renglón $\nu = ${nu}$, columna $${COL_CHI[String(a)]}$ → $${v}$`,
      pide: T`$X^2_{${fx(a)},\,${nu}}$ (búscalo en la tabla $X^2$)`, ok: v, mal: otra, tabla: "chi", seg: 45, fila: fila, col: col });
  }

  /* ---------- Promedios ---------- */
  function promedios(v) {
    var D = v.datos, N = D.length, a = 0.05, s = rd(suma(D), 5), X = s / N, Zs = (X - 0.5) * Math.sqrt(N) / Math.sqrt(1 / 12), Z0 = Math.abs(Zs), ar = 1 - a, acepta = Z0 < Z_TABLA;
    var fgZ = T`$Z_0 = \dfrac{\left(\bar{X} - \frac{1}{2}\right)\sqrt{N}}{\sqrt{\frac{1}{12}}}$ (valor absoluto)`;
    return {
      datos: D, alfa: a, Z0: Z0, X: X, acepta: acepta,
      enunciado: enunPrueba("promedios", a),
      cols: ["Paso", "Fórmula", "Resultado"],
      pasos: [
        P({ t: "Media aritmética", fg: T`$\bar{X} = \dfrac{\sum \text{ de los valores de los números rectangulares}}{N}$`, f: T`$\bar{X} = \dfrac{${D.map(f5).join(" + ")}}{${N}} = \dfrac{${fx(s, 5)}}{${N}} = ${fx(X)}$`,
          pide: T`la media aritmética $\bar{X}$`, ok: X, males: [s, s / (N - 1)], seg: 75, fila: ["1", T`$\bar{X} = \frac{\sum x}{N}$`, fx(X)], col: 2 }),
        P({ t: "Estadístico $Z_0$", fg: fgZ, f: T`$Z_0 = \dfrac{(${fx(X)} - \frac{1}{2})\sqrt{${N}}}{\sqrt{\frac{1}{12}}} = ${fx(Zs)}$` + (Zs < 0 ? T` → $|Z_0| = ${fx(Z0)}$` : ""),
          pide: "el estadístico $Z_0$", ok: Z0, males: [Math.abs((X - 0.5) * N / Math.sqrt(1 / 12)), Math.abs((X - 0.5) * Math.sqrt(N) / (1 / 12))], seg: 80, fila: ["2", T`$Z_0$`, fx(Z0)], col: 2 }),
        P({ t: T`$\alpha$ real`, fg: T`$\alpha_{real} = 100\% - \alpha_{dato}$`, f: T`$\alpha_{real} = 100\% - ${pct(a)} = ${pct(ar)} = ${fx(ar)}$`,
          pide: T`$\alpha_{real}$ (en decimal)`, ok: ar, mal: a, seg: 25, fila: ["3", T`$\alpha_{real} = 100\% - \alpha$`, fx(ar)], col: 2 }),
        P({ t: "Valor de tablas", fg: T`$Z_{\alpha_{real}/2}$ en la tabla normal (se busca el área en el cuerpo de la tabla)`, f: T`$Z_{${fx(ar)}/2} = Z_{${fx(ar / 2)}}$: el área $0.4750$ está en el renglón $1.9$ y la columna $.06$ → $Z = 1.96$`,
          pide: T`$Z_{\alpha_{real}/2}$ (búscalo en la tabla normal)`, ok: Z_TABLA, mal: 1.64, tabla: "normal", seg: 45, fila: ["4", T`$Z_{${fx(ar)}/2} = Z_{${fx(ar / 2)}}$`, "1.96"], col: 2 })
      ],
      jefe: [conclJ(acepta, "|Z_0|", "Z_{" + fx(ar / 2) + "}")],
      resumen: T`$\bar{X} = ${fx(X)}$, $|Z_0| = ${fx(Z0)}$ ${acepta ? "<" : ">"} $Z_{0.475} = 1.96$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m04", nombre: "Prueba de promedios", unidad: "Pruebas estadísticas", tema: 3, tipo: "prueba", fuente: "PPromedios.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: EJ_B }, { datos: cambia(CL_A, { 6: 0.41196 }) }, { datos: EJ_C },
    { datos: POKER_K }, { datos: cambia(CL_D, { 8: 0.06316 }) }, { datos: cambia(CL_D, { 8: 0.86336 }) }
  ].map(promedios));

  /* ---------- Kolmogorov-Smirnov ---------- */
  function ks(v) {
    var D = v.datos, N = D.length, a = v.alfa, xs = D.slice().sort(function (p, q) { return p - q; });
    var Dn = xs.map(function (x, i) { return rd((i + 1) / N - x, 5); }), max = Math.max.apply(null, Dn), iMax = Dn.indexOf(max), d = KS10[String(a)], acepta = max < d;
    var orden = Dn.slice().sort(function (p, q) { return q - p; });
    var pasos = xs.map(function (x, i) {
      var F = (i + 1) / N;
      return P({ t: T`Renglón $i = ${i + 1}$`, fg: T`$F(x_i) = \dfrac{i}{N}$ (posición del número ordenado entre la cantidad de números), $\quad D_n = F(x_i) - x_i$`,
        f: T`$F(x_{${i + 1}}) = \dfrac{${i + 1}}{${N}} = ${fx(F)}$ → $D_n = ${fx(F)} - ${f5(x)} = ${fx(Dn[i], 5)}$`, pide: T`$D_n$ del renglón $i = ${i + 1}$`, ok: Dn[i], dec: 5,
        males: [rd(x - F, 5), rd(i / N - x, 5)], seg: 35, fila: [String(i + 1), f5(x), T`$\frac{${i + 1}}{${N}}$ = ${fx(F)}`, fx(Dn[i], 5)], ver: [0, 1], col: 3 });
    });
    return {
      datos: D, alfa: a, xs: xs, Dn: Dn, max: max, acepta: acepta,
      enunciado: enunPrueba("Kolmogorov-Smirnov (KS)", a) + " Ordena los números en forma ascendente y llena la tabla.",
      cols: ["$i$", "$x_i$", "$F(x_i) = \\frac{i}{N}$", "$D_n$"],
      pasos: pasos,
      jefe: [J(T`¿Cuál es el valor del estadístico $D_n$ (el mayor de la columna)?`, fx(max, 5), fx(orden[1], 5), T`$D_n = \max\,[F(x_i) - x_i]$`),
        J(T`¿Cuánto vale $d_{${fx(a)},\,${N}}$ en la tabla KS?`, String(d), String(a === 0.05 ? KS10["0.1"] : KS10["0.05"]), T`$d_{\alpha,\,N}$: renglón $N$, columna $\alpha$`, "ks"),
        conclJ(acepta, "D_n", T`d_{${fx(a)},\,${N}}`)],
      resumen: T`$D_n = ${fx(max, 5)}$ (renglón $i = ${iMax + 1}$) ${acepta ? "<" : ">"} $d_{${fx(a)},\,10} = ${d}$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m05", nombre: "Prueba Kolmogorov-Smirnov", unidad: "Pruebas estadísticas", tema: 4, tipo: "prueba", fuente: "PKS.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: EJ_B, alfa: 0.05 }, { datos: cambia(CL_A, { 9: 0.41228 }), alfa: 0.1 }, { datos: EJ_C, alfa: 0.05 },
    { datos: cambia(CL_A, { 6: 0.61796 }), alfa: 0.01 }, { datos: cambia(CL_D, { 4: 0.11407 }), alfa: 0.1 }, { datos: cambia(CL_D, { 4: 0.71507 }), alfa: 0.05 }
  ].map(ks));

  /* ---------- Frecuencias ---------- */
  function frecuencias(v) {
    var D = v.datos, N = D.length, a = v.alfa, n = v.n, FE = N / n, FO = [];
    for (var k = 0; k < n; k++) FO.push(0);
    D.forEach(function (x) { FO[Math.min(n - 1, Math.floor(x * n))]++; });
    var X2 = suma(FO.map(function (o) { return (o - FE) * (o - FE); })) / FE, tab = chi(a, n - 1), acepta = X2 < tab;
    function lim(k) { return k === 0 ? "0" : k === n ? "1" : T`\frac{${k}}{${n}}`; }
    var pasos = [P({ t: "Frecuencia esperada", fg: T`$FE_i = \dfrac{N}{n}$`, f: T`$FE_i = \dfrac{${N}}{${n}} = ${fx(FE)}$`, pide: "la frecuencia esperada $FE_i$", ok: FE, males: [n / N, N * n], seg: 25 })];
    FO.forEach(function (fo, k) {
      var de = k / n, a2 = (k + 1) / n, cuales = D.filter(function (x) { return x >= de && x < a2; });
      pasos.push(P({ t: T`Intervalo ${k + 1}: de $${lim(k)}$ a $${lim(k + 1)}$`, fg: T`$FO_i$ = total de números rectangulares que caen en el intervalo`,
        f: T`Números entre $${fx(de, 4)}$ y $${fx(a2, 4)}$: ` + (cuales.map(f5).join(", ") || "ninguno") + T` → $FO_{${k + 1}} = ${fo}$`,
        pide: T`$FO_{${k + 1}}$ (números entre $${fx(de, 4)}$ y $${fx(a2, 4)}$)`, ok: fo, males: [fo + 1, fo - 1], seg: 35,
        fila: [String(k + 1), T`$${lim(k)}$ – $${lim(k + 1)}$`, String(fo), fx(FE)], ver: [0, 1, 3], col: 2 }));
    });
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \dfrac{1}{FE_i}\displaystyle\sum_{i=1}^{n}(FO_i - FE_i)^2$`, f: T`$X_0^2 = \dfrac{1}{${fx(FE)}}\left[${FO.map(function (o) { return "(" + o + " - " + fx(FE) + ")^2"; }).join(" + ")}\right] = ${fx(X2)}$`,
      pide: "el estadístico $X_0^2$", ok: X2, males: [X2 * FE, suma(FO.map(function (o) { return Math.abs(o - FE); })) / FE], seg: 80, fila: ["", T`$X_0^2$`, "", fx(X2)], col: 3 }));
    pasos.push(pasoChi(a, n - 1, "n-1", ["", T`$X^2_{${fx(a)},\,${n - 1}}$`, "", String(tab)], 3));
    return {
      datos: D, alfa: a, n: n, FO: FO, FE: FE, X2: X2, acepta: acepta,
      enunciado: enunPrueba("frecuencias", a, T` y $n = ${n}$ intervalos`),
      cols: ["$i$", "Intervalo", "$FO_i$", "$FE_i$"],
      pasos: pasos,
      jefe: [conclJ(acepta, "X_0^2", T`X^2_{${fx(a)},\,${n - 1}}`)],
      resumen: T`$FE_i = ${fx(FE)}$, $FO = ${FO.join(",\\ ")}$ → $X_0^2 = ${fx(X2)}$ ${acepta ? "<" : ">"} $X^2_{${fx(a)},\,${n - 1}} = ${tab}$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m06", nombre: "Prueba de frecuencias", unidad: "Pruebas estadísticas", tema: 5, tipo: "prueba", fuente: "PF.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: EJ_B, alfa: 0.05, n: 4 }, { datos: cambia(EJ_B, { 3: 0.62861, 6: 0.60231 }), alfa: 0.05, n: 5 }, { datos: EJ_C, alfa: 0.05, n: 4 },
    { datos: cambia(CL_A, { 6: 0.41196 }), alfa: 0.05, n: 2 }, { datos: cambia(CL_D, { 4: 0.71401 }), alfa: 0.01, n: 4 }, { datos: cambia(CL_A, { 2: 0.47546 }), alfa: 0.05, n: 4 }
  ].map(frecuencias));

  /* ---------- Series ---------- */
  function series(v) {
    var D = v.datos, N = D.length, a = v.alfa, n = 2, FE = (N - 1) / (n * n), filasIni = [], C = [0, 0, 0, 0], en = [[], [], [], []];
    /* Cuadrantes en el orden del apunte: abajo izquierda, abajo derecha, arriba izquierda, arriba derecha */
    var NOM = [T`$0 \le x < \frac{1}{2}$, $0 \le y < \frac{1}{2}$`, T`$\frac{1}{2} \le x < 1$, $0 \le y < \frac{1}{2}$`, T`$0 \le x < \frac{1}{2}$, $\frac{1}{2} \le y < 1$`, T`$\frac{1}{2} \le x < 1$, $\frac{1}{2} \le y < 1$`];
    var CORTO = ["Abajo izq.", "Abajo der.", "Arriba izq.", "Arriba der."];
    for (var i = 0; i < N - 1; i++) {
      var q = Math.floor(D[i] * n) + 2 * Math.floor(D[i + 1] * n); C[q]++; en[q].push(i);
      filasIni.push([String(i + 1), f5(D[i]), f5(D[i + 1]), ""]);
    }
    var X2 = (n * n) / (N - 1) * suma(C.map(function (o) { return (o - FE) * (o - FE); })), tab = chi(a, n * n - 1), acepta = X2 < tab;
    var pasos = [P({ t: "Frecuencia esperada", fg: T`$FE_i = \dfrac{N - 1}{n^2}$ ($N - 1$ = número de parejas que se forma con todos los números rectangulares)`, f: T`$FE_i = \dfrac{${N} - 1}{(${n})^2} = \dfrac{${N - 1}}{${n * n}} = ${fx(FE)}$`,
      pide: "la frecuencia esperada $FE_i$", ok: FE, males: [N / (n * n), (N - 1) / n], seg: 30, fila: ["FE", "", "", fx(FE)], col: 3 })];
    C.forEach(function (fo, k) {
      pasos.push(P({ t: "Cuadrante " + CORTO[k].toLowerCase(), fg: T`$FO_{ij}$ = total de parejas $(U_i,\ U_{i+1})$ ubicadas en el cuadrante, según los números rectangulares que la forman`,
        f: T`Parejas en ${NOM[k]}: ` + (en[k].map(function (j) { return j + 1; }).join(", ") || "ninguna") + T` → $FO = ${fo}$`,
        pide: T`¿cuántas parejas hay en ${NOM[k]}?`, ok: fo, males: [fo + 1, fo - 1], seg: 50,
        pon: en[k].map(function (j) { return [j, 3, CORTO[k]]; }), fila: [["", "", CORTO[k], "FO = " + fo]] }));
    });
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \dfrac{n^2}{N - 1}\displaystyle\sum_{i=1}^{n}\sum_{j=1}^{n}(FO_{ij} - FE_{ij})^2$`, f: T`$X_0^2 = \dfrac{(${n})^2}{${N - 1}}\left[${C.map(function (o) { return "(" + o + " - " + fx(FE) + ")^2"; }).join(" + ")}\right] = ${fx(X2)}$`,
      pide: "el estadístico $X_0^2$", ok: X2, males: [suma(C.map(function (o) { return (o - FE) * (o - FE); })) / FE, suma(C.map(function (o) { return (o - FE) * (o - FE); }))], seg: 80, fila: ["", "", T`$X_0^2$`, fx(X2)], col: 3 }));
    pasos.push(pasoChi(a, n * n - 1, "n^2-1", ["", "", T`$X^2_{${fx(a)},\,3}$`, String(tab)], 3));
    return {
      datos: D, alfa: a, FO: C, FE: FE, X2: X2, acepta: acepta, filasIni: filasIni,
      enunciado: enunPrueba("series", a, T` y $n = 2$`) + T` Las parejas $(U_i,\ U_{i+1})$ se forman en el orden de la lista (1ª con 2ª, 2ª con 3ª…).`,
      cols: ["Pareja", "$U_i$ (x)", "$U_{i+1}$ (y)", "Cuadrante"],
      pasos: pasos,
      jefe: [conclJ(acepta, "X_0^2", T`X^2_{${fx(a)},\,3}`)],
      resumen: T`$FE = ${fx(FE)}$; parejas por cuadrante $= ${C.join(",\\ ")}$ → $X_0^2 = ${fx(X2)}$ ${acepta ? "<" : ">"} $X^2_{${fx(a)},\,3} = ${tab}$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m07", nombre: "Prueba de series", unidad: "Pruebas estadísticas", tema: 6, tipo: "prueba", fuente: "PSeries.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: EJ_B, alfa: 0.05 }, { datos: cambia(EJ_B, { 0: 0.90461 }), alfa: 0.05 }, { datos: EJ_C, alfa: 0.01 },
    { datos: cambia(CL_A, { 2: 0.17146 }), alfa: 0.05 }, { datos: cambia(EJ_C, { 0: 0.43915, 4: 0.21427, 5: 0.01189 }), alfa: 0.05 }, { datos: cambia(CL_D, { 0: 0.03325 }), alfa: 0.05 }
  ].map(series));

  /* ---------- Distancias ---------- */
  function distancia(x) {
    var s = x.toFixed(5).slice(2);
    for (var i = 0; i < s.length; i++) for (var j = i + 1; j < s.length; j++) if (s[i] === s[j]) return { d: j - i - 1, dig: s[i] };
    return null;
  }
  function distancias(v) {
    var D = v.datos, N = D.length, a = v.alfa, nG = 3, info = D.map(distancia), FO = [0, 0, 0, 0];
    info.forEach(function (o) { FO[Math.min(nG, o.d)]++; });
    var FE = [0, 1, 2].map(function (i) { return rd(0.1 * Math.pow(0.9, i) * N, 6); }).concat([rd(Math.pow(0.9, nG) * N, 6)]);
    var FEa = rd(FE[0] + FE[1] + FE[2], 6), FOa = FO[0] + FO[1] + FO[2];
    var X2 = (FOa - FEa) * (FOa - FEa) / FEa + (FO[3] - FE[3]) * (FO[3] - FE[3]) / FE[3], tab = chi(a, 1), acepta = X2 < tab;
    var fgFO = T`$i$ = distancia entre dígitos iguales (cantidad de dígitos entre ellos); $FO_i$ = cantidad de números rectangulares con la misma $i$`;
    var pasos = [0, 1, 2, 3].map(function (i) {
      var cuales = D.filter(function (x, k) { return Math.min(nG, info[k].d) === i; });
      return P({ t: T`Distancia $i = ${i}$`, fg: fgFO, f: (cuales.map(function (x) { var o = distancia(x); return f5(x) + " (dígito " + o.dig + ")"; }).join(", ") || "Ningún número") + T` → $FO_{${i}} = ${FO[i]}$`,
        pide: T`¿cuántos números tienen distancia $i = ${i}$?`, ok: FO[i], males: [FO[i] + 1, FO[i] - 1], seg: 60, fila: [String(i), String(FO[i]), ""], ver: [0], col: 1 });
    });
    [0, 1, 2, 3].forEach(function (i) {
      var formula = i < nG ? T`(0.1)(0.9)^{${i}} \times ${N}` : T`(0.9)^{${i}} \times ${N}`;
      pasos.push(P({ t: T`$FE$ para $i = ${i}$`, fg: T`$FE_i = (0.1)(0.9)^i \times N$ si $i < n$, $\quad FE_i = (0.9)^i \times N$ si $i \ge n$ ($n = ${nG}$)`, f: T`$FE_{${i}} = ${formula} = ${fx(FE[i])}$`,
        pide: T`$FE_{${i}}$`, ok: FE[i], males: i < nG ? [Math.pow(0.9, i) * N, 0.1 * Math.pow(0.9, i)] : [0.1 * Math.pow(0.9, i) * N, Math.pow(0.9, i)], seg: 40, pon: [[i, 2, fx(FE[i])]] }));
    });
    pasos.push(P({ t: "FE agrupada", fg: T`$FE_i$ agrupada $= \sum$ de los valores de $FE_i$ menores de 5`, f: T`$FE_i$ agrupada $= ${fx(FE[0])} + ${fx(FE[1])} + ${fx(FE[2])} = ${fx(FEa)}$ (1er. grupo); $FE_{3} = ${fx(FE[3])}$ (2do. grupo)`,
      pide: "la $FE_i$ agrupada (1er. grupo)", ok: FEa, males: [FE[0] + FE[1], 10], seg: 40, fila: [["Grupo 1 ($i < 3$)", "", fx(FEa)], ["Grupo 2 ($i = 3$)", String(FO[3]), fx(FE[3])]] }));
    pasos.push(P({ t: "FO agrupada", fg: T`$FO_i$ agrupada $= \sum$ de los valores de $FO_i$ de los mismos $i$`, f: T`$FO_i$ agrupada $= ${FO[0]} + ${FO[1]} + ${FO[2]} = ${FOa}$`,
      pide: "la $FO_i$ agrupada (1er. grupo)", ok: FOa, males: [FOa + FO[3], FO[0] + FO[1]], seg: 35, pon: [[4, 1, String(FOa)]] }));
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \displaystyle\sum_{i=0}^{n}\dfrac{(FO_i - FE_i)^2}{FE_i}$`, f: T`$X_0^2 = \dfrac{(${FOa} - ${fx(FEa)})^2}{${fx(FEa)}} + \dfrac{(${FO[3]} - ${fx(FE[3])})^2}{${fx(FE[3])}} = ${fx(X2)}$`,
      pide: "el estadístico $X_0^2$", ok: X2, males: [(FOa - FEa) * (FOa - FEa) + (FO[3] - FE[3]) * (FO[3] - FE[3]), (FOa - FEa) * (FOa - FEa) / FEa], seg: 80, fila: [T`$X_0^2$`, "", fx(X2)], col: 2 }));
    pasos.push(pasoChi(a, 1, "n-1", ["Tabla", "", String(tab)], 2));
    return {
      datos: D, alfa: a, info: info, FO: FO, FE: FE, FEa: FEa, FOa: FOa, X2: X2, acepta: acepta,
      enunciado: enunPrueba("distancias", a) + T` Para $FE_i$ usa $n = ${nG}$, como en el ejemplo de clase.`,
      cols: ["$i$", "$FO_i$", "$FE_i$"],
      pasos: pasos,
      jefe: [conclJ(acepta, "X_0^2", T`X^2_{${fx(a)},\,1}`)],
      resumen: T`$FO = ${FO.join(",\\ ")}$; agrupadas: $FO = ${FOa}$ con $FE = ${fx(FEa)}$ y $FO = ${FO[3]}$ con $FE = ${fx(FE[3])}$ ($n = 2$ grupos) → $X_0^2 = ${fx(X2)}$ ${acepta ? "<" : ">"} $X^2_{${fx(a)},\,1} = ${tab}$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m08", nombre: "Prueba de distancias", unidad: "Pruebas estadísticas", tema: 7, tipo: "prueba", fuente: "PDistancias.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: cambia(CL_D, { 5: 0.01169 }), alfa: 0.05 },
    { datos: [0.43315, 0.31422, 0.43031, 0.15452, 0.71427, 0.61189, 0.53095, 0.91259, 0.76317, 0.10552], alfa: 0.01 },
    { datos: cambia(EJ_C, { 9: 0.10552 }), alfa: 0.05 },
    { datos: [0.10461, 0.90554, 0.73704, 0.12861, 0.68076, 0.66591, 0.30231, 0.01704, 0.07590, 0.63379], alfa: 0.01 },
    { datos: [0.03991, 0.38055, 0.47546, 0.32643, 0.29572, 0.04122, 0.01196, 0.30532, 0.03788, 0.40228], alfa: 0.05 },
    { datos: [0.10461, 0.90554, 0.73704, 0.12861, 0.68077, 0.66591, 0.30231, 0.01704, 0.07599, 0.63379], alfa: 0.01 }
  ].map(distancias));

  /* ---------- Póker ---------- */
  var MANOS = ["Todos diferentes", "Un par", "Dos pares", "Tercia", "Full", "Póker", "Quintilla"];
  var PROB = [0.30240, 0.50400, 0.10800, 0.07200, 0.00900, 0.00450, 0.00010];
  function mano(x) {
    var c = {}; x.toFixed(5).slice(2).split("").forEach(function (d) { c[d] = (c[d] || 0) + 1; });
    var v = Object.keys(c).map(function (k) { return c[k]; }).sort().reverse().join("");
    return { "11111": 0, "2111": 1, "221": 2, "311": 3, "32": 4, "41": 5, "5": 6 }[v];
  }
  function poker(v) {
    var D = v.datos, N = D.length, a = v.alfa, m = D.map(mano), FO = [0, 0, 0, 0, 0, 0, 0];
    m.forEach(function (k) { FO[k]++; });
    var FE = PROB.map(function (p) { return rd(p * N, 4); }), gr = [0, 2, 3, 4, 5, 6];
    var FEa = rd(suma(gr.map(function (i) { return FE[i]; })), 4), FOa = suma(gr.map(function (i) { return FO[i]; }));
    var X2 = (FOa - FEa) * (FOa - FEa) / FEa + (FO[1] - FE[1]) * (FO[1] - FE[1]) / FE[1], tab = chi(a, 1), acepta = X2 < tab;
    var pide = [0, 1, 2, 3, 4].concat(FO[5] ? [5] : []).concat(FO[6] ? [6] : []), pasos = [];
    pide.forEach(function (k, j) {
      var cuales = D.filter(function (x, i) { return m[i] === k; }).map(f5);
      var filas = [[MANOS[k], String(FO[k]), T`$(${PROB[k].toFixed(5)})(${N})$ = ${FE[k].toFixed(4)}`]];
      if (j === pide.length - 1) [5, 6].forEach(function (z) { if (pide.indexOf(z) < 0) filas.push([MANOS[z], String(FO[z]), T`$(${PROB[z].toFixed(5)})(${N})$ = ${FE[z].toFixed(4)}`]); });
      pasos.push(P({ t: "Categoría: " + MANOS[k], fg: T`Se identifica cada número: sus 5 dígitos forman una mano de póker. $FO_i$ = cantidad de números de la categoría; $FE_i = \text{probabilidad} \times N$`,
        f: (cuales.join(", ") || "Ningún número") + T` → $FO = ${FO[k]}$; $FE = (${PROB[k].toFixed(5)})(${N}) = ${FE[k].toFixed(4)}$`,
        pide: T`¿cuántos números hay de «${MANOS[k]}»?`, ok: FO[k], males: [FO[k] + 1, FO[k] - 1], seg: 70, tabla: "poker", fila: filas, ver: [0, 2], col: 1 }));
    });
    var menores = gr.map(function (i) { return FE[i].toFixed(4); }).join(" + ");
    pasos.push(P({ t: "FE agrupada", fg: T`$FE_i$ agrupada $= \sum$ de los valores menores de 5 de $FE_i$`, f: T`$FE_i$ agrupada $= ${menores} = ${FEa.toFixed(4)}$; «Un par» queda solo ($FE = 5.0400$): $n = 2$ categorías`,
      pide: "la $FE_i$ agrupada", ok: FEa, dec: 4, males: [4.914, FE[0] + FE[2]], seg: 45, tabla: "poker", fila: [["Agrupadas (FE < 5)", "", FEa.toFixed(4)], ["Un par", String(FO[1]), FE[1].toFixed(4)]] }));
    pasos.push(P({ t: "FO agrupada", fg: T`$FO_i$ agrupada $= \sum$ de los valores de $FO_i$ de las mismas categorías`, f: T`$FO_i$ agrupada $= ${gr.map(function (i) { return FO[i]; }).join(" + ")} = ${FOa}$`,
      pide: "la $FO_i$ agrupada", ok: FOa, males: [FOa + FO[1], FO[0]], seg: 35, pon: [[7, 1, String(FOa)]] }));
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \displaystyle\sum_{i=1}^{n}\dfrac{(FO_i - FE_i)^2}{FE_i}$`, f: T`$X_0^2 = \dfrac{(${FOa} - ${FEa.toFixed(4)})^2}{${FEa.toFixed(4)}} + \dfrac{(${FO[1]} - 5.0400)^2}{5.0400} = ${fx(X2)}$`,
      pide: "el estadístico $X_0^2$", ok: X2, males: [(FOa - FEa) * (FOa - FEa) + (FO[1] - FE[1]) * (FO[1] - FE[1]), (FO[1] - FE[1]) * (FO[1] - FE[1]) / FE[1]], seg: 80, fila: [T`$X_0^2$`, "", fx(X2)], col: 2 }));
    pasos.push(pasoChi(a, 1, "n-1", ["Tabla", "", String(tab)], 2));
    return {
      datos: D, alfa: a, manos: m, FO: FO, FE: FE, FEa: FEa, FOa: FOa, X2: X2, acepta: acepta,
      enunciado: enunPrueba("póker", a) + " Identifica la mano de póker que forman los 5 dígitos de cada número (el botón Póker muestra las probabilidades de clase).",
      cols: ["Categoría", "$FO_i$", "$FE_i$ = probabilidad × N"],
      pasos: pasos,
      jefe: [conclJ(acepta, "X_0^2", T`X^2_{${fx(a)},\,1}`)],
      resumen: T`Agrupadas: $FO = ${FOa}$, $FE = ${FEa.toFixed(4)}$; un par: $FO = ${FO[1]}$, $FE = 5.0400$ → $X_0^2 = ${fx(X2)}$ ${acepta ? "<" : ">"} $X^2_{${fx(a)},\,1} = ${tab}$. ` + conclTxt(acepta)
    };
  }
  mundo({ id: "m09", nombre: "Prueba póker", unidad: "Pruebas estadísticas", tema: 8, tipo: "prueba", fuente: "PPoker.pdf · Ejer.PEStadísticas.pdf · TablasPE.pdf" }, [
    { datos: EJ_B, alfa: 0.05 }, { datos: [0.69910, 0.85345, 0.89889, 0.10024, 0.73827, 0.33468, 0.11970, 0.96176, 0.63121, 0.62167], alfa: 0.05 },
    { datos: EJ_C, alfa: 0.01 }, { datos: cambia(CL_A, { 0: 0.05991 }), alfa: 0.05 },
    { datos: cambia(CL_A, { 3: 0.32663, 7: 0.32532, 8: 0.03786 }), alfa: 0.05 }, { datos: cambia(CL_D, { 3: 0.01452, 7: 0.90543, 8: 0.86315 }), alfa: 0.05 }
  ].map(poker));

  /* =========================================================
     VARIABLES ALEATORIAS NO UNIFORMES (ProbGVAU.pdf, AcGenDVAnou.pdf, DistribuciónPoisson.pdf)
     ========================================================= */
  function listaR(R) { return R.map(function (r) { return String(r); }).join(", "); }

  /* ---------- Exponencial (cajero automático) ---------- */
  function exponencial(v) {
    var lam = v.lam, R = v.R, n = R.length, TA = R.map(function (r) { return -1 / lam * Math.log(r); }), TT = suma(TA), TP = TT / n;
    var fg = T`$x = -\dfrac{1}{\lambda}\,\mathrm{Ln}\,R$`;
    var pasos = R.map(function (r, i) {
      return P({ t: "Cliente " + (i + 1), fg: fg, f: T`$TA_{${i + 1}} = -\dfrac{1}{${lam}}\,\mathrm{Ln}(${r}) = ${fx(TA[i], 9)}$ min`, pide: T`el tiempo de atención $TA_{${i + 1}}$ (min)`, ok: TA[i],
        males: [-lam * Math.log(r), 1 / lam * Math.log(r)], seg: 60, fila: [String(i + 1), String(r), T`$-\frac{1}{${lam}}\,\mathrm{Ln}(${r})$`, fx(TA[i], 9)], ver: [0, 1], col: 3 });
    });
    pasos.push(P({ t: "Tiempo total del cajero", fg: T`$TTC = TA_1 + TA_2 + \dots + TA_n$`, f: T`$TTC = ${TA.map(function (t) { return fx(t, 9); }).join(" + ")} = ${fx(TT, 9)}$ min`,
      pide: "el tiempo total del cajero $TTC$ (min)", ok: TT, males: [TT - TA[n - 1], TT / n], seg: 60, fila: ["", "", "$TTC$", fx(TT, 9)], col: 3 }));
    return {
      lam: lam, R: R, TA: TA, TT: TT, TP: TP, datos: R, datosDec: 0,
      enunciado: T`Los tiempos de atención para los clientes de un cajero automático están exponencialmente distribuidos con $\lambda = ${lam}$. Si al cajero llegaron ${n} clientes, ¿cuál fue el tiempo de servicio de cada uno de ellos?, ¿cuál fue el tiempo total de operación del cajero? y ¿cuál fue el tiempo promedio de atención? Los números rectangulares son: ${listaR(R)}.`,
      cols: ["Cliente", "$R$", "$x = -\\frac{1}{\\lambda}\\,\\mathrm{Ln}\\,R$", "$TA$ (min)"],
      pasos: pasos,
      jefe: [J("¿Cuál es el tiempo promedio de atención $TPA$ (min)?", fx(TP), fx(TT / (n - 1)), T`$TPA = \dfrac{TTC}{\text{No. de clientes}}$`)],
      resumen: T`$TTC = ${fx(TT, 9)}$ min y $TPA = \dfrac{${fx(TT, 9)}}{${n}} = ${fx(TP, 9)}$ min.`
    };
  }
  mundo({ id: "m10", nombre: "Distribución exponencial", unidad: "Variables aleatorias no uniformes", tema: 9, tipo: "va", fuente: "ProbGVAU.pdf (cajero automático) · AcGenDVAnou.pdf" }, [
    { lam: 4, R: [0.76971, 0.82534, 0.63249, 0.11073] }, { lam: 5, R: [0.1331, 0.2389, 0.2054, 0.1700] }, { lam: 5, R: [0.9959, 0.3091, 0.3014, 0.2944] },
    { lam: 5, R: [0.3621, 0.3830, 0.4015, 0.4177] }, { lam: 2, R: [0.2703, 0.3508, 0.3264, 0.2994, 0.3729] }, { lam: 3, R: [0.6699, 0.9299, 0.8294, 0.7348] }
  ].map(exponencial));

  /* ---------- Uniforme (envase de refrescos) ---------- */
  function uniforme(v) {
    var a = v.a, b = v.b, R = v.R, n = R.length, TE = R.map(function (r) { return a + (b - a) * r; });
    var fg = T`$x = a + (b - a)R$`;
    function paso(i) {
      return P({ t: "Refresco " + (i + 1), fg: fg, f: T`$TE_{${i + 1}} = ${a} + [(${b} - ${a})(${R[i]})] = ${fx(TE[i], 5)}$ min`, pide: T`el tiempo de envasamiento $TE_{${i + 1}}$ (min)`, ok: TE[i], dec: 5,
        males: [(b - a) * R[i], a + b * R[i]], seg: 50, fila: [String(i + 1), String(R[i]), T`$${a} + (${b} - ${a})(${R[i]})$`, fx(TE[i], 5)], ver: [0, 1], col: 3 });
    }
    var pasos = R.slice(0, n - 1).map(function (r, i) { return paso(i); }), ult = paso(n - 1), kMax = TE.indexOf(Math.max.apply(null, TE)), kMin = TE.indexOf(Math.min.apply(null, TE));
    return {
      a: a, b: b, R: R, TE: TE, datos: R, datosDec: 0,
      enunciado: T`Los tiempos de envase de un refresco están uniformemente distribuidos entre ${a} y ${b} minutos. Se desea conocer el tiempo de envasamiento de ${n} refrescos. Los números rectangulares son: ${listaR(R)}.`,
      cols: ["Refresco", "$R$", "$x = a + (b - a)R$", "$TE$ (min)"],
      pasos: pasos,
      jefe: [conFilas(J(T`¿Cuál es el tiempo de envasamiento del refresco ${n} ($R = ${R[n - 1]}$)?`, fx(TE[n - 1], 5), fx((b - a) * R[n - 1], 5), fg), ult.filas),
        J("¿Qué refresco tardó más en envasarse?", "Refresco " + (kMax + 1), "Refresco " + (kMin + 1), T`El mayor $TE$ corresponde al mayor $R$`)],
      resumen: "$TE$ = " + TE.map(function (t) { return fx(t, 5); }).join(", ") + T` min. Todos quedan entre $a = ${a}$ y $b = ${b}$.`
    };
  }
  mundo({ id: "m11", nombre: "Distribución uniforme", unidad: "Variables aleatorias no uniformes", tema: 10, tipo: "va", fuente: "ProbGVAU.pdf (envase de refrescos) · AcGenDVAnou.pdf" }, [
    { a: 2, b: 5, R: [0.76971, 0.82534, 0.63249, 0.11073, 0.24122] }, { a: 5, b: 8, R: [0.1331, 0.2389, 0.2054, 0.1700, 0.2703] }, { a: 5, b: 8, R: [0.9959, 0.3091, 0.3014, 0.2944, 0.2649] },
    { a: 5, b: 8, R: [0.3621, 0.3830, 0.4015, 0.4177, 0.4319] }, { a: 3, b: 6, R: [0.2703, 0.3508, 0.3264, 0.2994, 0.3729] }, { a: 1, b: 4, R: [0.6699, 0.9299, 0.8294, 0.7348, 0.3185] }
  ].map(uniforme));

  /* ---------- Empírica (mensajes de texto) ---------- */
  function empirica(v) {
    var R = v.R, n = R.length, X = R.map(function (r) { return r <= 0.5 ? Math.sqrt(2 * r) : 2 * r; });
    var fg = T`$x = \sqrt{2R}$ si $R \le \frac{1}{2}$, $\quad x = 2R$ si $R > \frac{1}{2}$`;
    function paso(i) {
      var r = R[i], raizR = r <= 0.5;
      return P({ t: "Mensaje " + (i + 1), fg: fg, f: raizR ? T`$R = ${r} \le \frac{1}{2}$ → $X_{${i + 1}} = \sqrt{2(${r})} = ${fx(X[i], 9)}$ min` : T`$R = ${r} > \frac{1}{2}$ → $X_{${i + 1}} = 2(${r}) = ${fx(X[i], 9)}$ min`,
        pide: T`el tiempo de transmisión $X_{${i + 1}}$ (min)`, ok: X[i], males: [raizR ? 2 * r : Math.sqrt(2 * r), raizR ? r * r : r], seg: 55,
        fila: [String(i + 1), String(r), raizR ? T`$\sqrt{2(${r})}$, $R \le \frac{1}{2}$` : T`$2(${r})$, $R > \frac{1}{2}$`, fx(X[i], 9)], ver: [0, 1], col: 3 });
    }
    var pasos = R.slice(0, n - 1).map(function (r, i) { return paso(i); }), ult = R[n - 1], kMax = X.indexOf(Math.max.apply(null, X)), kMin = X.indexOf(Math.min.apply(null, X));
    return {
      R: R, X: X, datos: R, datosDec: 0,
      enunciado: T`Se desea conocer los tiempos que tardan en transmitirse ${n} mensajes de texto de un celular a otro; estos se encuentran empíricamente distribuidos. Los números rectangulares son: ${listaR(R)}.`,
      cols: ["Mensaje", "$R$", "Fórmula", "$X$ (min)"],
      pasos: pasos,
      jefe: [conFilas(J(T`¿Cuál es el tiempo de transmisión del mensaje ${n} ($R = ${ult}$)?`, fx(X[n - 1]), fx(ult <= 0.5 ? 2 * ult : Math.sqrt(2 * ult)), fg), paso(n - 1).filas),
        J("¿Qué mensaje tardó más en transmitirse?", "Mensaje " + (kMax + 1), "Mensaje " + (kMin + 1), fg)],
      resumen: "$X$ = " + X.map(function (t) { return fx(t, 6); }).join(", ") + " min. Primero se revisa la condición de $R$ y después se aplica la fórmula."
    };
  }
  mundo({ id: "m12", nombre: "Distribución empírica", unidad: "Variables aleatorias no uniformes", tema: 11, tipo: "va", fuente: "ProbGVAU.pdf (mensajes de texto) · AcGenDVAnou.pdf" }, [
    { R: [0.76971, 0.32534, 0.63249, 0.11073, 0.69572] }, { R: [0.1331, 0.2389, 0.2054, 0.1700, 0.6703] }, { R: [0.9959, 0.3091, 0.6699, 0.2944, 0.8294] },
    { R: [0.3621, 0.3830, 0.4015, 0.0359, 0.7517] }, { R: [0.9299, 0.8294, 0.7348, 0.3185, 0.2649] }, { R: [0.2703, 0.6508, 0.3264, 0.8994, 0.4099] }
  ].map(empirica));

  /* ---------- Poisson y tabla de rangos ---------- */
  function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
  function poisson(v) {
    var lam = v.lam, f = [], F = [], acc = 0, x = 0;
    while (true) { var p = Math.exp(-lam) * Math.pow(lam, x) / fact(x); acc += p; f.push(p); F.push(acc); if (acc >= 0.9999 || x > 30) break; x++; }
    var ult = F.length - 1;
    function rango(R) { for (var i = 0; i < F.length; i++) if (R <= F[i]) return i; return ult; }
    function fracP(k) { return T`\dfrac{e^{-${lam}}\,(${lam}^{${k}})}{${k}!}`; }
    function celdaRango(k) { return k ? T`$${fx(F[k - 1], 9)} < R \le ${fx(F[k], 9)}$` : T`$0 \le R \le ${fx(F[0], 9)}$`; }
    var fgf = T`$f(x) = \dfrac{e^{-\lambda}\,\lambda^{x}}{X!}$`, fgF = T`$F(x) = F(x - 1) + f(x)$ (las distribuciones de probabilidad anteriores más la suya propia)`;
    var pasos = [], K = 3;
    for (var k = 0; k <= K; k++) {
      pasos.push(P({ t: T`$X = ${k}$ · $f(${k})$`, fg: fgf, f: T`$f(${k}) = ${fracP(k)} = ${fx(f[k], 9)}$`, pide: T`$f(${k})$`, ok: f[k], males: [Math.exp(-lam) * Math.pow(lam, k), Math.exp(-lam) * Math.pow(lam, k) / fact(k + 1)], seg: 75,
        fila: [String(k), T`$${fracP(k)}$ = ${fx(f[k], 9)}`, "", ""], ver: [0], col: 1 }));
      pasos.push(P({ t: T`$X = ${k}$ · $F(${k})$`, fg: fgF, f: T`$F(${k}) = ${k ? fx(F[k - 1], 9) : "0"} + ${fx(f[k], 9)} = ${fx(F[k], 9)}$`, pide: T`$F(${k})$`, ok: F[k], males: k ? [F[k - 1], F[k] + f[k]] : [1 - f[0], 2 * f[0]], seg: 45,
        pon: [[k, 2, fx(F[k], 9)], [k, 3, celdaRango(k)]], marcar: true }));
    }
    var resto = []; for (k = K + 1; k < F.length; k++) resto.push([String(k), T`$${fracP(k)}$ = ${fx(f[k], 9)}`, fx(F[k], 9), celdaRango(k)]);
    pasos.push(P({ t: "¿Cuándo se detiene?", fg: T`Se detiene el cálculo cuando la distribución acumulada $F(x)$ se acerca de forma considerable a 1`, f: T`Con el mismo procedimiento se llega a $X = ${ult}$: $F(${ult}) = ${fx(F[ult], 9)}$`,
      pide: "el valor de $X$ donde se detiene el cálculo", ok: ult, males: [ult - 2, ult + 2], seg: 90, fila: resto }));
    var R1 = v.Rs[0], R2 = v.Rs[1], fgR = T`Tabla de rangos: $R$ corresponde al valor $X$ con $F(x - 1) < R \le F(x)$`;
    function q(R) { var x1 = rango(R); return J(T`Con el número rectangular $R = ${R}$, ¿cuál es la demanda simulada?`, T`$X = ${x1}$`, T`$X = ${x1 + 1}$`, fgR); }
    return {
      lam: lam, f: f, F: F, ult: ult, rango: rango, Rs: v.Rs,
      enunciado: T`La demanda de cierto producto tiene un comportamiento Poisson. La $\lambda$ de esta variable es igual a ${lam}. Calcula la distribución de probabilidad $f(x)$ y la distribución acumulada $F(x)$ hasta que $F(x)$ se acerque de forma considerable a 1, arma la tabla de rangos y simula la demanda con $R_1 = ${R1}$ y $R_2 = ${R2}$.`,
      cols: ["$X$", "$f(x)$", "$F(x)$", "Rango de $R$"],
      pasos: pasos,
      jefe: [q(R1), q(R2)],
      resumen: T`Se calculó hasta $X = ${ult}$ ($F = ${fx(F[ult], 9)}$). Con $R = ${R1}$ la demanda es ${rango(R1)} y con $R = ${R2}$ es ${rango(R2)}.`
    };
  }
  mundo({ id: "m13", nombre: "Distribución Poisson", unidad: "Variables aleatorias no uniformes", tema: 12, tipo: "va", fuente: "DistribuciónPoisson.pdf (λ = 5) · EjPRDistribuciónPoisson.pdf (λ = 4) · GeneraciónVleatoriasnou.pdf" }, [
    { lam: 3, Rs: [0.76971, 0.11073] }, { lam: 2, Rs: [0.82534, 0.63249] }, { lam: 6, Rs: [0.03991, 0.38555] },
    { lam: 4, Rs: [0.69572, 0.24122] }, { lam: 7, Rs: [0.61196, 0.30532] }, { lam: 8, Rs: [0.48228, 0.88722] }
  ].map(poisson));

  /* =========================================================
     APLICACIONES (EjerAplicaciones de Simulación.pdf, EjRApVolados.pdf, EjApCaja.pdf)
     ========================================================= */
  /* ---------- Juego de volados ---------- */
  function volados(v) {
    var ini = v.ini, base = v.ap, meta = v.meta, le = v.le, Rs = v.R, din = ini, ap = base, corr = 1, filas = [], metas = 0, quiebras = 0, nuevo = true;
    Rs.forEach(function (r) {
      var gana = le ? r <= 0.5 : r < 0.5, antes = din; din = gana ? din + ap : din - ap;
      var fin = din >= meta ? "Sí" : (din <= 0 ? "Quiebra" : "No");
      filas.push({ corrida: nuevo ? String(corr) : "", antes: antes, ap: ap, r: r, gana: gana, despues: din, fin: fin, otra: gana ? antes - ap : antes + ap });
      nuevo = false;
      if (din >= meta || din <= 0) { if (din >= meta) metas++; else quiebras++; corr++; din = ini; ap = base; nuevo = true; }
      else ap = gana ? base : Math.min(2 * ap, din);
    });
    if (!nuevo) throw new Error("Volados: la última corrida no termina");
    var corridas = corr - 1, Pm = metas / corridas, regla = le ? T`$R \le 0.5$` : T`$R < 0.5$`;
    function txt(d, f) { return pesos(d) + " · " + (f === "Sí" ? "llegó a la meta" : f === "Quiebra" ? "quiebra" : "no llegó"); }
    function finOtra(d) { return d >= meta ? "Sí" : d <= 0 ? "Quiebra" : "No"; }
    var pasos = filas.map(function (w, i) {
      return P({ t: "Volado " + (i + 1) + (w.corrida ? " · corrida " + w.corrida : ""), fg: T`Gana si ${regla}: cantidad + apuesta; si pierde: cantidad − apuesta. ¿Se llegó a la meta (${pesos(meta)})?`,
        f: (w.gana ? T`$R = ${w.r}$ → gana: ${pesos(w.antes)} + ${pesos(w.ap)} = ${pesos(w.despues)}` : T`$R = ${w.r}$ → pierde: ${pesos(w.antes)} − ${pesos(w.ap)} = ${pesos(w.despues)}`) + (w.fin === "Sí" ? " → llegó a la meta" : w.fin === "Quiebra" ? " → quiebra" : ""),
        pide: "la cantidad después del volado y si se llegó a la meta", ok: txt(w.despues, w.fin), mal: txt(w.otra, finOtra(w.otra)), seg: 35,
        fila: [w.corrida, pesos(w.antes), pesos(w.ap), String(w.r), w.gana ? "Sí" : "No", pesos(w.despues), w.fin], ver: [0, 1, 2, 3], col: 5 });
    });
    var fgP = T`$P(\text{meta}) = \dfrac{\text{No. de veces que se llegó a la meta}}{\text{No. de corridas}}$`;
    return {
      ini: ini, base: base, meta: meta, le: le, R: Rs, filas: filas, metas: metas, quiebras: quiebras, corridas: corridas, Pm: Pm, datos: Rs,
      enunciado: T`Juego de volados. Condiciones: 1) se dobla la apuesta cada vez que se pierde (si se apuesta ${pesos(base)} y se pierde, se apuesta el doble, y así sucesivamente); si se gana se regresa a la apuesta inicial; 2) si la apuesta es mayor que la cantidad disponible, se apuesta lo que se tiene. Cantidad disponible: ${pesos(ini)}; apuesta: ${pesos(base)}; meta: ${pesos(meta)}; ganancia = cantidad apostada; el volado se gana si ${regla} y se pierde en otro caso. Al llegar a la meta o a la quiebra empieza otra corrida con ${pesos(ini)}. ¿Cuál es la probabilidad de llegar a la meta?`,
      cols: ["Corrida", "Antes", "Apuesta", "# aleatorio", "¿Ganó?", "Después", "¿Meta?"],
      pasos: pasos,
      jefe: [J("¿Cuántas veces se llegó a la meta?", String(metas), String(metas + 1), "Cuenta los «Sí» de la columna ¿Meta?"),
        J("¿Cuántas veces se llegó a la quiebra?", String(quiebras), String(quiebras === 0 ? 1 : quiebras - 1), "Cuenta las quiebras de la columna ¿Meta?"),
        J("¿Cuál es la probabilidad de llegar a la meta?", T`$\frac{${metas}}{${corridas}} = ${fx(Pm, 4)}$`, T`$\frac{${metas}}{${Rs.length}} = ${fx(metas / Rs.length, 4)}$`, fgP)],
      resumen: T`Corridas: ${corridas}; metas: ${metas}; quiebras: ${quiebras}. $P(\text{meta}) = \frac{${metas}}{${corridas}} = ${fx(Pm, 4)}$.`
    };
  }
  var VR_A = [0.03991, 0.38555, 0.17546, 0.32843, 0.69572, 0.24122, 0.61196, 0.88722, 0.65961, 0.03788];
  var VR_B = [0.03991, 0.38555, 0.17546, 0.32643, 0.69572, 0.24122, 0.61196, 0.30532, 0.03788, 0.48228];
  mundo({ id: "m14", nombre: "Juego de volados", unidad: "Aplicaciones", tema: 13, tipo: "app", fuente: "EjerAplicaciones de Simulación.pdf ($30, apuesta $10, meta $50) · EjRApVolados.pdf" }, [
    { ini: 30, ap: 10, meta: 50, le: false, R: cambia(VR_A, { 4: 0.09572, 8: 0.05961 }) },
    { ini: 40, ap: 20, meta: 90, le: true, R: cambia(VR_A, { 3: 0.52843, 9: 0.53788 }) },
    { ini: 20, ap: 10, meta: 40, le: false, R: cambia(VR_A, { 8: 0.05961 }) },
    { ini: 30, ap: 10, meta: 60, le: true, R: cambia(VR_B, { 5: 0.54122 }) },
    { ini: 40, ap: 10, meta: 70, le: false, R: cambia(VR_B, { 5: 0.54122 }) },
    { ini: 50, ap: 20, meta: 90, le: true, R: cambia(VR_A, { 8: 0.05961 }) }
  ].map(volados));

  /* ---------- Caja del supermercado (cola de un canal) ---------- */
  function caja(v) {
    var TL = v.TL, TS = v.TS, rows = [], hl = 0, fin = 0;
    TL.forEach(function (t, k) { hl += t; var ini = Math.max(hl, fin), f = ini + TS[k]; rows.push({ tl: t, hl: hl, ini: ini, ts: TS[k], fin: f, sis: f - hl, inac: ini - fin }); fin = f; });
    var n = rows.length, Ssis = suma(rows.map(function (r) { return r.sis; })), Sin = suma(rows.map(function (r) { return r.inac; })), TPS = Ssis / n, ocio = Sin / fin * 100;
    function fila(r, k) { return [String(k + 1), String(r.tl), String(r.hl), String(r.ini), String(r.ts), String(r.fin), String(r.sis), String(r.inac)]; }
    var CICLO = ["hl", "fin", "sis", "inac"], COL = { hl: 2, ini: 3, fin: 5, sis: 6, inac: 7 };
    var VER = { hl: [0, 1, 4], ini: [0, 1, 2, 4], fin: [0, 1, 2, 3, 4], sis: [0, 1, 2, 3, 4, 5], inac: [0, 1, 2, 3, 4, 5, 6] };
    var FG = { hl: "Hora llegada = hora llegada del cliente anterior + tiempo llegada (reloj inicial = 0)", ini: T`Hora inicio servicio $=$ la mayor entre (hora llegada, hora fin servicio del cliente anterior)`, fin: "Hora fin servicio = hora inicio servicio + tiempo servicio", sis: "Tiempo espera = hora fin servicio − hora llegada", inac: "Tiempo cajero inactivo = hora inicio servicio − hora fin servicio del cliente anterior" };
    var NOM = { hl: "la hora de llegada", ini: "la hora de inicio de servicio", fin: "la hora de fin de servicio", sis: "el tiempo de espera", inac: "el tiempo de cajero inactivo" };
    var c = 0;
    var pasos = rows.map(function (r, k) {
      var q = k > 0 && r.ini > r.hl ? "ini" : CICLO[c++ % CICLO.length], ant = k ? rows[k - 1].fin : 0, hlAnt = k ? rows[k - 1].hl : 0, cuenta;
      if (q === "hl") cuenta = T`$${hlAnt} + ${r.tl} = ${r.hl}$`;
      else if (q === "ini") cuenta = T`mayor entre $(${r.hl},\ ${ant}) = ${r.ini}$`;
      else if (q === "fin") cuenta = T`$${r.ini} + ${r.ts} = ${r.fin}$`;
      else if (q === "sis") cuenta = T`$${r.fin} - ${r.hl} = ${r.sis}$`;
      else cuenta = T`$${r.ini} - ${ant} = ${r.inac}$`;
      var mal = { hl: r.tl, ini: r.hl, fin: r.hl + r.ts, sis: r.ts, inac: r.hl - hlAnt }[q];
      if (q === "ini" && mal === r.ini) mal = ant;
      return P({ t: "Cliente " + (k + 1), fg: FG[q], f: NOM[q].replace(/^./, function (z) { return z.toUpperCase(); }) + " del cliente " + (k + 1) + ": " + cuenta, pide: NOM[q] + " del cliente " + (k + 1), ok: r[q], males: [mal, r[q] + 1], seg: 45, fila: fila(r, k), ver: VER[q], col: COL[q] });
    });
    pasos.push(P({ t: "Tiempo promedio en el sistema", fg: T`$TPS = \dfrac{\sum \text{tiempo espera}}{\text{No. de clientes}}$`, f: T`$TPS = \dfrac{${Ssis}}{${n}} = ${fx(TPS, 4)}$ min`, pide: "el tiempo promedio en el sistema $TPS$ (min)", ok: TPS, dec: 4,
      males: [Ssis / (n - 1), suma(TS) / n], seg: 60, fila: ["Σ", String(suma(TL)), "", "", String(suma(TS)), "", String(Ssis), String(Sin)] }));
    return {
      TL: TL, TS: TS, rows: rows, TPS: TPS, ocio: ocio, total: fin, filasIni: [["0", "", "", "", "", "0", "", ""]],
      enunciado: T`Sistema de colas con un solo canal (una caja registradora de un supermercado). El tiempo de llegada entre clientes está distribuido uniformemente entre 1 y 10 minutos y el tiempo de atención entre 1 y 6 minutos. Los tiempos simulados para ${n} clientes son: tiempos de llegada ${TL.join(", ")} min; tiempos de servicio ${TS.join(", ")} min. Llena la tabla y calcula el tiempo promedio en que un cliente permanece dentro del sistema y el porcentaje de tiempo desocupado del cajero.`,
      cols: ["No", "Tiempo llegada", "Hora llegada", "Hora inicio servicio", "Tiempo servicio", "Hora fin servicio", "Tiempo espera", "Cajero inactivo"],
      pasos: pasos,
      jefe: [J("¿Cuál es el porcentaje de tiempo desocupado del cajero?", fx(ocio, 4) + "\\%", fx(Sin / n, 4) + "\\%", T`$\%\ \text{desocupado} = \dfrac{\sum \text{tiempo cajero inactivo}}{\text{tiempo total de operación}} \times 100$ (tiempo total = hora fin servicio del último cliente)`)],
      resumen: T`$TPS = \frac{${Ssis}}{${n}} = ${fx(TPS, 4)}$ min; % desocupado $= \frac{${Sin}}{${fin}} \times 100 = ${fx(ocio, 4)}\%$.`
    };
  }
  mundo({ id: "m15", nombre: "Caja del supermercado", unidad: "Aplicaciones", tema: 14, tipo: "app", fuente: "EjApCaja.pdf (20 clientes)" }, [
    { TL: [9, 2, 6, 8, 6, 9], TS: [3, 2, 4, 6, 4, 4] }, { TL: [4, 2, 5, 3, 5, 10], TS: [3, 3, 4, 4, 6, 3] }, { TL: [2, 2, 4, 8, 8, 3], TS: [3, 4, 3, 2, 2, 3] },
    { TL: [4, 8, 8, 3, 6, 3], TS: [3, 2, 2, 3, 5, 2] }, { TL: [5, 2, 6, 3, 6, 2], TS: [3, 2, 4, 6, 4, 4] }, { TL: [5, 5, 5, 10, 2, 2], TS: [4, 4, 6, 3, 1, 4] }
  ].map(caja));

  /* ---------- Datos del problema que se repiten en cada zona de cálculo ---------- */
  function datosDe(id, V) {
    var al = V.alfa !== undefined ? T`$\alpha = ${pct(V.alfa)}$` : "";
    switch (id) {
      case "m04": case "m05": case "m09": return T`$N = 10$, ` + al;
      case "m06": return T`$N = 10$, $n = ${V.n}$, ` + al;
      case "m07": return T`$N = 10$, $n = 2$, ` + al;
      case "m08": return T`$N = 10$, $n = 3$, ` + al;
      case "m10": return T`$\lambda = ${V.lam}$, ${V.R.length} clientes ($R$ de cada cliente en la tabla)`;
      case "m11": return T`$a = ${V.a}$ min, $b = ${V.b}$ min ($R$ de cada refresco en la tabla)`;
      case "m12": return T`$R$ de cada mensaje en la tabla`;
      case "m13": return T`$\lambda = ${V.lam}$`;
      case "m14": return T`Cantidad inicial ${pesos(V.ini)}, apuesta inicial ${pesos(V.base)}, meta ${pesos(V.meta)}; se gana si ${V.le ? "$R \le 0.5$" : "$R < 0.5$"}`;
      case "m15": return T`Tiempos de llegada: ${V.TL.join(", ")} min · tiempos de servicio: ${V.TS.join(", ")} min`;
    }
    return "";
  }
  NIVELES.forEach(function (Nv) {
    Nv.variantes.forEach(function (V) {
      var base = V.datosZona || datosDe(Nv.id, V);
      V.pasos.forEach(function (p) {
        var m = /\$X_n = (\d+)\$/.exec(p.t || "");
        p.datos = base.replace("{xn}", m ? m[1] : "");
      });
      V.datosZona = base.replace(/ · en este renglón.*$/, "");
    });
  });

  /* ---------- Numeración y comprobaciones ---------- */
  NIVELES.forEach(function (Nv, i) {
    Nv.num = i + 1;
    Nv.variantes.forEach(function (V) {
      V.pasos.forEach(function (p) {
        if (!p.malTxt || p.okTxt === p.malTxt) throw new Error("Tubo falso vacío o igual a la respuesta en " + Nv.id + " problema " + V.prob + " · " + p.t);
        if (p.tipo === "num" && !isFinite(p.ok)) throw new Error("Respuesta no numérica en " + Nv.id + " · " + p.t);
      });
      V.jefe.forEach(function (q) { if (q.ok === q.mal) throw new Error("Distractor del jefe igual en " + Nv.id + " problema " + V.prob); });
    });
  });
  /* Arma el mundo jugable con uno de sus problemas. */
  function problema(i, k) { var Nv = NIVELES[i], V = Nv.variantes[k]; var o = {}; Object.keys(Nv).forEach(function (c) { if (c !== "variantes") o[c] = Nv[c]; }); Object.keys(V).forEach(function (c) { o[c] = V[c]; }); return o; }

  var API = { NIVELES: NIVELES, problema: problema, fx: fx, rd: rd, Z_TABLA: Z_TABLA, CHI: CHI, KS10: KS10, MANOS: MANOS, PROB: PROB };
  raiz.BROTE = raiz.BROTE || {}; raiz.BROTE.niveles = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
