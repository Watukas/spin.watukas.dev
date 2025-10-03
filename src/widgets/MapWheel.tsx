import React, { useState, useRef, useEffect } from "react";
import "./Wheel.css";
import { playTickSound } from "../util/sounds";
import { getRotation } from "../util/wheels";

interface SpinnableMapWheelProps {
	onFinish: (result: MapInfo) => void;
	onMiddleClick?: () => void;
	onRightClick?: () => void;
	size?: number;
	segments: MapInfo[];
}

export interface MapInfo {
	label: string;
	image: string;
}

const SpinnableMapWheel: React.FC<SpinnableMapWheelProps> = ({
	onFinish,
	onMiddleClick,
	onRightClick,
	segments,
	size = 250,
}) => {
	const wheelRef = useRef<HTMLDivElement | null>(null);
	const [rotation, setRotation] = useState(0);
	const [spinning, setSpinning] = useState(false);

	useEffect(() => {
		if (segments.length == 1) setRotation(0);
	}, [segments]);

	const DURATION = 4000 - segments.length * 250;
	const angle = 360 / segments.length;

	useEffect(() => {
		const node = wheelRef.current;
		if (!node) return;

		function onTransitionEnd(e: TransitionEvent) {
			if (e.propertyName !== "transform")
				return;
			if (e.target != node)
				return;
			const normalized = ((rotation % 360) + 360) % 360;
			const pointerAngle = (360 - normalized) % 360;
			const index = Math.floor((pointerAngle + angle / 2) / angle) % segments.length;

			setSpinning(false);
			onFinish(segments[index]);
		}

		node.addEventListener("transitionend", onTransitionEnd);
		return () => node.removeEventListener("transitionend", onTransitionEnd);
	}, [rotation, segments, onFinish]);

	const [_, setCurrentTickIndex] = useState<number>(-1);

	useEffect(() => {
		if (!spinning) return;

		let animationFrame: number;
		let start: number | null = null;
		let lastTickTime = 0;
		const initialRotation = rotation;
		const duration = DURATION;
		const anglePerSegment = 360 / segments.length;

		function animate(now: number) {
			if (start === null) start = now;
			const elapsed = now - start;
			const t = Math.min(elapsed / duration, 1);

			const currentRotation = getRotation(wheelRef.current!) || initialRotation;

			const normalized = ((currentRotation % 360) + 360) % 360;
			const pointerAngle = (360 - normalized) % 360;
			const index = Math.floor((pointerAngle + anglePerSegment / 2) / anglePerSegment) % segments.length;

			setCurrentTickIndex(currentIndex => {
				if (index != currentIndex && now - lastTickTime > 30) {
					lastTickTime = now;
					const pitch = 0.8 + 0.4 * t;
					playTickSound(undefined, pitch);
				}
				return index;
			});

			if (t < 1) {
				animationFrame = requestAnimationFrame(animate);
			}
		}

		animationFrame = requestAnimationFrame(animate);

		return () => cancelAnimationFrame(animationFrame);
		// eslint-disable-next-line
	}, [spinning, rotation, segments.length]);

	function spin(e: React.MouseEvent) {
		e.preventDefault();
		if (e.button == 1) {
			onMiddleClick?.();
			return;
		}
		if (spinning || segments.length < 2 || e.button != 0)
			return;
		setSpinning(true);
		const extraTurns = Math.floor(Math.random() * 3) + 4;
		const offset = Math.random() * 360;
		setRotation((r) => r + extraTurns * 360 + offset);
	}

	return (
		<div className="wheel-wrapper"
			onContextMenu={e => {
				e.preventDefault();
				onRightClick?.();
			}}
		>
			<div className="pointer wabove">▼</div>

			<div className="wheel-container" style={{width: size}}>

				<div
					ref={wheelRef}
					onMouseDown={spin}
					className="wheel"
					style={{
						width: size,
						height: size,
						transform: `rotate(${rotation}deg)`,
						transition: spinning
							? `transform ${DURATION}ms cubic-bezier(.33,1,.68,1)`
							: "none",
					}}
				>
					{segments.map((map, i) => {
						const rotate = i * angle;

						const cx = 50, cy = 47;
						const startAngle = -angle / 2;
						const endAngle = angle / 2;
						const toRad = (deg: number) => (deg * Math.PI) / 180;

						const arcPoints: string[] = [];
						const arcSteps = Math.max(6, Math.ceil(angle / 6));
						for (let s = 0; s <= arcSteps; ++s) {
							const a = startAngle + (endAngle - startAngle) * (s / arcSteps);
							const x = cx + 50 * Math.cos(toRad(a - 90));
							const y = cy + 50 * Math.sin(toRad(a - 90));
							arcPoints.push(`${x}% ${y}%`);
						}

						const center = `50% 48%`;
						const polygon = `polygon(${center}, ${arcPoints.join(", ")})`;
						return (
							<div
								key={map.label}
								className="segment-label"
								style={{
									position: "absolute",
									top: 0, left: 0,
									width: "100%", height: "100%",

									transform: `rotate(${rotate}deg)`,
									clipPath: polygon,

									backgroundImage: `url(${map.image})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
								}}
							>
								<span>{map.label}</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default SpinnableMapWheel;
