/**
 * Animates element.scrollLeft to a target using spring physics.
 * Returns a cancel function — call it before starting a new animation on the same element.
 */
export function springScrollTo(
  el: HTMLElement,
  target: number,
  { stiffness = 180, damping = 22 } = {}
): () => void {
  let position = el.scrollLeft;
  let velocity = 0;
  let raf: number;
  let lastTime: number | null = null;

  function tick(time: number) {
    if (lastTime === null) {
      lastTime = time;
      raf = requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min((time - lastTime) / 1000, 0.064);
    lastTime = time;

    const force = -stiffness * (position - target) - damping * velocity;
    velocity += force * dt;
    position += velocity * dt;

    el.scrollLeft = position;

    if (Math.abs(position - target) < 0.5 && Math.abs(velocity) < 0.5) {
      el.scrollLeft = target;
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
