/* =========================================================
   SEMILLÍN RUN · NIVELES (17 mundos)
   Cada mundo es una variante de un problema resuelto en clase (apuntes del
   profesor "OZ", Modelado y Simulación de Sistemas Dinámicos): mismo
   procedimiento, misma fórmula y mismo formato de tabla, con otros números.
   El juego da los datos del problema (como en clase) y el jugador calcula
   cada celda de la tabla.
   Los textos usan $…$ para las fórmulas (se dibujan con KaTeX en el juego
   y como ecuaciones de Word en el solucionario); \$ es un signo de pesos.
   Este archivo solo contiene datos y cálculos: se puede probar en Node.
   ========================================================= */
(function (raiz) {
  "use strict";
  var T = String.raw;

  /* ---------- Formato ---------- */
  function rd(v, d) { var p = Math.pow(10, d === undefined ? 6 : d); return Math.round(v * p) / p; }
  function fx(v, d) { if (typeof v !== "number") return String(v); var s = rd(v, d === undefined ? 6 : d).toString(); return s === "-0" ? "0" : s; }
  function pesos(v) { return "\\$" + v.toFixed(2); }
  function suma(a) { return a.reduce(function (s, x) { return s + x; }, 0); }

  /* Paso del juego.
     t: título · fg: fórmula general (la de clase) · f: sustitución con los números del problema
     pide: lo que se calcula · ok: respuesta (número → se escribe; texto → se elige tubo) · mal: tubo falso (solo texto)
     fila(s): renglones que se agregan a la tabla al responder · ver: columnas visibles antes de responder · col: celda que se pide
     pon: [[renglón, columna, valor]] celdas que se llenan en renglones ya existentes · seg: segundos base para resolver */
  function P(o) {
    if (o.fila && !Array.isArray(o.fila[0])) o.filas = [o.fila]; else o.filas = o.fila || [];
    delete o.fila;
    o.tipo = typeof o.ok === "number" ? "num" : "opcion";
    o.okTxt = o.pesos ? pesos(o.ok) : fx(o.ok, o.dec);
    o.malTxt = o.mal === undefined ? "" : (o.pesos ? pesos(o.mal) : fx(o.mal, o.dec));
    return o;
  }
  function J(q, ok, mal) { return { q: q, ok: ok, mal: mal }; }

  /* ¿El número escrito coincide con la respuesta? Se acepta truncar o redondear a 4 decimales. */
  function revisar(p, v) {
    if (p.tipo !== "num" || typeof v !== "number" || !isFinite(v)) return false;
    var tol = Math.max(1e-4, Math.abs(p.ok) * 1e-3);
    return Math.abs(v - p.ok) <= tol + 1e-12;
  }

  /* ---------- Tablas del curso (TablasPE.pdf, α = 5 %) ---------- */
  var Z_TABLA = 1.96;                                     /* Z(0.475) */
  var CHI = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49 };       /* χ²(0.05, ν) */
  var KS_10 = 0.409;                                      /* d(0.05, 10) */

  var NIVELES = [];

  /* =========================================================
     MUNDO 1 · ¿Qué es simular?  (IntroSimulación.pdf, Generación#Rectangulares.pdf)
     ========================================================= */
  function teoria(t, frase, pide, ok, mal, fila) { return P({ t: t, f: frase, pide: pide, ok: ok, mal: mal, fila: fila, ver: [0, 1], col: 2 }); }
  NIVELES.push({
    id: "m01", nombre: "¿Qué es simular?", unidad: "UT1 · Introducción", tema: 0, tipo: "teoria",
    fuente: "IntroSimulación.pdf · Generación#Rectangulares.pdf",
    enunciado: "Completa las definiciones del curso. Lee la frase y entra al tubo que la completa tal como viene en el apunte.",
    cols: ["#", "Concepto", "Respuesta"],
    pasos: [
      teoria("Definición de Shannon", "Shannon: es el proceso de diseñar un modelo computarizado de un sistema y conducir ______ con él.", "la palabra que falta", "experimentos", "encuestas", ["1", "Shannon: diseñar un modelo y conducir…", "experimentos"]),
      teoria("Definición de Naylor", "Naylor: es una técnica ______ para conducir experimentos en una computadora digital.", "el tipo de técnica", "numérica", "gráfica", ["2", "Naylor: técnica … en computadora digital", "numérica"]),
      teoria("Origen del término", "En 1940, Von Neumann y Ulam resolvieron problemas de reacciones nucleares en el proyecto ______.", "el nombre del proyecto", "Monte Carlo", "Apolo", ["3", "Von Neumann y Ulam, 1940", "Monte Carlo"]),
      teoria("Pasos de un experimento", "Después de la implementación del modelo en la computadora sigue la ______.", "el siguiente paso", "Validación", "Documentación", ["4", "Paso después de la implementación", "Validación"]),
      teoria("Números rectangulares", "Se obtienen por provisión externa, por un proceso físico al azar o por una relación de ______.", "la tercera forma", "recurrencia", "regresión", ["5", "Tercera forma de obtener rectangulares", "relación de recurrencia"]),
      teoria("Características deseables", "Deben ser uniformes, independientes, reproducibles y de período ______.", "cómo debe ser el período", "largo", "corto", ["6", "Período de los rectangulares", "largo"])
    ],
    jefe: [J("¿Cuál es el PRIMER paso para realizar un experimento de simulación?", "Definición del sistema", "Colección de datos"),
      J("La validación detecta deficiencias en la formulación del modelo o en sus…", "datos", "colores")],
    resumen: "Los 8 pasos: definición del sistema, formulación del modelo, colección de datos, implementación en la computadora, validación, experimentación, interpretación y documentación."
  });

  /* =========================================================
     MUNDOS 2 y 3 · Generadores congruenciales (ProbGeneradores.pdf)
     El jugador calcula cada semilla Xn+1 (el numerador del quebrado); el número rectangular sale de Xn+1 / m.
     ========================================================= */
  function nivelLCG(o) {
    var g = o.g, x = g.x0, pasos = [], n = 0, mixto = g.tipo === "mixto";
    var fg = mixto ? T`X_{n+1} = (aX_n + c) \bmod m` : T`X_{n+1} = aX_n \bmod m`;
    do {
      n++;
      var num = g.a * x + g.c, ent = Math.floor(num / g.m), X1 = num % g.m, R = X1 / g.m;
      var arriba = mixto ? T`(${g.a})(${x}) + ${g.c}` : T`(${g.a})(${x})`;
      var cuenta = T`\frac{${arriba}}{${g.m}} = \frac{${num}}{${g.m}}` + (ent ? T` = ${ent} + \frac{${X1}}{${g.m}}` : "");
      pasos.push(P({
        t: T`$n = ${n}$ · $X_{${n - 1}} = ${x}$`, fg: fg,
        f: T`$${cuenta}$ → $X_{${n}} = ${X1}$ y $R_{${n}} = \frac{${X1}}{${g.m}} = ${fx(R, 6)}$`,
        pide: T`$X_{${n}}$ (numerador del quebrado)`, ok: X1, mal: (X1 + 1) % g.m,
        fila: [String(n), String(x), "$" + cuenta + "$", String(X1), T`$\frac{${X1}}{${g.m}}$ = ${fx(R, 6)}`], ver: [0, 1, 2], col: 3
      }));
      x = X1;
    } while (x !== g.x0 && n < 40);
    var esp = mixto ? g.m : g.m / 4, ok = n === esp;
    o.pasos = pasos; o.periodo = n; o.esperado = esp; o.acepta = ok;
    o.cols = ["n", "$X_n$", mixto ? "$\\frac{aX_n + c}{m}$" : "$\\frac{aX_n}{m}$", "$X_{n+1}$", "# Rect."];
    return o;
  }
  NIVELES.push(nivelLCG({
    id: "m02", nombre: "Generador mixto", unidad: "UT2 · Números rectangulares", tema: 1, tipo: "lcg",
    fuente: "ProbGeneradores.pdf (ejemplo a = 7, X0 = 7, C = 7, m = 10)",
    g: { tipo: "mixto", a: 3, c: 7, m: 10, x0: 3 },
    enunciado: T`Determina si el generador congruencial mixto $X_{n+1} = (3X_n + 7) \bmod 10$ con $X_0 = 3$ produce números rectangulares aceptados. Para $X_{n+1}$ se considera el numerador del quebrado. Sigue hasta que la semilla regrese a $X_0$.`,
    jefe: [J("El ciclo regresó a $X_0 = 3$ en $n = 4$. Para el mixto, ¿con qué se compara $n$?", "$n = m = 10$", T`$n = \frac{m}{4} = 2.5$`),
      J("Como $n = 4 \\ne m = 10$, los números rectangulares…", "Son RECHAZADOS", "Son ACEPTADOS"),
      J("Regla del apunte: $(a - 1) \\bmod b = 0$ para cada factor primo $b$ de $m$. Con $a = 3$ y $b = 5$:", "$(3 - 1) \\bmod 5 = 2 \\ne 0$", "$(3 - 1) \\bmod 5 = 0$")],
    resumen: "Período $n = 4$ y $m = 10$: como $n \\ne m$, el período no es completo y los números rectangulares son rechazados. La regla $(a - 1) \\bmod 5 = 0$ ya lo advertía."
  }));
  NIVELES.push(nivelLCG({
    id: "m03", nombre: "Generador multiplicativo", unidad: "UT2 · Números rectangulares", tema: 2, tipo: "lcg",
    fuente: "ProbGeneradores.pdf (ejemplo a = 5, X0 = 5, m = 32)",
    g: { tipo: "multiplicativo", a: 11, c: 0, m: 32, x0: 3 },
    enunciado: T`Determina si el generador congruencial multiplicativo $X_{n+1} = 11X_n \bmod 32$ con $X_0 = 3$ produce números rectangulares aceptados (sistema binario: $PE = \frac{m}{4}$). Sigue hasta que la semilla regrese a $X_0$.`,
    jefe: [J("Sistema binario: ¿cuál es el período esperado $PE$?", T`$PE = \frac{m}{4} = 8$`, "$PE = m = 32$"),
      J("El ciclo regresó a $X_0 = 3$ en $n = 8$. Como $n = PE$, los números…", "Son ACEPTADOS", "Son RECHAZADOS"),
      J("En binario, $a$ se obtiene con $a = 8t \\pm 3$. ¿Qué $t$ da $a = 11$?", "$t = 1$ (8·1 + 3)", "$t = 2$ (8·2 − 3)")],
    resumen: T`Período $n = 8 = PE = \frac{32}{4}$: los números rectangulares son aceptados ($a = 8(1) + 3$ y $X_0 = 3$ impar, como pide la regla del sistema binario).`
  }));

  /* =========================================================
     Datos para las pruebas (variante de los 10 números de clase)
     ========================================================= */
  var DATOS = [0.05213, 0.41867, 0.19544, 0.30876, 0.72395, 0.26041, 0.58712, 0.33509, 0.08236, 0.45193];
  var N = DATOS.length;
  function concl(est, tab, nombre) {
    var acepta = est < tab;
    return J(T`$${nombre}_0 = ${fx(est)}$ y el valor de tablas es $${tab}$. ¿Qué se concluye?`, acepta ? "Aceptados: el estadístico es menor" : "Rechazados: el estadístico es mayor", acepta ? "Rechazados: el estadístico es menor" : "Aceptados: el estadístico es mayor");
  }

  /* MUNDO 4 · Promedios (PPromedios.pdf) */
  (function () {
    var s = rd(suma(DATOS), 5), X = rd(s / N, 6), Z0 = Math.abs((X - 0.5) * Math.sqrt(N) / Math.sqrt(1 / 12));
    NIVELES.push({
      id: "m04", nombre: "Prueba de promedios", unidad: "UT2 · Pruebas estadísticas", tema: 3, tipo: "prueba", datos: DATOS,
      fuente: "PPromedios.pdf", Z0: Z0,
      enunciado: "Con $\\alpha = 5\\%$ aplica la prueba de promedios a los 10 números rectangulares.",
      cols: ["Paso", "Fórmula", "Resultado"],
      pasos: [
        P({ t: "Suma de los números", fg: T`$\sum x_i = x_1 + x_2 + \dots + x_N$`, f: T`$\sum x_i = 0.05213 + 0.41867 + \dots + 0.45193 = ${fx(s, 5)}$`, pide: T`$\sum x_i$`, ok: s, dec: 5, fila: ["1", T`$\sum x_i$`, fx(s, 5)], col: 2 }),
        P({ t: "Media aritmética", fg: T`$\bar{X} = \dfrac{\sum x_i}{N}$`, f: T`$\bar{X} = \dfrac{${fx(s, 5)}}{10} = ${fx(X)}$`, pide: T`$\bar{X}$`, ok: X, fila: ["2", T`$\bar{X} = \frac{\sum x_i}{N}$`, fx(X)], col: 2 }),
        P({ t: "Estadístico $Z_0$", fg: T`$Z_0 = \left|\dfrac{\left(\bar{X} - \frac{1}{2}\right)\sqrt{N}}{\sqrt{\frac{1}{12}}}\right|$`, f: T`$Z_0 = \left|\dfrac{(${fx(X)} - \frac{1}{2})\sqrt{10}}{\sqrt{\frac{1}{12}}}\right| = ${fx(Z0)}$`, pide: "$Z_0$", ok: Z0, seg: 60,
          fila: ["3", T`$Z_0 = \left|\frac{(\bar{X} - \frac{1}{2})\sqrt{N}}{\sqrt{1/12}}\right|$`, fx(Z0)], col: 2 }),
        P({ t: "$Z$ de tablas", fg: T`$\alpha_{real} = 100\% - \alpha = 95\% \;\Rightarrow\; Z_{\alpha_{real}/2} = Z_{0.475}$`, f: T`En el cuerpo de la tabla normal se busca $0.4750$: renglón $1.9$, columna $.06$ → $Z_{0.475} = 1.96$`, pide: "$Z_{0.475}$ (búscalo en la tabla normal)", ok: Z_TABLA, fila: ["4", "$Z_{0.95/2} = Z_{0.475}$", "1.96"], col: 2, tabla: "normal" })
      ],
      jefe: [concl(Z0, Z_TABLA, "Z"),
        J(T`¿Por qué se usa $\sqrt{\frac{1}{12}}$ en la fórmula?`, "Es la desviación de los rectangulares", "Es el número de datos")],
      resumen: T`$\bar{X} = ${fx(X)}$, $Z_0 = ${fx(Z0)} < 1.96$: los números rectangulares son aceptados.`
    });
  })();

  /* MUNDO 5 · Kolmogorov-Smirnov (PKS.pdf) */
  (function () {
    var xs = DATOS.slice().sort(function (a, b) { return a - b; });
    var D = xs.map(function (x, i) { return rd((i + 1) / N - x, 5); });
    var Dn = Math.max.apply(null, D), iMax = D.indexOf(Dn);
    var pide = [1, 4, 6, iMax + 1].filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    function celda(i) { return T`$\frac{${i + 1}}{10} - ${fx(xs[i], 5)}$ = ${fx(D[i], 5)}`; }
    var pasos = [P({ t: "Ordena de menor a mayor", fg: T`$x_{(1)} \le x_{(2)} \le \dots \le x_{(10)}$`, f: T`Ordenados: ${xs.map(function (x) { return fx(x, 5); }).join(", ")} → $x_{(1)} = ${fx(xs[0], 5)}$`, pide: T`el menor, $x_{(1)}$`, ok: xs[0], dec: 5,
      fila: xs.map(function (x, i) { return [String(i + 1), fx(x, 5), T`$\frac{${i + 1}}{10}$ = ${fx((i + 1) / 10)}`, ""]; }) })];
    pide.forEach(function (i) {
      var x = xs[i - 1];
      pasos.push(P({ t: T`Renglón $i = ${i}$`, fg: T`$D_n = F(x_i) - x_i = \dfrac{i}{N} - x_i$`, f: T`$D_n = \dfrac{${i}}{10} - ${fx(x, 5)} = ${fx(D[i - 1], 5)}$`, pide: T`$D_n$ para $i = ${i}$`, ok: D[i - 1], dec: 5, pon: [[i - 1, 3, celda(i - 1)]] }));
    });
    pasos.push(P({ t: "El mayor $D_n$", fg: T`$D_n = \max\left[F(x_i) - x_i\right]$`, f: T`El valor más grande de la columna es el del renglón $i = ${iMax + 1}$: $D_n = ${fx(Dn, 5)}$`, pide: "$D_n$ (el valor mayor)", ok: Dn, dec: 5,
      pon: xs.map(function (x, i) { return [i, 3, celda(i) + (i === iMax ? "  ← mayor" : "")]; }) }));
    pasos.push(P({ t: "Valor de tablas", fg: T`$d_{\alpha,\,N}$ con $\alpha = 0.05$ y $N = 10$`, f: T`Tabla KS: renglón $N = 10$, columna $\alpha = 5\%$ → $d_{0.05,\,10} = 0.409$`, pide: T`$d_{0.05,\,10}$ (búscalo en la tabla KS)`, ok: KS_10, fila: [["", "", T`$D_n$ =`, fx(Dn, 5)], ["", "", T`$d_{0.05,10}$ =`, "0.409"]], tabla: "ks" }));
    NIVELES.push({
      id: "m05", nombre: "Prueba Kolmogorov-Smirnov", unidad: "UT2 · Pruebas estadísticas", tema: 4, tipo: "prueba", datos: DATOS,
      fuente: "PKS.pdf", xs: xs, D: D, Dn: Dn,
      enunciado: T`Con $\alpha = 5\%$ aplica la prueba KS: ordena los números, calcula $F(x_i) = \frac{i}{N}$ y $D_n = F(x_i) - x_i$ en cada renglón y toma el mayor.`,
      cols: ["$i$", "$x_i$", "$F(x_i) = \\frac{i}{N}$", "$D_n$"],
      pasos: pasos,
      jefe: [J(T`$D_n = ${fx(Dn, 5)}$ y $d_{0.05,10} = 0.409$. ¿Qué se concluye?`, Dn < KS_10 ? "Aceptados: $D_n < d$" : "Rechazados: $D_n > d$", Dn < KS_10 ? "Rechazados: $D_n < d$" : "Aceptados: $D_n > d$"),
        J("¿Por qué se ordenan los números antes de calcular?", T`$F(x_i) = \frac{i}{N}$ supone orden creciente`, "Para que la suma dé 1")],
      resumen: T`El mayor valor es $D_n = ${fx(Dn, 5)}$ ($i = ${iMax + 1}$) $< d_{0.05,10} = 0.409$: los números rectangulares son aceptados.`
    });
  })();

  /* MUNDO 6 · Frecuencias (PF.pdf) */
  (function () {
    var n = 4, FE = N / n, FO = [0, 0, 0, 0];
    DATOS.forEach(function (x) { FO[Math.min(n - 1, Math.floor(x * n))]++; });
    var X2 = rd(suma(FO.map(function (o) { return (o - FE) * (o - FE); })) / FE, 6);
    var lim = [[0, 0.25], [0.25, 0.5], [0.5, 0.75], [0.75, 1]];
    var pasos = [P({ t: "Frecuencia esperada", fg: T`$FE_i = \dfrac{N}{n}$`, f: T`$FE_i = \dfrac{10}{4} = 2.5$`, pide: "$FE_i$", ok: FE, fila: ["FE", T`$\frac{N}{n}$`, "", "2.5"], col: 3 })];
    FO.forEach(function (fo, i) {
      var de = lim[i][0], a = lim[i][1];
      pasos.push(P({ t: T`Intervalo ${i + 1}: $${de} \le x < ${a}$`, fg: T`$FO_i$ = cuántos números caen en el intervalo $i$`, f: T`Números entre $${de}$ y $${a}$: ${DATOS.filter(function (x) { return x >= de && x < a; }).map(function (x) { return fx(x, 5); }).join(", ") || "ninguno"} → $FO_{${i + 1}} = ${fo}$`,
        pide: T`$FO_{${i + 1}}$`, ok: fo, fila: [String(i + 1), T`$${de} - ${a}$`, String(fo), "2.5"], ver: [0, 1, 3], col: 2 }));
    });
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \displaystyle\sum \frac{(FO_i - FE_i)^2}{FE_i}$`, f: T`$X_0^2 = \dfrac{${FO.map(function (o) { return "(" + o + " - 2.5)^2"; }).join(" + ")}}{2.5} = ${fx(X2)}$`, pide: "$X_0^2$", ok: X2, seg: 60, fila: [T`$X_0^2$`, T`$\sum\frac{(FO - FE)^2}{FE}$`, "", fx(X2)], col: 3 }));
    pasos.push(P({ t: "Valor de tablas", fg: T`$X^2_{\alpha,\,n-1}$ con $\alpha = 0.05$ y $n - 1 = 4 - 1 = 3$`, f: T`Tabla $X^2$: renglón $\nu = 3$, columna $0.050$ → $X^2_{0.05,\,3} = 7.81$`, pide: T`$X^2_{0.05,\,3}$ (búscalo en la tabla $X^2$)`, ok: CHI[3], fila: ["Tabla", T`$X^2_{0.05,3}$`, "", "7.81"], col: 3, tabla: "chi" }));
    NIVELES.push({
      id: "m06", nombre: "Prueba de frecuencias", unidad: "UT2 · Pruebas estadísticas", tema: 5, tipo: "prueba", datos: DATOS,
      fuente: "PF.pdf", FO: FO, X2: X2,
      enunciado: "Con $\\alpha = 5\\%$ y $n = 4$ intervalos aplica la prueba de frecuencias.",
      cols: ["$i$", "Intervalo", "$FO_i$", "$FE_i$"],
      pasos: pasos,
      jefe: [concl(X2, CHI[3], "X^2")],
      resumen: T`$FO = ${FO.join(",\\ ")}$, $FE = 2.5$ → $X_0^2 = ${fx(X2)} < 7.81$: los números rectangulares son aceptados.`
    });
  })();

  /* MUNDO 7 · Series (PSeries.pdf) */
  (function () {
    var n = 2, FE = (N - 1) / (n * n), C = { "00": 0, "01": 0, "10": 0, "11": 0 }, filas = [];
    for (var i = 0; i < N - 1; i++) {
      var k = Math.floor(DATOS[i] * n) + "" + Math.floor(DATOS[i + 1] * n); C[k]++;
      filas.push([String(i + 1), fx(DATOS[i], 5), fx(DATOS[i + 1], 5), k === "00" ? "abajo izq." : k === "01" ? "arriba izq." : k === "10" ? "abajo der." : "arriba der."]);
    }
    var FO = [C["00"], C["01"], C["10"], C["11"]];
    var X2 = rd((n * n) / (N - 1) * suma(FO.map(function (o) { return (o - FE) * (o - FE); })), 6);
    var nombres = [T`abajo izquierda ($x < \frac12,\ y < \frac12$)`, T`arriba izquierda ($x < \frac12,\ y \ge \frac12$)`, T`abajo derecha ($x \ge \frac12,\ y < \frac12$)`, T`arriba derecha ($x \ge \frac12,\ y \ge \frac12$)`];
    var cortos = ["abajo izq.", "arriba izq.", "abajo der.", "arriba der."];
    var pasos = [P({ t: "Forma las parejas", fg: T`Parejas $(U_i,\ U_{i+1})$: 1ª con 2ª, 2ª con 3ª, …, 9ª con 10ª`, f: T`Con $N = 10$ números hay $N - 1 = 9$ parejas`, pide: "¿cuántas parejas?", ok: N - 1, fila: filas }),
      P({ t: "Frecuencia esperada", fg: T`$FE = \dfrac{N - 1}{n^2}$`, f: T`$FE = \dfrac{9}{2^2} = \dfrac{9}{4} = 2.25$`, pide: "$FE$", ok: FE })];
    FO.forEach(function (fo, i) { pasos.push(P({ t: "Cuadrante " + (i + 1), fg: "$FO$ = parejas que caen en el cuadrante " + nombres[i], f: T`Parejas en ${cortos[i]}: $FO = ${fo}$`, pide: "$FO$ del cuadrante " + (i + 1), ok: fo, fila: ["", "", "Cuadrante " + (i + 1), "FO = " + fo], ver: [2], col: 3 })); });
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \dfrac{n^2}{N - 1}\displaystyle\sum (FO_{ij} - FE)^2$`, f: T`$X_0^2 = \dfrac{4}{9}\left[${FO.map(function (o) { return "(" + o + " - 2.25)^2"; }).join(" + ")}\right] = ${fx(X2)}$`, pide: "$X_0^2$", ok: X2, seg: 60, fila: ["", "", "$X_0^2$", fx(X2)], ver: [2], col: 3 }));
    pasos.push(P({ t: "Valor de tablas", fg: T`$X^2_{\alpha,\,n^2-1}$ con $\alpha = 0.05$ y $n^2 - 1 = 4 - 1 = 3$`, f: T`Tabla $X^2$: renglón $\nu = 3$, columna $0.050$ → $X^2_{0.05,\,3} = 7.81$`, pide: T`$X^2_{0.05,\,3}$ (búscalo en la tabla $X^2$)`, ok: CHI[3], fila: ["", "", T`$X^2_{0.05,3}$`, "7.81"], ver: [2], col: 3, tabla: "chi" }));
    NIVELES.push({
      id: "m07", nombre: "Prueba de series", unidad: "UT2 · Pruebas estadísticas", tema: 6, tipo: "prueba", datos: DATOS,
      fuente: "PSeries.pdf", FO: FO, X2: X2,
      enunciado: T`Con $\alpha = 5\%$ y $n = 2$ aplica la prueba de series: forma parejas consecutivas $(U_i,\ U_{i+1})$ en el orden de la lista y ubícalas en los 4 cuadrantes del plano.`,
      cols: ["Pareja", "$U_i$ (x)", "$U_{i+1}$ (y)", "Cuadrante"],
      pasos: pasos,
      jefe: [concl(X2, CHI[3], "X^2")],
      resumen: T`$FO$ por cuadrante $= ${FO.join(",\\ ")}$, $FE = 2.25$ → $X_0^2 = \frac{4}{9}\sum(FO - FE)^2 = ${fx(X2)} < 7.81$: aceptados.`
    });
  })();

  /* MUNDO 8 · Distancias (PDistancias.pdf) */
  (function () {
    var D = [0.27741, 0.65590, 0.31184, 0.81615, 0.57374, 0.06092, 0.24927, 0.52851, 0.70937, 0.13861];
    function distancia(x) {
      var s = x.toFixed(5).slice(2);
      for (var i = 0; i < s.length; i++) for (var j = i + 1; j < s.length; j++) if (s[i] === s[j]) return { d: j - i - 1, dig: s[i] };
      return null;
    }
    var nG = 3, info = D.map(distancia), dist = info.map(function (o) { return o.d; }), FO = [0, 0, 0, 0];
    dist.forEach(function (d) { FO[Math.min(nG, d)]++; });
    var FE = [0, 1, 2].map(function (i) { return rd(0.1 * Math.pow(0.9, i) * N, 6); }).concat([rd(Math.pow(0.9, nG) * N, 6)]);
    var FEa = rd(FE[0] + FE[1] + FE[2], 6), FOa = FO[0] + FO[1] + FO[2];
    var X2 = (FOa - FEa) * (FOa - FEa) / FEa + (FO[3] - FE[3]) * (FO[3] - FE[3]) / FE[3];
    var pasos = [0, 3, 6, 8].map(function (k) {
      return P({ t: "Número " + D[k].toFixed(5), fg: "$i$ = cantidad de dígitos que hay entre dos dígitos iguales", f: T`En ${D[k].toFixed(5)} el dígito ${info[k].dig} se repite y entre los dos hay ${dist[k]} dígito${dist[k] === 1 ? "" : "s"} → $i = ${dist[k]}$`, pide: "la distancia $i$", ok: dist[k] });
    });
    pasos.push(P({ t: "Frecuencias observadas", fg: "$FO_i$ = cuántos números tienen distancia $i$", f: T`Distancias de los 10 números: ${dist.join(", ")} → $FO_0 = ${FO[0]}$`, pide: T`$FO$ para $i = 0$`, ok: FO[0],
      fila: [0, 1, 2, 3].map(function (i) { return [i < 3 ? String(i) : "≥ 3", String(FO[i]), i < 3 ? T`$(0.1)(0.9)^{${i}}(10)$` : T`$(0.9)^{3}(10)$`, fx(FE[i])]; }) }));
    pasos.push(P({ t: "Frecuencia esperada $i \\ge n$", fg: T`$FE_{i \ge n} = (0.9)^n \, N$`, f: T`$FE_{i \ge 3} = (0.9)^{3}(10) = ${fx(FE[3])}$`, pide: T`$FE$ para $i \ge 3$`, ok: FE[3] }));
    pasos.push(P({ t: "Agrupa las $FE$ menores de 5", fg: T`$FE_i = (0.1)(0.9)^i \, N$ para $i < n$; se suman las que son menores de 5`, f: T`$FE_{agrupada} = ${fx(FE[0])} + ${fx(FE[1])} + ${fx(FE[2])} = ${fx(FEa)}$`, pide: "$FE$ agrupada", ok: FEa,
      fila: [["Grupo 1", String(FOa), "1 + 0.9 + 0.81", fx(FEa)], ["Grupo 2", String(FO[3]), T`$(0.9)^{3}(10)$`, fx(FE[3])]] }));
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \displaystyle\sum \frac{(FO_i - FE_i)^2}{FE_i}$`, f: T`$X_0^2 = \dfrac{(${FOa} - ${fx(FEa)})^2}{${fx(FEa)}} + \dfrac{(${FO[3]} - ${fx(FE[3])})^2}{${fx(FE[3])}} = ${fx(X2)}$`, pide: "$X_0^2$", ok: X2, seg: 60, fila: ["$X_0^2$", "", "", fx(X2)], col: 3 }));
    pasos.push(P({ t: "Valor de tablas", fg: T`$X^2_{\alpha,\,g-1}$ con $g = 2$ grupos`, f: T`Tabla $X^2$: renglón $\nu = 2 - 1 = 1$, columna $0.050$ → $X^2_{0.05,\,1} = 3.84$`, pide: T`$X^2_{0.05,\,1}$ (búscalo en la tabla $X^2$)`, ok: CHI[1], fila: ["Tabla", "", T`$X^2_{0.05,1}$`, "3.84"], col: 3, tabla: "chi" }));
    NIVELES.push({
      id: "m08", nombre: "Prueba de distancias", unidad: "UT2 · Pruebas estadísticas", tema: 7, tipo: "prueba", datos: D,
      fuente: "PDistancias.pdf", dist: dist, FO: FO, FE: FE, X2: X2,
      enunciado: T`Con $\alpha = 5\%$ aplica la prueba de distancias. $i$ = distancia (dígitos intermedios) entre los dígitos repetidos de cada número; $FE_i = (0.1)(0.9)^i\,N$ para $i < n$ y $FE = (0.9)^n\,N$ para $i \ge n$, con $n = 3$.`,
      cols: ["$i$", "$FO_i$", "Fórmula $FE_i$", "$FE_i$"],
      pasos: pasos,
      jefe: [concl(X2, CHI[1], "X^2"),
        J("¿Por qué los grados de libertad son 1?", "Quedaron 2 grupos: 2 − 1", "Hay 4 distancias: 4 − 3")],
      resumen: T`$FO$ agrupada $= ${FOa}$ vs $FE = ${fx(FEa)}$; $FO = ${FO[3]}$ vs $FE = ${fx(FE[3])}$ → $X_0^2 = ${fx(X2)} > 3.84$: los números rectangulares son rechazados.`
    });
  })();

  /* MUNDO 9 · Póker (PPoker.pdf) */
  (function () {
    var D = [0.92471, 0.44915, 0.30586, 0.28372, 0.55220, 0.57193, 0.63056, 0.60656, 0.16840, 0.91739];
    var MANOS = ["Todos diferentes", "Un par", "Dos pares", "Tercia", "Full", "Póker", "Quintilla"];
    var PROB = [0.30240, 0.50400, 0.10800, 0.07200, 0.00900, 0.00450, 0.00010];
    function mano(x) {
      var c = {}; x.toFixed(5).slice(2).split("").forEach(function (d) { c[d] = (c[d] || 0) + 1; });
      var v = Object.keys(c).map(function (k) { return c[k]; }).sort().reverse().join("");
      return { "11111": 0, "2111": 1, "221": 2, "311": 3, "32": 4, "41": 5, "5": 6 }[v];
    }
    var m = D.map(mano), FO = [0, 0, 0, 0, 0, 0, 0];
    m.forEach(function (k) { FO[k]++; });
    var FE = PROB.map(function (p) { return rd(p * N, 4); });
    var gr = [0, 2, 3, 4, 5, 6], FEa = rd(suma(gr.map(function (i) { return FE[i]; })), 4), FOa = suma(gr.map(function (i) { return FO[i]; }));
    var X2 = (FOa - FEa) * (FOa - FEa) / FEa + (FO[1] - FE[1]) * (FO[1] - FE[1]) / FE[1];
    var pasos = [1, 4, 7, 8].map(function (k) {
      return P({ t: "Número " + D[k].toFixed(5), fg: "Los 5 dígitos del número forman una mano de póker", f: "Dígitos de " + D[k].toFixed(5) + ": " + D[k].toFixed(5).slice(2).split("").join(", ") + " → " + MANOS[m[k]], pide: "la mano", ok: MANOS[m[k]], mal: MANOS[m[k] === 1 ? 2 : 1] });
    });
    pasos.push(P({ t: "Cuenta las manos", fg: "$FO_i$ = cuántos números forman cada mano", f: "Manos: " + m.map(function (k) { return MANOS[k]; }).join(", ") + T` → $FO_{\text{un par}} = ${FO[1]}$`, pide: "$FO$ de «Un par»", ok: FO[1],
      fila: MANOS.map(function (nm, i) { return [nm, String(FO[i]), T`$(${fx(PROB[i], 5)})(10)$`, fx(FE[i], 4)]; }) }));
    pasos.push(P({ t: "Agrupa las $FE$ menores de 5", fg: T`$FE_i = P(\text{mano})\,N$; se suman todas las menores de 5`, f: T`$FE_{agrupada} = 3.024 + 1.08 + 0.72 + 0.09 + 0.045 + 0.001 = ${fx(FEa, 4)}$`, pide: "$FE$ agrupada", ok: FEa, dec: 4,
      fila: [["Agrupadas", String(FOa), T`$\sum FE < 5$`, fx(FEa, 4)], ["Un par", String(FO[1]), "", fx(FE[1], 4)]] }));
    pasos.push(P({ t: "Estadístico $X_0^2$", fg: T`$X_0^2 = \displaystyle\sum \frac{(FO_i - FE_i)^2}{FE_i}$`, f: T`$X_0^2 = \dfrac{(${FOa} - ${fx(FEa, 4)})^2}{${fx(FEa, 4)}} + \dfrac{(${FO[1]} - 5.04)^2}{5.04} = ${fx(X2)}$`, pide: "$X_0^2$", ok: X2, seg: 60, fila: ["$X_0^2$", "", "", fx(X2)], col: 3 }));
    pasos.push(P({ t: "Valor de tablas", fg: T`$X^2_{\alpha,\,g-1}$ con $g = 2$ grupos`, f: T`Tabla $X^2$: renglón $\nu = 2 - 1 = 1$, columna $0.050$ → $X^2_{0.05,\,1} = 3.84$`, pide: T`$X^2_{0.05,\,1}$ (búscalo en la tabla $X^2$)`, ok: CHI[1], fila: ["Tabla", "", T`$X^2_{0.05,1}$`, "3.84"], col: 3, tabla: "chi" }));
    NIVELES.push({
      id: "m09", nombre: "Prueba póker", unidad: "UT2 · Pruebas estadísticas", tema: 8, tipo: "prueba", datos: D,
      fuente: "PPoker.pdf", manos: m, FO: FO, FE: FE, X2: X2,
      enunciado: T`Con $\alpha = 5\%$ aplica la prueba póker a los 5 dígitos de cada número. $FE_i = P(\text{mano})\,N$; se agrupan todas las $FE$ menores de 5.`,
      cols: ["Mano", "$FO_i$", "$P \\cdot N$", "$FE_i$"],
      pasos: pasos,
      jefe: [concl(X2, CHI[1], "X^2"),
        J("Probabilidad de «Un par» según el apunte:", "0.50400", "0.30240")],
      resumen: T`Agrupadas: $FO = ${FOa}$, $FE = ${fx(FEa, 4)}$; un par: $FO = ${FO[1]}$, $FE = 5.04$ → $X_0^2 = ${fx(X2)} < 3.84$: aceptados. (Al agrupar se incluyen también Póker y Quintilla para que $\sum FE = N = 10$.)`
    });
  })();

  /* =========================================================
     Variables aleatorias no uniformes (ProbGVAU.pdf) · R de la variante
     ========================================================= */
  var RV = [0.58213, 0.91347, 0.27604, 0.40958];

  /* MUNDO 10 · Exponencial (cajero automático, λ = 3 → variante λ = 4) */
  (function () {
    var lam = 4, TA = RV.map(function (r) { return -1 / lam * Math.log(r); }), TT = suma(TA), TP = TT / RV.length;
    var fg = T`$x = -\dfrac{1}{\lambda}\,\mathrm{Ln}\,R$`;
    var pasos = RV.map(function (r, i) {
      return P({ t: "Cliente " + (i + 1), fg: fg, f: T`$TA_{${i + 1}} = -\dfrac{1}{4}\,\mathrm{Ln}(${r}) = ${fx(TA[i], 9)}$`, pide: T`$TA_{${i + 1}}$ (min)`, ok: TA[i], fila: [String(i + 1), String(r), T`$-\frac{1}{4}\mathrm{Ln}(${r})$`, fx(TA[i], 9)], ver: [0, 1, 2], col: 3 });
    });
    pasos.push(P({ t: "Tiempo total del cajero", fg: T`$TTC = \sum TA_i$`, f: T`$TTC = ${TA.map(function (v) { return fx(v, 6); }).join(" + ")} = ${fx(TT, 9)}$`, pide: "$TTC$ (min)", ok: TT, fila: ["", "", "$TTC = \\sum TA$", fx(TT, 9)], ver: [2], col: 3 }));
    pasos.push(P({ t: "Tiempo promedio de atención", fg: T`$TPA = \dfrac{TTC}{\text{No. de clientes}}$`, f: T`$TPA = \dfrac{${fx(TT, 6)}}{4} = ${fx(TP, 9)}$`, pide: "$TPA$ (min)", ok: TP, fila: ["", "", T`$TPA = \frac{TTC}{4}$`, fx(TP, 9)], ver: [2], col: 3 }));
    NIVELES.push({
      id: "m10", nombre: "Distribución exponencial", unidad: "UT2 · Variables no uniformes", tema: 9, tipo: "va",
      fuente: "ProbGVAU.pdf (cajero automático, λ = 3)", TA: TA, TT: TT, TP: TP,
      enunciado: T`Los tiempos de atención de un cajero automático son exponenciales con $\lambda = 4$. Llegaron 4 clientes con $R$ = ${RV.join(", ")}. Calcula cada tiempo, el total y el promedio con $x = -\frac{1}{\lambda}\,\mathrm{Ln}\,R$.`,
      cols: ["Cliente", "$R$", "Fórmula", "$TA$ (min)"],
      pasos: pasos,
      jefe: [J("¿Qué fórmula usa el método de la transformada inversa para la exponencial?", T`$x = -\frac{1}{\lambda}\,\mathrm{Ln}\,R$`, "$x = a + (b - a)R$"),
        J("Si $R$ está cerca de 1, el tiempo generado es…", "Cercano a 0", "Muy grande")],
      resumen: T`$TTC = ${fx(TT, 9)}$ min y $TPA = ${fx(TP, 9)}$ min ($\lambda$ se sustituye directo en $\frac{1}{\lambda}$, como en el ejemplo de clase).`
    });
  })();

  /* MUNDO 11 · Uniforme (envase de refrescos, 2 a 4 min → variante 3 a 6 min) */
  (function () {
    var a = 3, b = 6, TE = RV.map(function (r) { return a + (b - a) * r; }), TT = suma(TE);
    var pasos = RV.map(function (r, i) {
      return P({ t: "Refresco " + (i + 1), fg: "$x = a + (b - a)R$", f: T`$TE_{${i + 1}} = 3 + (6 - 3)(${r}) = ${fx(TE[i], 5)}$`, pide: T`$TE_{${i + 1}}$ (min)`, ok: TE[i], fila: [String(i + 1), String(r), T`$3 + (6 - 3)(${r})$`, fx(TE[i], 5)], ver: [0, 1, 2], col: 3 });
    });
    pasos.push(P({ t: "Tiempo promedio de envase", fg: T`$TP = \dfrac{\sum TE_i}{4}$`, f: T`$TP = \dfrac{${fx(TT, 5)}}{4} = ${fx(TT / 4, 6)}$`, pide: "$TP$ (min)", ok: TT / 4, fila: ["", "", T`$TP = \frac{\sum TE}{4}$`, fx(TT / 4, 6)], ver: [2], col: 3 }));
    NIVELES.push({
      id: "m11", nombre: "Distribución uniforme", unidad: "UT2 · Variables no uniformes", tema: 10, tipo: "va",
      fuente: "ProbGVAU.pdf (envase de refrescos, a = 2, b = 4)", TE: TE,
      enunciado: T`Los tiempos de envase de un refresco están uniformemente distribuidos entre 3 y 6 minutos. Con los mismos $R$ (${RV.join(", ")}) calcula el tiempo de envasamiento de 4 refrescos: $x = a + (b - a)R$.`,
      cols: ["Refresco", "$R$", "Fórmula", "$TE$ (min)"],
      pasos: pasos,
      jefe: [J("En $x = a + (b - a)R$, ¿qué representa $a$?", "El valor mínimo de la variable", "El valor máximo de la variable"),
        J("¿Puede un tiempo generado salir mayor que 6 min?", "No: $R < 1$ y $x < b$", "Sí, si $R$ es grande")],
      resumen: "$TE$ = " + TE.map(function (v) { return fx(v, 5); }).join(", ") + " min. Todos quedan entre $a = 3$ y $b = 6$."
    });
  })();

  /* MUNDO 12 · Empírica (mensajes de texto) */
  (function () {
    var X = RV.map(function (r) { return r <= 0.5 ? Math.sqrt(2 * r) : 2 * r; });
    var fg = T`$x = \sqrt{2R}$ si $R \le \frac{1}{2}$; $\ x = 2R$ si $R > \frac{1}{2}$`;
    var pasos = RV.map(function (r, i) {
      var raiz = r <= 0.5;
      return P({ t: T`Mensaje ${i + 1} ($R = ${r}$)`, fg: fg, f: raiz ? T`Como $R = ${r} \le \frac{1}{2}$: $X_{${i + 1}} = \sqrt{2(${r})} = ${fx(X[i], 9)}$` : T`Como $R = ${r} > \frac{1}{2}$: $X_{${i + 1}} = 2(${r}) = ${fx(X[i], 9)}$`,
        pide: T`$X_{${i + 1}}$ (min)`, ok: X[i], fila: [String(i + 1), String(r), raiz ? T`$\sqrt{2(${r})}$ ($R \le \frac12$)` : T`$2(${r})$ ($R > \frac12$)`, fx(X[i], 9)], ver: [0, 1], col: 3 });
    });
    NIVELES.push({
      id: "m12", nombre: "Distribución empírica", unidad: "UT2 · Variables no uniformes", tema: 11, tipo: "va",
      fuente: "ProbGVAU.pdf (mensajes de texto)", X: X,
      enunciado: T`Los tiempos de transmisión de 4 mensajes de texto están distribuidos empíricamente: $x = \sqrt{2R}$ si $R \le \frac{1}{2}$ y $x = 2R$ si $R > \frac{1}{2}$. Usa los mismos $R$ (${RV.join(", ")}).`,
      cols: ["Mensaje", "$R$", "Fórmula", "$X$ (min)"],
      pasos: pasos,
      jefe: [J("Con $R = 0.5$ exacto, ¿qué fórmula toca?", T`$\sqrt{2R}$, porque $R \le \frac{1}{2}$`, T`$2R$, porque $R \ge \frac{1}{2}$`),
        J("Con $R = 0.5$, ambas fórmulas dan…", "1 (la función es continua)", "Valores distintos")],
      resumen: "$X$ = " + X.map(function (v) { return fx(v, 6); }).join(", ") + " min. Primero se revisa la condición de $R$ y después se aplica la fórmula."
    });
  })();

  /* MUNDO 13 · Poisson y tabla de rangos (DistribuciónPoisson.pdf, λ = 5 → variante λ = 3) */
  (function () {
    var lam = 3, f = [], F = [], acc = 0, x = 0;
    function fact(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
    while (true) { var v = Math.exp(-lam) * Math.pow(lam, x) / fact(x); acc += v; f.push(v); F.push(acc); if (acc >= 0.9999) break; x++; }
    function rango(R) { for (var i = 0; i < F.length; i++) if (R <= F[i]) return i; return F.length; }
    function frac(k) { return T`\dfrac{e^{-3}\,3^{${k}}}{${k}!}`; }
    function celdaRango(k) { return k ? T`$${fx(F[k - 1], 9)} < R \le ${fx(F[k], 9)}$` : T`$0 \le R \le ${fx(F[k], 9)}$`; }
    var fg = T`$f(x) = \dfrac{e^{-\lambda}\,\lambda^{x}}{x!}, \quad F(x) = F(x - 1) + f(x)$`;
    var pasos = [];
    for (var k = 0; k <= 4; k++) {
      pasos.push(P({ t: "$X = " + k + "$", fg: fg, f: T`$f(${k}) = ${frac(k)} = ${fx(f[k], 9)}$ → $F(${k}) = ${k ? fx(F[k - 1], 9) + " + " + fx(f[k], 9) : "f(0)"} = ${fx(F[k], 9)}$`, pide: T`$F(${k})$`, ok: F[k], dec: 9, seg: 60,
        fila: [String(k), T`$${frac(k)}$ = ${fx(f[k], 9)}`, fx(F[k], 9), celdaRango(k)], ver: [0], col: 2 }));
    }
    var resto = []; for (k = 5; k < F.length; k++) resto.push([String(k), T`$${frac(k)}$ = ${fx(f[k], 9)}`, fx(F[k], 9), celdaRango(k)]);
    var ult = F.length - 1;
    pasos.push(P({ t: "¿Cuándo se detiene?", fg: T`Se sigue hasta que $F(x) \approx 1$`, f: T`Con el mismo procedimiento se llega a $X = ${ult}$: $F(${ult}) = ${fx(F[ult], 9)} \approx 1$`, pide: T`$F(${ult})$`, ok: F[ult], dec: 9, seg: 60, fila: resto }));
    var R1 = 0.71530, R2 = 0.18264;
    var fgR = T`Tabla de rangos: $F(x - 1) < R \le F(x)$`;
    pasos.push(P({ t: "Simula la semana 1", fg: fgR, f: T`$R = ${R1.toFixed(5)}$ cae en $${fx(F[rango(R1) - 1], 9)} < R \le ${fx(F[rango(R1)], 9)}$ → demanda $= ${rango(R1)}$`, pide: "demanda de la semana 1", ok: rango(R1), fila: ["Sem 1", "$R = " + R1.toFixed(5) + "$", "", "Demanda = " + rango(R1)], ver: [0, 1], col: 3 }));
    pasos.push(P({ t: "Simula la semana 2", fg: fgR, f: T`$R = ${R2.toFixed(5)}$ cae en $${fx(F[rango(R2) - 1], 9)} < R \le ${fx(F[rango(R2)], 9)}$ → demanda $= ${rango(R2)}$`, pide: "demanda de la semana 2", ok: rango(R2), fila: ["Sem 2", "$R = " + R2.toFixed(5) + "$", "", "Demanda = " + rango(R2)], ver: [0, 1], col: 3 }));
    NIVELES.push({
      id: "m13", nombre: "Distribución Poisson", unidad: "UT2 · Variables no uniformes", tema: 12, tipo: "va",
      fuente: "DistribuciónPoisson.pdf (λ = 5) y GeneraciónVA.pdf", f: f, F: F, rango: rango, R1: R1, R2: R2,
      enunciado: T`La demanda de un producto es Poisson con $\lambda = 3$. Calcula $f(x) = \frac{e^{-\lambda}\lambda^{x}}{x!}$ y la acumulada $F(x)$ hasta que $F(x)$ se acerque a 1, arma la tabla de rangos y simula 2 semanas con $R_1 = ${R1.toFixed(5)}$ y $R_2 = ${R2.toFixed(5)}$.`,
      cols: ["$X$", "$f(x)$", "$F(x)$", "Rango de $R$"],
      pasos: pasos,
      jefe: [J("¿Para qué sirve la distribución acumulada $F(x)$?", "Para la tabla de rangos", "Para calcular $Z_0$"),
        J("$R = 0.95$ cae en el rango de…", "$X = " + rango(0.95) + "$", "$X = " + (rango(0.95) - 1) + "$")],
      resumen: T`Se calculó hasta $X = ${ult}$ ($F = ${fx(F[ult], 9)}$). Con $R = ${R1}$ la demanda es ${rango(R1)} y con $R = ${R2}$ es ${rango(R2)}.`
    });
  })();

  /* =========================================================
     Aplicaciones (TAplicaciones y EjerAplicaciones de Simulación)
     ========================================================= */
  /* MUNDO 14 · Juego de volados ($30, apuesta $10, meta $50 → variante $20, $10, meta $40) */
  (function () {
    var Rs = [0.62374, 0.18905, 0.44612, 0.07351, 0.81546, 0.93017, 0.35288, 0.27460, 0.56919, 0.12833];
    var ini = 20, base = 10, meta = 40, din = ini, ap = base, corr = 1, filas = [], metas = 0, quiebras = 0, terminadas = 0, nuevo = true;
    Rs.forEach(function (r) {
      var gana = r < 0.5, antes = din; din = gana ? din + ap : din - ap;
      var fin = din >= meta ? "Sí" : (din <= 0 ? "Quiebra" : "No");
      filas.push({ corrida: nuevo ? String(corr) : "", antes: antes, ap: ap, r: r, gana: gana, despues: din, fin: fin });
      nuevo = false;
      if (din >= meta || din <= 0) { if (din >= meta) metas++; else quiebras++; terminadas++; corr++; din = ini; ap = base; nuevo = true; }
      else ap = gana ? base : Math.min(2 * ap, din);
    });
    function p$(v) { return pesos(v); }
    var pasos = filas.map(function (v, i) {
      return P({ t: "Volado " + (i + 1) + " · tienes " + p$(v.antes) + ", apuestas " + p$(v.ap), fg: "Gana si $R < 0.5$: cantidad + apuesta; si pierde: cantidad − apuesta",
        f: v.gana ? T`$R = ${v.r} < 0.5$ → gana: ${p$(v.antes)} + ${p$(v.ap)} = ${p$(v.despues)}` : T`$R = ${v.r} \ge 0.5$ → pierde: ${p$(v.antes)} − ${p$(v.ap)} = ${p$(v.despues)}`,
        pide: "cantidad después del volado (\\$)", ok: v.despues, pesos: true,
        fila: [v.corrida, p$(v.antes), p$(v.ap), String(v.r), v.gana ? "Sí" : "No", p$(v.despues), v.fin], ver: [0, 1, 2, 3], col: 5 });
    });
    var Pm = metas / terminadas;
    pasos.push(P({ t: "Probabilidad de llegar a la meta", fg: T`$P(\text{meta}) = \dfrac{\text{veces en la meta}}{\text{corridas terminadas}}$`, f: T`$P(\text{meta}) = \dfrac{${metas}}{${terminadas}} = ${fx(Pm, 4)}$ (la corrida ${corr} quedó incompleta)`, pide: "$P(\\text{meta})$", ok: Pm, dec: 4 }));
    NIVELES.push({
      id: "m14", nombre: "Juego de volados", unidad: "UT3 · Aplicaciones", tema: 13, tipo: "app",
      fuente: "EjerAplicaciones de Simulación.pdf ($30, apuesta $10, meta $50)", metas: metas, quiebras: quiebras, terminadas: terminadas, Pm: Pm, filas: filas,
      enunciado: "Cantidad disponible \\$20.00, apuesta \\$10.00, meta \\$40.00. Si se pierde se apuesta el doble; si la apuesta es mayor que lo disponible se apuesta lo que se tiene; si se gana se regresa a \\$10.00. Se gana con $R < 0.5$. Al terminar una corrida (meta o quiebra) empieza otra con \\$20.00. $R$ = " + Rs.join(", ") + ". Probabilidad = metas / corridas terminadas.",
      cols: ["Corrida", "Antes", "Apuesta", "$R$", "¿Ganó?", "Después", "¿Meta?"],
      pasos: pasos,
      jefe: [J("¿Cuántas veces se llegó a la meta?", String(metas), String(metas + 1)), J("¿Cuántas veces a la quiebra?", String(quiebras), String(quiebras + 1)),
        J("Si pierdes con apuesta de \\$10 y solo te quedan \\$10, ¿cuánto apuestas?", "\\$10 (lo que se tiene)", "\\$20 (el doble)")],
      resumen: "Metas: " + metas + ", quiebras: " + quiebras + ", corridas terminadas: " + terminadas + " (la última quedó incompleta). $P(\\text{meta}) = \\frac{" + metas + "}{" + terminadas + "} = " + fx(Pm, 4) + "$."
    });
  })();

  /* MUNDO 15 · Caja del supermercado (EjApCaja.pdf) · variante con 6 clientes */
  (function () {
    var TL = [4, 6, 2, 7, 3, 5], TS = [5, 3, 4, 2, 6, 3], rows = [], hl = 0, fin = 0;
    TL.forEach(function (t, k) {
      hl += t; var ini = Math.max(hl, fin), f = ini + TS[k];
      rows.push({ tl: t, hl: hl, ini: ini, ts: TS[k], fin: f, sis: f - hl, inac: ini - fin });
      fin = f;
    });
    var Ssis = suma(rows.map(function (r) { return r.sis; })), Sin = suma(rows.map(function (r) { return r.inac; })), TPS = Ssis / rows.length, ocio = Sin / fin * 100;
    function fila(r, k) { return [String(k + 1), String(r.tl), String(r.hl), String(r.ini), String(r.ts), String(r.fin), String(r.sis), String(r.inac)]; }
    var pide = ["hl", "ini", "fin", "sis", "inac", "ini"], COL = { hl: 2, ini: 3, fin: 5, sis: 6, inac: 7 };
    var VER = { hl: [0, 1, 4], ini: [0, 1, 2, 4], fin: [0, 1, 2, 3, 4], sis: [0, 1, 2, 3, 4, 5], inac: [0, 1, 2, 3, 4, 5, 6] };
    var FG = { hl: "H. llegada = H. llegada anterior + T. llegada", ini: T`H. inicio $= \max$(H. llegada, H. fin del anterior)`, fin: "H. fin = H. inicio + T. servicio", sis: "T. espera = H. fin − H. llegada", inac: "Inactivo = H. inicio − H. fin del anterior" };
    var NOM = { hl: "H. llegada", ini: "H. inicio", fin: "H. fin", sis: "T. espera", inac: "Inactivo" };
    var pasos = rows.map(function (r, k) {
      var q = pide[k], ant = k ? rows[k - 1].fin : 0, hlAnt = k ? rows[k - 1].hl : 0, cuenta;
      if (q === "hl") cuenta = T`$${hlAnt} + ${r.tl} = ${r.hl}$`;
      else if (q === "ini") cuenta = T`$\max(${r.hl},\ ${ant}) = ${r.ini}$`;
      else if (q === "fin") cuenta = T`$${r.ini} + ${r.ts} = ${r.fin}$`;
      else if (q === "sis") cuenta = T`$${r.fin} - ${r.hl} = ${r.sis}$`;
      else cuenta = T`$${r.ini} - ${ant} = ${r.inac}$`;
      return P({ t: "Cliente " + (k + 1), fg: FG[q], f: NOM[q] + " del cliente " + (k + 1) + ": " + cuenta, pide: NOM[q] + " del cliente " + (k + 1), ok: r[q], fila: fila(r, k), ver: VER[q], col: COL[q] });
    });
    pasos.push(P({ t: "Tiempo promedio en el sistema", fg: T`$TPS = \dfrac{\sum \text{T. espera}}{\text{No. de clientes}}$`, f: T`$TPS = \dfrac{${Ssis}}{6} = ${fx(TPS, 4)}$`, pide: "$TPS$ (min)", ok: TPS, dec: 4, fila: ["Σ", String(suma(TL)), "", "", String(suma(TS)), "", String(Ssis), String(Sin)] }));
    pasos.push(P({ t: "% de tiempo desocupado", fg: T`$\%\ \text{desocupado} = \dfrac{\sum \text{inactivo}}{\text{tiempo total}} \times 100$`, f: T`$\%\ \text{desocupado} = \dfrac{${Sin}}{${fin}} \times 100 = ${fx(ocio, 4)}\%$`, pide: "% desocupado", ok: ocio, dec: 4 }));
    NIVELES.push({
      id: "m15", nombre: "Caja del supermercado", unidad: "UT3 · Aplicaciones", tema: 14, tipo: "app",
      fuente: "EjApCaja.pdf (20 clientes)", rows: rows, TPS: TPS, ocio: ocio, total: fin,
      enunciado: "Sistema de colas con un solo canal (una caja). Tiempos entre llegadas (min): " + TL.join(", ") + ". Tiempos de servicio (min): " + TS.join(", ") + ". Reloj inicial = 0. Llena la tabla y calcula el tiempo promedio en el sistema y el % de tiempo desocupado del cajero.",
      cols: ["No", "T. lleg.", "H. lleg.", "H. inicio", "T. serv.", "H. fin", "T. espera", "Inactivo"],
      pasos: pasos,
      jefe: [J("Elemento o entidad de este sistema:", "Clientes y cajero", "Tiempo de servicio"),
        J("El tiempo de servicio del cliente es una variable…", "Exógena no controlable", "Endógena de salida")],
      resumen: T`$TPS = \frac{${Ssis}}{6} = ${fx(TPS, 4)}$ min; % desocupado $= \frac{${Sin}}{${fin}} \times 100 = ${fx(ocio, 4)}\%$. (La columna «Tiempo espera» del apunte es fin − llegada: tiempo dentro del sistema.)`
    });
  })();

  /* MUNDO 16 · Inventarios (q, R) · TAplicaciones de Simulación.pdf (q = 200, R = 100, 12 meses) → variante q = 180, R = 110, 6 meses */
  (function () {
    var CANT = [], PRO = [0.010, 0.015, 0.020, 0.020, 0.022, 0.023, 0.025, 0.027, 0.028, 0.029, 0.035, 0.045, 0.060, 0.065, 0.070, 0.080, 0.075, 0.070, 0.065, 0.060, 0.050, 0.040, 0.030, 0.016, 0.015, 0.005];
    for (var c = 35; c <= 60; c++) CANT.push(c);
    var ACU = []; PRO.reduce(function (s, p, i) { ACU[i] = rd(s + p, 3); return s + p; }, 0);
    var FAC = [1.20, 1.00, 0.90, 0.80, 0.80, 0.70, 0.80, 0.90, 1.00, 1.20, 1.30, 1.40];
    function demanda(R) { for (var i = 0; i < ACU.length; i++) if (R <= ACU[i]) return CANT[i]; return 60; }
    function entrega(R) { return R <= 0.30 ? 1 : (R <= 0.70 ? 2 : 3); }
    var q = 180, Rr = 110, inv = 150, RD = [0.41730, 0.88264, 0.15902, 0.67418, 0.52987, 0.03615], RE = [0.55120, 0.21876];
    var meses = [], pend = null, ords = 0, kE = 0, falt = 0, back = 0;
    RD.forEach(function (r, i) {
      var mes = i + 1, iniv = inv, llego = 0, surte = 0;
      if (pend && pend.llega === mes) { llego = q; surte = back; iniv = inv + q - back; back = 0; pend = null; }
      var base = demanda(r), dem = Math.round(base * FAC[i]);
      var fin = iniv - dem, f = 0;
      if (fin < 0) { f = -fin; fin = 0; back += f; falt += f; }
      var prom = f ? Math.round(iniv * iniv / (2 * dem)) : (iniv + fin) / 2, orden = "";
      if (!pend && fin <= Rr) { ords++; var L = entrega(RE[kE++]); pend = { llega: mes + L + 1, L: L }; orden = ords + " (L = " + L + ")"; }
      meses.push({ mes: mes, ini: iniv, r: r, base: base, fac: FAC[i], dem: dem, fin: fin, falt: f, orden: orden, prom: prom, llego: llego, surte: surte });
      inv = fin;
    });
    var Sprom = suma(meses.map(function (m) { return m.prom; })), cOrd = ords * 100, cLlev = Sprom * 20 / 12, cFal = falt * 50, total = cOrd + cLlev + cFal;
    function fila(m) { return [String(m.mes), String(m.ini), String(m.r), String(m.dem), String(m.fin), m.falt ? String(m.falt) : "", m.orden, fx(m.prom, 2) + (m.falt ? "*" : "")]; }
    var tipos = ["dem", "fin", "prom", "ini", "fin", "dem"];
    var pasos = meses.map(function (m, i) {
      var t = tipos[i], prev = i ? meses[i - 1] : null, o;
      if (t === "dem") o = { fg: "Demanda ajustada = demanda de la tabla × factor estacional (redondeada)", f: T`$R = ${m.r}$ → demanda de la tabla $= ${m.base}$; $${m.base} \times ${m.fac.toFixed(2)} = ${rd(m.base * m.fac, 2)} \approx ${m.dem}$`, pide: "demanda ajustada del mes " + m.mes, ok: m.dem, ver: [0, 1, 2], col: 3 };
      else if (t === "fin") o = { fg: "Inv. final = Inv. inicial − demanda (si sale negativo, el resto es faltante)", f: m.falt ? T`$${m.ini} - ${m.dem} = ${m.ini - m.dem}$ → Inv. final $= 0$ y faltante $= ${m.falt}$` : T`Inv. final $= ${m.ini} - ${m.dem} = ${m.fin}$`, pide: "inventario final del mes " + m.mes, ok: m.fin, ver: [0, 1, 2, 3], col: 4 };
      else if (t === "ini") o = { fg: "Inv. inicial = Inv. final anterior (+ q si llega el pedido − faltante que se surte)", f: m.llego ? T`Llega el pedido: $${prev.fin} + ${q} - ${m.surte} = ${m.ini}$` : T`Inv. inicial $= ${prev.fin}$`, pide: "inventario inicial del mes " + m.mes, ok: m.ini, ver: [0, 2], col: 1 };
      else o = { fg: m.falt ? T`Con faltante: Inv. promedio $= \dfrac{(\text{inicial})^2}{2(\text{demanda})}$` : T`Inv. promedio $= \dfrac{\text{inicial} + \text{final}}{2}$`, f: m.falt ? T`$\dfrac{${m.ini}^2}{2(${m.dem})} = ${fx(m.ini * m.ini / (2 * m.dem), 4)} \approx ${m.prom}$` : T`$\dfrac{${m.ini} + ${m.fin}}{2} = ${m.prom}$`, pide: "inventario promedio del mes " + m.mes, ok: m.prom, dec: 2, ver: [0, 1, 2, 3, 4, 5, 6], col: 7 };
      o.t = "Mes " + m.mes; o.fila = fila(m); o.seg = 50;
      return P(o);
    });
    pasos.push(P({ t: "Costo de llevar inventario", fg: T`Costo de llevar $= \sum \text{Inv. promedio} \times \dfrac{\$20}{12}$`, f: T`$${fx(Sprom, 2)} \times \dfrac{20}{12} = ${fx(cLlev, 2)}$`, pide: "costo de llevar (\\$)", ok: rd(cLlev, 2), dec: 2 }));
    pasos.push(P({ t: "Costo total", fg: "Costo total = costo de ordenar + costo de llevar + costo de faltante", f: T`$${ords}(100) + ${fx(cLlev, 2)} + ${falt}(50) = ${fx(total, 2)}$`, pide: "costo total (\\$)", ok: rd(total, 2), dec: 2 }));
    NIVELES.push({
      id: "m16", nombre: "Sistema de inventarios", unidad: "UT3 · Aplicaciones", tema: 15, tipo: "app",
      fuente: "TAplicaciones de Simulación.pdf (q = 200, R = 100)", meses: meses, costos: { ordenar: cOrd, llevar: cLlev, faltante: cFal, total: total, ordenes: ords, faltantes: falt, Sprom: Sprom }, demanda: demanda, ACU: ACU, CANT: CANT, PRO: PRO, FAC: FAC,
      enunciado: "Misma demanda empírica (35 a 60 unidades), factores estacionales y costos del apunte (\\$100/orden, \\$20/unidad/año, \\$50/unidad faltante). Inventario inicial 150, $q = 180$, $R = 110$, 6 meses. $R$ de demanda: " + RD.join(", ") + ". $R$ de entrega: " + RE.join(", ") + " ($\\le 0.30$ → 1 mes, $\\le 0.70$ → 2, si no 3). Se ordena cuando el inventario final $\\le R$ y no hay pedido pendiente; el pedido llega al inicio del mes $t + L + 1$ y primero surte los faltantes.",
      cols: ["Mes", "Inv. ini.", "$R$", "Dem. aj.", "Inv. fin.", "Falt.", "Orden", "Inv. prom."],
      pasos: pasos,
      jefe: [J("Variables de decisión del modelo de inventarios:", "$q$ y $R$", "Demanda y tiempo de entrega"),
        J("¿Qué se busca al simular varias políticas $(q, R)$?", "Minimizar el costo total", "Maximizar el inventario")],
      resumen: T`Órdenes: ${ords} → \$${cOrd}; llevar: $${fx(Sprom, 2)} \times \frac{20}{12}$ = \$${fx(cLlev, 2)}; faltante: $${falt} \times 50$ = \$${cFal}. Costo total = \$${fx(total, 2)}.`
    });
  })();

  /* MUNDO 17 · Factores del modelo (FACTORESDEMODELOS.pdf) */
  NIVELES.push({
    id: "m17", nombre: "Factores del modelo", unidad: "UT3 · Factores", tema: 16, tipo: "teoria",
    fuente: "FACTORESDEMODELOS.pdf · TAplicaciones de Simulación.pdf",
    enunciado: "Repaso final de los factores que se consideran al desarrollar un modelo de simulación. Lee la frase y entra al tubo que la completa.",
    cols: ["#", "Factor", "Respuesta"],
    pasos: [
      teoria("Modelo estocástico", "Se necesita un generador de números uniformes y una función que transforme esos números en la distribución ______.", "qué distribución", "deseada", "normal siempre", ["1", "Modelo estocástico", "generador + transformación"]),
      teoria("Condiciones iniciales", "Se estudia el estado estable, pero en la etapa inicial hay estados ______.", "cómo son esos estados", "transientes", "constantes", ["2", "Condiciones iniciales", "estados transientes"]),
      teoria("Tamaño de la muestra", "Debe asegurar la precisión deseada y a la vez minimizar el ______ de operación.", "qué se minimiza", "costo", "tiempo de entrega", ["3", "Tamaño de la muestra", "precisión vs costo"]),
      teoria("Ventajas (Naylor)", "Permite estudiar el efecto de cambios, entender mejor el sistema y usarse como instrumento ______.", "qué tipo de instrumento", "pedagógico", "contable", ["4", "Ventajas", "instrumento pedagógico"]),
      teoria("Desventajas", "Requiere equipo computacional y recursos humanos ______ y bastante tiempo.", "cómo son", "costosos", "gratuitos", ["5", "Desventajas", "costosos y lentos"]),
      teoria("Usos de la simulación", "Sistemas de colas, de inventarios, proyectos de inversión y ______.", "otro uso del apunte", "estados financieros", "redes sociales", ["6", "Ejemplos de uso", "colas, inventarios, inversión…"])
    ],
    jefe: [J("Los modelos de simulación se usan para análisis, diseño y síntesis de sistemas, y para…", "Entrenamiento", "Contabilidad"),
      J("Alternativa del apunte para el problema del estado transiente:", "Simulación regenerativa", "Prueba de póker")],
    resumen: "Factores: generación de variables, lenguajes de programación, condiciones iniciales, tamaño de la muestra y diseño de experimentos; ventajas y desventajas según Naylor."
  });

  /* Tubo falso de cada celda numérica: el error típico de clase (versión anterior del juego):
     usar el renglón de al lado, olvidar dividir, olvidar el factor, sumar en vez de restar… */
  var MALES = {"m04":[2.96393,0.37954,0.548762,1.64],"m05":[0.08236,0.01764,0.09124,0.18133,0.21288,0.27605,0.368],"m06":[2,2,4,1,1,2.4,9.49],"m07":[5,2.5,6,3,3,1,12.75,3.84],"m08":[1,2,3,4,4,0.729,10,10.326236,7.81],"m09":[null,null,null,null,5,4.914,0.218065,5.99],"m10":[2.164246,0.362019,5.148838,3.570492,0.479694,0.234283],"m11":[1.74639,2.74041,0.82812,1.22874,4.5],"m12":[1.079009,1.351643,0.55208,0.81916],"m13":[0.149361205,0.149361205,0.224041808,0.224041808,0.168031356,0.999707663,5,0],"m14":[30,0,10,20,30,20,10,20,30,0,0.5],"m15":[1,9,15,3,0,27,5,32],"m16":[48,147,18.5,180,177,37,11250,1137.5]};
  NIVELES.forEach(function (Nv) {
    var lista = MALES[Nv.id] || [];
    Nv.pasos.forEach(function (p, i) {
      if (p.tipo !== "num" || p.mal !== undefined || lista[i] === null || lista[i] === undefined) return;
      p.mal = lista[i]; p.malTxt = p.pesos ? pesos(p.mal) : fx(p.mal, p.dec);
    });
  });

  /* Numeración y comprobaciones: ningún tubo repite la respuesta y cada paso numérico tiene respuesta finita */
  NIVELES.forEach(function (Nv, i) {
    Nv.num = i + 1;
    Nv.jefe = Nv.jefe.filter(Boolean);
    Nv.pasos.forEach(function (p) {
      if (!p.malTxt || p.okTxt === p.malTxt) throw new Error("Falta tubo falso o es igual a la respuesta en " + Nv.id + " · " + p.t);
      if (p.tipo === "num" && !isFinite(p.ok)) throw new Error("Respuesta no numérica en " + Nv.id + " · " + p.t);
    });
    Nv.jefe.forEach(function (q) { if (q.ok === q.mal) throw new Error("Distractor del jefe igual en " + Nv.id); });
  });

  var API = { NIVELES: NIVELES, fx: fx, rd: rd, revisar: revisar, Z_TABLA: Z_TABLA, CHI: CHI, KS_10: KS_10 };
  raiz.BROTE = raiz.BROTE || {}; raiz.BROTE.niveles = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
