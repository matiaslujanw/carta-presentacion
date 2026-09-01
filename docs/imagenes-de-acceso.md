# Imágenes de control de acceso

Las fotos de las escenas 6, 7 y 8 de la presentación:

| Archivo | Escena | Qué muestra |
|---|---|---|
| `public/accesos/ingreso-peatonal.jpg` | 6 · Acceso biométrico | Una vecina frente al lector del ingreso, que la reconoce y le abre |
| `public/cams/cam4.jpg` | 7 · Tótem IA | El tótem en el lobby, con el operador de turno en pantalla |
| `public/accesos/ingreso-vehicular.jpg` | 8 · Cocheras LPR | Un auto en el portón: la cámara lee la patente y abre |

La foto del tótem cumple doble función: en la presentación va sin corregir, en
color y de día, porque ahí es material de marketing; en el panel de `/panel` la
misma foto pasa por corrección nocturna fuerte para leerse como feed de la Cam
04. El grado está en `CAMERAS` dentro de [`lib/config.ts`](../lib/config.ts).

## Qué se les retocó y por qué

Las dos venían con detalles que a un vecino de Tucumán le habrían hecho ruido:

- **La patente era turca** (`34 AB 1234`, con la franja azul a la izquierda).
  Se reemplazó por una del Mercosur: `AB 452 KJ`.
- **El cartel del portón decía `ACCESS GRANTED`** en inglés. Ahora dice
  `AUTORIZADO` con la misma patente debajo.
- **La pantalla del tótem tenía texto ilegible en inglés.** Se reemplazó por un
  tilde verde, que se entiende sin leer.

Los retoques se dibujaron encima de la imagen con AppKit, no por CSS, así que
la corrección viaja con el archivo y no depende de la pantalla.

Los originales sin retocar están en `material-crudo/`.

## Si cambiás las imágenes

Los scripts que hicieron los retoques quedaron fuera del repo porque están
calibrados a estas fotos exactas (posiciones en % de cada imagen). Si generás
imágenes nuevas hay que volver a medir. Lo más rápido es pedirle a quien las
genere que ya salgan con patente argentina y los carteles en castellano.

## Los dos equipos son dos equipos

En la demo conviven dos diseños distintos, y ahora las escenas 6 y 7 van una
detrás de la otra, así que la diferencia se ve:

- `public/accesos/ingreso-peatonal.jpg` — la columna delgada de acceso, **afuera**
- `public/cams/cam4.jpg` — el kiosco de 47" con el operador, **adentro del lobby**

Se leen como dos equipos porque son dos equipos: el lector de acceso en la puerta
y el Tótem IA pasando la puerta. El guion los separa igual (escena 6 "ingresan al
edificio", escena 7 "traspasada la puerta principal de ingreso"), así que la
secuencia queda coherente sola.

Si algún día se unifica en un solo equipo hay que cambiar las dos fotos juntas,
no una.
