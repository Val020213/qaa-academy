---
title: Bienvenida
duration: 15 min
---

## El jueves antes del release

Mañana sale una versión y tienes que correr la regresión. Abres la hoja con 120 casos y empiezas por el primero: *login*, búsqueda, carrito, pago. Son los mismos casos de hace dos semanas, y de las dos semanas anteriores.

Hacia el caso 90 ya haces clic casi sin mirar, y ahí es donde se escapa lo que no esperabas: el total que no suma el envío, el botón que quedó fuera de lugar. La regresión te toma dos días, y el equipo ya está planeando la siguiente versión.

Una parte grande de esa hoja puede ejecutarla un programa en minutos, las veces que haga falta. Este curso te enseña a escribir ese programa.

## Objetivo

- Explicar qué es un test end-to-end y qué hace Playwright.
- Reconocer qué pasos de tus casos manuales puede seguir una computadora y cuáles no.
- Entender el orden del curso y por qué empieza por programación.
- Tener un método de estudio para las lecciones que siguen.

## ¿Qué es la automatización de pruebas?

Automatizar pruebas es escribir código que ejecute tus casos por ti. Cada caso se convierte en un **test automatizado**: un archivo que abre la aplicación, hace los pasos, compara el resultado y dice si pasó o falló. Corre cuando tú quieras, o en cada cambio del equipo, sin que nadie lo mire.

## Ya tienes la parte difícil

Lo difícil de probar no es el código, es saber qué probar. Tú ya sabes leer un requisito, reconocer los casos riesgosos y anticipar lo que un usuario puede hacer mal. Un programador sin ese criterio escribe tests débiles. El código se aprende paso a paso, y el criterio es lo que más tarda en construirse.

## ¿Qué es un test end-to-end?

Un **test end-to-end** (de extremo a extremo, test E2E) recorre un flujo completo con la aplicación real en un navegador real. Por ejemplo:

1. Abre la página de *login*.
2. Escribe un correo y una contraseña válidos.
3. Haz clic en "Log in".
4. Comprueba que aparece el *dashboard*.

Se llama "de extremo a extremo" porque atraviesa todas las capas a la vez: interfaz, servidor y base de datos. Si algo falla en cualquiera de ellas, el test falla, aunque no te dice en cuál.

## ¿Qué es Playwright?

**Playwright** es una herramienta gratuita de Microsoft que controla un navegador como Chrome desde código. Abre páginas, hace clic, escribe y lee lo que aparece en pantalla. Playwright también existe para Python, Java y .NET. En este curso lo usas con TypeScript, que es su versión más completa.

## Herramientas del curso

| Herramienta | Uso en el curso | Sitio oficial |
| --- | --- | --- |
| ![](/icons/typescript.svg) TypeScript | Escribir los programas y los tests | [typescriptlang.org](https://www.typescriptlang.org) |
| ![](/icons/nodejs.svg) Node.js | Ejecutar los programas y los tests | [nodejs.org](https://nodejs.org) |
| ![](/icons/playwright.svg) Playwright | Automatizar los tests en el navegador | [playwright.dev](https://playwright.dev) |
| ![](/icons/vscode.svg) VS Code | Escribir y revisar el código | [code.visualstudio.com](https://code.visualstudio.com) |
| ![](/icons/git.svg) Git | Guardar los cambios del código | [git-scm.com](https://git-scm.com) |
| ![](/icons/pnpm.svg) pnpm | Instalar las librerías del proyecto | [pnpm.io](https://pnpm.io) |

## El orden de este curso

Muchos cursos empiezan por la herramienta. Este empieza por el lenguaje, porque un test de Playwright es código, y si no puedes leerlo no puedes arreglarlo cuando falle. El orden es este:

1. Primero, programación con TypeScript.
2. Después, Git y cómo funciona la web.
3. Por último, Playwright.

## Los módulos

| Módulo | Nombre | Qué aprendes |
| --- | --- | --- |
| 0 | Primeros pasos | Instalar las herramientas y ejecutar el sitio del curso |
| 1 | Fundamentos de programación con TypeScript | Variables, decisiones, bucles, funciones y más |
| 2 | Git y la web para QA | Guardar tu trabajo con Git. Entender HTML y cómo funcionan los navegadores |
| 3 | Playwright básico | Escribir tus primeros tests reales en el navegador |
| 4 | Buenas prácticas de QAA | Hacer tests estables, claros y fáciles de mantener |
| 5 | Proyecto real | Probar una aplicación pequeña y completa |
| 6 | Referencias | Enlaces y un glosario para después |

## Cómo estudiar

**Escribe el código tú mismo.** No copies y pegues. Al escribir prestas más atención, y los pequeños errores que cometas te enseñan más que un ejemplo que funciona a la primera.

**Adivina primero.** Antes de ejecutar un ejemplo, anota lo que esperas ver. Cuando te equivocas, es cuando más aprendes.

**Rompe cosas a propósito.** Cuando un ejemplo funcione, bórrale un carácter o cámbiale un nombre y mira qué pasa. Así descubres qué hace cada parte.

**Lee los mensajes de error.** Dicen qué está mal y, casi siempre, dónde. Léelos despacio, desde arriba, y fíjate en el número de línea.

**Busca antes de preguntar.** Algunas lecciones tienen un Reto que necesita algo que la lección no enseñó. Tienes que buscarlo, y buscar es parte del trabajo diario de quien programa.

**Da pasos pequeños cada día.** Treinta minutos diarios rinden más que cinco horas una vez por semana. Para cuando estés cansado y vuelve mañana.

**Pide ayuda con una pregunta clara.** Cuenta qué hiciste, qué esperabas y qué pasó, y copia el mensaje de error completo.

> **Consejo:** Lleva un archivo de notas. Cuando aprendas una palabra nueva, anótala con tu propia explicación corta.

### Usar un asistente de IA

Puedes pedirle ayuda a un asistente de IA con una condición: ejecuta el código y sé capaz de explicar cada línea. Si no puedes explicarla, tampoco podrás arreglarla cuando se rompa. Un buen uso es preguntar "¿por qué funciona esta línea?" después de escribir tu propia versión.

## Profundiza

### Un paso manual no es un paso automático

Un caso manual puede decir "Verifica que la página se vea bien", y una persona sabe qué hacer. Un test no. Necesita el elemento exacto, la forma exacta de encontrarlo y el resultado exacto que debe esperar, como "el título es Welcome" o "el total es 45,00". Si falta uno de esos datos, el test se detiene o comprueba otra cosa.

Por eso escribir tus casos como pasos concretos, como en la Práctica, es la primera habilidad de este trabajo. Cada paso que escribes con claridad es un paso que después puedes convertir en código.

### La automatización no reemplaza las pruebas manuales

Un test automatizado solo repite una comprobación que ya conoces. No encuentra bugs nuevos: avisa cuando se rompe un comportamiento que antes funcionaba. Encontrar lo nuevo sigue necesitando a una persona que explore, dude y note lo que parece raro. Lo que conviene es combinar las dos cosas: exploración manual para descubrir y automatización para proteger lo descubierto.

## Práctica

1. Piensa en un caso de prueba manual que escribiste en tu trabajo. Anota sus pasos en papel.
2. Marca cada paso como una acción (hacer clic, escribir) o una comprobación (ver, comparar).
3. Guarda este papel. En el módulo 3, convertirás un caso como este en un test automatizado.

## Siguiente paso

Ve a la siguiente lección e instala las herramientas que necesitas en Windows.
