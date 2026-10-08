---
title: Lecturas y repositorios
duration: Consulta
---

## Cómo usar esta página

No necesitas leer todo. Esta página es un mapa. Cada entrada muestra su nivel y te dice cuándo leerla.

- **Beginner** (principiante): empieza por las bases del tema.
- **Intermediate** (intermedio): supone que ya escribiste algo de código o de tests.
- **Advanced** (avanzado): léela solo cuando tu trabajo la necesite.

Las páginas enlazadas están en inglés. Lee primero la "Ruta recomendada". Vuelve a las otras secciones cuando necesites más detalle.

Cada entrada nombra un módulo del curso:

- Módulo 0: Primeros pasos
- Módulo 1: Fundamentos de programación
- Módulo 2: Git y la web
- Módulo 3: Playwright básico
- Módulo 4: Buenas prácticas de QAA
- Módulo 5: Proyecto real

> **Nota:** La documentación cambia. Si un enlace falla, busca el título de la entrada.

> **Nota:** Algunas páginas de Playwright muestran comandos que empiezan con `npx playwright`. En este proyecto, el mismo comando es `pnpm exec playwright`.

## Ruta recomendada

Lee estas nueve páginas en este orden. Primero aprendes programación. Playwright viene después.

1. [Command Line Crash Course (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line): para que la terminal te resulte normal antes de escribir muchos comandos.
2. [The Modern JavaScript Tutorial (javascript.info)](https://javascript.info/): las bases del lenguaje, en pasos pequeños y con ejercicios.
3. [TypeScript for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html): el punto de partida oficial para quienes nunca han programado.
4. [Everyday Types (TypeScript Handbook)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html): los tipos que usarás todos los días.
5. [Installation (Playwright)](https://playwright.dev/docs/intro): cómo se instala Playwright y cómo se ejecuta el primer test.
6. [Writing tests (Playwright)](https://playwright.dev/docs/writing-tests): acciones, aserciones y aislamiento de los tests.
7. [Locators (Playwright)](https://playwright.dev/docs/locators): cómo encontrar elementos usando atributos que ve o usa el usuario.
8. [Best Practices (Playwright)](https://playwright.dev/docs/best-practices): una lista corta de qué hacer y qué evitar.
9. [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html): dónde encajan los tests end-to-end y por qué no debes escribir demasiados.

## 1. Aprende programación y las bases de JavaScript

- [Learn Web Development (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development): Beginner. Un curso de HTML, CSS y JavaScript que empieza por las bases. Úsalo como una biblioteca. Abre solo la parte de JavaScript, durante el módulo 1.
- [The Modern JavaScript Tutorial (javascript.info)](https://javascript.info/): Beginner a Intermediate. Explica el lenguaje con ejemplos cortos y ejercicios. Léelo junto con el módulo 1, cuando estudies variables, funciones y `async`/`await`.
- [Command Line Crash Course (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Command_line): Beginner. Cubre comandos como `cd`, `ls` y `mkdir`, y las herramientas `npm` y `npx`. Léelo en el módulo 0, antes de tu primer ejercicio con la terminal.

## 2. TypeScript

- [TypeScript for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html): Beginner. Explica qué es TypeScript y por qué encuentra errores antes de que ejecutes el código. Léelo en el módulo 1, cuando empiece TypeScript.
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html): Beginner a Intermediate. Un resumen corto de la inferencia de tipos, `interface` y los tipos unión. Léelo al final del módulo 1, cuando ya puedas escribir código simple.
- [Everyday Types (TypeScript Handbook)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html): Beginner a Intermediate. Cubre `string`, `number`, arrays, objetos, uniones y tipos literales. Mantenlo abierto durante los ejercicios de tipos del módulo 1.
- [TypeScript Playground](https://www.typescriptlang.org/play/): Beginner. Un editor en el navegador. Puedes probar una idea sin instalar nada. Úsalo en el módulo 1 cuando una duda sobre tipos te bloquee.
- [Free TypeScript Tutorials (Total TypeScript)](https://www.totaltypescript.com/tutorials): Intermediate. Tiene tutoriales gratuitos con ejercicios, como "Beginner's TypeScript" y "Solving TypeScript Errors". Hazlos después del módulo 1, para practicar con mensajes de error reales.
- [Modules: TypeScript (Node.js)](https://nodejs.org/docs/latest-v24.x/api/typescript.html): Intermediate. Explica cómo Node 24 ejecuta archivos `.ts` quitando los tipos, sin verificarlos. Un `enum` o un `namespace` con código que se ejecuta necesita transformación; un `namespace` que contiene solo tipos se puede quitar. Léelo en el módulo 1 si te preguntas por qué `node file.ts` funciona.

## 3. Documentación oficial de Playwright

Lee estas páginas solo después del módulo 1. Primero necesitas programación básica.

- [Installation](https://playwright.dev/docs/intro): Beginner. Muestra los pasos de instalación, la estructura del proyecto, un primer test y el reporte HTML. Este proyecto ya está configurado, así que léela para entender la estructura. Léela al inicio del módulo 3. La página usa `npx playwright`. Aquí, usa `pnpm exec playwright`.
- [Writing tests](https://playwright.dev/docs/writing-tests): Beginner. Cubre las acciones básicas, las aserciones que esperan y los *hooks* `beforeEach` y `afterEach`. Léela en el módulo 3, antes de tu primer caso de prueba real.
- [Locators](https://playwright.dev/docs/locators): Beginner. Recomienda `getByRole` y `getByLabel` para buscar por lo que ve o usa el usuario, en vez de depender de la estructura del DOM con CSS o XPath. También explica los *locators* estrictos. Mantenla abierta durante todo el módulo 3.
- [Auto-waiting](https://playwright.dev/docs/actionability): Intermediate. Lista las comprobaciones que Playwright espera antes de actuar. Las comprobaciones dependen de la acción: un clic requiere, entre otras, que el elemento sea visible, estable y esté habilitado. Léela en el módulo 4, cuando aparezca tu primer test inestable.
- [Assertions](https://playwright.dev/docs/test-assertions): Beginner a Intermediate. Muestra la diferencia entre las aserciones que reintentan, como `toBeVisible`, y las que no, como `toBe`. Léela en el módulo 3, cuando aprendas a comprobar resultados.
- [Best Practices](https://playwright.dev/docs/best-practices): Beginner a Intermediate. Dice que pruebes lo que ven los usuarios, que mantengas los tests aislados y que evites selectores frágiles. Léela al final del módulo 3, después de tus primeros cinco tests. Vuelve a leerla en el módulo 4.
- [Fixtures](https://playwright.dev/docs/test-fixtures): Intermediate. Muestra cómo preparar y limpiar cada test con `test.extend()`. Léela en el módulo 4, cuando repitas la misma preparación en muchos archivos.
- [Page Object Models](https://playwright.dev/docs/pom): Intermediate. Agrupa los locators y las acciones de una pantalla en una clase. Léela en el módulo 4, cuando varios tests repitan los mismos locators y acciones.
- [Authentication](https://playwright.dev/docs/auth): Intermediate. Muestra cómo guardar y reutilizar el estado de sesión. Compartir una cuenta entre tests paralelos requiere que no se afecten entre sí al cambiar datos del servidor. Te advierte que no hagas *commit* de los archivos de sesión al repositorio. Léela en el módulo 5.
- [Trace Viewer](https://playwright.dev/docs/trace-viewer-intro): Beginner a Intermediate. Permite inspeccionar las acciones grabadas de un test, con capturas del DOM, llamadas de red y mensajes de la consola, para investigar un fallo. Léela en el módulo 3, después de tu primer test que falle.
- [UI Mode](https://playwright.dev/docs/test-ui-mode): Beginner. Una ventana con una línea de tiempo y un modo de observación. La página usa `npx playwright test --ui`. En este proyecto, usa `pnpm e2e:ui` o `pnpm exec playwright test --ui`. Úsalo desde tu primer test en el módulo 3.
- [Generating tests (Codegen)](https://playwright.dev/docs/codegen-intro): Beginner. Graba tus clics y escribe código. La página usa `npx playwright codegen`. En este proyecto, usa `pnpm exec playwright codegen`. Úsalo en el módulo 3 para ver cómo se escribe un locator. Revisa y limpia siempre el resultado.
- [Debugging Tests](https://playwright.dev/docs/debug): Intermediate. Cubre el depurador de VS Code, el Inspector, el modo headed y los logs. Léela en el módulo 3 o 4, cuando un test falle y no sepas por qué. En este proyecto, el modo headed es `pnpm e2e:headed`.
- [Retries](https://playwright.dev/docs/test-retries): Intermediate. Playwright clasifica un test como "flaky" si falla al principio y pasa en un reintento. Léela en el módulo 4, junto con los artículos sobre tests flaky de la sección 4.
- [TypeScript in Playwright Test](https://playwright.dev/docs/test-typescript): Intermediate. Playwright ejecuta TypeScript pero no revisa los tipos. Debes revisarlos con un comando aparte. En este proyecto ese comando es `pnpm typecheck`. Léela en el módulo 4.
- [Parameterize tests](https://playwright.dev/docs/test-parameterize): Intermediate. Muestra cómo generar tests para distintos conjuntos de datos y usar variables de entorno. Léela en el módulo 4, cuando tengas casos casi idénticos con datos distintos.
- [API testing](https://playwright.dev/docs/api-testing): Advanced. Muestra cómo crear datos por la API antes de un test de UI y comprobar el estado final. Léela en el módulo 5, cuando los tests sean lentos por los clics de preparación.
- [Setting up CI](https://playwright.dev/docs/ci-intro): Intermediate. Un workflow de GitHub Actions que ejecuta los tests y sube el reporte. Léela al final del módulo 5.

## 4. Buenas prácticas de QAA y diseño de pruebas

- [Test Pyramid (Martin Fowler)](https://martinfowler.com/bliki/TestPyramid.html): Beginner. Una versión corta de la idea: los tests end-to-end a través de la interfaz suelen ser más frágiles, lentos y costosos que los tests de menor alcance. Léela al inicio del módulo 4, antes de la siguiente entrada.
- [The Practical Test Pyramid (Ham Vocke)](https://martinfowler.com/articles/practical-test-pyramid.html): Intermediate. Escribe muchos tests unitarios, menos tests de integración y pocos tests end-to-end. Léela en el módulo 4, antes de decidir qué casos automatizar.
- [Write tests. Not too many. Mostly integration. (Kent C. Dodds)](https://kentcdodds.com/blog/write-tests): Intermediate. Presenta el "Testing Trophy". También analiza los beneficios cada vez menores de perseguir el 100% de cobertura. Léela en el módulo 4 para formarte tu propia opinión sobre cuánto automatizar.
- [Guiding Principles (Testing Library)](https://testing-library.com/docs/guiding-principles/): Beginner. Presenta un principio útil para elegir locators: cuanto más se parece un test al uso real, más confianza puede darte. Léela en el módulo 3, junto con la página de locators.
- [About Queries (Testing Library)](https://testing-library.com/docs/queries/about/#priority): Intermediate. Da una lista de prioridades para encontrar elementos y recomienda el rol y la etiqueta antes que otras opciones. Léela en el módulo 3, junto con la lección Locators.
- [Test Flakiness: One of the main challenges of automated testing (Google Testing Blog)](https://testing.googleblog.com/2020/12/test-flakiness-one-of-main-challenges.html): Intermediate. Clasifica las causas de los tests flaky. Léela en el módulo 4, la primera vez que un test pase y falle sin cambios en el código.
- [Eradicating Non-Determinism in Tests (Martin Fowler)](https://martinfowler.com/articles/nonDeterminism.html): Intermediate. Lista causas y soluciones para tests que dan resultados distintos: aislamiento, código asíncrono, tiempo y servicios remotos. Léela en el módulo 4, después del artículo de Google.
- [Just Say No to More End-to-End Tests (Google Testing Blog)](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html): Intermediate. Argumenta contra depender solo de tests end-to-end. Los comentarios discuten cuándo el consejo no aplica, así que léela con ojo crítico. Léela en el módulo 4.
- [Test Sizes (Google Testing Blog)](https://testing.googleblog.com/2010/12/test-sizes.html): Advanced. Clasifica los tests en pequeños, medianos y grandes según sus dependencias, no según sus nombres. Léela en el módulo 5, cuando quieras palabras exactas para hablar con los desarrolladores.

## 5. Repositorios para leer y practicar

### Código

- [microsoft/playwright](https://github.com/microsoft/playwright): Intermediate. El repositorio oficial del framework. Úsalo en el módulo 5 para leer issues, notas de versión y ejemplos cuando la documentación no responda tu pregunta.
- [microsoft/playwright-examples](https://github.com/microsoft/playwright-examples): Intermediate. Escenarios de prueba de ejemplo con Node.js. Léelo en el módulo 4, después de los fixtures, para comparar estilos.
- [UKHO/playwright-template](https://github.com/UKHO/playwright-template): Advanced. Una plantilla con Playwright, TypeScript y Page Object Model. Tiene tests de páginas, de flujos end-to-end y de accesibilidad. También tiene una aplicación de ejemplo en Angular. Mira solo la carpeta `tests/` e ignora el resto. Léela en el módulo 5.
- [awesome-playwright](https://github.com/mxschmitt/awesome-playwright): Intermediate. Una lista curada de herramientas, ayudas y proyectos alrededor de Playwright. Úsala en el módulo 5 cuando necesites una biblioteca específica, por ejemplo para reportes.

### Sitios para practicar

- [TodoMVC demo (demo.playwright.dev)](https://demo.playwright.dev/todomvc/): Beginner. La aplicación de ejemplo que usa la documentación de Playwright. Está hecha para hacer pruebas. Úsala en el módulo 3 para tu primera práctica de locators y aserciones.
- [The Internet (the-internet.herokuapp.com)](https://the-internet.herokuapp.com/): Beginner. Más de 40 escenarios, como casillas, listas desplegables, contenido dinámico, alertas y descargas. Úsala en los módulos 3 y 4. Elige un escenario por sesión de práctica.

### Curso guiado

- [Build your first end-to-end test with Playwright (Microsoft Learn)](https://learn.microsoft.com/en-us/training/modules/build-with-playwright/): Beginner. Un módulo de 8 unidades para instalar, ejecutar, depurar y grabar tests desde VS Code. Hazlo en el módulo 3 si prefieres pasos guiados a leer documentación.

## 6. Herramientas de uso diario

- [What is Git? (Pro Git)](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F): Beginner. Explica los tres estados de un archivo: modificado, preparado (*staged*) y confirmado (*committed*). Léela en el módulo 2, antes de tu primer `git commit`.
- [Getting a Git Repository (Pro Git)](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository): Beginner. Muestra `git init` y `git clone` con ejemplos. Úsala en el módulo 2, cuando clones el repositorio de tu equipo.
- [VS Code Extension for Playwright Testing](https://playwright.dev/docs/getting-started-vscode): Beginner. Ejecuta y depura tests con un clic, graba con Codegen y mira los traces dentro del editor. Instálala al inicio del módulo 3.
- [Basic Editing (VS Code)](https://code.visualstudio.com/docs/editing/codebasics): Beginner. Atajos, cursores múltiples, buscar y reemplazar, y dar formato al guardar. Léela una vez en el módulo 0 para trabajar más rápido en el editor.

> **Consejo:** Mantén un traductor abierto en tu navegador si lo necesitas. Comprueba siempre los nombres en inglés de los métodos, como `getByRole`, `toBeVisible` y `test.extend`.
