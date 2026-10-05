---
title: Tu primer pull request
summary: Lleva tus tests de tu computadora al equipo: branch, commits pequeños, comprobaciones, push, pull request y revisión.
duration: 35 min
---

## Objetivo

- Seguir el ciclo completo desde una branch nueva hasta un pull request con merge.
- Ejecutar todas las comprobaciones antes del push.
- Escribir una descripción de pull request que un revisor pueda usar.
- Responder a los comentarios de la revisión.

## El ciclo

Ya conoces lo básico de Git. En un equipo, tu código de tests llega a la rama principal solo mediante un *pull request* (solicitud para fusionar tu rama, que otros revisan primero).

Los pasos son:

1. Crear una *branch* (rama).
2. Hacer *commits* (confirmaciones de cambios) pequeños.
3. Ejecutar las comprobaciones.
4. Hacer *push* (subir) de la branch.
5. Abrir el pull request.
6. Responder a la revisión.

## 1. Crea una branch

Parte de un `main` actualizado. Dale a la branch un nombre que diga lo que hace.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Buenos nombres: `tests/cancel-pending-order`, `tests/edit-product`. Una branch debe tratar un solo tema.

## 2. Commits pequeños

Haz un commit por cada pieza terminada. Un commit que hace una sola cosa es fácil de revisar y de deshacer.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Escribe el mensaje en presente. Di qué añade el commit. Añade los archivos por nombre. No uses `git add .` a ciegas, porque puede añadir archivos que no querías.

Ejecuta `git status` antes de cada commit. Nunca debes ver `.auth/`, `playwright-report/` ni `test-results/` en la lista. Están ignorados.

## 3. Ejecuta las comprobaciones

Ejecuta estos tres comandos desde la raíz del repositorio. Todos deben pasar.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` revisa el código del sitio del curso.
- `pnpm --filter practice-shop typecheck` revisa la tienda y sus tests. Un tipo incorrecto en un spec falla aquí.
- `pnpm shop:e2e` ejecuta la suite de la tienda. Ejecútala al menos dos veces si cambiaste la preparación de datos.

Si tocaste el sitio del curso, ejecuta también `pnpm e2e`. El CI ejecuta ambas suites, así que tú también debes hacerlo.

## 4. Push

La primera vez, define el upstream. Esto enlaza tu branch local con la remota.

```bash
git push -u origin tests/close-coverage-gaps
```

La salida imprime un enlace para abrir un pull request. Ábrelo en tu navegador.

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
- Each test creates its own data. Order 1001 is used only by the cancel test.
```

Sé breve. Expón hechos. No escribas "por favor revisa", escribe qué revisar.

## 6. Responde a la revisión

Un revisor lee tu código y deja **comentarios**. Un comentario no es un ataque. Es una segunda opinión gratis.

- Lee cada comentario completo antes de responder.
- Si estás de acuerdo, cambia el código, haz commit y push. El pull request se actualiza solo.
- Si no estás de acuerdo, haz una pregunta o explica tu razón en una o dos frases.
- Responde "Done" cuando corrijas un comentario, para que el revisor lo encuentre.
- No discutas sobre estilo. El estilo del equipo está en `e2e/README.md`.

## La lista de verificación

Antes de abrir el pull request, revisa tú mismo cada punto. Es la lista del módulo 4 (la lección "Revisar un spec"), en forma corta.

- Los specs importan `test` y `expect` desde `lib/test`.
- Cada elemento interactivo se selecciona con `getByTestId`.
- Sin `page.waitForTimeout`. Las esperas son aserciones web-first.
- Cada test crea sus propios datos y no depende del orden.
- Ningún `test.only` olvidado en el código.
- El nombre del test dice lo que ve el usuario.
- `COVERAGE.md` está actualizado.
- El typecheck y las dos suites pasan.

> **Cuidado:** Un `test.only` olvidado hace fallar el build del CI, porque allí `forbidOnly` está activado. Busca `.only` antes del push.

## Práctica

1. Crea una branch llamada `tests/close-coverage-gaps`.
2. Haz commit del test de cancelar pedido junto con `COVERAGE.md` en un solo commit.
3. Haz commit de `product-edit.spec.ts` y su cambio en `COVERAGE.md` en un segundo commit.
4. Haz commit del spec del viewer y su cambio en `COVERAGE.md` en un tercer commit.
5. Ejecuta las tres comprobaciones. Haz push. Abre el pull request con la plantilla.
6. Pide a un compañero o a tu mentor que lo revise.

## Comprueba lo que sabes

1. ¿Por qué hacer commits pequeños?

<details><summary>Respuesta</summary>

Son fáciles de revisar y de deshacer. Cada uno hace una sola cosa.

</details>

2. ¿Qué comandos ejecutas antes del push?

<details><summary>Respuesta</summary>

`pnpm typecheck`, `pnpm --filter practice-shop typecheck` y `pnpm shop:e2e`.

</details>

3. ¿Qué debe decir la descripción de un pull request?

<details><summary>Respuesta</summary>

Qué se cubre, cómo ejecutarlo y que `COVERAGE.md` está actualizado.

</details>

4. Un revisor pide un cambio con el que estás de acuerdo. ¿Qué haces?

<details><summary>Respuesta</summary>

Cambias el código, haces commit, haces push a la misma branch y respondes "Done".

</details>

## Siguiente paso

En la próxima lección verás qué le pasa a tu pull request en CI.
