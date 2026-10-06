---
title: Tu primer pull request
summary: Lleva tus tests de tu computadora al equipo: branch, commits pequeños, revisiones, push, pull request y review. Aprende lo que un merge no puede comprobar por ti.
duration: 90 min
---

## Empieza con un acertijo

Dos compañeros trabajan al mismo tiempo en los tests de la tienda.

El *pull request* (solicitud de integración) de Ana agrega un test que cancela el pedido pendiente 1001. El pull request de Ben agrega un test que marca ese mismo pedido 1001 como pagado. Cada pull request pasa solo las revisiones de CI, con una marca verde.

Se hace el *merge* (integración) del pull request de Ana. Luego el de Ben. Git no muestra ningún conflicto. Unos minutos después, la ejecución de CI en `main` está en rojo.

Nadie cambió la misma línea de código. ¿Qué falló, y por qué nadie lo vio antes del merge? ¿Qué cambiarías en la forma de trabajar del equipo?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Sigue el ciclo completo, desde un *branch* (rama) nuevo hasta un pull request integrado.
- Predice qué contiene un rango de commits y qué no puede comprobar un merge.
- Ejecuta todas las revisiones antes del *push* (subir cambios), y di cuál revisión no ejecuta CI por ti.
- Escribe una descripción de pull request que un revisor pueda usar, y responde a los comentarios de la revisión.

## El ciclo

Ya conoces lo básico de Git. En un equipo, tu código de tests llega a la rama principal solo a través de un **pull request**: una solicitud para integrar tu rama, que otros revisan primero.

Los pasos son:

1. Crea un branch.
2. Haz commits pequeños.
3. Ejecuta las revisiones.
4. Haz push del branch.
5. Abre el pull request.
6. Responde a la revisión.

Planifica el trabajo antes de empezar, con palabras sencillas. Un pull request es un proyecto pequeño. Pregunta: ¿cuál es el único tema? ¿Cuáles son las piezas? ¿En qué orden las voy a confirmar con commit? Esto es **descomposición**. El plan de esta lección es la lista de la sección Práctica.

## 1. Crea un branch

Empieza desde un `main` actualizado. Dale al branch un nombre que diga lo que hace.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Buenos nombres: `tests/cancel-pending-order`, `tests/edit-product`. Un branch debe tener un solo tema.

## 2. Commits pequeños

Haz un *commit* por cada pieza terminada. Un commit que hace una sola cosa es fácil de revisar y de deshacer.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Escribe el mensaje en presente. Di qué agrega el commit. Agrega los archivos por su nombre. No uses `git add .` a ciegas, porque puede agregar archivos que no querías.

Prueba un experimento pequeño. Antes de seguir, adivina qué imprime este comando en tu proyecto:

```bash
git add --dry-run .
```

`--dry-run` muestra lo que se agregaría, y no agrega nada. Compara la lista con tu respuesta. ¿Hay algún archivo que no querías compartir?

Ejecuta `git status` antes de cada commit. Nunca debes ver `.auth/`, `playwright-report/` ni `test-results/` en la lista. Están ignorados.

> **Cuidado:** `git commit -am "message"` agrega al área de preparación solo los archivos que Git ya conoce. Un archivo de spec nuevo todavía no se conoce, así que se queda fuera del commit. Agrega siempre un archivo nuevo por su nombre con `git add`.

## 3. Ejecuta las revisiones

Ejecuta estos tres comandos desde la raíz del repositorio. Todos deben pasar.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` revisa los tipos del sitio del curso, sus tests y los ejercicios.
- `pnpm --filter practice-shop typecheck` revisa los tipos de la tienda y sus tests. Un tipo incorrecto en un spec falla aquí.
- `pnpm shop:e2e` ejecuta la suite de la tienda. Ejecútala al menos dos veces si cambiaste la preparación de datos.

Mira el archivo de workflow `.github/workflows/e2e.yml`. ¿Cuáles de estos tres comandos ejecuta? Ejecuta el primero y el tercero. No ejecuta `pnpm --filter practice-shop typecheck`. Así que CI no detectará un tipo incorrecto en un spec de la tienda. Para esa revisión, tú eres la única barrera. Sabe qué revisiones hace la máquina por ti, y cuáles son tuyas.

Si tocaste el sitio del curso, ejecuta también `pnpm e2e`. CI ejecuta las dos suites, así que tú también debes hacerlo.

## 4. Push

La primera vez, define el upstream. Esto vincula tu branch local con el remoto.

```bash
git push -u origin tests/close-coverage-gaps
```

Aquí `origin` es tu *fork* en GitHub, la copia que hiciste en el módulo 0. La salida imprime un enlace para abrir un pull request. Ábrelo en tu navegador.

> **Cuidado:** GitHub puede ofrecerse a enviar el pull request al repositorio original del curso. Cambia el **base repository** (repositorio base) a tu propio fork, para que el pull request se quede en tu copia. Luego comparte su enlace con la persona que revisa tu trabajo.

## 5. Escribe la descripción

Una buena descripción responde cuatro preguntas. Usa esta plantilla:

```text
## What is covered
- An admin cancels a pending order (order 1001).
- Editing a product: four scenarios.

## How to run
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts

## Notes
- COVERAGE.md is updated: two gaps removed.
- Product tests create their own data. The cancel test uses the seeded order 1001, and only that test uses it.
```

Hazla corta. Di hechos. No escribas "por favor revisa", escribe qué revisar.

La última nota, "Order 1001 is used only by the cancel test", es una promesa. Cualquiera puede romperla más adelante. Esa es la lección del acertijo.

Puedes pedirle a un asistente de IA que redacte una descripción. Pero ejecuta cada comando que escriba y comprueba cada afirmación, como el id del pedido. Nunca pegues una frase que no puedas explicar. En la revisión te preguntarán a ti, no al asistente.

### De vuelta al acertijo

Git integra texto, no comportamiento. El test de Ana y el de Ben cambian archivos distintos, así que no hay conflicto. Pero los dos tests usan el pedido 1001, y un pedido cambia en una sola dirección. Si el test de cancelar corre primero, el pedido queda cancelado, y el test de pagado no puede marcarlo como pagado: el servidor responde que un pedido cancelado no puede pasar a pagado. Si el test de pagado corre primero, el test de cancelar igual falla, porque su guarda espera que el pedido 1001 esté pendiente, y ya está pagado. (Pasaría solo si el test de cancelar aceptara un pedido ya pagado.) Así que fallan en los dos órdenes. Los dos tests no pueden compartir el pedido 1001. Cada uno falla por una razón distinta según el orden de los archivos, lo que vuelve confuso el mensaje de error. Cada test estaba en verde solo, porque cada uno corrió sobre una semilla nueva.

Tres hábitos lo habrían detectado:

- Antes del merge, actualiza tu branch con el `main` más reciente y ejecuta la suite otra vez. Muchos equipos lo vuelven una regla.
- Escribe en la descripción qué datos de la semilla usa tu test. Así los revisores pueden buscar el mismo id.
- Mejor aún, crea el pedido que tu test necesita. Así ningún test es dueño de un registro compartido.

Esta es la **I** de **FIRST** (una lista de rasgos de un buen test: Fast, Independent, Repeatable, Self-checking, Timely; es decir, rápido, independiente, repetible, autoverificable y oportuno): los tests deben ser independientes. Un merge es el momento en que se encuentran dos tests independientes.

## 6. Responde a la revisión

Un revisor lee tu código y deja **comentarios**. Un comentario no es un ataque. Es una segunda opinión gratis.

- Lee cada comentario completo antes de responder.
- Si estás de acuerdo, cambia el código, haz commit y push. El pull request se actualiza solo.
- Si no estás de acuerdo, haz una pregunta o explica tu razón en una o dos frases.
- Responde "Done" cuando arregles un comentario, para que el revisor pueda encontrarlo.
- No discutas sobre estilo. El estilo del equipo está en `e2e/README.md`.

## La lista de verificación

Antes de abrir el pull request, revisa cada punto tú mismo. Esta es la lista del módulo 4 (la lección "Revisar un spec"), en forma corta.

- Los specs importan `test` y `expect` desde `lib/test`.
- Cada elemento interactivo se selecciona con `getByTestId`.
- Ningún `page.waitForTimeout`. Las esperas son aserciones *web-first* (que esperan solas).
- Los tests de productos crean sus propios datos. Los tests de pedidos usan su propio pedido de la semilla. Ningún test depende del orden de los archivos.
- Ningún `test.only` olvidado en el código.
- El nombre del test dice lo que ve el usuario.
- `COVERAGE.md` está actualizado.
- La revisión de tipos y las dos suites pasan.

> **Cuidado:** Un `test.only` olvidado hace fallar el build de CI, porque allí `forbidOnly` está activado. Busca `.only` antes de hacer push.

## Profundiza

### Por qué ayudan los commits pequeños: qué es realmente un commit

Un **commit** es una foto guardada de tus archivos, con un mensaje y un id. Git guarda todo el historial de fotos. Como cada commit es independiente, Git puede deshacer uno sin tocar los demás. Con un solo commit grande, no puedes deshacer solo la parte mala.

Un **branch** es solo un nombre que apunta a un commit. Crear un branch es barato. Por eso el consejo es crear un branch nuevo para cada tema.

Cuando escribes `git log --oneline main..HEAD`, los dos puntos significan: los commits que `HEAD` puede alcanzar y `main` no. Esa es la lista de commits de tu pull request.

### Una idea equivocada: "git add . es más rápido, así que está bien"

Es más rápido, pero agrega todo, incluso archivos que no querías compartir. Antes de cada commit, mira qué está preparado:

```bash
git status
git diff --staged
```

`git diff --staged` muestra las líneas exactas que entran al commit. Si ves un archivo que no corresponde, quítalo del área de preparación:

```bash
git restore --staged path/to/file
```

Esta revisión toma diez segundos. Los revisores notan un diff limpio, y confían más en ti.

### Cómo aparece en el trabajo real de automatización QA

Un pull request también es una **conversación sobre riesgo**. Un revisor pregunta: "¿Por qué elegiste el pedido 1001?" o "¿Qué pasa si esto corre dos veces?" Tus respuestas ya deben estar en la descripción. La lista de verificación al final de esta lección es una forma de quitar repetición: no hace falta escribir otra vez los mismos comentarios de revisión en cada pull request. Esta es la idea llamada **DRY**, aplicada al trabajo de un equipo en lugar de al código. El archivo `COVERAGE.md` funciona igual. Lo que está cubierto se escribe una vez, en un archivo, no en muchos mensajes de chat.

### El costo del tamaño

Un pull request muy grande es difícil de revisar. La gente lo lee por encima y se le escapan bugs. Uno muy pequeño por cada línea crea demasiados pull requests, y cada uno tiene un costo: esperar, ejecutar CI, cambiar de tarea. Un buen tamaño es un tema que una persona pueda leer en 15 a 20 minutos. Los tres commits de esta lección son un solo pull request porque comparten un objetivo: cerrar huecos de cobertura. Si fueran temas sin relación, serían mejores tres pull requests.

## Práctica

1. Crea un branch llamado `tests/close-coverage-gaps`.
2. Haz commit del test de cancelar pedido junto con `COVERAGE.md` en un solo commit.
3. Haz commit de `product-edit.spec.ts` y su cambio en `COVERAGE.md` en un segundo commit.
4. Haz commit del spec del viewer y su cambio en `COVERAGE.md` en un tercer commit.
5. Ejecuta las tres revisiones. Haz push. Abre el pull request con la plantilla.
6. Pide a un compañero o a tu mentor que lo revise.

## Reto

Practica una habilidad que necesitan los pull requests reales: **separar un cambio mezclado en commits limpios**. Trabaja en un branch de práctica que no vas a subir. Crea el branch `tests/challenge-split-commits` desde `main`. En `apps/practice-shop/e2e/COVERAGE.md`, haz dos ediciones sin relación de una sola vez, a pocas líneas de distancia, sin hacer commit entre ellas. Edición uno: arregla o reformula la frase "These gaps are left on purpose." de la forma que elijas. Edición dos: borra una línea de la lista de huecos. Luego crea el archivo `exercises/challenges/pr-description.md` y escribe una descripción de estos cambios con la plantilla de esta lección. Agrega una línea que nombre un riesgo sobre el que un revisor podría preguntar.

Está terminado cuando:

- `git log --oneline main..HEAD` muestra exactamente tres commits.
- `git show --stat` de los dos primeros commits lista solo `COVERAGE.md`, y cada uno cambia una sola línea: el primer commit tiene la edición uno, el segundo tiene la edición dos.
- El tercer commit agrega solo `exercises/challenges/pr-description.md`.
- `git status` muestra un árbol de trabajo limpio, y el branch nunca se subió.
- Cada mensaje de commit empieza con un verbo y dice qué cambia el commit.

Vas a necesitar algo que esta lección no enseñó: cómo preparar solo una parte de un archivo, y qué hacer cuando Git muestra dos ediciones cercanas como una sola pieza. Busca: `git add patch mode`, `git add -p split hunk` y `git show --stat`.

## Piénsalo bien

1. Predice la salida. Estás en `main` con 20 commits. Ejecutas `git switch -c tests/a`, haces dos commits y luego ejecutas `git log --oneline main..HEAD`. ¿Cuántas líneas imprime, y en qué orden?

<details><summary>Respuesta</summary>

Imprime dos líneas. El rango `main..HEAD` significa los commits que `HEAD` puede alcanzar y `main` no. Los 20 commits viejos se alcanzan desde `main`, así que se dejan fuera. El commit más nuevo se imprime primero, porque `git log` va del más nuevo al más viejo.

</details>

2. Un compañero escribe un spec nuevo `product-edit.spec.ts`, y luego ejecuta `git commit -am "Add edit spec"`. Los tests pasan en su computadora. En el pull request, solo ves un cambio en `COVERAGE.md`. Encuentra el bug.

<details><summary>Respuesta</summary>

La opción `-a` agrega solo los archivos que Git ya sigue. El spec nuevo no está seguido, así que quedó fuera del commit. Los tests pasan en local porque el archivo existe en el disco. `COVERAGE.md` ahora dice que la edición está cubierta, pero el pull request no tiene ningún test para eso. Agrega el archivo por su nombre con `git add`, y lee `git status` antes de cada commit.

</details>

3. La versión uno es un pull request con tres commits relacionados. La versión dos son tres pull requests separados. ¿Cuál es mejor para el trabajo de esta lección, y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

Un pull request es mejor aquí, porque los tres commits comparten un objetivo y un revisor puede leerlos de una sola vez. Tres pull requests costarían tres ejecuciones de CI y tres rondas de espera. Si los commits fueran de temas sin relación, o si uno de ellos es riesgoso y hay que revertirlo solo, serían mejores tres pull requests. Deciden el tamaño del diff y la independencia de los temas.

</details>

4. ¿Qué se rompe si falta la línea `.auth/` en el archivo de ignorados, y un compañero hace commit de `e2e/.auth/admin.json`?

<details><summary>Respuesta</summary>

El archivo contiene una cookie de sesión, y cambia en cada ejecución. Entonces cada pull request contiene un cambio ruidoso, y dos personas que lo editan crearán conflictos. En la tienda, las sesiones viven en memoria, así que la cookie queda muerta después de reiniciar. En un proyecto real, una sesión guardada puede dar acceso a una cuenta real, y cualquiera con el repositorio puede usarla. Los archivos que contienen secretos deben ignorarse antes del primer commit.

</details>

5. Explica a un compañero, en tres frases y sin la palabra "copia", qué es un branch.

<details><summary>Respuesta</summary>

Una buena respuesta dice que un branch es un nombre que apunta a un commit. Cuando haces un commit nuevo en el branch, el nombre avanza hasta él. Crear un branch no duplica archivos, así que es rápido y barato. Cualquier respuesta que muestre "un puntero, no una carpeta de archivos" es correcta.

</details>

6. Ana y Ben agregan cada uno una fila nueva en el mismo lugar, al final de la tabla de `COVERAGE.md`. Se integra primero el pull request de Ana. ¿Qué ve Ben, y qué hace?

<details><summary>Respuesta</summary>

Ben ve un conflicto. Git no puede decidir cómo ordenar dos líneas nuevas agregadas en el mismo lugar. El archivo recibe marcas (`<<<<<<<`, `=======`, `>>>>>>>`) alrededor de las dos versiones. Ben conserva las dos filas, quita las marcas, ejecuta los tests otra vez, hace commit y push. Un conflicto es una pregunta de Git que solo una persona puede responder.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un commit y un branch de Git?**
   - Busca: `git commit vs branch explained`
   - Pruébalo: en una carpeta de práctica fuera del curso, ejecuta `git init` y haz dos commits. Ejecuta `git branch second`, luego haz un tercer commit en el primer branch. Ejecuta `git log --oneline --graph --all --decorate` y anota qué nombres apuntan a qué commits.
   - Una buena respuesta explica: que un commit es una foto y un branch es un nombre móvil que apunta a un commit

2. **¿Cómo se escribe un buen mensaje de commit de Git?**
   - Busca: `git commit message best practices`
   - Pruébalo: en la misma carpeta de práctica, escribe un commit con un mal mensaje como "fix". Reescríbelo con `git commit --amend`. Compara los dos con `git log --oneline`. Di cuál te gustaría leer dentro de seis meses.
   - Una buena respuesta explica: la línea corta de resumen, el presente y por qué el mensaje debe decir qué y por qué

3. **¿Qué debe buscar un revisor en un pull request que agrega tests automáticos?**
   - Busca: `code review checklist test automation pull request`
   - Pruébalo: actúa como revisor de `e2e/orders/orders.spec.ts`. Escribe tres comentarios. Al menos uno debe ser una pregunta, y al menos uno debe ser sobre un riesgo, no sobre estilo.
   - Una buena respuesta explica: al menos tres cosas, como tests independientes, nombres claros y selectores estables

## Siguiente paso

En la siguiente lección ves qué pasa con tu pull request en CI.
