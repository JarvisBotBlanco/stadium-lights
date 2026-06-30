# Hipico Light Show Design

## Goal

Convert the project from a mapped stadium-pixel demo into a simpler, more reliable crowd light show for a single Hipico grandstand or event area.

The product should work from one QR/URL, avoid exact seat or grid mapping, and prioritize a strong live-show experience over perfect images. Every participating phone must be useful with only its screen. Flashlight and haptics are optional enhancements when the device supports them.

## Non-Goals

- No exact seat, table, section, or grid selection.
- No pixel-perfect images, text, flags, or venue-scale drawings.
- No dependency on phone flashlight support.
- No native mobile app in this phase.
- No ultrasonic audio sync in this phase.
- No complex timeline editor in the first implementation.

## Product Model

The show runs from a single event URL:

```txt
/?event=hipico-demo
```

The audience joins the event and becomes "ready". The operator sees how many devices are ready and triggers scenes. Scenes are designed as collective lighting effects that work without knowing where each person is standing or sitting.

Each client receives a stable random group number on join, such as 0-7. Effects can use this group to create variation, chase behavior, sparkle, and burst effects without requiring a physical map.

## Audience UX

The audience flow should be short:

1. Scan the QR.
2. Tap `Entrar al show`.
3. The app enters show mode and prepares optional capabilities.
4. The user sees one clear ready state:
   - `Listo con pantalla`
   - `Listo con pantalla + flash`
5. During the show, the user holds the phone up with the screen facing the track or crowd.

The audience screen should avoid technical setup language. Flash permission may require camera access; if that prompt appears and the user declines, the app continues with screen-only mode.

## Device Capabilities

The client should expose a small capability model:

```txt
screen: always available
torch: optional
haptics: optional
wakeLock: optional
fullscreen: optional
```

Screen output is the primary light source and must always work.

Torch output is best-effort. The app should try to enable it only after user interaction. If torch setup fails, the client reports screen-only readiness and continues participating.

Haptics should use the `web-haptics` package if it integrates cleanly with this vanilla JavaScript project. Haptics are feedback, not core show output. They should be subtle:

- tap/selection feedback on user actions,
- success feedback when ready,
- warning feedback when torch fails but fallback succeeds,
- occasional synchronized pulses only when they add to the show.

## Flashlight Behavior

The web implementation should use a local wrapper around browser APIs rather than depending on a flashlight library.

The wrapper should try browser-supported torch paths using `navigator.mediaDevices.getUserMedia` and track constraints such as `torch`. It should keep the camera stream private to the client and stop it when the user leaves show mode or the page unloads.

Torch support is expected to vary by browser and OS. Android Chromium-based browsers are the most likely target. iOS Safari should be treated as screen-only unless testing proves otherwise.

Operator controls should not expose device-specific complexity. A scene may request torch behavior, but each client decides whether it can execute that part.

## Operator UX

The operator console should become a live-show controller, not a venue mapper.

Primary elements:

- event ID and audience URL/QR,
- ready device count,
- screen-only count,
- screen plus flash count,
- connection health,
- large scene buttons,
- immediate `Apagar` button,
- dry-run mode that logs the scene without broadcasting it.

Initial scene buttons:

- `Blanco`
- `Color Hipico`
- `Pulso`
- `Flash`
- `Estrobo`
- `Sparkle`
- `Rafaga`
- `Apagar`

The existing layout editor, venue canvas, seat picker, table selection, and grid-specific preview should be removed from the main flow.

## Scene Model

A scene is a compact command sent to all clients:

```json
{
  "action": "strobe",
  "color": "#ffffff",
  "duration": 3000,
  "intensity": 1,
  "tempo": 120,
  "useTorch": true,
  "executeAt": 1790000000000
}
```

Each client executes the scene using its own capabilities and group assignment.

Core actions:

- `solid`: show a color until another command arrives.
- `off`: clear screen and torch.
- `flash`: short full-brightness burst.
- `pulse`: smooth fade in/out.
- `strobe`: rapid on/off pulses for a limited duration.
- `sparkle`: randomized short flashes across devices.
- `burst`: group-based chase or call-response effect.

Effects must have bounded durations unless they are explicit state commands like `solid` or `off`.

## Sync

Keep the existing server time synchronization pattern. The server should send `executeAt` timestamps far enough in the future to tolerate mobile network jitter. The default lead time should be configurable and start at 1000 ms.

The client should ignore stale timed commands whose execution window has already passed.

## Server Architecture

The current Node, Express, and Socket.IO stack is acceptable for this phase.

Suggested server modules:

- `EventService`: creates and tracks simple events.
- `ParticipantService`: tracks ready clients, capabilities, group ID, and connection status.
- `SceneBroadcastService`: validates and broadcasts scene commands.

The existing layout-specific services can either be removed from the main path or left unused temporarily while the new simple show flow is implemented.

## Client Architecture

Suggested client modules:

- `LightDevice`: combines screen, torch, haptics, fullscreen, and wake lock capabilities.
- `ScreenLight`: renders color and animation to the page.
- `TorchLight`: best-effort browser torch wrapper.
- `HapticsFeedback`: thin wrapper around `web-haptics` with safe no-op fallback.
- `SceneRunner`: executes scene commands with requestAnimationFrame and timers.
- `AudienceApp`: join flow, socket connection, ready state, and status display.

## Error Handling

Audience client:

- If socket disconnects, show reconnecting state but keep the last visual safe.
- If torch permission is denied, continue with screen-only mode.
- If fullscreen or wake lock fails, continue without blocking.
- If haptics are unsupported, use no-op feedback.
- If a scene fails, clear torch and keep the screen controllable.

Operator:

- Disable scene buttons until connected to the server.
- Show participant counts and capability counts.
- Keep `Apagar` available whenever the socket is connected.
- Log sent scenes and server acknowledgements.

## Testing And Verification

Minimum test coverage:

- scene validation,
- participant join and capability reporting,
- stable group assignment,
- scene timing payload generation,
- screen-only fallback when torch setup fails,
- scene runner behavior for `solid`, `off`, `flash`, `strobe`, and `sparkle`.

Manual verification:

- desktop browser joins and receives screen scenes,
- Android Chrome attempts torch and falls back if unavailable,
- iPhone Safari joins in screen-only mode,
- reconnecting client can rejoin without seat selection,
- operator can send `Apagar` after any effect.

## Rollout Plan

Build this as the new default flow while keeping the existing project runnable during transition.

Implementation should first make the simple no-map show work with screen-only output. Then add haptics. Then add torch as optional capability. Finally simplify the operator UI and remove or isolate layout-specific controls.
