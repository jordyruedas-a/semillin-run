/* =========================================================
   SEMILLÍN RUN · Formulario (solo fórmulas y tablas vistas en clase)
   Las fórmulas van en LaTeX ($…$) y se dibujan con KaTeX (mate.js).
   Las tablas estadísticas son las de TablasPE.pdf.
   ========================================================= */
(function () {
  "use strict";
  var B = window.BROTE = window.BROTE || {};
  function M(s) { return B.mate ? B.mate.html(s) : s; }
  var SECCIONES = [
    { t: "Generadores congruenciales", f: [
      ["Mixto", "$X_{n+1} = (aX_n + C) \\bmod m$", "Para $X_{n+1}$ se considera el numerador del quebrado; número rectangular $= \\frac{X_{n+1}}{m}$. Si $n = m$ y $X_n = X_{n+1}$: período completo y números aceptados."],
      ["Multiplicativo", "$X_{n+1} = aX_n \\bmod m, \\qquad PE = \\dfrac{m}{4}$", "$PE$ = período esperado. Si $n = PE$ y $X_n = X_{n+1}$: período completo y números aceptados."],
    ] },
    { t: "Pruebas estadísticas", f: [
      ["Promedios", "$\\bar{X} = \\dfrac{\\sum x_i}{N}, \\qquad Z_0 = \\left|\\dfrac{\\left(\\bar{X} - \\frac{1}{2}\\right)\\sqrt{N}}{\\sqrt{\\frac{1}{12}}}\\right|$", "$\\alpha_{real} = 100\\% - \\alpha$ → $Z_{\\alpha_{real}/2}$ (tabla normal). Aceptados si $|Z_0| < Z$."],
      ["Kolmogorov-Smirnov", "$F(x_i) = \\dfrac{i}{N}, \\qquad D_n = \\max\\left[F(x_i) - x_i\\right]$", "Ordenar de menor a mayor. Aceptados si $D_n < d_{\\alpha,N}$ (tabla KS)."],
      ["Frecuencias", "$FE_i = \\dfrac{N}{n}, \\qquad X_0^2 = \\displaystyle\\sum \\frac{(FO_i - FE_i)^2}{FE_i}$", "$n$ intervalos iguales entre 0 y 1. Aceptados si $X_0^2 < X^2_{\\alpha,\\,n-1}$."],
      ["Series", "$FE = \\dfrac{N - 1}{n^2}, \\qquad X_0^2 = \\dfrac{n^2}{N - 1}\\displaystyle\\sum\\sum (FO_{ij} - FE)^2$", "Parejas $(U_i,\\ U_{i+1})$ en el plano. Aceptados si $X_0^2 < X^2_{\\alpha,\\,n^2-1}$."],
      ["Distancias", "$FE_i = (0.1)(0.9)^i\\,N$ si $i < n, \\qquad FE = (0.9)^n\\,N$ si $i \\ge n$", "$i$ = dígitos entre dos dígitos iguales. Se agrupan las $FE < 5$; $X^2_{\\alpha,\\,g-1}$ con $g$ grupos."],
      ["Póker", "$FE_i = P(\\text{mano})\\,N, \\qquad X_0^2 = \\displaystyle\\sum \\frac{(FO_i - FE_i)^2}{FE_i}$", "Probabilidades en el botón Tablas → Póker. Se agrupan las $FE < 5$; $X^2_{\\alpha,\\,n-1}$ con $n$ categorías."]
    ] },
    { t: "Variables aleatorias no uniformes", f: [
      ["Exponencial", "$x = -\\dfrac{1}{\\lambda}\\,\\mathrm{Ln}\\,R$", "$\\lambda$ se sustituye directo en $\\frac{1}{\\lambda}$, como en el ejemplo del cajero."],
      ["Uniforme", "$x = a + (b - a)R$", "$a$ = valor mínimo, $b$ = valor máximo."],
      ["Empírica", "$x = \\sqrt{2R}$ si $R \\le \\frac{1}{2}, \\qquad x = 2R$ si $R > \\frac{1}{2}$", "Primero revisa la condición de $R$."],
      ["Poisson", "$f(x) = \\dfrac{e^{-\\lambda}\\,\\lambda^{x}}{x!}, \\qquad F(x) = F(x - 1) + f(x)$", "Se calcula hasta que $F(x)$ se acerca a 1; luego tabla de rangos: $F(x - 1) < R \\le F(x)$."]
    ] },
    { t: "Aplicaciones", f: [
      ["Cola (una caja)", "H. inicio $= \\max$(H. llegada, H. fin anterior), $\\quad$ H. fin = H. inicio + T. servicio", "T. espera = H. fin − H. llegada · Inactivo = H. inicio − H. fin anterior · $TPS = \\frac{\\sum \\text{espera}}{\\text{clientes}}$ · % desocupado $= \\frac{\\sum \\text{inactivo}}{\\text{tiempo total}} \\times 100$."],
      ["Volados", "Gana: cantidad + apuesta; pierde: cantidad − apuesta", "Si pierde se dobla la apuesta (o se apuesta lo que se tiene); si gana regresa a la apuesta inicial. $P(\\text{meta}) = \\frac{\\text{veces en la meta}}{\\text{corridas}}$."]
    ] }
  ];

  /* Valores tal como vienen en TablasPE.pdf (incluso sus erratas, p. ej. 1.3/.01 = .5059). */
  var TPE = {"normal": [["0.0", ".0000", ".0040", ".0080", ".0120", ".0160", ".0199", ".0239", ".0279", ".0319", ".0359"], ["0.1", ".0398", ".0438", ".0478", ".0517", ".0557", ".0596", ".0636", ".0675", ".0714", ".0753"], ["0.2", ".0793", ".0832", ".0871", ".0910", ".0948", ".0987", ".1026", ".1064", ".1103", ".1141"], ["0.3", ".1179", ".1217", ".1255", ".1293", ".1331", ".1368", ".1406", ".1443", ".1480", ".1517"], ["0.4", ".1554", ".1591", ".1628", ".1664", ".1700", ".1736", ".1772", ".1808", ".1844", ".1879"], ["0.5", ".1915", ".1950", ".1985", ".2019", ".2054", ".2088", ".2123", ".2157", ".2190", ".2224"], ["0.6", ".2257", ".2291", ".2324", ".2357", ".2389", ".2422", ".2454", ".2486", ".2517", ".2549"], ["0.7", ".2580", ".2611", ".2642", ".2673", ".2703", ".2734", ".2764", ".2794", ".2835", ".2852"], ["0.8", ".2881", ".2910", ".2939", ".2967", ".2994", ".3023", ".3051", ".3078", ".3106", ".3133"], ["0.9", ".3159", ".3186", ".3212", ".3238", ".3264", ".3289", ".3315", ".3340", ".3365", ".3389"], ["1.0", ".343", ".3438", ".3461", ".3485", ".3508", ".3531", ".3554", ".3577", ".3599", ".3621"], ["1.1", ".3643", ".3665", ".3686", ".3708", ".3729", ".3749", ".3770", ".3790", ".3810", ".3830"], ["1.2", ".3849", ".3869", ".3888", ".3907", ".3925", ".3944", ".3962", ".3980", ".3997", ".4015"], ["1.3", ".4032", ".5059", ".4066", ".4082", ".4099", ".4115", ".4131", ".34147", ".4162", ".4177"], ["1.4", ".4192", ".4207", ".4222", ".4236", ".4251", ".4265", ".4279", ".4392", ".4300", ".4319"], ["1.5", ".4332", ".4345", ".4357", ".4370", ".4382", ".4394", ".4406", ".4418", ".4429", ".4441"], ["1.6", ".4452", ".4463", ".4474", ".4484", ".4495", ".4505", ".4515", ".4525", ".4535", ".4545"], ["1.7", ".4554", ".4564", ".4573", "4582", ".4591", ".4599", ".4608", ".4616", ".4625", ".4633"], ["1.8", ".4641", ".4649", ".4656", ".4664", ".4671", ".4678", ".4686", ".4693", ".4699", ".4706"], ["1.9", ".4713", ".4719", ".4726", ".4732", ".4738", ".4744", ".4750", ".4756", ".4761", ".4767"], ["2.0", ".4772", ".4778", ".4783", ".4788", ".4793", ".4798", ".4803", ".4808", ".4812", ".4817"], ["2.1", ".4821", ".4826", ".4830", ".4834", ".4838", ".4842", ".4846", ".4950", ".4854", ".4857"], ["2.2", ".4861", ".4864", ".4868", ".4871", ".4875", ".4878", ".4881", ".4884", ".4887", ".4890"], ["2.3", ".4893", ".4896", ".4898", ".4901", ".4904", ".4906", ".4909", ".4911", ".4913", ".4916"], ["2.4", ".4918", ".4920", ".4922", ".4925", ".4927", ".4929", ".4931", ".4932", ".4934", ".4936"], ["2.5", ".4938", ".4940", ".4941", ".4943", ".4945", ".4946", ".4948", ".4949", ".4951", ".4952"], ["2.6", ".4953", ".4955", ".4956", ".4957", ".4959", ".4960", ".4961", ".4962", ".4963", ".4964"], ["2.7", ".4965", ".4966", ".4967", ".4968", ".4969", ".4970", ".4971", ".4972", ".4973", ".4974"], ["2.8", ".4974", ".4975", ".4976", ".4977", ".4977", ".4978", ".4979", ".4979", ".4980", ".4981"], ["2.9", ".4981", ".4982", ".4982", ".4983", ".4984", ".4984", ".4985", ".4985", ".4986", ".4986"], ["3.0", ".4987", ".4987", "4987", ".4988", ".4988", ".4989", ".4989", ".4989", ".4990", ".4990"]], "ks": [["1", "0.950", "0.975", "0.995"], ["2", "0.776", "0.842", "0.929"], ["3", "0.642", "0.809", "0.829"], ["4", "0.564", "0.624", "0.734"], ["5", "0.510", "0.563", "0.669"], ["6", "0.470", "0.521", "0.617"], ["7", "0.438", "0.486", "0.577"], ["8", "0.411", "0.457", "0.543"], ["9", "0.388", "0.432", "0.514"], ["10", "0.368", "0.409", "0.486"], ["11", "0.352", "0.391", "0.468"], ["12", "0.338", "0.375", "0.450"], ["13", "0.352", "0.361", "0.433"], ["14", "0.314", "0.349", "0.418"], ["15", "0.304", "0.338", "0.404"], ["16", "0.295", "0.328", "0.392"], ["17", "0.286", "0.318", "0.381"], ["18", "0.278", "0.309", "0.371"], ["19", "0.272", "0.301", "0.363"], ["20", "0.264", "0.294", "0.352"], ["25", "0.240", "0.264", "0.317"], ["30", "0.220", "0.242", "0.290"], ["35", "0.210", "0.230", "0.270"], ["40", "", "0.210", "0.252"], ["50", "", "0.188", "0.226"], ["60", "", "0.172", "0.207"], ["70", "", "0.160", "0.192"], ["80", "", "0.150", "0.180"], ["90", "", "0.141", ""], ["100", "", "0.134", ""]], "chiCab": ["0.995", "0.990", "0.975", "0.950", "0.500", "0.050", "0.025", "0.010", "0.005"], "chi": [["1", "0.00+", "0.00+", "0.00+", "0.00+", "0.46", "3.84", "5.02", "6.63", "7.88"], ["2", "0.01", "0.02", "0.05", "0.10", "1.39", "5.99", "7.38", "9.21", "10.60"], ["3", "0.07", "0.11", "0.22", "0.5", "2.37", "7.81", "9.35", "11.34", "12.84"], ["4", "0.21", "0.30", "0.48", "0.71", "3.36", "9.49", "11.14", "13.28", "14.86"], ["5", "0.41", "0.55", "0.83", "1.13", "4.35", "11.07", "12.83", "15.09", "16.75"], ["6", "0.68", "0.87", "1.24", "1.64", "5.35", "12.59", "14.45", "16.81", "18.55"], ["7", "0.99", "1.24", "1.69", "2.17", "6.35", "14.07", "16.01", "18.48", "20.28"], ["8", "1.34", "1.65", "2.18", "2.73", "7.34", "15.51", "17.53", "20.09", "21.96"], ["9", "1.73", "2.09", "2.70", "3.33", "8.34", "16.92", "19.02", "21.67", "23.59"], ["10", "2.16", "2.56", "3.25", "3.94", "9.34", "18.31", "20.48", "23.21", "25.19"], ["11", "2.60", ".305", "3.82", "4.57", "10.34", "19.68", "21.92", "24.72", "26.76"], ["12", "3.07", "3.57", "4.40", "5.23", "11.34", "21.03", "23.34", "26.22", "28.30"], ["13", "3.57", "4.11", "5.01", "5.89", "12.34", "22.36", "24.74", "27.69", "29.82"], ["14", "4.07", "4.66", "5.63", "6.57", "13.34", "23.68", "26.12", "29.14", "31.32"], ["15", "4.60", "5.23", "6.27", "7.26", "14.34", "25.00", "27.49", "30.58", "32.80"], ["16", "5.14", "5.81", "6.91", "7.96", "15.34", "26.30", "28.85", "32.00", "34.27"], ["17", "5.70", "6.41", "7.56", "8.67", "16.34", "27.59", "30.19", "33.41", "35.72"], ["18", "6.26", "7.01", "8.23", "9.39", "17.34", "28.87", "31.53", "34.81", "37.16"], ["19", "6.84", "7.63", "8.91", "10.12", "18.34", "30.14", "32.85", "36.19", "38.58"], ["20", "7.43", "8.26", "9.59", "10.85", "19.34", "31.41", "34.17", "37.57", "40.00"], ["25", "10.52", "11.52", "13.12", "14.61", "24.34", "37.65", "40.65", "44.31", "46.93"], ["30", "13.79", "14.95", "16.79", "18.49", "20.34", "43.77", "46.98", "50.89", "53.67"], ["40", "20.71", "22.16", "24.43", "26.51", "39.34", "55.76", "59.34", "63.69", "66.77"], ["50", "27.99", "29.71", "32.36", "34.76", "49.33", "67.50", "71.42", "76.15", "79.49"], ["60", "35.53", "37.48", "40.48", "43.19", "59.33", "79.08", "83.30", "88.38", "91.95"], ["70", "43.28", "45.44", "48.76", "51.74", "69.33", "90.53", "95.08", "100.42", "104.22"], ["80", "51.17", "53.54", "57.15", "60.39", "79.33", "101.88", "106.63", "112.33", "116.32"], ["90", "59.20", "61.75", "65.65", "69.13", "89.33", "113.14", "118.14", "124.12", "128.30"], ["100", "67.33", "70.06", "74.22", "77.93", "99.33", "124.34", "129.56", "135.81", "140.17"]]};

  function tablaNormal() {
    var h = "<table class='tpe'><thead><tr><th>z</th>" + [".00", ".01", ".02", ".03", ".04", ".05", ".06", ".07", ".08", ".09"].map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>";
    TPE.normal.forEach(function (r) { h += "<tr><th>" + r[0] + "</th>" + r.slice(1).map(function (v) { return "<td>" + v + "</td>"; }).join("") + "</tr>"; });
    return h + "</tbody></table>";
  }
  var ALFA = 0.05;
  function colChi() { return { "0.05": "0.050", "0.025": "0.025", "0.01": "0.010" }[String(ALFA)] || "0.050"; }
  function tablaChi() {
    var col = colChi();
    var h = "<table class='tpe'><thead><tr><th>" + M("$\\nu$ \\ $\\alpha$") + "</th>" + TPE.chiCab.map(function (c) { return "<th" + (c === col ? " class='alfa'" : "") + ">" + c + "</th>"; }).join("") + "</tr></thead><tbody>";
    TPE.chi.forEach(function (r) { h += "<tr><th>" + r[0] + "</th>" + r.slice(1).map(function (v, j) { return "<td" + (TPE.chiCab[j] === col ? " class='alfa'" : "") + ">" + v + "</td>"; }).join("") + "</tr>"; });
    return h + "</tbody></table>";
  }
  function tablaKS() {
    var k = { "0.1": 1, "0.05": 2, "0.01": 3 }[String(ALFA)] || 2;
    function c(j) { return j === k ? " class='alfa'" : ""; }
    var h = "<table class='tpe'><thead><tr><th>N</th><th" + c(1) + ">α = 10%</th><th" + c(2) + ">α = 5%</th><th" + c(3) + ">α = 1%</th></tr></thead><tbody>";
    TPE.ks.forEach(function (r) { h += "<tr><th>" + r[0] + "</th><td" + c(1) + ">" + r[1] + "</td><td" + c(2) + ">" + r[2] + "</td><td" + c(3) + ">" + r[3] + "</td></tr>"; });
    return h + "<tr><th>N &gt; 100</th><td" + c(1) + ">" + M("$\\frac{1.22}{\\sqrt{N}}$") + "</td><td" + c(2) + ">" + M("$\\frac{1.36}{\\sqrt{N}}$") + "</td><td" + c(3) + ">" + M("$\\frac{1.63}{\\sqrt{N}}$") + "</td></tr></tbody></table>";
  }
  /* Probabilidades de las manos de póker (PPoker.pdf) */
  var POKER = [["Todos diferentes", "\\dfrac{10 \\times 9 \\times 8 \\times 7 \\times 6}{10^5}", "0.30240"], ["Un par", "\\dfrac{10 \\times 1 \\times 9 \\times 8 \\times 7}{10^5}\\dbinom{5}{2}", "0.50400"],
    ["Dos pares", "\\dfrac{1}{2}\\,\\dfrac{10 \\times 1 \\times 9 \\times 1 \\times 8}{10^5}\\dbinom{5}{2}\\dbinom{3}{2}", "0.10800"], ["Tercia", "\\dfrac{10 \\times 1 \\times 1 \\times 9 \\times 8}{10^5}\\dbinom{5}{3}", "0.07200"],
    ["Full", "\\dfrac{10 \\times 1 \\times 1 \\times 9 \\times 1}{10^5}\\dbinom{5}{2}\\dbinom{3}{2}", "0.00900"], ["Póker", "\\dfrac{10 \\times 1 \\times 1 \\times 1 \\times 9}{10^5}\\dbinom{5}{4}", "0.00450"], ["Quintilla", "\\dfrac{10 \\times 1 \\times 1 \\times 1 \\times 1}{10^5}\\dbinom{5}{5}", "0.00010"]];
  function tablaPoker() {
    return "<table class='tpe poker'><thead><tr><th>Categoría</th><th>Cálculo</th><th class='alfa'>Probabilidad</th></tr></thead><tbody>" +
      POKER.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + M("$" + r[1] + "$") + "</td><td class='alfa'>" + r[2] + "</td></tr>"; }).join("") + "</tbody></table>";
  }
  var TABLAS = [
    { id: "normal", t: "Distribución normal", nota: "Área entre 0 y z. Para $\\alpha = 5\\%$ se busca $0.4750$ en el cuerpo de la tabla.", html: tablaNormal },
    { id: "chi", t: "Distribución $X^2$", nota: "$\\nu$ = grados de libertad (renglón); la columna es el $\\alpha$ del problema (resaltada).", html: tablaChi },
    { id: "ks", t: "Kolmogorov-Smirnov $d_{\\alpha,N}$", nota: "Renglón = tamaño de la muestra $N$; columna = $\\alpha$ del problema (resaltada).", html: tablaKS },
    { id: "poker", t: "Probabilidades del póker", nota: "Probabilidad de cada mano de 5 dígitos. $FE_i = \\text{probabilidad} \\times N$.", html: tablaPoker }
  ];
  function tablasHtml(cual, alfa) {
    ALFA = alfa || 0.05;
    var act = TABLAS.some(function (t) { return t.id === cual; }) ? cual : "normal";
    var id = "tb" + Math.floor(Math.random() * 1e6);
    setTimeout(function () {
      var raiz = document.getElementById(id); if (!raiz) return;
      raiz.querySelectorAll("[data-tb]").forEach(function (b) {
        b.onclick = function () {
          raiz.querySelectorAll("[data-tb]").forEach(function (x) { x.classList.toggle("activo", x === b); });
          raiz.querySelectorAll("[data-panel]").forEach(function (p) { p.style.display = p.getAttribute("data-panel") === b.getAttribute("data-tb") ? "" : "none"; });
        };
      });
    }, 0);
    return "<div class='tablas-pe' id='" + id + "'><div class='tabs-pe'>" + TABLAS.map(function (t) { return "<button data-tb='" + t.id + "' class='" + (t.id === act ? "activo" : "") + "'>" + M(t.t) + "</button>"; }).join("") + "</div>" +
      TABLAS.map(function (t) { return "<div data-panel='" + t.id + "'" + (t.id === act ? "" : " style='display:none'") + "><p class='nota-pe'>" + M(t.nota) + "</p><div class='scroll-pe'>" + t.html() + "</div></div>"; }).join("") +
      "<p class='fuente-pe'>Fuente: TablasPE.pdf (apunte del curso), copiadas tal cual.</p></div>";
  }

  B.formulario = {
    html: function () {
      return "<div class='form-run'>" + SECCIONES.map(function (s) {
        return "<h3>" + s.t + "</h3>" + s.f.map(function (f) { return "<div class='f-item'><b>" + f[0] + "</b><div class='f-mate'>" + M(f[1]) + "</div><small>" + M(f[2]) + "</small></div>"; }).join("");
      }).join("") + "<h3>Tablas estadísticas</h3>" + tablasHtml("normal") + "</div>";
    },
    tablasHtml: tablasHtml
  };
})();
