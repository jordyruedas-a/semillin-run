# Semillín Run · Modelado y Simulación de Sistemas Dinámicos

Juego de navegador para practicar la materia. Cada mundo es un tema práctico del curso y tiene **6 problemas**; al entrar se elige uno al azar. Cada problema es una variante de un ejemplo o ejercicio de clase: mismo procedimiento, misma fórmula y mismo formato de tabla, con otros datos.

El juego te da los datos del problema (la semilla y las constantes del generador, los números rectangulares y α, λ, el enunciado de la aplicación…) igual que en clase, y tú llenas la tabla celda por celda:

1. **Corres** con Semillín, esquivas virus y juntas monedas. Cada moneda vale **+5 s** de tiempo para resolver.
2. En la **zona de cálculo** el juego marca con **?** la celda de la tabla que sigue y muestra solo la fórmula de clase (sin sustituir). Resuelves con la calculadora del juego; en las pruebas estadísticas el botón **Tablas** (que parpadea cuando lo necesitas) abre las tablas del curso y, en póker, las probabilidades de cada mano.
3. Presionas Enter (o se acaba el tiempo) y corres a los **dos tubos**: uno tiene el resultado correcto y el otro un error típico. Entras al correcto con ↓ (para el tubo B hay que brincar la lava).
4. Si aciertas, se llena la tabla y ves el procedimiento (fórmula y sustitución). Si eliges mal, caes a la lava, pierdes una vida y lo intentas otra vez.
5. Al final llega el jefe **Dr. Período** con la conclusión del problema (¿período completo?, ¿números aceptados o rechazados?, tiempo promedio…). Si lo vences, entras al tubo dorado y terminas el mundo.

Las fórmulas se ven con notación matemática normal (fracciones, exponentes, subíndices y raíces) gracias a KaTeX.

## Cómo abrirlo

- **En línea:** la dirección de Render (ver abajo). Ahí funciona la liga con tus compañeros.
- **En tu computadora sin internet:** doble clic en `INICIAR.bat` o abre `index.html`. La liga queda local (con código para compartir).
- **En tu computadora con la liga:** `INICIAR-con-servidor.bat` (necesita Node.js) y abre <http://localhost:8000>.

## Controles

| Tecla | Acción |
|---|---|
| Espacio o ↑ | Brincar |
| ↓ (mantener) | Agacharse (esquiva los virus voladores bajos) |
| ↓ sobre un tubo | Entrar al tubo |
| Enter | Ir a los tubos / continuar |
| Esc o P | Pausa |

El mundo 1 empieza con una demo interactiva de 7 pasos que enseña cada control (se puede saltar con Esc).

## Botones dentro del juego

- **Enunciado:** el problema completo con sus datos.
- **Tablas** (solo en las pruebas estadísticas): tabla normal, tabla X² y tabla Kolmogorov-Smirnov, copiadas de `TablasPE.pdf`.
- **Formulario:** solo las fórmulas vistas en clase.
- **⤢ Ampliar:** la tabla del apunte en grande.
- Mientras resuelves, consultar enunciado, tablas o formulario **no detiene el reloj**.

## Los 14 mundos

| # | Mundo | Basado en | Se pide en los tubos | Jefe final |
|---|---|---|---|---|
| 1 | Generador congruencial mixto | ProbGeneradores | número rectangular de cada renglón | ¿período completo? · ¿aceptados? |
| 2 | Generador congruencial multiplicativo | ProbGeneradores | PE = m/4 y número rectangular de cada renglón | ¿período completo? · ¿aceptados? |
| 3 | Prueba de promedios | PPromedios, Ejer.PEStadísticas | media, Z0, α real, Z de tablas | ¿aceptados o rechazados? |
| 4 | Prueba Kolmogorov-Smirnov | PKS | Dn de cada renglón | Dn, d(α, N), ¿aceptados? |
| 5 | Prueba de frecuencias | PF | FE, FO de cada intervalo, X0², tabla | ¿aceptados o rechazados? |
| 6 | Prueba de series | PSeries | FE, parejas por cuadrante, X0², tabla | ¿aceptados o rechazados? |
| 7 | Prueba de distancias | PDistancias | FO y FE de cada distancia, agrupadas, X0², tabla | ¿aceptados o rechazados? |
| 8 | Prueba póker | PPoker | FO de cada mano, FE y FO agrupadas, X0², tabla | ¿aceptados o rechazados? |
| 9 | Distribución exponencial | ProbGVAU, AcGenDVAnou | TA de cada cliente y TTC | tiempo promedio de atención |
| 10 | Distribución uniforme | ProbGVAU, AcGenDVAnou | TE de cada refresco | último TE y el que más tardó |
| 11 | Distribución empírica | ProbGVAU, AcGenDVAnou | X de cada mensaje | último X y el que más tardó |
| 12 | Distribución Poisson | DistribuciónPoisson, EjPRDistribuciónPoisson | f(x) y F(x), dónde se detiene | demanda simulada con la tabla de rangos |
| 13 | Juego de volados | EjerAplicaciones de Simulación, EjRApVolados | cantidad después de cada volado y si llegó a la meta | metas, quiebras y probabilidad |
| 14 | Caja del supermercado | EjApCaja | celdas de cada cliente y tiempo promedio | % de tiempo desocupado |

Los problemas resueltos de cada tema están en `problemario/` (un documento de Word por tema, generado desde `js/runner/niveles.js`).

## Puntaje

- Moneda: 25 pts y +5 s · tubo correcto: 200 pts + 2 pts por cada segundo que te sobró en la zona de cálculo.
- Racha: cada 3 aciertos seguidos sube el multiplicador (×2, ×3, ×4); cada 4 aciertos seguidos da una vida extra.
- Estrellas: 3 sin errores ni golpes, 2 con hasta 2 fallas, 1 al terminar.

## Liga en línea

El servidor (`server.js`) sirve el juego y guarda el mejor puntaje de cada jugador por mundo en PostgreSQL (variable `DATABASE_URL`). Sin esa variable usa un archivo local `data/liga.json`. Cada jugador tiene una clave secreta guardada en su navegador: nadie más puede cambiar sus puntos.

API: `GET /api/salud`, `GET /api/liga?mundo=m04`, `POST /api/puntaje`.

### Publicar en Render

1. Sube este repositorio a GitHub.
2. En Render: **New → Blueprint**, elige el repositorio. `render.yaml` crea el servicio web (Node, plan gratis). En `DATABASE_URL` pega la «Internal Database URL» de una base PostgreSQL de Render (puede ser una que ya uses: el juego solo crea y usa la tabla `semillin_jugadores`).
3. Render instala con `npm install` y arranca con `node server.js`.

Nota: en el plan gratis el servicio se duerme tras 15 min sin visitas (la primera carga tarda unos 30 s) y Render solo permite una base de datos gratis por cuenta (caduca a los 30 días).

## Archivos

```
index.html               el juego
server.js                servidor + liga en línea
render.yaml              configuración para Render
js/runner/niveles.js     los 14 mundos × 6 problemas (datos, cálculos y fórmulas; se puede probar en Node)
js/runner/runner.js      motor del juego (paso fijo de 1/120 s, capas pre-dibujadas)
js/runner/mate.js        fórmulas con KaTeX
js/runner/formulario.js  formulario y tablas estadísticas de clase
js/runner/liga.js        jugadores, liga local y liga en línea
vendor/katex/            KaTeX 0.16 (MIT)
problemario/             un Word por tema con los 6 problemas resueltos
```

Gráficos: Tiny City de Kenney (CC0). Fuente: Jersey 10 (OFL). Fórmulas: KaTeX (MIT). Sonidos de Crowds de Nicky Case (CC0).
