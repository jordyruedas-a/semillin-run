# Semillín Run · Modelado y Simulación de Sistemas Dinámicos

Juego de navegador para aprender la materia. Cada mundo es un tema del curso y su problema es una variante de un ejercicio resuelto en clase: mismo procedimiento, misma fórmula y mismo formato de tabla, con otros números.

El juego te da los datos del problema (la semilla, los números rectangulares, los tiempos…) igual que en clase, y tú llenas la tabla celda por celda:

1. **Corres** con Semillín, esquivas virus y juntas monedas. Cada moneda vale **+5 s** de tiempo para resolver.
2. En la **zona de cálculo** el juego marca con **?** la celda de la tabla que sigue. Escribes el resultado (puedes usar la calculadora del juego o escribir la operación, por ejemplo `16/10`).
3. Si aciertas, se llena la tabla y ves el procedimiento completo (fórmula de clase y sustitución). Si fallas pierdes 5 s; si se acaba el tiempo pierdes una vida y ves la solución.
4. Las preguntas de palabras (teoría, manos de póker, conclusiones) se contestan entrando al **tubo** correcto.
5. Al final llega el jefe **Dr. Período**: la tabla se oculta y respondes de memoria.

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
| Enter | Revisar tu resultado / continuar / ir a los tubos |
| Esc o P | Pausa |

El mundo 1 empieza con una demo interactiva de 7 pasos que enseña cada control (se puede saltar con Esc).

## Botones dentro del juego

- **Enunciado:** el problema completo con sus datos.
- **Tablas** (solo en las pruebas estadísticas): tabla normal, tabla X² y tabla Kolmogorov-Smirnov, copiadas de `TablasPE.pdf`.
- **Formulario:** solo las fórmulas vistas en clase.
- **⤢ Ampliar:** la tabla del apunte en grande.
- Mientras resuelves, consultar enunciado, tablas o formulario **no detiene el reloj**.

## Los 17 mundos

| # | Mundo | Basado en |
|---|---|---|
| 1 | ¿Qué es simular? | IntroSimulación, Generación#Rectangulares |
| 2 | Generador mixto (a = 3, c = 7, m = 10, X0 = 3) | ProbGeneradores |
| 3 | Generador multiplicativo (a = 11, m = 32, X0 = 3) | ProbGeneradores |
| 4–9 | Promedios, Kolmogorov-Smirnov, frecuencias, series, distancias, póker | PPromedios, PKS, PF, PSeries, PDistancias, PPoker, TablasPE |
| 10–13 | Exponencial, uniforme, empírica, Poisson con tabla de rangos | ProbGVAU, DistribuciónPoisson |
| 14 | Juego de volados | EjerAplicaciones de Simulación |
| 15 | Caja del supermercado (cola) | EjApCaja |
| 16 | Sistema de inventarios (q, R) | TAplicaciones de Simulación |
| 17 | Factores del modelo | FACTORESDEMODELOS |

## Puntaje

- Moneda: 25 pts y +5 s · celda correcta: 200 pts + 2 pts por cada segundo que te sobró.
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
js/runner/niveles.js     los 17 problemas (datos, cálculos y fórmulas; se puede probar en Node)
js/runner/runner.js      motor del juego (paso fijo de 1/120 s, capas pre-dibujadas)
js/runner/mate.js        fórmulas con KaTeX
js/runner/formulario.js  formulario y tablas estadísticas de clase
js/runner/liga.js        jugadores, liga local y liga en línea
vendor/katex/            KaTeX 0.16 (MIT)
Solucionario_Semillin_Run.docx / .pdf   procedimiento y respuestas de los 17 mundos
```

Gráficos: Tiny City de Kenney (CC0). Fuente: Jersey 10 (OFL). Fórmulas: KaTeX (MIT). Sonidos de Crowds de Nicky Case (CC0).
