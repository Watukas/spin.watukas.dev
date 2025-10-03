export function getRotation(el: HTMLElement): number {
	const style = window.getComputedStyle(el);
	const transform = style.transform;

	if (transform === "none") return 0;

	const values = transform.match(/matrix\(([^)]+)\)/)?.[1].split(", ") ?? [];
	const a = parseFloat(values[0]);
	const b = parseFloat(values[1]);

	let angle = Math.atan2(b, a) * (180 / Math.PI);
	if (angle < 0) angle += 360;

	return angle;
}