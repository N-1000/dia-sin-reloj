# Día sin reloj

Una web personal para llevar las tareas del día sin horarios fijos ni cuentas regresivas. No es un calendario: el día se divide en tres momentos flexibles — **mañana**, **tarde** y **noche** — y vos decidís qué entra en cada uno.

## Por qué existe

La idea no es que te presione un reloj ni que te mida con rachas, puntos o "días perdidos". Por eso:

- No hay horarios ni notificaciones de "ya casi es hora".
- No hay streaks, puntajes ni ranking: nada que convierta un día flojo en un fracaso.
- Cada día empieza en blanco. Lo que no se marcó ayer, simplemente no se carga hoy.
- Si ya pasó la mañana, esa sección deja de mostrarse — el día avanza con vos, no te reclama lo que no hiciste.

## Cómo funciona

Al abrir la página, lo primero que ves es un saludo según la hora (buenos días / buenas tardes / buenas noches). Bajando el scroll aparecen, en cascada, el manifiesto corto del proyecto y los bloques de tareas disponibles para ese momento del día. También hay:

- **Respirar un minuto** — un espacio para cuando aprietan las ganas de hacer algo más, con una animación de respiración y un contador suave (extendible hasta 10 minutos).
- **Cerrar el día** — un mensaje de cierre según lo que se marcó, sin juicio ni exigencia.

## Privacidad

Todo se guarda únicamente en el `localStorage` del navegador. No hay backend, no hay cuentas, no se envían datos a ningún lado.

## Correr el proyecto

Es HTML/CSS/JS plano, sin build ni dependencias. Alcanza con un servidor estático simple:

```bash
python3 -m http.server 8080
```

y abrir `http://localhost:8080`.
