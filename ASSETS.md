# Guía de assets para el lobby

Ahora mismo todo se dibuja con placeholders vectoriales. Para reemplazarlos por arte generado con IA:

1. Genera cada pieza **por separado**, con **fondo transparente (PNG)**.
2. Guárdala en `public/lobby/` (por ejemplo `public/lobby/stand-about.png`).
3. En `src/lobby/assets.ts`, cambia `src: null` por `src: "/lobby/stand-about.png"` y ajusta `anchor`/`scale` si hace falta.

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
| `lobby-floor` | Suelo completo del lobby, vacío (mármol, anillos de la plaza, alfombra **sin texto**; el texto lo pone el código en el idioma activo) | Rombo 2:1, recortado al borde (≈ 2000 × 1020) | x 0.5, y 0 (esquina superior del rombo). Se escala solo a 1984 px de ancho |
| `planter-center` | Jardinera redonda de la plaza con su árbol, **sin bancas ni placa** (las pone el código) | ~1024 × 1024, recortada al borde de la jardinera | Automático: ancho 200 px, se apoya en el centro de la base |
| `stand-about` | Stand "Sobre mí": paredes en L, letrero, cuadro, suelo del stand, **sin recepcionista ni escritorio** | 460 × 380 | 0.5, 0.75 |
| `stand-portfolio` | Stand "Portafolio" con pantallas en la pared | 460 × 380 | 0.5, 0.75 |
| `stand-skills` | Stand "Habilidades" con iconos Ps/Ai/Figma/código | 460 × 380 | 0.5, 0.75 |
| `stand-experience` | Stand "Experiencias" con timeline en la pared | 460 × 380 | 0.5, 0.75 |
| `plant-a` | Planta frondosa y redonda en maceta oscura | ~768 × 1024, recortada al borde | Automático: ancho 46 px × tamaño |
| `plant-b` | Planta alta de hojas grandes en maceta oscura | ~768 × 1024, recortada al borde | Automático: ancho 40 px × tamaño |
| `bench` | Banca de madera | 140 × 80 | 0.5, 0.7 |
| `lamp` | Poste de luz con bombilla cálida | 40 × 110 | 0.5, 0.97 |

> Los stands se colocan sobre las posiciones de `STANDS` en `src/lobby/config.ts`. Si tu imagen no cae exacto, ajusta el `anchor` en vez de mover la lógica.

## Personajes (siguiente paso)

Para sustituir los chibis vectoriales (`src/lobby/layers/Chibi.ts`) por sprites animados:

- **Spritesheet** por personaje: 4 filas × 6 columnas, celdas de 96 × 128 px.
  - Fila 1: caminar hacia el espectador (abajo-derecha)
  - Fila 2: caminar de espaldas (arriba-izquierda)
  - Fila 3: quieto / respirando
  - Fila 4: saludar (recepcionistas) o sentado con laptop (visitantes)
- Los pies deben tocar el borde inferior centrado de cada celda.
- El espejo horizontal se hace en código, así que no hace falta dibujar izquierda y derecha.

La clase `Chibi` solo expone `setFacing`, `wave`, `update` y `headY`. Un `AnimatedSprite` que implemente esos mismos métodos se puede conectar sin tocar el resto del motor.

## Prompts sugeridos

**Stand:**
> Isometric 2:1 3D render of a small modern portfolio exhibition booth, L-shaped white walls, large navy sign reading "Sobre mí", framed photo on wall, light wood floor platform, warm soft studio lighting, cozy minimal style, no people, no desk, transparent background, clean edges, high detail.

**Suelo:**
> Top-down isometric 2:1 empty lobby floor, cream marble tiles, circular plaza pattern in the center with thin golden light ring, dark entrance mat with the word "BIENVENIDO", no furniture, no people, soft warm lighting, diamond shaped floor, transparent background.

**Chibi (spritesheet):**
> Chibi character sprite sheet, cute big-head proportions, isometric 3/4 view, backpack, casual clothes, 6-frame walk cycle facing camera, 6-frame walk cycle facing away, idle and waving rows, consistent character, flat soft shading, transparent background, grid layout 96x128 per frame.
