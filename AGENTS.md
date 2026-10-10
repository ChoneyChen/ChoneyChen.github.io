# Personal homepage interaction rules

The user's direct input has priority over animation and automatic positioning.

- Preserve native wheel, trackpad, touch, scrollbar and keyboard scrolling. Do not cancel scroll input, lock inertia, accumulate wheel thresholds into page jumps, or animate resistance while a gesture is active.
- The latest instruction on 2026-10-10 cancels all page snapping and damping. Preserve free native scrolling. Do not add CSS scroll-snap, JavaScript inertia/spring controllers, scrollend positioning, thresholds or fixed page heights. Mature alternatives are research options only until the user chooses one.
- Keep chapter interiors freely readable. Only explicit chapter links align opening strips below the header. Preserve language changes, reading-layer expansion and close-on-leave without automatic repositioning.
- All other presentation animations run at 0.6 of their previously accepted speed, with duration and choreography intervals divided by 0.6. Keep direct dragging, range-control mapping and input feedback tied to the pointer; time-scale automatic returns, not the gesture itself. Preserve zero-duration/reduced-motion overrides.
- Avoid per-frame React state for visual-only motion, batch geometry reads before writes, and stop WebGL rendering offscreen or at rest.
- Expandable reading layers use intrinsic grid-track reveals, never Motion `height: auto` measurement (it restores scroll position). On exit, hide and disable interaction immediately; defer structural collapse until native scrolling ends. That event only releases layout, never drives scroll. Same-chapter layer auto-close requires a real reading gesture, so focus/layout re-snapping cannot dismiss newly opened information.
- Preserve chapter-top calibration below the fixed header, default-closed reading layers, reversible entrances, close-on-leave behavior and English-first EN/ZH content.
- Information belongs to Tianyi / Choney Chen. Keep personal contributions, team outcomes and proposed research distinct. Current FYP display name is U-IMPROVE, following the supplied Tianyi.pptx. Do not display a phototherapy-mask 3D model.
- Every substantive experience has one canonical detail location. Directions contain future questions, Methods contain working practices, Tools contain the personal research workflow, and Archive contains education/CAN201/ISA305 plus links to other records. Do not duplicate project descriptions, metrics or awards in these sections. Keep English and Chinese equivalent, and derive counts from the records displayed.

These priorities were clarified by the user on 2026-10-10.
