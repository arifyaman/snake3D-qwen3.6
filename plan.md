Create a fully functional 3D Snake game using Three.js with the following specifications:

## CORE GAMEPLAY

1. **Auto-Play Mode (Initial State)**
   - When the game loads, the snake moves automatically in a random or pre-determined safe direction
   - The auto-play AI should avoid walls and its own body for as long as possible
   - Auto-play continues indefinitely until user interaction

2. **User Takeover**
   - As soon as the user presses any arrow key (up, down, left, right), auto-play disables immediately
   - After takeover, user controls the snake with full manual control
   - The transition is seamless—snake position, length, and score remain unchanged

3. **Manual Controls (Post-takeover only)**
   - Arrow keys control direction
   - Snake cannot reverse direction into itself
   - Smooth but responsive movement

## 3D VISUAL REQUIREMENTS

- Use Three.js with a perspective camera orbiting slightly or fixed at an angle
- Snake is composed of individual cube segments, each with a glowing material
- Food is a floating, rotating, pulsating sphere or torus knot
- Ground grid with subtle reflections or a checkered plane
- Walls or boundaries clearly visible (invisible walls that kill the snake or wrap? choose wrapping walls)
- Shadows and basic lighting (ambient + directional + point light following snake head)

## GAME MECHANICS

- Grid size: 20x20 or 15x15
- Snake grows by 1 segment when food is eaten
- Score displayed in top-right (2D HTML overlay)
- Game over when snake hits wall or itself → display "Game Over" + restart button
- Food respawns at random empty position after being eaten

## AUTO-PLAY AI LOGIC

- AI chooses the safest direction (avoid immediate collision with wall or body)
- If multiple safe directions exist, prioritize moving toward food (simple BFS or random among safe)
- If no safe moves exist, game ends (auto-play cannot avoid death forever—that's fine)
- Movement speed: 150-200ms per step

## UI / UX

- HTML overlay showing:
  - "AUTO-PLAY ACTIVE" (green badge) before user interaction
  - "MANUAL MODE" (orange badge) after user takes over
  - Score display
  - Restart button (resets game to auto-play mode)
- Instructions: "Press any arrow key to take control"

## TECHNICAL REQUIREMENTS

- Single HTML file with embedded Three.js script
- Use Three.js via CDN
- Responsive canvas (fills viewport)
- RequestAnimationFrame for rendering loop
- Separate game tick logic (setInterval or custom timer for snake movement)
- Clean code with comments

## VISUAL EFFECTS

- Camera slightly follows snake head
- Food has rotation animation and pulsing scale
- Snake segments have subtle border or wireframe
- Background dark theme with neon green snake

## EXAMPLE CODE STRUCTURE

The output must be a standalone index.html file that I can save and open in a browser. No external dependencies except Three.js.
