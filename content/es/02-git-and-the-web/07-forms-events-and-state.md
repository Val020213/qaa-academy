---
title: Formularios, eventos y estado
summary: Entiende los inputs, los eventos y el estado, y mira qué conserva o pierde una recarga en la memoria, en localStorage y en las cookies.
duration: 45 min
---

## Objetivo

- Explicar los inputs, el `value` y el envío de un formulario (*submit*).
- Nombrar los cuatro eventos que más encontrarás: click, input, change y submit.
- Explicar qué es el estado y dónde puede guardarlo una página.
- Predecir qué conserva una recarga y qué pierde.
- Explicar por qué esto importa para los tests independientes.

## Formularios e inputs

Un **formulario** es un grupo de campos y un botón que los envía. Un **input** es un campo donde el usuario escribe o elige algo.

El texto dentro de un input es su **valor** (*value*). El valor es una propiedad del elemento. Una **propiedad** es un dato que guarda un elemento, y el código puede leerla o cambiarla.

El formulario de login de la Practice app (app de práctica) tiene dos inputs y un botón de envío. Puedes leer un valor en la Console (consola):

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

El `value` cambia mientras el usuario escribe. El atributo HTML no cambia. El atributo solo guarda el valor inicial. Un test lee el valor vivo, no el atributo.

## Eventos

Un **evento** es algo que ocurre en la página, como un clic. El código puede escuchar un evento y reaccionar. El código que reacciona se llama **manejador de eventos** (*event handler*).

Cuatro eventos importan más a los testers:

| Evento | Cuándo ocurre |
| --- | --- |
| `click` | El usuario hace clic en un elemento |
| `input` | El usuario cambia el texto de un campo, en cada tecla |
| `change` | El usuario termina un cambio, como elegir una opción en un `select` o marcar una casilla |
| `submit` | El usuario envía un formulario, al hacer clic en el botón de envío o al pulsar `Enter` |

En la Practice app, el formulario de login reacciona a `submit`, el filtro de casos a `change` y el botón Delete a `click`. Cuando Playwright hace clic o rellena, ocurren los eventos reales, y la página reacciona como lo hace con una persona.

## Estado

El **estado** es lo que la página recuerda en este momento. Algunos ejemplos son la lista de casos, el texto de un campo y si el usuario ha iniciado sesión.

El estado tiene que vivir en algún lugar. El lugar decide cuánto dura.

## Dónde vive el estado

| Lugar | Vive hasta que | Ejemplo |
| --- | --- | --- |
| Memoria | Recargas o cierras la página | La lista de casos de la Practice app |
| URL | Cambias la dirección | La dirección `#/practice`, o `?next=%2Fproducts` en la tienda |
| `localStorage` | Lo borras. Se queda después de recargar y después de cerrar el navegador | Las lecciones que marcaste como completadas |
| Cookie | Caduca o la borras. El navegador la envía con cada petición al servidor | El inicio de sesión de la tienda |

**Memoria** significa las variables dentro del código de la página en ejecución. Desaparecen al recargar.

**`localStorage`** es un almacén pequeño en tu navegador. Guarda texto bajo un nombre. Solo este navegador lo tiene. Otro navegador u otra computadora no lo ve.

Una **cookie** es un dato pequeño que el servidor le pide al navegador que guarde. El navegador la devuelve con cada petición. La tienda usa una cookie llamada `shop_session` para saber quién eres.

> **Nota:** La cookie de la tienda está marcada como `HttpOnly`. El código de la página no puede leerla, pero tú puedes verla en las DevTools, en el panel **Application**.

## Qué conserva y qué pierde una recarga

Recarga la página. Luego pregunta: ¿dónde estaba este dato?

- La lista de casos de la Practice app está en memoria. Una recarga la pierde.
- El login de la Practice app también está solo en memoria. Una recarga muestra el formulario de login otra vez.
- Las marcas de completada están en `localStorage`. Se quedan.
- El inicio de sesión de la tienda está en una cookie. Una recarga te mantiene con la sesión iniciada.

## Por qué importa para los tests

Un test no debe depender de lo que dejó un test anterior. El estado es la razón.

- El estado en memoria empieza vacío en cada página nueva.
- `localStorage` y las cookies se quedan en el navegador. Si un test deja una cookie, el siguiente test puede empezar ya con la sesión iniciada. Puede pasar o fallar por la razón equivocada.
- Cada test crea sus propios datos y no depende del orden de los tests. Es una regla del equipo.

Playwright le da a cada test un contexto de navegador nuevo, sin cookies y con un `localStorage` vacío. Un contexto es como una ventana privada nueva del navegador. Cuando un test necesita un usuario con sesión iniciada, un paso de preparación inicia sesión a propósito y guarda la sesión en un archivo. La suite de la tienda hace esto en `apps/practice-shop/e2e/global.setup.ts`.

Cuando pruebas a mano, tu navegador guarda estado. Si un bug aparece solo para ti, borra las cookies y el `localStorage` e inténtalo de nuevo.

## Profundiza

### Por qué funciona así: los eventos necesitan un oyente

Un evento no hace nada por sí solo. Solo hace algo si hay código escuchando. El código se conecta después de que la página carga. En la tienda, el servidor primero envía HTML simple, y después el código de React "despierta" en el navegador. Esto se llama **hidratación** (*hydration*). Antes de que termine, la página parece lista, pero ningún código escucha el clic.

Por eso `auth.spec.ts` en la tienda tiene un comentario: un clic antes de que React esté listo envía el formulario a la antigua, y la página se recarga. Un test demasiado rápido hace la acción correcta en el momento equivocado.

### Una idea equivocada común: "asignar un valor es lo mismo que escribir"

En la Console puedes escribir `input.value = "a@b.test"`. El texto aparece en el campo. Pero el navegador no dispara el evento `input`, así que el código que lo escucha no se entera. Un usuario real que escribe dispara el evento en cada tecla. El `fill` de Playwright sí dispara los eventos correctos, y por eso lo usas, y no un script que asigna el valor.

### Cómo aparece en el trabajo real de QA: un bucle de reintento escrito una vez

Los tests de la tienda tienen un problema por la hidratación: el texto escrito demasiado pronto puede borrarse. El equipo lo resolvió con un bucle que escribe, comprueba el valor y vuelve a intentarlo:

```ts
import { expect } from "../lib/test"
import type { Page } from "../lib/test"

async function fillLoginForm(page: Page, email: string, password: string) {
  await expect(async () => {
    await page.getByTestId("login-email").fill(email)
    await page.getByTestId("login-password").fill(password)
    await expect(page.getByTestId("login-email")).toHaveValue(email)
    await expect(page.getByTestId("login-password")).toHaveValue(password)
  }).toPass()
}
```

Esta es la función de `apps/practice-shop/e2e/auth/auth.spec.ts`. Es un ejemplo de **DRY** (*Don't Repeat Yourself*, no te repitas): los cinco pasos se escriben una vez, y cada test llama a `fillLoginForm`. El mismo bucle también aparece en `global.setup.ts`. Dos copias son un costo pequeño. Quien revisa podría preguntar si ambos deberían usar un solo *helper* (función de ayuda) compartido. Es justo. Pero el test mismo debe seguir leyéndose como una historia clara: "rellena el formulario, haz clic, mira el error".

### Una comprobación que puedes escribir: un inicio limpio

Playwright le da a cada test un contexto nuevo. Puedes demostrarlo:

```ts
import { expect, test } from "./lib/test"

test("a new test starts with an empty localStorage", async ({ page }) => {
  await page.goto("/")

  const saved = await page.evaluate(() =>
    localStorage.getItem("qaa-academy:completed")
  )

  expect(saved).toBeNull()
})
```

La función dentro de `page.evaluate` se ejecuta en la página, no en el test. Lee la clave donde este curso guarda las lecciones completadas. `null` significa que no hay nada guardado.

## Práctica

1. Inicia el sitio del curso con `pnpm dev`. Abre `http://localhost:5180/#/practice` y pulsa `F12`.
2. Escribe `qa@example.com` en el campo Email, pero no lo envíes. En la Console ejecuta esto y lee el resultado:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Ejecuta esto y compara. Lee el atributo, no el valor. El resultado es `null`, porque el HTML no tiene atributo `value`:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. En la sección 2, añade los casos "One" y "Two". Pulsa `F5` para recargar. La lista está vacía. Los datos estaban en memoria.
5. Abre esta lección en el curso. Haz clic en **Marcar como completada**.
6. En las DevTools, abre el panel **Application**. Abre **Local storage** y luego `http://localhost:5180`. Busca la clave `qaa-academy:completed`. Lee su valor. Es una lista de rutas de lecciones.
7. Pulsa `F5`. El botón sigue diciendo **Completada**. Haz clic otra vez para deshacerlo.
8. Inicia la tienda con `pnpm shop:dev`. Abre `http://localhost:5190` e inicia sesión como `admin@qa-shop.test` con `Admin123!`.
9. En el panel **Application**, abre **Cookies** y luego `http://localhost:5190`. Busca `shop_session`. Pulsa `F5`. Sigues con la sesión iniciada.
10. Borra la cookie `shop_session` en las DevTools. Pulsa `F5`. ¿Qué pasa?
11. Detén la tienda con `Ctrl + C`.

## Comprueba lo que sabes

1. ¿Cuál es la diferencia entre un atributo y un valor?

<details><summary>Respuesta</summary>

El atributo es el texto inicial escrito en el HTML. El valor es el texto vivo del campo. Cambia mientras el usuario escribe.

</details>

2. ¿Qué evento ocurre cuando un usuario elige una opción en un `select`?

<details><summary>Respuesta</summary>

El evento `change`.

</details>

3. La lista de casos está vacía después de una recarga. ¿Dónde se guardaba?

<details><summary>Respuesta</summary>

En memoria. La memoria se pierde al recargar.

</details>

4. ¿Por qué una cookie puede hacer que los tests dependan unos de otros?

<details><summary>Respuesta</summary>

Una cookie se queda en el navegador. Si un test la deja, el siguiente test puede empezar ya con la sesión iniciada.

</details>

5. En tu navegador normal marcas una lección como completada. Luego ejecutas el test de Playwright de arriba. ¿Por qué sigue encontrando `null`?

<details>
<summary>Respuesta</summary>

Playwright no usa el perfil de tu navegador normal. Abre un contexto de navegador nuevo y vacío para cada test. Ese contexto no tiene cookies y tiene un `localStorage` vacío. Así que tus lecciones completadas no están ahí. Esto es lo que mantiene los tests independientes.

</details>

6. Un test de la tienda hace `page.goto("/login")`, rellena los dos campos y hace clic en `login-submit` de inmediato. A veces los campos están vacíos después del clic y la página se recargó. ¿Cuál es la causa más probable?

<details>
<summary>Respuesta</summary>

El test actuó antes de que la página estuviera hidratada. El HTML del servidor era visible, pero React aún no escuchaba. El texto escrito puede borrarse, y un clic puede enviar el formulario a la antigua, lo que recarga la página. La solución en el repositorio es escribir, comprobar el valor y reintentar hasta que se quede.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `localStorage` y `sessionStorage`?**
   - Busca: `localStorage vs sessionStorage MDN`
   - Una buena respuesta explica: cuánto dura cada uno y cómo se comportan con varias pestañas.
2. **¿Qué hacen las banderas de cookie `HttpOnly`, `Secure` y `SameSite`?**
   - Busca: `cookie HttpOnly Secure SameSite MDN`
   - Una buena respuesta explica: cada bandera en una frase y qué ataque ayuda a evitar cada una.
3. **¿Por qué Playwright inicia cada test con un contexto de navegador nuevo y para qué sirve `storageState`?**
   - Busca: `playwright browser context isolation storage state`
   - Una buena respuesta explica: qué contiene un contexto, por qué el aislamiento ayuda a tener tests confiables y cómo una sesión guardada evita iniciar sesión otra vez.

## Siguiente paso

En el próximo módulo empiezas con Playwright y escribes tus primeros tests con las ideas que aprendiste aquí.
