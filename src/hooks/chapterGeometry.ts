/** The opening strip, rather than an assumed uniform section padding, is the visual anchor. */
export function chapterInset(sectionTop: number, stripTop: number, home = false): number {
  return home ? 0 : 96 - (stripTop - sectionTop);
}
