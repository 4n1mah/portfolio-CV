# Guía de assets para el lobby

Ahora mismo todo se dibuja con placeholders vectoriales. Para reemplazarlos por arte generado con IA:

1. Genera cada pieza **por separado**, con **fondo transparente (PNG)**.
2. Guárdala en `public/lobby/` (por ejemplo `public/lobby/stand-about.png`).
3. En `src/lobby/assets.ts`, cambia `src: null` por `src: "/lobby/stand-about.png"` y ajusta `anchor`/`scale` si hace falta.

Las imágenes generadas suelen pesar 1–2 MB. Antes de publicarlas conviene recortarlas al objeto, bajarlas al tamaño máximo que muestra la cámara (zoom 2.6 × pantalla retina) y convertirlas a WebP. El original a tamaño completo se guarda en `art/lobby/` (no se sube a git ni se publica).

La lógica (hover, zoom, NPCs) no cambia: solo cambia lo que se ve.

## Reglas de consistencia (muy importante)

- **Vista isométrica 2:1** (ángulo de cámara ~30°, sin perspectiva), igual en todas las piezas.
- **Luz** cálida desde arriba a la izquierda, con sombras suaves hacia abajo a la derecha.
- La misma paleta en todo: mármol crema `#efe8de`, azul marino `#1f2a44`, madera `#b98a5e`, verdes `#5f8d4e`, luz dorada `#ffd27a`.
- Las piezas **no deben incluir personajes** (los NPCs se animan aparte) ni sombras proyectadas sobre el suelo del fondo.
- Deja un margen de 20 px de transparencia alrededor de cada objeto.

## Lista de piezas

| Key (`assets.ts`) | Qué es | Tamaño sugerido | Anchor |
|---|---|---|---|
| `lobby-floor` | Suelo completo del lobby, vacío (mármol, anillos de la plaza, alfombra **sin texto**; el texto lo pone el código en el idioma activo) | ✅ `lobby-floor.webp`, hecho con la plantilla `art/reference/lobby-floor.png` (plaza de radio 5.4 casillas). La alfombra de entrada se borró al preparar la imagen, continuando el mármol, porque ahí va el stand de Experiencias | Esquina superior del rombo; 0.76 px por px del mundo |
| `planter-center` | Jardinera redonda de la plaza con su árbol, **sin bancas ni placa** (las pone el código) | ✅ `planter-center.webp`, 1100 × 1056 | Ancho 200 px, se apoya en el centro de la base (45 px sobre el borde inferior); la placa va en la banda frontal |
| `stand-about` | Stand "Sobre mí": solo paredes en L y suelo, **paredes lisas** (letrero, textos, iconos y cuadros los dibuja el código encima). Plantilla: `art/reference/stand-about.png` | ✅ `stand-about.webp`, recortada del lienzo de la plantilla (1536 × 1024) | Esquina del fondo donde se juntan las paredes y el suelo |
| `stand-portfolio` | Igual, pared lateral azul marino. Plantilla: `art/reference/stand-portfolio.png` | ✅ `stand-portfolio.webp` | Igual |
| `stand-skills` | Igual, pared lateral verde salvia. Plantilla: `art/reference/stand-skills.png` | ✅ `stand-skills.webp` | Igual |
| `stand-experience` | Igual, pared lateral nogal. Plantilla: `art/reference/stand-experience.png` | ✅ `stand-experience.webp` | Igual |
| `desk` | Mostrador de recepción (el mismo en los cuatro stands), **sin laptop**. Plantilla: `art/reference/desk.png` | ✅ `desk.webp`, 640 px de ancho | Centro de la base del mostrador |

Las plantillas de `art/reference/` las genera el código con la geometría exacta del lobby: se suben a ChatGPT para que respete la forma y solo cambie los materiales.
| `plant-a` | Planta frondosa y redonda en maceta oscura | ✅ `plant-a.webp`, 360 px de ancho | Ancho 42 px × tamaño, apoyada en el centro de la maceta |
| `plant-b` | Planta alta de hojas grandes en maceta oscura | ✅ `plant-b.webp`, 360 px de ancho | Ancho 48 px × tamaño, apoyada en el centro de la maceta |
| `bench` | Banca de madera sin respaldo, lado largo de arriba-izquierda a abajo-derecha | ✅ `bench.webp`, 480 px de ancho | Ancho 73 px, apoyada en el centro de su huella; se refleja en código para las bancas en la otra diagonal |
| `sofa` | Sofá gris de dos plazas, respaldo al fondo a la derecha | ✅ `sofa.webp`, 480 px de ancho | Ancho 78 px, apoyado en el centro entre las patas |
| `lamp` | Poste azul marino con globo de luz, **sin halo** (el brillo lo dibuja el código) | ✅ `lamp.webp`, 96 px de ancho | Ancho 10.5 px, apoyado en el centro de la base; halo a 54 px de altura |

> Los stands se colocan sobre las posiciones de `STANDS` en `src/lobby/config.ts`. Si tu imagen no cae exacto, ajusta el `anchor` en vez de mover la lógica.

## Funciones en construcción

Tres espacios entre los stands (`src/lobby/layers/Features.ts`, posiciones en `NOTES_BOARD`, `STATS_BOARD` y `ANIMA_DESK` de `config.ts`). Se iluminan al pasar el mouse y al hacer click abren un panel "En construcción". Todos los textos (título, "Próximamente", "En construcción", el cartel de Anima) los dibuja el código en el idioma activo, así que las imágenes van **sin texto**.

| Key | Qué es | Plantilla (`art/reference/`) | Referencia de estilo |
|---|---|---|---|
| ✅ `notes-board` | Mural independiente del muro de visitantes (mira hacia la plaza): panel mostaza sobre base de madera con corcho y notas | `notes-board.png` | `art/lobby/desk.png` |
| ✅ `stats-board` | Pantalla con gráfico de barras, cinta de precaución y conos | `stats-board.png` | `art/lobby/desk.png` |
| ✅ `desk-anima` | Mostrador azul marino en herradura, abierto por detrás | `desk-anima.png` | `art/lobby/desk.png` |
| ✅ `staff-anima` | Anima (hoja de personaje: de frente · saludando) | — | `art/lobby/staff-about.png` |

La correspondencia de cada plantilla con el mundo está en `art/reference/features-mapping.json`, pero ChatGPT devolvió estas imágenes a otro tamaño (1448 × 1086) y con proporciones propias, así que el anchor y el ancho se midieron sobre el arte. El mural llegó mirando hacia el lado contrario y se reflejó al exportarlo; la pantalla y el mostrador tienen una cámara algo más baja que el lobby, lo que se corrige con `skewY` y `squashY`. Las sombras de contacto de las cuatro piezas las dibuja el código.

## Personajes

Los generadores de imágenes no mantienen bien a un personaje a lo largo de muchos fotogramas, así que cada personaje es **una hoja con poses fijas** y la animación la hace el código: rebote al caminar, balanceo, saludo y espejo horizontal para las otras dos direcciones. La clase `Chibi` (`src/lobby/layers/Chibi.ts`) solo expone `setFacing`, `wave`, `update` y `headY`, así que una versión con sprites se conecta sin tocar el resto del motor.

| Archivo | Quién | Poses (de izquierda a derecha) | Lienzo |
|---|---|---|---|
| ✅ `staff-about`, `staff-portfolio`, `staff-skills`, `staff-experience` | Recepcionistas | De frente · saludando | 1536 × 1024 |
| ✅ `visitor-1` … `visitor-7` | Visitantes que caminan | De frente hacia abajo a la derecha · de espaldas hacia arriba a la derecha | 1536 × 1024 |
| ✅ `sitter-1`, `sitter-2`, `sitter-3` | Sentados (banca, banca, sofá) | Sentado sobre un asiento invisible, mirando abajo a la derecha | 1024 × 1024 (ChatGPT las entrega de 1254 × 1254) |

Al prepararla, cada hoja se corta en celdas iguales (una por pose) que comparten el punto de apoyo y se guarda en WebP a 6 px por px del mundo (unos 400 px de alto). El punto de apoyo es el centro entre los pies o, en los sentados, el punto donde tocan el asiento (medido a mano sobre la imagen). La entrada de `CHARACTERS` en `src/lobby/assets.ts` guarda las poses, ese punto, el ancho de la celda y la altura de la cabeza: de pie miden 62 px como los chibis vectoriales (65 con moño alto) y sentados 48 px desde el asiento (52 con moño). Mientras un personaje no tenga imagen, se sigue dibujando el chibi vectorial.

Revisar que cada archivo corresponda a su personaje antes de prepararlo: `staff-skills` y `staff-experience` llegaron con los nombres cruzados.

Flujo: primero `staff-about` con `art/lobby/sofa.png` y `art/lobby/plant-a.png` como referencia de estilo (prompt A). Cuando esa hoja se vea bien dentro del lobby, cada personaje nuevo se pide adjuntando esa hoja (prompt B) para que todos tengan el mismo estilo y tamaño.

**Prompt A (primer personaje):**
> Character model sheet for an isometric game: 2 poses of the SAME character side by side, transparent background, 1536×1024. Style: cute chibi vinyl-toy character, soft 3D render matching the attached furniture (same warm soft light from the top-left, same smooth matte materials and level of detail). Big round head (about 40% of total height), small rounded body, short legs, simple friendly face with dark glossy eyes, rosy cheeks and a small smile. Camera: high three-quarter view from above, the same ~30° isometric angle as the attached furniture, no perspective distortion. Pose 1 (left half): standing, facing the viewer and turned slightly toward the lower right, hands relaxed in front. Pose 2 (right half): exactly the same, but waving with the arm on the right side of the image raised. Both poses full body, the same size (about 820 px tall), feet on the same horizontal line, centered in each half with empty space around. Character: a lobby receptionist with short dark hair, warm light-brown skin, a camel sweater (#c9a27a) over a white collar, navy trousers, dark shoes and a lanyard with a small blank gold badge. No floor, no ground shadow, no glow, no text, no labels, no frames, no other objects.

**Prompt B (el resto; adjuntar la hoja aprobada):**
> Using the attached character sheet as the exact reference for style, proportions, size, camera angle, lighting and layout, create a new character sheet on a transparent background, [LIENZO]. [POSES]. Character: [DESCRIPCIÓN]. No floor, no ground shadow, no glow, no text, no labels, no frames, no other objects.

Poses para `[POSES]`:
- Recepcionistas: *Pose 1 (left half): standing, facing the viewer and turned slightly toward the lower right. Pose 2 (right half): the same, waving with the arm on the right side of the image raised. Feet on the same line.*
- Visitantes: *Pose 1 (left half): standing naturally with the feet a small step apart, body and face clearly turned 45° toward the lower right of the image, arms relaxed at the sides. Pose 2 (right half): the same character seen from behind, body clearly turned 45° toward the upper right of the image, as if walking away in that direction; we see the back of the head, the backpack and a sliver of the cheek, no face. Feet on the same line. No lanyard or badge.* La pose es neutra (no a medio paso) porque la misma imagen sirve quieto y caminando; el paso lo simula el código.
- Sentados: *One pose, centered: sitting in mid-air on an invisible seat (do not draw any chair, bench, sofa, cushion or floor), body and face turned 45° toward the lower right of the image, thighs horizontal and lower legs hanging straight down. No lanyard or badge.*

Adjuntar siempre `art/lobby/staff-about.png`; los visitantes 2 a 7 llevan además `visitor-1` aprobado, que es el primero con vista de espaldas.

Descripciones:

| Archivo | `[DESCRIPCIÓN]` |
|---|---|
| `staff-portfolio` | a lobby receptionist with brown hair in a neat ponytail, fair skin, a navy blazer (#1f2a44) over a white shirt, navy trousers, dark shoes and a lanyard with a small blank gold badge |
| `staff-skills` | a lobby receptionist with short brown hair, medium skin, round black glasses, a sage-green shirt (#5f7f6f), navy trousers, dark shoes and a lanyard with a small blank gold badge |
| `staff-experience` | a lobby receptionist with wavy brown hair, deep-brown skin, a walnut-brown vest (#8a6448) over a white shirt, navy trousers, dark shoes and a lanyard with a small blank gold badge |
| `visitor-1` | a visitor with curly dark-brown hair, medium-brown skin, a slate-blue hoodie (#3c4a6b), navy trousers, white sneakers and a small brown backpack |
| `visitor-2` | a visitor with short tidy brown hair, light skin, a cream knit sweater (#d9d2c5), navy trousers, brown shoes and a small brown backpack |
| `visitor-3` | a visitor with blonde hair in a top bun, fair skin, a navy jacket (#2f3b5c) over a white t-shirt, navy trousers, white sneakers and a small tan backpack |
| `visitor-4` | a visitor with dark hair in a low bun, olive skin, a caramel-brown cardigan (#8a6a52), navy trousers, dark shoes and a small brown backpack |
| `visitor-5` | a visitor with curly brown hair, dark-brown skin, a sage-green shirt (#4f6b62), navy trousers, white sneakers and a small grey backpack |
| `visitor-6` | a visitor with short black hair, light-tan skin, an off-white t-shirt (#e9e2d7), navy trousers, dark sneakers and a small navy backpack |
| `visitor-7` | a visitor with chin-length wavy auburn hair, fair freckled skin, a dark navy polo (#1f2a44), beige trousers, brown shoes and a small brown backpack |
| `sitter-1` | a visitor with short dark hair, medium-brown skin, a navy sweater (#2f3b5c) and jeans, with an open silver laptop on the lap, screen facing the character |
| `sitter-2` | a visitor with blonde hair in a bun, fair skin, a cream sweater (#d9d2c5) and navy trousers, holding a coffee cup with both hands |
| `sitter-3` | a visitor with short brown hair, light skin, a caramel-brown shirt (#8a6a52) and beige trousers, with an open silver laptop on the lap, screen facing the character |
