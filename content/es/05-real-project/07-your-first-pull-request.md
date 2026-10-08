---
title: Tu primer pull request
duration: 75 min
---

## Objetivo

Vas a reunir los tests de las lecciones anteriores en un pull request y preparar el trabajo para que un compañero lo revise.

- Separar los cambios en commits que se puedan revisar por tema.
- Ejecutar las comprobaciones locales y reconocer cuál falta en CI.
- Escribir una descripción con la cobertura, los comandos y los datos que usan los tests.
- Responder a la revisión y detectar problemas que un merge sin conflictos puede dejar pasar.

## 1. Crea un branch

Empieza desde un `main` actualizado. Dale al branch un nombre que diga lo que hace.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Buenos nombres: `tests/cancel-pending-order`, `tests/edit-product`. En esta lección, los tests de cancelación, edición de productos y viewer comparten un objetivo: cerrar huecos de cobertura.

## 2. Commits pequeños

Haz un commit por cada pieza terminada, junto con su cambio en `COVERAGE.md`.

Los commits pequeños facilitan revertir una pieza con otro commit. Si cambios posteriores dependen de ella, la reversión puede causar conflictos. También puedes corregir parte de un commit grande con una nueva edición.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Escribe el mensaje en presente y di qué agrega el commit. Agrega los archivos por su nombre para incluir solo los que pertenecen a esa pieza.

Este comando muestra qué prepararía Git desde la carpeta actual, sin preparar nada:

```bash
git add --dry-run .
```

Antes de cada commit, revisa los archivos preparados y sus cambios:

```bash
git status
git diff --staged
```

`git diff --staged` muestra las líneas que entran al commit. Si ves un archivo que no corresponde, quítalo del área de preparación:

```bash
git restore --staged path/to/file
```

Nunca debes ver `.auth/`, `playwright-report/` ni `test-results/` en la lista. Están ignorados.

> **Cuidado:** `git commit -am "message"` prepara solo cambios en archivos que Git ya sigue. Un spec nuevo queda fuera del commit hasta que lo agregues con `git add`.

![Un spec nuevo necesita git add explícito para entrar al commit.](/images/05-commit-inclusion.es.svg)

## 3. Ejecuta las comprobaciones

Ejecuta estos tres comandos desde la raíz del repositorio. Todos deben pasar.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` revisa los tipos del sitio del curso, sus tests y los ejercicios.
- `pnpm --filter practice-shop typecheck` revisa los tipos de la tienda y sus tests. Un tipo incorrecto en un spec falla aquí.
- `pnpm shop:e2e` ejecuta la suite de la tienda. Ejecútala al menos dos veces si cambiaste la preparación de datos.

El workflow `.github/workflows/e2e.yml` ejecuta el primero y el tercero, pero no `pnpm --filter practice-shop typecheck`. CI no ejecuta esa revisión de tipos; un test aún puede fallar si el defecto afecta su ejecución. Debes ejecutar esa comprobación en local.

Si tocaste el sitio del curso, ejecuta también `pnpm e2e`. CI ejecuta las dos suites.

## 4. Push

La primera vez, define el upstream para vincular tu branch local con el remoto.

```bash
git push -u origin tests/close-coverage-gaps
```

Aquí `origin` es tu fork en GitHub, la copia que hiciste en el módulo 0. La salida imprime un enlace para abrir un pull request. Ábrelo en tu navegador.

> **Cuidado:** GitHub puede ofrecerse a enviar el pull request al repositorio original del curso. Cambia el **base repository** (repositorio base) a tu propio fork, para que el pull request se quede en tu copia. Luego comparte su enlace con la persona que revisa tu trabajo.

## 5. Escribe la descripción

Describe qué cubren los tests, cómo ejecutarlos y qué datos usan. Usa esta plantilla:

```text
## What is covered
- An admin cancels a pending order (order 1001).
- Editing a product: four scenarios.
- Viewer: no New, Edit or Delete controls; product creation returns 403.

## How to run
pnpm --filter practice-shop e2e e2e/orders/orders.spec.ts
pnpm --filter practice-shop e2e e2e/products/product-edit.spec.ts
pnpm --filter practice-shop e2e e2e/products/viewer.spec.ts

## Notes
- COVERAGE.md is updated: three gaps removed.
- Product tests create their own data. The cancel test uses the seeded order 1001, and only that test uses it.
```

Comprueba que la descripción coincide con los cambios del pull request. La nota sobre el pedido 1001 permite al revisor buscar si otro test usa el mismo registro.

### Un merge sin conflictos puede reunir tests incompatibles

El test de Ana cancela el pedido pendiente 1001. El de Ben marca ese mismo pedido como pagado. Cada test pasa por separado sobre una semilla nueva.

Git combina los cambios en archivos distintos sin conflicto, pero ambos tests modifican el mismo pedido. En ambos órdenes, la guarda del segundo test encuentra un pedido que ya no está pendiente y falla antes del clic. Si cancelar corre primero y el test de pagar omite su guarda, Playwright espera el botón ausente hasta agotar el timeout. En el orden contrario, Cancel sigue disponible después de pagar. Los dos tests no pueden compartir el pedido 1001.

![En ambos órdenes de ejecución, el segundo test encuentra que el pedido compartido ya no está pendiente.](/images/05-shared-order.es.svg)

- Antes del merge, actualiza tu branch con el `main` más reciente y ejecuta la suite otra vez.
- Escribe en la descripción qué datos de la semilla usa tu test para que los revisores puedan buscar el mismo id.
- Esta API no permite crear pedidos. Reserva un id distinto de la semilla para cada test que lo modifique y registra esa reserva en el comentario del spec.

## 6. Responde a la revisión

Lee cada comentario completo antes de responder.

- Si estás de acuerdo, cambia el código, haz commit y push. GitHub actualiza el mismo pull request con los nuevos commits del branch.
- Si no estás de acuerdo, haz una pregunta o explica tu razón.
- Responde "Done" cuando arregles un comentario.
- Consulta las convenciones del equipo en `e2e/README.md` para resolver comentarios de estilo.

## La lista de verificación

Antes de abrir el pull request, aplica la lista de la lección "Revisar un spec" a tus cambios:

- Los specs importan `test` y `expect` desde `lib/test`.
- Cada elemento interactivo se selecciona con `getByTestId`.
- Ningún `page.waitForTimeout`. Las esperas son aserciones *web-first*.
- Los tests de productos crean sus propios datos. Los tests de pedidos usan su propio pedido de la semilla. Ningún test depende del orden de los archivos.
- Ningún `test.only` olvidado en el código.
- El nombre del test dice lo que ve el usuario.
- `COVERAGE.md` está actualizado.
- La comprobación de tipos y las dos suites pasan.

> **Cuidado:** Un `test.only` olvidado hace fallar el build de CI, porque allí `forbidOnly` está activado. Busca `.only` antes de hacer push.

## Profundiza

### El rango de commits

`git log --oneline main..HEAD` muestra los commits que `HEAD` puede alcanzar y `main` no. Con `main` como base, esa es la lista de commits de tu pull request.

### El tamaño del pull request

Un pull request grande cuesta más revisar y facilita que se pasen por alto bugs. Separar cada línea en un pull request también tiene un costo: ejecutar CI, esperar la revisión y cambiar de tarea.

Los tres commits de esta lección van juntos porque cierran huecos de cobertura. Si fueran temas sin relación, convendría separarlos en distintos pull requests.

## Práctica

1. Crea un branch llamado `tests/close-coverage-gaps`.
2. Haz commit del test de cancelar pedido junto con `COVERAGE.md` en un solo commit.
3. Haz commit de `product-edit.spec.ts` y su cambio en `COVERAGE.md` en un segundo commit.
4. Haz commit del spec del viewer y su cambio en `COVERAGE.md` en un tercer commit.
5. Ejecuta las tres comprobaciones. Haz push. Abre el pull request con la plantilla.
6. Pide a un compañero o a tu mentor que lo revise.

## Reto

Separa dos cambios mezclados en commits distintos. Crea el branch `tests/challenge-split-commits` desde `main` y no lo subas.

En `apps/practice-shop/e2e/COVERAGE.md`, haz dos ediciones cercanas sin hacer commit entre ellas: reformula la frase "These gaps are left on purpose." y borra una línea de la lista de huecos.

Crea `exercises/challenges/pr-description.md` con una descripción de estos cambios usando la plantilla. Incluye un riesgo sobre el que un revisor podría preguntar.

Está terminado cuando:

- `git log --oneline main..HEAD` muestra exactamente tres commits, con mensajes que empiezan con un verbo y dicen qué cambia cada uno.
- `git show --stat HEAD~2` y `git show --stat HEAD~1` listan solo `COVERAGE.md`. Revisa también los parches con `git show HEAD~2` y `git show HEAD~1`: el primero sustituye una línea y el segundo elimina una línea.
- El tercer commit agrega solo `exercises/challenges/pr-description.md`.
- `git status` muestra un árbol de trabajo limpio, y el branch nunca se subió.

Busca cómo preparar parte de un archivo y separar dos ediciones cercanas: `git add patch mode`, `git add -p split hunk` y `git show --stat`.

## Piénsalo bien

1. Estás en `main` con 20 commits. Ejecutas `git switch -c tests/a`, haces dos commits y luego ejecutas `git log --oneline main..HEAD`. ¿Cuántas líneas imprime, y en qué orden?

<details><summary>Respuesta</summary>

Imprime dos líneas, con el commit más nuevo primero. Los 20 commits anteriores se alcanzan desde `main`, así que quedan fuera del rango `main..HEAD`.

</details>

2. Un compañero escribe un spec nuevo `product-edit.spec.ts` y ejecuta `git commit -am "Add edit spec"`. Los tests pasan en su computadora. En el pull request, solo ves un cambio en `COVERAGE.md`. Encuentra el bug.

<details><summary>Respuesta</summary>

La opción `-a` prepara cambios solo en archivos que Git ya sigue. El spec nuevo quedó fuera del commit, aunque Playwright lo ejecuta en local porque existe en el disco. Agrega el archivo con `git add` y revisa `git status` antes del commit.

</details>

3. Ana y Ben agregan cada uno una fila nueva en el mismo lugar, al final de la tabla de `COVERAGE.md`. Se integra primero el pull request de Ana. ¿Qué ve Ben, y qué hace?

<details><summary>Respuesta</summary>

Cuando Ben trae los cambios remotos e intenta integrar el `main` actualizado en su branch con `git merge main`, Git puede mostrar un conflicto entre las dos filas agregadas en el mismo lugar. El archivo recibe marcas (`<<<<<<<`, `=======`, `>>>>>>>`) alrededor de las dos versiones. Ben conserva las dos filas, quita las marcas, ejecuta los tests otra vez, hace commit y push.

</details>

## Siguiente paso

En la siguiente lección ves qué pasa con tu pull request en CI.
