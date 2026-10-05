---
title: Tu primer pull request
summary: Lleva tus tests de tu computadora al equipo: branch, commits pequeños, comprobaciones, push, pull request y revisión.
duration: 50 min
---

## Objetivo

- Seguir el ciclo completo, desde un *branch* (rama) nuevo hasta un *pull request* (solicitud de cambios) integrado.
- Ejecutar todas las comprobaciones antes de hacer *push* (subir tus cambios).
- Escribir una descripción de pull request que un revisor pueda usar.
- Responder a los comentarios de la revisión.

## El ciclo

Ya conoces lo básico de Git. En un equipo, tu código de tests llega a la rama principal solo mediante un **pull request**: una solicitud para hacer *merge* (integrar) de tu branch, que otras personas revisan primero.

Los pasos son:

1. Crea un branch.
2. Haz *commits* (guardados de cambios) pequeños.
3. Ejecuta las comprobaciones.
4. Haz push del branch.
5. Abre el pull request.
6. Responde a la revisión.

## 1. Crea un branch

Empieza desde un `main` actualizado. Dale al branch un nombre que diga qué hace.

```bash
git switch main
git pull
git switch -c tests/close-coverage-gaps
```

Buenos nombres: `tests/cancel-pending-order`, `tests/edit-product`. Un branch debe contener un solo tema.

## 2. Commits pequeños

Haz un commit por cada pieza terminada. Un commit que hace una sola cosa es fácil de revisar y de deshacer.

```bash
git add apps/practice-shop/e2e/orders/orders.spec.ts apps/practice-shop/e2e/COVERAGE.md
git commit -m "Test that an admin cancels a pending order"
```

Escribe el mensaje en presente. Di qué añade el commit. Añade los archivos por su nombre. No uses `git add .` a ciegas, porque puede añadir archivos que no querías.

Ejecuta `git status` antes de cada commit. Nunca debes ver `.auth/`, `playwright-report/` ni `test-results/` en la lista. Git los ignora.

## 3. Ejecuta las comprobaciones

Ejecuta estos tres comandos desde la raíz del repositorio. Todos deben pasar.

```bash
pnpm typecheck
pnpm --filter practice-shop typecheck
pnpm shop:e2e
```

- `pnpm typecheck` comprueba el código del sitio del curso.
- `pnpm --filter practice-shop typecheck` comprueba la tienda y sus tests. Un tipo incorrecto en un spec falla aquí.
- `pnpm shop:e2e` ejecuta la suite de la tienda. Ejecútala al menos dos veces si cambiaste la preparación de datos.

Si tocaste el sitio del curso, ejecuta también `pnpm e2e`. El CI ejecuta ambas suites, así que tú también deberías.

## 4. Push

La primera vez, define el upstream. Esto enlaza tu branch local con el remoto.

```bash
git push -u origin tests/close-coverage-gaps
```

Aquí `origin` es tu *fork* en GitHub, la copia que hiciste en el módulo 0. La salida imprime un enlace para abrir un pull request. Ábrelo en tu navegador.

> **Cuidado:** GitHub puede ofrecer enviar el pull request al repositorio original del curso. Cambia el **base repository** (repositorio base) a tu propio fork, para que el pull request quede en tu copia. Luego comparte su enlace con la persona que revisa tu trabajo.

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

Hazla corta. Expón hechos. No escribas "por favor revisa", escribe qué revisar.

## 6. Responde a la revisión

Un revisor lee tu código y deja **comentarios**. Un comentario no es un ataque. Es una segunda opinión gratuita.

- Lee cada comentario completo antes de responder.
- Si estás de acuerdo, cambia el código, haz commit y push. El pull request se actualiza solo.
- Si no estás de acuerdo, haz una pregunta o explica tu razón en una o dos frases.
- Responde "Done" (hecho) cuando arregles un comentario, para que el revisor lo encuentre.
- No discutas sobre estilo. El estilo del equipo está en `e2e/README.md`.

## La lista de verificación

Antes de abrir el pull request, revisa tú mismo cada punto. Es la lista del módulo 4 (la lección "Revisar un spec"), en forma corta.

- Los specs importan `test` y `expect` desde `lib/test`.
- Cada elemento interactivo se selecciona con `getByTestId`.
- Ningún `page.waitForTimeout`. Las esperas son aserciones web-first.
- Cada test crea sus propios datos y no depende del orden.
- Ningún `test.only` olvidado en el código.
- El nombre del test dice qué ve el usuario.
- `COVERAGE.md` está actualizado.
- El typecheck y ambas suites pasan.

> **Cuidado:** Un `test.only` olvidado hace fallar el build del CI, porque allí `forbidOnly` está activado. Busca `.only` antes de hacer push.

## Profundiza

### Por qué ayudan los commits pequeños: qué es realmente un commit

Un **commit** es una instantánea guardada de tus archivos, con un mensaje y un id. Git guarda todo el historial de instantáneas. Como cada commit es independiente, Git puede deshacer uno sin tocar los demás. Con un solo commit grande, no puedes deshacer solo la parte mala.

Un **branch** es solo un nombre que apunta a un commit. Crear un branch es barato. Por eso se aconseja crear un branch nuevo para cada tema.

### Una idea equivocada: "git add . es más rápido, así que está bien"

Es más rápido, pero añade todo, incluso archivos que no querías compartir. Antes de cada commit, mira qué está preparado:

```bash
git status
git diff --staged
```

`git diff --staged` muestra las líneas exactas que entran en el commit. Si ves un archivo que no corresponde, quítalo del área de preparación:

```bash
git restore --staged path/to/file
```

Esta comprobación toma diez segundos. Los revisores notan un diff limpio y confían más en ti.

### Cómo aparece en el trabajo real de automatización QA

Un pull request también es una **conversación sobre riesgos**. Un revisor pregunta: "¿Por qué elegiste el pedido 1001?" o "¿Qué pasa si esto se ejecuta dos veces?" Tus respuestas ya deberían estar en la descripción. La lista de verificación al final de esta lección es una forma de quitar repetición: los mismos comentarios de revisión no hay que escribirlos de nuevo en cada pull request. Esta es la idea llamada **DRY** (Don't Repeat Yourself, no te repitas), aplicada al trabajo de un equipo en vez de al código. El archivo `COVERAGE.md` funciona igual. Lo que está cubierto se escribe una sola vez, en un archivo, no en muchos mensajes de chat.

### El costo del tamaño

Un pull request muy grande es difícil de revisar. La gente lo lee por encima y se pierde bugs. Uno muy pequeño por cada línea crea demasiados pull requests, y cada uno tiene un costo: esperar, ejecutar el CI, cambiar de tarea. Un buen tamaño es un tema que una persona pueda leer en 15 a 20 minutos. Los tres commits de esta lección son un solo pull request porque comparten un objetivo: cerrar huecos de cobertura. Si fueran temas sin relación, tres pull requests serían mejores.

## Práctica

1. Crea un branch llamado `tests/close-coverage-gaps`.
2. Haz commit del test de cancelar pedido con `COVERAGE.md` en un solo commit.
3. Haz commit de `product-edit.spec.ts` y su cambio en `COVERAGE.md` en un segundo commit.
4. Haz commit del spec del viewer y su cambio en `COVERAGE.md` en un tercer commit.
5. Ejecuta las tres comprobaciones. Haz push. Abre el pull request con la plantilla.
6. Pide a un compañero o a tu mentor que lo revise.

## Comprueba lo que sabes

1. ¿Por qué hacer commits pequeños?

<details><summary>Respuesta</summary>

Son fáciles de revisar y fáciles de deshacer. Cada uno hace una sola cosa.

</details>

2. ¿Qué comandos ejecutas antes de hacer push?

<details><summary>Respuesta</summary>

`pnpm typecheck`, `pnpm --filter practice-shop typecheck` y `pnpm shop:e2e`.

</details>

3. ¿Qué debe decir la descripción de un pull request?

<details><summary>Respuesta</summary>

Qué está cubierto, cómo ejecutarlo, y que `COVERAGE.md` está actualizado.

</details>

4. Un revisor pide un cambio con el que estás de acuerdo. ¿Qué haces?

<details><summary>Respuesta</summary>

Cambias el código, haces commit, haces push al mismo branch y respondes "Done".

</details>

5. Haces commit con el mensaje "fixed stuff" y `git status` antes del commit mostraba `e2e/.auth/admin.json`. Enumera dos problemas.

<details><summary>Respuesta</summary>

Primero, el mensaje no dice qué cambió, así que nadie puede entender el historial. Segundo, Git debería ignorar `.auth`. Si aparece en `git status`, la regla de ignorar no funciona o el archivo se añadió a la fuerza. El archivo contiene una sesión privada y no se debe hacer commit de él.

</details>

6. Tu pull request tiene tres commits. Después del merge, descubres que el spec del viewer rompe el build. ¿Qué ventaja tiene haber hecho tres commits?

<details><summary>Respuesta</summary>

Puedes deshacer solo el commit que contiene el spec del viewer, con `git revert`. El test de cancelar y el spec de edición se quedan en su lugar. Con un solo commit grande, tendrías que deshacer todo el trabajo o editarlo a mano.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre un commit de Git y un branch de Git?**
   - Busca: `git commit vs branch explained`
   - Una buena respuesta explica: que un commit es una instantánea y un branch es un nombre movible que apunta a un commit

2. **¿Cómo se escribe un buen mensaje de commit de Git?**
   - Busca: `git commit message best practices`
   - Una buena respuesta explica: la línea corta de resumen, el presente, y por qué el mensaje debe decir qué y por qué

3. **¿Qué debe buscar un revisor en un pull request que añade tests automatizados?**
   - Busca: `code review checklist test automation pull request`
   - Una buena respuesta explica: al menos tres cosas, como tests independientes, nombres claros y selectores estables

## Siguiente paso

En la próxima lección verás qué pasa con tu pull request en el CI.
