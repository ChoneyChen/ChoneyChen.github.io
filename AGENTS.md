# Personal homepage interaction rules

The user's direct input has priority over animation and automatic positioning.

- Preserve native wheel, trackpad, touch, scrollbar and keyboard scrolling. Do not cancel scroll input, lock inertia, accumulate wheel thresholds into page jumps, or animate resistance while a gesture is active.
- Only align after both the gesture and native momentum have finished. The user widened the trigger on 2026-10-10: a chapter's actual top crossing the half-viewport line qualifies for release snapping; do not use the older 56–88px capture zone. Keep direction-aware approach checks, free scrolling in chapter interiors, and only a small correction after an opening has been passed. Leaving an aligned heading must never pull the visitor back to it.
- Native scrollend permits immediate next-frame handoff; do not add another wheel silence delay. Use a zero-bounce critically damped spring with a tiny C2 settling tail: position, velocity and acceleration match at the tail join, and end at exact rest without a jump. Start its clock on the first painted frame. Automatic velocity must never take precedence over a new human input.
- Any new input immediately cancels an automatic alignment. Layout changes, links, language switching, reading-layer expansion and focus changes must not trigger surprise scrolling.
- Preserve chapter-top calibration below the fixed header, default-closed reading layers, reversible entrances, close-on-leave behavior and English-first EN/ZH content.
- Information belongs to Tianyi / Choney Chen. Keep personal contributions, team outcomes and proposed research distinct. Current FYP display name is U-IMPROVE, following the supplied Tianyi.pptx. Do not display a phototherapy-mask 3D model.

These priorities were clarified by the user on 2026-10-10.
