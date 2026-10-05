---
title: Bienvenida
summary: Qué es QA Automation, cómo está ordenado este curso y cómo estudiar para aprender de verdad.
duration: 30 min
---

## Objetivo

- Explicar qué es QA Automation (QAA).
- Explicar qué es un test end-to-end (de extremo a extremo).
- Conocer el orden de este curso y sus siete módulos.
- Saber cómo estudiar de una forma que funciona.

## ¿Qué es QA Automation?

Ya pruebas software a mano. Abres una página, escribes datos, haces clic en los botones y revisas el resultado.

QA Automation significa que escribes un programa que hace estos pasos por ti. Ese programa se llama *test* (prueba) automatizado. Puedes ejecutarlo en segundos, tantas veces como quieras.

Un **programa** es una lista de instrucciones que una computadora sigue al pie de la letra. Para escribir tests automatizados, debes aprender a escribir programas. Por eso este curso empieza con programación.

## Ya tienes la parte difícil

La parte difícil de probar no es el código. Lo difícil es saber qué probar.

Sabes leer un requisito. Sabes qué casos son riesgosos. Sabes qué puede hacer mal un usuario. Sabes cuándo un resultado es un *bug* (error del software).

Un programador que no prueba bien escribe tests débiles. Tú escribirás tests sólidos, porque piensas como tester. El código es una habilidad que puedes aprender paso a paso.

## ¿Qué es un test end-to-end?

Un **test end-to-end** (de extremo a extremo, o test E2E) revisa un flujo completo del usuario, de principio a fin. Usa la aplicación real en un navegador real.

Este es un ejemplo de flujo:

1. Abre la página de *login* (inicio de sesión).
2. Escribe un correo y una contraseña válidos.
3. Haz clic en "Log in".
4. Comprueba que aparece la página del *dashboard* (panel principal).

Un test E2E hace los mismos pasos que tú haces en un caso de prueba manual. La diferencia es que un programa hace los clics y las comprobaciones.

## ¿Qué es Playwright?

**Playwright** es una herramienta gratuita hecha por Microsoft. Controla un navegador, como Chrome, desde tu código. Puede abrir páginas, hacer clic, escribir y comprobar lo que hay en la pantalla.

Escribes los tests de Playwright en **TypeScript**. TypeScript es un lenguaje de programación. Lo aprenderás en el módulo 1.

## El orden de este curso

Muchos cursos empiezan por la herramienta. Este no. Una herramienta es difícil de usar cuando no conoces el lenguaje que hay detrás.

El orden honesto es este:

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
| 5 | Proyecto real | Probar una aplicación pequeña completa |
| 6 | Referencias | Enlaces y un glosario para después |

## Cómo estudiar

Estos hábitos hacen una gran diferencia.

**Escribe el código tú mismo.** No copies y pegues. Al escribir, tu cerebro presta atención. Además cometerás pequeños errores, y corregirlos es como se aprende.

**Rompe las cosas a propósito.** Cuando un ejemplo funcione, cámbialo. Borra un carácter. Cambia un nombre. Mira qué pasa. Así aprenderás qué hace cada parte.

**Lee los mensajes de error.** Un mensaje de error no es un castigo. Te dice qué está mal y, muchas veces, dónde. Léelo despacio, desde arriba. Lee el número de línea.

**Da pasos pequeños cada día.** Treinta minutos al día es mejor que cinco horas una vez por semana. Para cuando estés cansado. Vuelve mañana.

**Pide ayuda con una pregunta clara.** Di qué hiciste, qué esperabas y qué pasó. Copia el mensaje de error completo.

> **Consejo:** Lleva un archivo de notas. Cuando aprendas una palabra nueva, anótala con tu propia explicación corta.

## Profundiza

### Una idea equivocada común: "La automatización reemplaza las pruebas manuales"

Muchos principiantes creen que un test automatizado encuentra bugs nuevos. No es así. Un test automatizado solo repite una comprobación que ya conoces. Es un guardia que te avisa cuando un comportamiento antiguo se rompe.

Encontrar bugs nuevos todavía necesita a una persona. Tú exploras, dudas y notas lo que se ve raro. Un programa solo nota lo que le dijiste que comprobara. Por eso el mejor plan usa ambas cosas: pruebas manuales para explorar y automatización para proteger lo que aprendiste.

### Por qué un programa debe ser exacto

Una persona puede leer "haz clic en el botón azul" y entenderlo. Una computadora no. Necesita el botón exacto, encontrado de una forma exacta, y el resultado exacto que debe esperar. Si falta una sola palabra, se detiene o hace algo incorrecto.

Por eso escribir un caso de prueba como pasos, como hiciste en la Práctica, es una buena primera habilidad. Cada paso que escribes con claridad es un paso que después puedes convertir en código.

### Cómo aparece en el trabajo real de automatización QA

Piensa en un equipo con 50 casos de prueba manuales. Muchos empiezan con los mismos tres pasos: abrir la página de login, escribir el correo y la contraseña, hacer clic en "Log in". Si la página de login cambia, debes corregir 50 casos.

Los programadores tienen un nombre para este problema. Dicen que los casos repiten el mismo conocimiento en muchos lugares. La regla contra esto se llama DRY (no te repitas), de *Don't Repeat Yourself*. Estudiarás esta idea al final del módulo 1 y otra vez en el módulo 4. Por ahora, fíjate en el dolor: un cambio, muchas ediciones.

> **Nota:** DRY tiene un límite. Un test debe seguir leyéndose como una historia clara. A veces un poco de repetición es mejor que un truco ingenioso que esconde los pasos.

## Práctica

1. Piensa en un caso de prueba manual que escribiste en tu trabajo. Anota sus pasos en papel.
2. Marca cada paso como una acción (clic, escribir) o una comprobación (ver, comparar).
3. Guarda este papel. En el módulo 3, convertirás un caso como este en un test automatizado.

## Comprueba lo que sabes

1. ¿Qué es un test automatizado?

<details>
<summary>Respuesta</summary>

Es un programa que ejecuta los pasos de una prueba y comprueba el resultado por ti.

</details>

2. ¿Qué es un test end-to-end?

<details>
<summary>Respuesta</summary>

Es un test que comprueba un flujo completo del usuario en la aplicación real, desde el primer paso hasta el último.

</details>

3. ¿Por qué este curso enseña programación antes que Playwright?

<details>
<summary>Respuesta</summary>

Los tests de Playwright son programas. Necesitas entender el lenguaje antes de usar la herramienta.

</details>

4. ¿Por qué debes escribir el código y no copiarlo?

<details>
<summary>Respuesta</summary>

Escribir te ayuda a prestar atención y a aprender. Corregir tus propios errores pequeños te enseña mucho.

</details>

5. Un equipo tiene una regla: "Automatizaremos todos los casos de prueba, así que no necesitamos pruebas manuales". Da dos razones por las que este plan es débil.

<details>
<summary>Respuesta</summary>

Un test automatizado solo comprueba lo que alguien ya pensó, así que no puede explorar riesgos nuevos. Además, algunas comprobaciones no valen su costo: un test que se ejecuta una sola vez, o una pantalla que cambia cada semana, cuesta más automatizarlo que ejecutarlo a mano. Una mezcla de ambos es más fuerte.

</details>

6. Un caso manual dice: "Comprueba que la página se ve bien". ¿Por qué este paso no se puede automatizar tal como está escrito?

<details>
<summary>Respuesta</summary>

"Se ve bien" no es exacto. Un programa necesita una comprobación clara, como "el título dice Welcome" o "el mensaje de error es visible". Para automatizar el paso, primero debes reescribirlo como una o más comprobaciones exactas. Este trabajo es parte de tu habilidad como tester.

</details>

## Investiga por tu cuenta

Estas preguntas no tienen respuesta aquí. Busca en internet, lee y escribe tu respuesta con tus propias palabras.

1. **¿Qué es la pirámide de tests y dónde encajan los tests end-to-end en ella?**
   - Busca: `test pyramid unit integration e2e`
   - Una buena respuesta explica: las tres capas, por qué hay menos tests E2E que tests unitarios y cuánto cuesta cada capa.

2. **¿Por qué se dice que un test automatizado también es un programa que puede tener bugs?**
   - Busca: `flaky test meaning automation`
   - Una buena respuesta explica: qué es un test *flaky* (inestable) y por qué un test que a veces pasa y a veces falla es un problema para un equipo.

3. **¿Qué tipos de casos de prueba son buenos candidatos para automatizar y cuáles no?**
   - Busca: `what to automate test automation candidates`
   - Una buena respuesta explica: al menos tres señales de un buen candidato, como que se repite a menudo, es estable y tiene un resultado claro, y al menos dos casos que conviene dejar manuales.

## Siguiente paso

Ve a la siguiente lección e instala las herramientas que necesitas en Windows.
