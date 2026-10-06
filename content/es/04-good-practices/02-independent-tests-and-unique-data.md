---
title: Tests independientes y datos únicos
summary: Escribe tests que pasan solos, en cualquier orden y dos veces seguidas, y encuentra el vínculo oculto cuando un test se rompe por culpa de otro.
duration: 80 min
---

## Empieza con un acertijo

Un test crea un producto con el SKU `SKU-5000`, que está escrito fijo en el código. El lunes pasa. El martes, sin ningún cambio en el código, falla: el servidor dice "This SKU is already used by another product."

Al mismo tiempo, falla un segundo test. Nadie lo editó en meses. Comprueba que una búsqueda de "Lamp" muestra 1 fila, y ahora muestra 2.

Ningún test muestra un error de código. El servidor de la tienda no se reinició entre el lunes y el martes.

¿Cuál test arreglas primero: el que falla con el mensaje de error o el que encuentra 2 filas? ¿Cuál es la causa real?

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir si un test pasa solo, en cualquier orden y dos veces seguidas.
- Encontrar el vínculo oculto entre dos tests que parecen no tener relación.
- Decidir entre valores aleatorios y un contador cuando necesitas datos únicos.
- Explicar qué ocultaría un reinicio de datos antes de cada test, y cuánto costaría.

## Tres reglas

Un buen test es **independiente**. Sigue tres reglas.

1. Pasa cuando lo ejecutas **solo**.
2. Pasa en **cualquier orden** con los demás tests.
3. Pasa **dos veces seguidas**, sin reiniciar nada.

Un test que rompe una de estas reglas es peligroso. Puede pasar hoy y fallar mañana, y nadie sabe por qué. La gente de testing llama a esto un test *flaky* (inestable): un test que a veces pasa y a veces falla sin ningún cambio en el código.

Estas tres reglas son parte de una lista corta llamada **FIRST**: los tests deben ser rápidos (Fast), independientes (Independent), repetibles (Repeatable) y autoverificables (Self-checking). Esta lección trata de la I y la R.

### Un experimento: dos tests y una lista compartida

Lee este programa. No lo ejecutes. ¿Qué esperas que impriman `testA()` y `testB()` cuando se ejecutan en este orden: A, luego B? Después adivina qué pasa si reinicias la lista y ejecutas solo B.

```ts
const products: string[] = ["Mouse"]

function testA() {
  products.push("Keyboard")
  return products.length === 2
}
function testB() {
  return products.length === 2
}

console.log("A then B:", testA(), testB())
products.length = 1
console.log("B alone:", testB())
```

Imprime `A then B: true true`, y luego `B alone: false`. La línea `products.length = 1` devuelve la lista a su inicio, como lo haría una ejecución nueva. El test B nunca agrega nada. Pasa solo porque el test A se ejecutó primero y cambió la lista.

Esto es **dependencia de orden**. El código del test B no está mal. Sus datos no son suyos.

Ahora cambia el orden. ¿Qué esperas de B, luego A, luego B otra vez?

```ts
const products: string[] = ["Mouse"]
function testA() { products.push("Keyboard"); return products.length === 2 }
function testB() { return products.length === 2 }
console.log("B, A, B:", testB(), testA(), testB())
```

Imprime `B, A, B: false true true`. El mismo test B falla primero y pasa después. Una suite que siempre se ejecuta en un solo orden nunca mostrará esto.

## Datos compartidos en la tienda

La tienda de práctica no tiene base de datos. Guarda sus datos en la memoria del servidor. Todos los tests usan la misma memoria.

Piensa en un cuaderno compartido. Si un test escribe en él, el siguiente test puede leerlo. Esta es la raíz de la mayoría de los problemas.

### De vuelta al acertijo

El mensaje de error señala al test con `SKU-5000`. Pero ese test es solo una víctima. El lunes creó el producto y nunca lo borró. El producto sigue vivo en la memoria del servidor el martes, así que ese SKU ya está ocupado. El test rompe la regla 3: no pasa dos veces seguidas.

El segundo test, con "Lamp", también es víctima, de otro test distinto. Algún test creó un segundo producto con "Lamp" en el nombre y lo dejó ahí. El test que cuenta filas lee datos que no son suyos.

Entonces el arreglo no está en los dos tests que fallan. Está en los tests que dejan datos, y en el hábito de escribir valores fijos. Arregla primero el que escribió `SKU-5000` en el código, porque es el que puedes ver. Luego dale a cada test sus propios datos únicos, para que nadie dependa de lo que dejan los demás.

### Por qué la tienda se ejecuta con un solo worker

Mira el comentario al inicio de `apps/practice-shop/playwright.config.ts`:

```ts
// The app keeps its data in memory and every test shares it,
// so tests run one at a time, in one worker.
fullyParallel: false,
workers: 1,
```

Un **worker** es un proceso que ejecuta tests. Con `workers: 1`, solo corre un test a la vez. Con `fullyParallel: false`, los tests de un mismo archivo también corren uno tras otro.

La razón es simple. Si dos tests corrieran al mismo tiempo, uno podría borrar un producto mientras el otro lo lee.

> **Nota:** Ejecutar tests en paralelo es más rápido. Necesita datos que los tests no compartan. Esta tienda no los tiene, así que elige la seguridad.

## Reinicia una vez, en el setup

Al inicio de cada ejecución, los datos deben estar en un estado conocido. El test de setup en `apps/practice-shop/e2e/global.setup.ts` hace esto:

```ts
const reset = await request.post("/api/test/reset")
expect(reset.ok()).toBeTruthy()
```

El reinicio devuelve los datos a los datos semilla: 24 productos y 12 pedidos.

El reinicio ocurre **una vez por ejecución**, no antes de cada test. Piensa por qué antes de leer la razón. Un reinicio antes de cada test suena más seguro. ¿Qué ocultaría?

Un reinicio antes de cada test le da a cada test una tienda limpia. Esa es una tienda que nunca existe en la vida real. Una tienda real tiene cientos de productos que crearon otras personas. Un test que solo funciona cuando la tienda está limpia puede fallar la primera vez que se encuentra con datos reales, por ejemplo una búsqueda que encuentra un segundo producto con la misma palabra. Un reinicio antes de cada test también agregaría una petición más a cada test. El mejor hábito es partir de datos conocidos una sola vez, y hacer cada test lo bastante fuerte para convivir con los datos de los demás.

## Crea tus propios datos

Cada test crea lo que necesita. No usa un producto que creó otro test.

El archivo `apps/practice-shop/e2e/lib/helpers.ts` tiene dos *helpers* (funciones de ayuda). El primero crea un nombre único:

```ts
/** A name that no other test uses, e.g. "Mouse 3fa9c1d2". */
export function uniqueName(prefix: string): string {
  return `${prefix} ${crypto.randomUUID().slice(0, 8)}`
}
```

El segundo crea un SKU. Un **SKU** es un código que identifica un producto, como `SKU-4821`.

```ts
/** A valid SKU like "SKU-4821" that is not used by the seed data. */
export function uniqueSku(): string {
  const value = nextSku
  nextSku = value >= LAST ? FIRST : value + 1
  return `SKU-${value}`
}
```

La semilla usa de `SKU-0001` a `SKU-0024`. El helper empieza en un número al azar desde 1000 y va contando hacia arriba. Dos tests nunca reciben el mismo SKU.

Aquí hay un test que los usa, de `e2e/products/products.spec.ts`:

```ts
const name = uniqueName("Created")
// ...
await page.getByTestId("product-name").fill(name)
await page.getByTestId("product-sku").fill(uniqueSku())
```

El nombre es único, así que el test puede encontrar su propio producto. No importa cuántos productos hayan creado otros tests.

## Nunca dependas de otro test

Mira el spec de pedidos, `e2e/orders/orders.spec.ts`. El estado de un pedido solo avanza. Cuando un pedido está "paid" (pagado), no puedes volver a ponerlo en "pending" (pendiente).

Por eso cada test usa su propio pedido de la semilla. Un test usa el pedido 1003. El otro usa el 1005. Si ambos usaran el 1005, el segundo test fallaría.

Mira también cómo el primer test de `products.spec.ts` maneja un total que cambia:

```ts
// Other tests add products, so we ask the API for the real total.
const total = ((await (await request.get("/api/products")).json()) as { total: number }).total
```

El test no escribe `24 products`. Otros tests agregan productos, así que primero lee el total real.

## Profundiza

### Depura como un científico cuando un test es flaky

Cuando un test falla solo a veces, no cambies cinco cosas a la vez. Usa el método de un científico.

1. **Haz una sola hipótesis.** Por ejemplo: "este test depende de un producto que crea otro test."
2. **Haz un experimento pequeño** que pueda demostrar que la hipótesis está mal. Ejecuta el test solo con `-g`. Si pasa solo y falla en la ejecución completa, la hipótesis tiene apoyo.
3. **Cambia una sola cosa** y ejecuta de nuevo. Nunca dos.
4. **Reduce el caso que falla.** Encuentra el grupo más pequeño de tests que todavía falla: dos tests, luego un par. Mientras más pequeño el caso, más claro el vínculo.

### Por qué los datos compartidos rompen un test que parece correcto

Una variable fuera de una función vive tanto como el programa. Cualquier función puede cambiarla. Los datos de test compartidos funcionan igual. El programa de la explicación muestra el problema en pequeño: el test B no tiene ningún error, y aun así falla cuando se ejecuta solo.

### Una idea equivocada común: único significa aleatorio

`uniqueName` usa caracteres aleatorios. Entonces puedes pensar que lo aleatorio es siempre el camino. Pero mira `uniqueSku`. No elige números al azar. Cuenta hacia arriba.

Antes de seguir, adivina: si eliges 100 SKU al azar entre los 9,000 valores de `SKU-1000` a `SKU-9999`, ¿qué tan probable es que al menos dos sean iguales? ¿1 por ciento, 10 por ciento o 40 por ciento? Este programa se lo pregunta a la computadora 20,000 veces:

```ts
const pool = 9000
const picks = 100
const trials = 20000
let clashes = 0

for (let trial = 0; trial < trials; trial++) {
  const seen = new Set<number>()
  for (let i = 0; i < picks; i++) {
    const value = 1000 + Math.floor(Math.random() * pool)
    if (seen.has(value)) {
      clashes++
      break
    }
    seen.add(value)
  }
}
console.log(`${((clashes / trials) * 100).toFixed(0)} percent of runs had a clash`)
```

Imprime cerca de `42 percent of runs had a clash`. El número puede cambiar en un punto de una ejecución a otra, porque usa números aleatorios.

La razón es el tamaño del espacio. Un nombre tiene ocho caracteres con 16 opciones cada uno. Eso son 4,294,967,296 valores posibles. Un choque entre 1,000 nombres es muy improbable, cerca de 1 en 8,600. Un SKU tiene solo cuatro dígitos, así que el espacio es pequeño y los choques llegan rápido. Contar hacia arriba da 9,000 SKU distintos antes de que el contador dé la vuelta y repita el primero. Es mucho más de lo que necesita una ejecución. No es una garantía entre workers ni entre ejecuciones.

```ts
let next = 9998
function sku() {
  const value = next
  next = value >= 9999 ? 1000 : value + 1
  return `SKU-${value}`
}
console.log(sku(), sku(), sku())
```

Esto imprime `SKU-9998 SKU-9999 SKU-1000`. Cuando el contador llega al final vuelve a 1000, así que el SKU sigue siendo válido.

### Cómo aparece en el trabajo de QA

Las ejecuciones en paralelo son el siguiente problema. Si un equipo quiere que los tests corran al mismo tiempo, cada worker necesita datos que no comparta. Los tests que ya crean sus propios datos únicos están listos para este paso. Los tests que dependen de registros compartidos deben reescribirse primero.

Nota también una idea de DRY aquí. El conocimiento "cómo esta suite crea datos únicos" vive solo en `helpers.ts`. Ningún spec inventa su propia forma de crear un nombre.

## Práctica

1. Abre `apps/practice-shop/e2e/lib/helpers.ts`. Encuentra las líneas que eligen el primer número de SKU.
2. Abre `apps/practice-shop/e2e/orders/orders.spec.ts`. Encuentra el comentario que dice qué pedido usa cada test.
3. Inicia la tienda con `pnpm shop:dev` en una terminal.
4. En una segunda terminal, ejecuta un solo archivo spec:

```bash
pnpm shop:e2e products/products.spec.ts
```

5. Ejecuta el mismo archivo otra vez, sin reiniciar:

```bash
pnpm shop:e2e products/products.spec.ts
```

6. Las dos ejecuciones deben pasar. Esto demuestra la regla 3: dos veces seguidas.
7. Ejecuta un solo test por una palabra de su nombre. `-g` significa "grep": ejecuta solo los tests cuyo nombre contiene la palabra.

```bash
pnpm shop:e2e -g cancelling
```

8. Esto demuestra la regla 1: pasa solo.

## Reto

Escribe el test para el hueco "Duplicate SKU error when creating a product" de `COVERAGE.md`. El objetivo es hacerlo independiente: debe crear sus propios datos y debe sobrevivir a ejecutarse muchas veces.

Crea el archivo `apps/practice-shop/e2e/challenges/duplicate-sku.spec.ts`.

El test crea un producto por la API. Luego abre el formulario de producto nuevo, lo llena con valores válidos y el SKU de ese producto, y guarda. El formulario debe mostrar un error y no debe crear un segundo producto.

Está terminado cuando:

- El test obtiene su SKU de un producto que crea él mismo. El archivo no contiene un SKU fijo como `SKU-0001`, ni el id de un producto de la semilla.
- Después de guardar (Save), el elemento `product-sku-error` tiene el texto exacto que envía el servidor, y la dirección de la página sigue terminando en `/products/new`.
- El número total de productos, leído de `/api/products` antes y después de guardar, es el mismo.
- Ejecutaste `pnpm shop:e2e challenges/duplicate-sku.spec.ts --repeat-each=3` y las tres ejecuciones pasaron.

Vas a necesitar algo que esta lección no enseñó: cómo ejecutar el mismo test varias veces con un solo comando, y por qué un test que abre un formulario debe esperar a que la página esté lista para escribir. Busca: `playwright repeat-each`, `playwright hydration fill input erased react`. Lee el comentario en `products.spec.ts` sobre `newButton.click()` para una primera pista.

## Piénsalo bien

1. Un archivo de tests tiene dos tests. El test uno crea un producto con `createProduct` y comprueba que aparece en la lista. El test dos comprueba que la lista tiene una fila con el texto "Created". El test dos nunca crea nada. Ejecutados en el orden uno, dos, pasa. Predice qué pasa cuando ejecutas el test dos solo en un servidor nuevo, y en el orden dos, uno.

<details><summary>Respuesta</summary>

En un servidor nuevo los datos semilla no tienen ningún producto llamado "Created", así que el test dos falla cuando se ejecuta solo, y también cuando se ejecuta primero. Pasa solo después del test uno, o después de cualquier test que cree un producto así. El test depende de datos que no son suyos. El arreglo es que el test dos cree su propio producto con un nombre de `uniqueName("Created")`, y luego busque exactamente ese nombre.

</details>

2. Este test pasa en una ejecución nueva. En la segunda ejecución falla. Encuentra el bug.

```ts
test("deleting Mouse Pad removes its row", async ({ page }) => {
  const products = new ProductsPage(page)
  await products.goto()

  await products.delete(23)

  await expect(products.row(23)).toHaveCount(0)
})
```

<details><summary>Respuesta</summary>

El producto 23 es un dato de la semilla, "Mouse Pad". La primera ejecución lo borra. Ejecútalo dos veces contra los mismos datos en marcha, por ejemplo con `--repeat-each 2`. La segunda copia no reinicia los datos, así que el producto 23 no existe y no hay botón de borrar para hacer clic. (Un segundo comando normal `pnpm shop:e2e` pasa, porque el proyecto de setup reinicia la semilla antes de cada comando.) El test rompe la regla 3, pasar dos veces seguidas. Debería crear su propio producto con `createProduct` y borrar ese.

</details>

3. Dos versiones de un helper dan SKU únicos. La versión uno elige un número al azar de 1000 a 9999 cada vez. La versión dos cuenta hacia arriba desde un inicio aleatorio y da la vuelta en 9999. ¿Cuál es mejor para esta suite y qué te haría elegir la otra?

<details><summary>Respuesta</summary>

La versión dos es mejor aquí: dentro de una ejecución da 9,000 SKU distintos antes de repetir, y la versión uno produce un choque entre 100 SKU en cerca de 4 de cada 10 ejecuciones. La versión uno estaría bien si el espacio fuera enorme, como un UUID, donde un choque no es una preocupación práctica. También sirve cuando muchos workers necesitan un valor cada uno y no pueden compartir un contador, porque los valores aleatorios no necesitan coordinación. La elección depende del tamaño del espacio y de si quienes llaman pueden compartir estado.

</details>

4. El equipo pone `workers: 2` en la configuración de la tienda, sin ningún otro cambio. ¿Qué test de `products.spec.ts` es el más probable que falle y por qué? ¿`uniqueSku` seguiría dando SKU distintos?

<details><summary>Respuesta</summary>

El primer test, "shows 10 rows on the first page and the total count", es el más probable. Lee el total de la API, luego abre la página, y un test del otro worker puede agregar o borrar un producto entre los dos pasos. Entonces el texto del conteo no coincide. `uniqueSku` guarda su contador en la memoria de un solo proceso worker, así que cada worker empieza en su propio número al azar. Los SKU dentro de un worker siguen siendo distintos, pero dos workers pueden chocar con una probabilidad pequeña. La tienda está hecha para un solo worker, y la configuración te lo dice.

</details>

5. La versión de contador de `uniqueSku` crea 9,000 SKU antes de dar la vuelta. ¿Qué pasa en la llamada número 9,001 de una ejecución muy larga? ¿Es un bug que debes arreglar?

<details><summary>Respuesta</summary>

La llamada 9,001 devuelve el mismo SKU que la llamada 1. Si el producto de la llamada 1 todavía existe, el servidor responde "This SKU is already used by another product." y el test falla. Una ejecución normal crea muchos menos de 9,000 productos, y los tests que limpian no dejan productos viejos, así que el problema es raro. No vale la pena un arreglo complejo hoy (esta es la idea de YAGNI). Sí vale la pena un comentario en el helper, para que la próxima persona conozca el límite.

</details>

6. Un compañero dice: "Reiniciemos los datos antes de cada test. Así nunca tenemos problemas de orden." Da una ganancia y una pérdida. ¿Aceptarías la propuesta?

<details><summary>Respuesta</summary>

La ganancia es un inicio conocido para cada test, y menos sobras. La pérdida es real: los tests ya no se encuentran con los datos desordenados de la vida real, así que un test que necesita una tienda limpia parecería sano, y se agrega una petición más a cada test. Un test que depende en silencio de una tienda limpia va a fallar en el primer entorno con datos reales. Muchos equipos prefieren un reinicio por ejecución y tests fuertes que crean sus propios datos únicos. La respuesta depende del costo de encontrar esos vínculos ocultos más tarde, y de si los datos pueden mantenerse privados para cada test.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Cómo evita Playwright que un test afecte a otro?**
   - Busca: `playwright test isolation browser context`
   - Pruébalo: escribe dos tests en un spec de prueba. En cada test, primero abre `/products` con `page.goto`. En el primero, guarda un valor con `page.evaluate(() => localStorage.setItem("x", "1"))`. En el segundo, léelo con `localStorage.getItem("x")` e imprímelo. Ejecuta los dos y mira qué imprime el segundo.
   - Una buena respuesta explica: qué es un contexto de navegador, y qué recibe nuevo cada test.

2. **¿Qué es un UUID y por qué uno aleatorio casi nunca se repite?**
   - Busca: `UUID version 4 collision probability`
   - Pruébalo: en un archivo `.ts`, llama a `crypto.randomUUID()` 100,000 veces y pon los resultados en un `Set`. Imprime el tamaño del conjunto. Luego corta cada valor a sus primeros 4 caracteres y ejecútalo otra vez.
   - Una buena respuesta explica: cómo se ve un UUID, cuántos valores existen y por qué un choque no es una preocupación práctica.

3. **¿Cómo mantienen separados los datos de prueba los equipos cuando muchos tests corren al mismo tiempo?**
   - Busca: `test data isolation parallel tests`
   - Pruébalo: en `playwright.config.ts` de la tienda, lee qué hacen `workers` y `fullyParallel`. Sin cambiar el archivo, escribe cuál de los tests de la tienda se rompería primero con `workers: 2`, y por qué.
   - Una buena respuesta explica: al menos dos estrategias, como datos únicos por test o una base de datos separada por worker.

## Siguiente paso

En la próxima lección aprendes la regla de nombres para `data-testid` y por qué el equipo la usa.
