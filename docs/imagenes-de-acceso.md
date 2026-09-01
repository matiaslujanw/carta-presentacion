# Imágenes de control de acceso

Las dos fotos de la sección "El tótem también es la puerta" están en
`public/accesos/`:

| Archivo | Qué muestra |
|---|---|
| `ingreso-peatonal.jpg` | Una vecina frente al tótem, que la reconoce y le abre |
| `ingreso-vehicular.jpg` | Un auto en el portón: la cámara lee la patente y abre |

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

## Ojo con esto

Hoy conviven dos diseños distintos de tótem en la demo:

- `public/cams/cam4.jpg` — el kiosco grande con el operador en pantalla
- `public/accesos/ingreso-peatonal.jpg` — la columna delgada con reconocimiento
  facial

Se leen como dos equipos distintos. Para una empresa que vende monitoreo *y*
control de accesos eso es perfectamente razonable, pero conviene decidirlo a
propósito y no que quede por accidente.
