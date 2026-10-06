---
title: Formularios, eventos y estado
summary: Entiende inputs, eventos y estado, y predice qué conserva o pierde una recarga en la memoria, en localStorage y en las cookies.
duration: 80 min
---

## Empieza con un acertijo

Un formulario tiene un campo para el nombre de tu perro. El HTML dice `<input id="dog" value="Rex">`. Borras "Rex" y escribes "Luna". Luego ejecutas dos líneas de código:

```text
dog.value
dog.getAttribute("value")
```

¿Qué da cada línea? Quizás las dos dicen "Luna". Quizás las dos dicen "Rex". O quizás son distintas. Y un segundo acertijo: tu código asigna `dog.value = "Max"` desde un script. ¿Algún código que escucha lo que se escribe se entera?

Puedes adivinar sin saber las respuestas. Piensa en lo que el navegador debe recordar: el texto con el que empezaste y el texto que hay ahora en el campo.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué dan `value` y el atributo HTML después de que el usuario escribe.
- Elegir el evento que corresponde a una acción: click, input, change o submit.
- Explicar qué es el estado y decidir dónde debe guardar una página cada parte de él.
- Predecir qué conserva una recarga y qué pierde.
- Explicar por qué esto importa para los tests independientes.

## Formularios e inputs

Un **formulario** es un grupo de campos y un botón que los envía. Un **input** es un campo donde el usuario escribe o elige algo. Un formulario puede ser el registro de un perro, la búsqueda de una receta o un login.

El texto dentro de un input es su **valor** (*value*). El valor es una propiedad del elemento. Una **propiedad** es un dato que guarda un elemento, y el código puede leerlo o cambiarlo.

El formulario de login de la app Practice tiene dos inputs y un botón de envío. Puedes leer un valor en la Console:

```text
> document.querySelector('[data-testid="login-email"]').value
'qa@example.com'
```

Ahora prueba tú mismo el acertijo. Abre la Console en cualquier página y ejecuta estas líneas. Adivina primero el último resultado.

```text
> const dog = document.createElement("input")
> dog.setAttribute("value", "Rex")
> dog.value = "Luna"
> [dog.value, dog.getAttribute("value")]
(2) ['Luna', 'Rex']
```

El `value` es el texto vivo. El atributo es solo el texto inicial escrito en el HTML. Cuando el usuario (o el código) cambia el valor, el atributo se queda igual.

## Eventos

Un **evento** es algo que pasa en la página, como un clic. El código puede escuchar un evento y reaccionar. El código que reacciona se llama **manejador de eventos** (*event handler*).

Cuatro eventos importan más para los testers:

| Evento | Cuándo ocurre |
| --- | --- |
| `click` | El usuario hace clic en un elemento |
| `input` | El usuario cambia el texto de un campo, en cada tecla |
| `change` | El usuario termina un cambio, como elegir una opción en un `select` o marcar una casilla |
| `submit` | El usuario envía un formulario, haciendo clic en el botón de envío o pulsando `Enter` |

En la app Practice, el formulario de login reacciona a `submit`, el filtro de casos a `change` y el botón Delete a `click`. Cuando Playwright hace clic o llena un campo, ocurren los eventos reales y la página reacciona como lo hace con una persona.

Ahora el caso que rompe la regla "la página siempre conoce el valor". Adivina cuánto vale `n` al final:

```text
> let n = 0
> const box = document.createElement("input")
> box.addEventListener("input", () => n++)
> box.value = "hello"
> n
0
```

El texto está en el campo, pero nadie disparó el evento `input`. El código que espera el evento nunca se ejecutó. Una persona real que escribe dispara el evento en cada tecla. Esta es la segunda parte del acertijo.

## Estado

El **estado** es lo que la página recuerda en este momento. Ejemplos: la lista de casos, el texto de un campo y si el usuario inició sesión. En un videojuego, el estado es tu puntaje, tus vidas y tu lugar en el mapa.

El estado tiene que vivir en algún lugar. El lugar decide cuánto dura. En el juego, el puntaje de la pantalla desaparece cuando apagas la consola. La partida guardada está en el disco. El talón de la entrada en tu bolsillo prueba quién eres cuando vuelves al parque.

## Dónde vive el estado

| Lugar | Vive hasta que | Ejemplo |
| --- | --- | --- |
| Memoria | Recargas o cierras la página | La lista de casos de la app Practice |
| URL | Cambias la dirección | La dirección `#/practice`, o `?next=%2Fproducts` en la tienda |
| `localStorage` | Lo borras. Sigue ahí después de recargar y de cerrar el navegador | Las lecciones que marcaste como completadas |
| Cookie | Expira o la borras. El navegador la envía al servidor con cada petición | El inicio de sesión de la tienda |

**Memoria** significa las variables dentro del código de la página que se está ejecutando. Son el puntaje de la pantalla. Desaparecen al recargar.

**`localStorage`** es un pequeño almacén en tu navegador. Guarda texto bajo un nombre. Es la partida guardada. Solo este navegador lo tiene. Otro navegador u otro computador no lo ve.

Una **cookie** es un dato pequeño que el servidor le pide al navegador que guarde. El navegador la devuelve con cada petición. Es el talón de la entrada. La tienda usa una cookie llamada `shop_session` para saber quién eres.

> **Nota:** La cookie de la tienda está marcada como `HttpOnly`. El código de la página no puede leerla, pero tú puedes verla en las DevTools, en el panel **Application** (Aplicación).

## Qué conserva y qué pierde una recarga

Antes de leer la lista, haz tu predicción. Haces estas cosas y luego pulsas `F5`:

- En la app Practice, agregas los casos "One" y "Two", y marcas "One".
- En la app Practice, inicias sesión con la cuenta válida.
- En el sitio del curso, marcas una lección como completada.
- En la tienda, inicias sesión como admin.

¿Qué se queda? Para cada una, pregunta: ¿dónde estaban estos datos? Luego comprueba:

- La lista de casos de la app Practice está en la memoria. Una recarga la pierde, y la marca con ella.
- El login de la app Practice también está solo en la memoria. Una recarga vuelve a mostrar el formulario de login.
- Las marcas de completadas están en `localStorage`. Se quedan.
- El inicio de sesión de la tienda está en una cookie. Una recarga te mantiene con la sesión iniciada.

## Por qué esto importa para los tests

Un test no debe depender de lo que dejó un test anterior. El estado es la razón.

- El estado en memoria empieza vacío en cada página nueva.
- `localStorage` y las cookies se quedan en el navegador. Si un test deja una cookie, el siguiente test puede empezar ya con la sesión iniciada. Puede pasar o fallar por la razón equivocada.
- Cada test crea sus propios datos y no depende del orden de los tests. Esta es una regla del equipo.

Playwright le da a cada test un contexto de navegador nuevo, sin cookies y con un `localStorage` vacío. Un contexto es como una ventana privada nueva del navegador. Cuando un test necesita un usuario con sesión iniciada, un paso de preparación inicia sesión a propósito y guarda la sesión en un archivo. La suite de la tienda hace esto en `apps/practice-shop/e2e/global.setup.ts`.

Cuando pruebas a mano, tu navegador guarda estado. Si un bug aparece solo para ti, borra las cookies y el `localStorage` e inténtalo otra vez.

### De vuelta al acertijo

`dog.value` da "Luna", y `dog.getAttribute("value")` da "Rex". El atributo es el texto inicial y el valor es el texto vivo. Asignar `value` desde un script no dispara ningún evento, así que los oyentes no saben nada de "Max".

Una sorpresa más. La app Practice está hecha con React, y React mantiene el atributo igual al valor en los inputs que controla. En la página Practice, después de escribir, las dos líneas muestran el texto escrito. El HTML simple no hace esto. La lección: no uses el atributo para leer lo que escribió el usuario. Usa el valor y deja que la herramienta decida.

## Profundiza

### Por qué funciona así: los eventos necesitan un oyente

Un evento no hace nada por sí solo. Solo hace algo si hay código escuchando. El código se conecta después de que la página carga. En la tienda, el servidor primero envía HTML simple, y luego el código de React "despierta" en el navegador. Esto se llama **hidratación** (*hydration*). Antes de que termine, la página parece lista, pero ningún código escucha el clic.

Por eso `auth.spec.ts` de la tienda tiene un comentario: un clic antes de que React esté listo envía el formulario a la manera antigua, y la página se recarga. Un test demasiado rápido hace la acción correcta en el momento equivocado.

### Una idea equivocada común: "asignar un valor es lo mismo que escribir"

En la Console puedes escribir `input.value = "a@b.test"`. El texto aparece en el campo. Pero el navegador no dispara el evento `input`, así que el código que lo escucha no se entera. Un usuario real que escribe dispara el evento en cada tecla. El `fill` de Playwright sí dispara los eventos correctos, y por eso lo usas, y no un script que asigna el valor.

### Cómo aparece en el trabajo real de QA: un bucle de reintento escrito una vez

Los tests de la tienda tienen un problema por la hidratación: el texto escrito demasiado pronto puede borrarse. El equipo lo resolvió con un bucle que escribe, comprueba el valor y lo intenta otra vez:

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

Esta es la función de `apps/practice-shop/e2e/auth/auth.spec.ts`. Es un ejemplo de **DRY**: los cinco pasos se escriben una vez, y cada test llama a `fillLoginForm`. El mismo bucle también aparece en `global.setup.ts`. Dos copias son un costo pequeño. Un revisor podría preguntar si las dos deberían usar un *helper* compartido. Es una pregunta justa. Pero el test mismo debe seguir leyéndose como una historia clara: "llenar el formulario, hacer clic, ver el error".

Esto también es **KISS** (*keep it simple*, mantenlo simple) en acción. El bucle hace un solo trabajo y tiene un nombre que lo dice. **YAGNI** (*you aren't gonna need it*, no construyas para necesidades que solo imaginas) dice: no construyas una gran biblioteca compartida de login antes de que un tercer lugar la necesite.

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

Podrías guardarlo como `e2e/clean-start.spec.ts` en el repositorio del curso. La función dentro de `page.evaluate` se ejecuta en la página, no en el test. Lee la clave donde este curso guarda las lecciones completadas. `null` significa que no hay nada guardado.

## Práctica

1. Inicia el sitio del curso con `pnpm dev`. Abre `http://localhost:5180/#/practice` y pulsa `F12`.
2. Escribe `qa@example.com` en el campo Email, pero no lo envíes. En la Console ejecuta esto y lee el resultado:

```text
document.querySelector('[data-testid="login-email"]').value
```

3. Ejecuta esto y compara. Lee el atributo, no el valor. La app Practice está hecha con React, que mantiene el atributo igual al valor, así que ves el mismo texto. El HTML simple no haría esto, como mostró el acertijo:

```text
document.querySelector('[data-testid="login-email"]').getAttribute("value")
```

4. En la sección 2, agrega los casos "One" y "Two". Pulsa `F5` para recargar. La lista está vacía. Los datos estaban en la memoria.
5. Abre esta lección en el curso. Haz clic en **Marcar como completada**.
6. En las DevTools, abre el panel **Application**. Abre **Local storage** y luego `http://localhost:5180`. Busca la clave `qaa-academy:completed`. Lee su valor. Es una lista de rutas de lecciones.
7. Pulsa `F5`. El botón sigue diciendo **Completada**. Haz clic otra vez para deshacer.
8. Inicia la tienda con `pnpm shop:dev`. Abre `http://localhost:5190` e inicia sesión como `admin@qa-shop.test` con `Admin123!`.
9. En el panel **Application**, abre **Cookies** y luego `http://localhost:5190`. Busca `shop_session`. Pulsa `F5`. Sigues con la sesión iniciada.
10. Borra la cookie `shop_session` en las DevTools. Pulsa `F5`. ¿Qué pasa?
11. Detén la tienda con `Ctrl + C`.

## Reto

Construye un programa pequeño que demuestre la diferencia entre la memoria y el estado guardado. Elige tú tu propio mundo: una lista de reproducción, una lista de compras, un refugio de mascotas, una tabla de fútbol. Cada vez que ejecutas el programa con un elemento nuevo, guarda una lista en memoria y también una lista guardada en un archivo. El programa imprime las dos cantidades. Una "recarga" es simplemente ejecutar el programa otra vez.

**Está terminado cuando:**

1. Ejecutas `node exercises/challenges/07-forms-events-and-state.ts "Blue Moon"` (o un elemento de tu mundo) e imprime `memory: 1 | file: 1`.
2. Lo ejecutas otra vez con otro elemento. Imprime `memory: 1 | file: 2`. La memoria olvidó y el archivo recordó.
3. Borras el archivo de datos y ejecutas el programa. Empieza de nuevo en `file: 1` y no se cae.
4. Escribes el texto `not json` en el archivo de datos y ejecutas el programa. Imprime una línea que dice que el archivo está dañado, empieza de nuevo y no se cae.
5. Lo ejecutas sin ningún elemento. Imprime cómo usarlo y no cambia el archivo.

Vas a necesitar algo que esta lección no enseñó: cómo leer las palabras de la línea de comandos y cómo leer y escribir un archivo en Node.js. Busca: `node process.argv` y `node fs readFileSync writeFileSync`. Para el archivo dañado, busca: `JSON.parse try catch`.

Crea la carpeta `exercises/challenges` si no existe, y luego crea tú mismo el archivo `exercises/challenges/07-forms-events-and-state.ts`. No uses `enum` ni propiedades de parámetro, porque Node ejecuta el archivo directamente.

## Piénsalo bien

1. Haces cuatro cosas y luego pulsas `F5`. ¿Cuáles sobreviven? (a) Agregas dos casos a la lista de la app Practice. (b) Eliges "Passed" en su filtro **Show**. (c) Marcas una lección como completada en el curso. (d) Tienes la sesión iniciada en la tienda. Di dónde vivía cada dato.

<details>
<summary>Respuesta</summary>

(a) y (b) se pierden. Los dos viven en la memoria de la página, y una recarga construye la página otra vez desde cero. (c) sobrevive, porque el curso guarda las lecciones completadas en `localStorage`, que se queda en el navegador. (d) sobrevive, porque el inicio de sesión es una cookie, y el navegador la envía otra vez con la siguiente petición. La regla: pregunta dónde vivía el dato y la respuesta sigue sola.

</details>

2. Un test asigna el campo con un script y luego hace clic en **Sign in** en la página Practice:

```ts
await page.evaluate(() => {
  const email = document.querySelector('[data-testid="login-email"]') as HTMLInputElement
  email.value = "qa@example.com"
})
await page.getByTestId("login-submit").click()
```

El test se ejecuta sin error, pero la página muestra "Enter your email and password." ¿Por qué?

<details>
<summary>Respuesta</summary>

El script cambió el valor del campo, pero no disparó un evento `input`. El código de la página guarda su propia copia del texto, en su estado, y la actualiza a partir del evento. El estado sigue vacío, así que el formulario se envía con un correo vacío. `fill` dispara los eventos, y esa es la solución. El test está "verde" en el sentido de que se ejecutó, y equivocado en lo que hizo.

</details>

3. Para un test que necesita un usuario con sesión iniciada, puedes llenar el formulario de login en cada test (versión A), o iniciar sesión una vez y guardar la sesión (versión B). Las dos funcionan. ¿Cuál es mejor aquí y qué te haría elegir la otra?

<details>
<summary>Respuesta</summary>

La versión B es más rápida y cada test se queda en su propio tema. La versión A es lenta, y una sola página de login rota haría fallar todos los tests. Pero la versión A es la correcta para los tests cuyo tema es el login mismo, porque deben usar el formulario real. Las dos versiones no son enemigas: guarda la sesión para la mayoría de los tests y usa el formulario en los pocos que lo prueban.

</details>

4. En la suite de la tienda, cada test empieza con la sesión guardada del admin. Un test hace clic en **Sign out** usando esa sesión compartida. ¿Qué se rompe y para quién?

<details>
<summary>Respuesta</summary>

Cerrar sesión borra la sesión en el servidor. La cookie guardada en el archivo ahora apunta a una sesión que no existe. Los tests posteriores que empiezan con ella se tratan como sin sesión, así que los envían a la página de login o reciben un 401. El fallo aparece lejos de la causa. El test de la tienda evita esto iniciando sesión con una sesión nueva solo para ese test.

</details>

5. Explica a un colega, en tres frases y sin las palabras "memoria" ni "localStorage", por qué una recarga vacía la lista de casos pero conserva las lecciones completadas.

<details>
<summary>Respuesta</summary>

Una respuesta modelo: La lista de casos existe solo dentro de la página que se está ejecutando, como el puntaje en la pantalla de un juego, así que una recarga la tira. Las lecciones completadas están escritas en un pequeño almacén del navegador, como una partida guardada, así que siguen ahí cuando la página carga otra vez. Los dos datos están en lugares distintos, y solo un lugar sobrevive a una recarga.

</details>

6. Una tienda web guarda el carrito en la memoria de la página, en `localStorage`, en una cookie o en el servidor. ¿Qué lugar elegirías? Piensa en un visitante que no ha iniciado sesión, un visitante que cambia de teléfono y un visitante con dos pestañas.

<details>
<summary>Respuesta</summary>

No hay una sola respuesta. La memoria pierde el carrito al recargar, así que es la peor para un carrito. `localStorage` sobrevive y sirve para un visitante sin sesión, pero está solo en un navegador, y dos pestañas pueden no coincidir. El servidor sobrevive a un cambio de teléfono, pero necesita conocer al visitante, por ejemplo con una cookie. Un diseño común: guardar el carrito en el servidor y usar una cookie para conocer al visitante. Depende de si el carrito debe seguir a la persona o solo al navegador.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cuál es la diferencia entre `localStorage` y `sessionStorage`?**
   - Busca: `localStorage vs sessionStorage MDN`
   - Pruébalo: en la Console ejecuta `sessionStorage.setItem("dog", "Rex")` y `localStorage.setItem("dog", "Rex")`. Abre la misma dirección en una pestaña nueva escribiéndola. Lee los dos valores con `getItem("dog")`.
   - Una buena respuesta explica: cuánto dura cada uno, cómo se comportan con varias pestañas y lo que viste en la pestaña nueva.
2. **¿Qué hacen las banderas de cookie `HttpOnly`, `Secure` y `SameSite`?**
   - Busca: `cookie HttpOnly Secure SameSite MDN`
   - Pruébalo: inicia sesión en la tienda. En el panel **Application**, lee las banderas de `shop_session`. Luego ejecuta `document.cookie` en la Console y busca el nombre.
   - Una buena respuesta explica: cada bandera en una frase, qué ataque ayuda a evitar cada una y por qué `shop_session` no aparece en `document.cookie`.
3. **¿Por qué Playwright empieza cada test con un contexto de navegador nuevo y para qué sirve `storageState`?**
   - Busca: `playwright browser context isolation storage state`
   - Pruébalo: ejecuta `pnpm shop:e2e` una vez. Luego abre el archivo `apps/practice-shop/e2e/.auth/admin.json` y busca la cookie `shop_session`.
   - Una buena respuesta explica: qué contiene un contexto, por qué el aislamiento ayuda a tener tests confiables, cómo una sesión guardada evita iniciar sesión otra vez y qué guarda el archivo.

## Siguiente paso

En el próximo módulo empezarás con Playwright y escribirás tus primeros tests con las ideas que aprendiste aquí.
