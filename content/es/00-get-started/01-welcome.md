---
title: Bienvenida
summary: Qué es la automatización de pruebas (QA Automation), por qué una computadora necesita instrucciones exactas, cómo está ordenado este curso y cómo estudiar para aprender de verdad.
duration: 60 min
---

## Empieza con un acertijo

Le das a un robot una tarjeta de cocina. Tiene tres líneas:

1. Hierve agua.
2. Pon la bolsita de té en la taza.
3. Vierte el agua. Espera hasta que el té esté suficientemente fuerte.

El robot hace exactamente lo que dice la tarjeta y nada más. Nunca ha visto el té.

¿Qué hará? ¿Preparará una buena taza de té? ¿Se detendrá en alguna línea? ¿Hará algo extraño? ¿Qué línea es la más peligrosa, y por qué?

Todavía no busques la respuesta "correcta". Busca la línea en la que te daría miedo dejar solo al robot.

Escribe tu respuesta antes de seguir leyendo.

## Objetivo

- Predecir qué hace una máquina literal con una instrucción que no es exacta.
- Decidir cuáles de tus pasos de prueba manual podría seguir hoy una computadora, y cuáles no.
- Explicar qué es un test end-to-end (de extremo a extremo) y por qué no reemplaza a las pruebas manuales.
- Explicar por qué este curso enseña programación antes que Playwright.

## ¿Qué es la automatización de pruebas?

Ya pruebas software a mano. Abres una página, escribes datos, haces clic en botones y revisas el resultado.

Automatizar pruebas (QA Automation) significa escribir un programa que haga estos pasos por ti. Ese programa se llama test automatizado. Puedes ejecutarlo en segundos, tantas veces como quieras.

Un **programa** es una lista de instrucciones que una computadora sigue al pie de la letra. Para escribir tests automatizados, tienes que aprender a escribir programas. Por eso este curso empieza con programación.

### Experimento: un robot que solo hace lo que le dices

Toma una tarjeta de cocina para un huevo cocido:

1. Pon el huevo en la olla.
2. Enciende la estufa.
3. Espera 8 minutos.
4. Saca el huevo.

¿Qué esperas que haga un robot literal? Piénsalo antes de seguir leyendo.

Aquí hay cuatro problemas. La olla no tiene agua. La estufa tiene dos perillas. "Espera 8 minutos" no dice qué hacer mientras espera. "Saca el huevo" no dice con qué. Una persona llena esos huecos sin darse cuenta. Un robot no puede.

Ahora prueba con un segundo mundo, una figura. Escribe pasos exactos para dibujar un cuadrado en papel. Empieza con "Dibuja un cuadrado" y agrega detalle hasta que un extraño que nunca ha visto un cuadrado pueda seguirte. ¿Cuántos pasos necesitas? Verás que necesitas el largo de un lado, el ángulo de cada giro y el número de lados. También necesitas una regla para saber cuándo parar.

Este trabajo tiene un nombre. **Descomponer** (*decomposition*) es dividir un trabajo grande en pasos pequeños, cada uno fácil de hacer. Los programadores descomponen antes de escribir código. A menudo escriben primero los pasos con palabras simples. Esto se llama **pseudocódigo**: pasos que parecen código, pero están escritos para personas.

### De vuelta al acertijo

La línea más peligrosa es la 3: "Espera hasta que el té esté suficientemente fuerte". "Suficientemente fuerte" no tiene un número. Un robot no tiene gusto. No sabe cuándo parar, así que puede esperar para siempre, o parar de inmediato.

Las líneas "Hierve agua" y "Pon la bolsita de té en la taza" también esconden huecos. ¿Cuánta agua? ¿Qué taza? Una buena instrucción dice: "Vierte agua hasta llenar la taza. Espera 3 minutos. Saca la bolsita". Cada paso tiene un número o un final claro.

Tus pasos de prueba manual tienen el mismo problema. "Verifica que la página se vea bien" es como "suficientemente fuerte".

## Ya tienes la parte difícil

La parte difícil de probar no es el código. La parte difícil es saber qué probar.

Sabes leer un requisito. Sabes qué casos son riesgosos. Sabes qué podría hacer mal un usuario. Sabes cuándo un resultado es un *bug* (error).

Un programador que no prueba bien escribe tests débiles. Tú escribirás tests fuertes, porque piensas como tester. El código es una habilidad que puedes aprender paso a paso.

## ¿Qué es un test end-to-end?

Un **test end-to-end** (de extremo a extremo, test E2E) revisa un flujo completo del usuario, de principio a fin. Usa la aplicación real en un navegador real.

Este es un ejemplo de flujo:

1. Abre la página de *login* (inicio de sesión).
2. Escribe un correo y una contraseña válidos.
3. Haz clic en "Log in".
4. Comprueba que aparece la página del *dashboard* (panel principal).

Un test E2E hace los mismos pasos que tú haces en un caso de prueba manual. La diferencia es que un programa hace los clics y las comprobaciones.

¿Por qué "de extremo a extremo"? Piensa en un paquete. Puedes revisar cada parte del viaje: la tienda, el camión, la oficina de clasificación. O puedes revisar una sola cosa: ¿llegó el paquete a la puerta? Un test E2E revisa esa última cosa.

## ¿Qué es Playwright?

**Playwright** es una herramienta gratuita hecha por Microsoft. Controla un navegador como Chrome desde tu código. Puede abrir páginas, hacer clic, escribir y revisar lo que hay en la pantalla.

Escribes los tests de Playwright en **TypeScript**. TypeScript es un lenguaje de programación. Lo aprenderás en el módulo 1.

## El orden de este curso

Muchos cursos empiezan por la herramienta. Este no. Una herramienta es difícil de usar cuando no conoces el lenguaje que hay detrás.

Piensa en una clase de música. El primer día puedes presionar las teclas de un piano. Pero no puedes tocar una canción antes de conocer las notas y el ritmo. La herramienta es el piano. El lenguaje son las notas.

El orden es este:

1. Primero, aprendes a programar.
2. Después, aprendes Git y cómo funciona la web.
3. Después, aprendes Playwright.

Esto toma tiempo. Ve despacio. Cada paso prepara el siguiente.

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

Estos hábitos hacen una gran diferencia.

**Escribe el código tú mismo.** No copies y pegues. Escribir hace que tu cerebro preste atención. También cometerás pequeños errores, y corregirlos es como aprendes.

**Adivina primero.** Antes de ejecutar un ejemplo, escribe lo que esperas ver. Luego ejecútalo. Cuando tu respuesta es incorrecta, es cuando más aprendes.

**Rompe cosas a propósito.** Cuando un ejemplo funcione, cámbialo. Borra un carácter. Cambia un nombre. Mira qué pasa. Aprenderás qué hace cada parte.

**Lee los mensajes de error.** Un mensaje de error no es un castigo. Te dice qué está mal y, a menudo, dónde. Léelo despacio, desde arriba. Lee el número de línea.

**Busca antes de preguntar.** Cada lección tiene un Reto que necesita algo que la lección no enseñó. Tienes que buscarlo. Este es el trabajo real de un programador.

**Da pasos pequeños cada día.** Treinta minutos al día es mejor que cinco horas una vez por semana. Para cuando estés cansado. Vuelve mañana.

**Pide ayuda con una pregunta clara.** Di qué hiciste, qué esperabas y qué pasó. Copia el mensaje de error completo.

> **Consejo:** Lleva un archivo de notas. Cuando aprendas una palabra nueva, anótala con tu propia explicación corta.

### Usar un asistente de IA

Puedes pedir ayuda a un asistente de IA. Pero sigue una regla: ejecuta el código y sé capaz de explicar cada línea. Nunca pegues código que no puedas explicar. Si no puedes explicar una línea, no puedes arreglarla cuando se rompa. Un buen uso es preguntar "¿por qué funciona esta línea?" después de escribir tu propia versión.

## Profundiza

### Una idea equivocada común: "La automatización reemplaza las pruebas manuales"

Muchos principiantes creen que un test automatizado encuentra bugs nuevos. No es así. Un test automatizado solo repite una comprobación que ya conoces. Es un guardia que te avisa cuando se rompe un comportamiento antiguo.

Encontrar bugs nuevos todavía necesita a una persona. Tú exploras, dudas y notas lo que parece raro. Un programa solo nota lo que le dijiste que revisara. Por eso el mejor plan usa los dos: pruebas manuales para explorar y automatización para proteger lo que aprendiste.

### Por qué un programa debe ser exacto

Una persona puede leer "haz clic en el botón azul" y entenderlo. Una computadora no. Necesita el botón exacto, encontrado de una forma exacta, y el resultado exacto que debe esperar. Si falta una sola palabra, se detiene o hace lo incorrecto.

Por eso escribir un caso de prueba como pasos, como hiciste en la Práctica, es una buena primera habilidad. Cada paso que escribes con claridad es un paso que después puedes convertir en código.

### Cómo aparece en el trabajo real de automatización

Piensa en un equipo con 50 casos de prueba manuales. Muchos empiezan con los mismos tres pasos: abrir la página de login, escribir el correo y la contraseña, hacer clic en "Log in". Si la página de login cambia, tienes que arreglar 50 casos.

Los programadores tienen un nombre para este problema. Dicen que los casos repiten el mismo conocimiento en muchos lugares. La regla contra esto se llama *DRY*, que significa "Don't Repeat Yourself" (no te repitas). Estudiarás esta idea al final del módulo 1 y otra vez en el módulo 4. Por ahora, fíjate en el dolor: un cambio, muchas ediciones.

> **Nota:** DRY tiene un límite. Un test debe seguir leyéndose como una historia clara. A veces un poco de repetición es mejor que un truco ingenioso que esconde los pasos.

## Práctica

1. Piensa en un caso de prueba manual que escribiste en tu trabajo. Anota sus pasos en papel.
2. Marca cada paso como una acción (hacer clic, escribir) o una comprobación (ver, comparar).
3. Guarda este papel. En el módulo 3, convertirás un caso como este en un test automatizado.

## Reto

Escribe una tarjeta para un robot literal. Elige tu propio mundo: un refugio de mascotas que alimenta a un perro, una biblioteca que presta un libro, una liga de fútbol que suma un gol, una cocina que hace panqueques. La tarjeta debe ser tan exacta que una persona que no sabe nada de tu mundo pueda seguirla y obtener el resultado correcto. Prueba tu tarjeta con una persona real, o contigo mismo después de un día, usando solo el texto.

Crea el archivo `exercises/challenges/01-welcome.md` y escribe ahí tu tarjeta.

Está terminado cuando:

- La tarjeta tiene entre 8 y 15 pasos numerados, y cada paso es una acción o una comprobación.
- Ningún paso usa una palabra sin número o sin un final claro, como "suficiente", "un rato" o "se ve bien".
- Al menos un paso es una decisión escrita como "Si ... entonces ... si no ...".
- Debajo de la tarjeta, listas tres cosas que podrían salir mal, y cada una tiene un paso que la resuelve.
- Le diste la tarjeta a una persona, o la seguiste tú mismo con objetos reales, y anotaste un paso que falló.

Vas a necesitar algo que esta lección no enseñó: cómo escriben los programadores una decisión con palabras simples antes de escribir código. Busca: `pseudocode examples for beginners` y `if then else flowchart simple`.

## Piénsalo bien

1. Una tarjeta para un robot dice: "Dibuja un cuadrado. Repite 3 veces: avanza 10 pasos, gira a la derecha 90 grados". El robot la ejecuta sin error. ¿Qué está mal en el resultado?

<details>
<summary>Respuesta</summary>

El robot dibuja solo tres lados, una figura abierta como la letra U. Un cuadrado tiene cuatro lados, así que el bucle debe repetirse 4 veces. El robot no da ningún error, porque la tarjeta es válida. Hace lo que dice la tarjeta, no lo que tú querías. Los bugs como este son los más comunes, y un tester los encuentra revisando el resultado, no las instrucciones.

</details>

2. Un test automatizado comprueba que el título de la página es exactamente "Welcome". Un diseñador cambia el título a "Welcome!". Ahora el test falla. ¿Es un bug del producto, un bug del test, o ninguno? Explica tu razonamiento.

<details>
<summary>Respuesta</summary>

No es ninguno, o son los dos, según el requisito. El test fue exacto, así que notó correctamente un cambio. Si el requisito dice que el título es "Welcome", el producto tiene un bug. Si el diseñador cambió el requisito a propósito, el test está desactualizado y debes actualizarlo. El test no puede saber cuál es cierto. Una persona debe decidir, y por eso la automatización necesita a un tester.

</details>

3. Un equipo tiene 50 casos de prueba que empiezan todos con "abrir la página de login, escribir el correo y la contraseña, hacer clic en Log in". El texto del botón cambia de "Log in" a "Sign in". ¿Qué se rompe si los pasos están escritos 50 veces, y qué se rompe si están escritos una sola vez y compartidos?

<details>
<summary>Respuesta</summary>

Con 50 copias, tienes que cambiar 50 lugares, y puedes olvidar uno. Ese caso falla entonces por una razón que no tiene nada que ver con su objetivo. Con una sola copia compartida, cambias un lugar. Pero la copia compartida también tiene un riesgo: si está mal, los 50 casos fallan juntos. Compartir hace que un cambio sea barato y que un error sea ruidoso. Normalmente es un buen trato, y lo estudiarás como DRY.

</details>

4. Explícale a un colega nuevo qué es un test automatizado. Usa tres oraciones. No uses la palabra "programa".

<details>
<summary>Respuesta</summary>

Una respuesta de ejemplo: "Un test automatizado es una lista de pasos exactos que una computadora sigue, como lo haría una persona en una prueba manual. Al final, comprueba un resultado y dice si pasó o falló. Puedes ejecutarlo una y otra vez, en segundos, con los mismos pasos cada vez". Una buena respuesta tiene tres partes: los pasos, la comprobación y la repetición. Si tu respuesta no tiene comprobación, describe solo un *script* que hace clics, no un test.

</details>

5. Un caso manual dice: "Abre el primer resultado de la búsqueda". ¿Qué pasa cuando la búsqueda devuelve cero resultados? ¿Qué debería hacer un test automatizado?

<details>
<summary>Respuesta</summary>

No hay un primer resultado, así que el paso no se puede hacer. Un programa literal se detiene con un error que dice que no encuentra el elemento, y el mensaje no explica por qué. El caso está incompleto: no dice cuál es el comportamiento esperado cuando hay cero resultados. Un test mejor primero se asegura de que existan resultados, o tiene un caso separado para "sin resultados" que revisa el mensaje de vacío. El caso límite te enseña a preguntar qué supone el paso.

</details>

6. Una pantalla cambia cada semana, y cada cambio ha roto algo en el pasado. ¿Deberías automatizar sus tests? No hay una sola respuesta. Di de qué depende tu respuesta.

<details>
<summary>Respuesta</summary>

Hay dos fuerzas. La pantalla es riesgosa, así que quieres un guardia. Pero cambia seguido, así que cada test necesitará reparación, y reparar cuesta tiempo. Depende de qué tan caro sea un bug, de qué tan grandes sean los cambios y de qué pruebas. Vale la pena probar el núcleo estable, como "el usuario puede iniciar sesión". No vale la pena probar el diseño exacto. Un buen compromiso es automatizar las pocas comprobaciones que siempre deben cumplirse y explorar el resto a mano.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la pirámide de tests (*test pyramid*) y dónde encajan los tests end-to-end en ella?**
   - Busca: `test pyramid unit integration e2e`
   - Pruébalo: Piensa en una aplicación que uses todos los días, como un reproductor de música. Escribe 10 comprobaciones que harías. Coloca cada una en una capa de la pirámide y cuenta cuántas hay en cada capa.
   - Una buena respuesta explica: las tres capas, por qué hay menos tests E2E que tests unitarios y cuánto cuesta cada capa.

2. **¿Por qué se dice que un test automatizado también es un programa que puede tener bugs?**
   - Busca: `flaky test meaning automation`
   - Pruébalo: Toma un caso manual y haz una lista de todo lo que podría ser distinto entre dos ejecuciones: velocidad, datos, hora del día, otros usuarios. Marca qué diferencias podrían hacer que una comprobación pase una vez y falle la siguiente.
   - Una buena respuesta explica: qué es un test inestable (*flaky*) y por qué un test que a veces pasa y a veces falla es un problema para un equipo.

3. **¿Qué tipos de casos de prueba son buenos candidatos para automatizar y cuáles no?**
   - Busca: `what to automate test automation candidates`
   - Pruébalo: Escribe 5 casos manuales de tu trabajo. Dale a cada uno un puntaje de 1 a 3 según qué tan seguido se ejecuta, qué tan estable es la pantalla y qué tan claro es el resultado. Suma los puntajes y ordena la lista.
   - Una buena respuesta explica: al menos tres señales de un buen candidato, como que se repite seguido, es estable y tiene un resultado claro, y al menos dos casos que conviene dejar manuales.

## Siguiente paso

Ve a la siguiente lección e instala las herramientas que necesitas en Windows.
