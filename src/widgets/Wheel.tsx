import React, { useState, useRef, useEffect } from "react";
import "./Wheel.css";
import { playTickSound } from "../util/sounds";
import { getRotation } from "../util/wheels";

export interface SpinResult {
	index: number;
	label: string;
}

interface SpinnableWheelProps {
	segments: string[];
	splitTarget?: boolean,
	onFinish: (result: SpinResult) => void;
	onMiddleClick?: () => void;
	onRightClick?: () => void;
	size?: number;
}

const looks = [
	"#d23b52ff",
	"#f59e0b",
	"#f97316",
	"#81cd59ff",
	"#a78bfa",
	"#dd52c8ff",
	"#fb7185"
];

const SpinnableWheel: React.FC<SpinnableWheelProps> = ({
	segments,
	onFinish,
	onMiddleClick, onRightClick,
	splitTarget = false,
	size = 250,
}) => {
	const wheelRef = useRef<HTMLDivElement | null>(null);
	const [rotation, setRotation] = useState(0);
	const [spinning, setSpinning] = useState(false);
	const [hovered, setHovered] = useState<number | null>(null);

	const DURATION = Math.max(1000, 5000 - segments.length * 250);

	useEffect(() => {
		const node = wheelRef.current;
		if (!node) return;

		function onTransitionEnd(e: TransitionEvent) {
			if (e.propertyName !== "transform")
				return;
			if (e.target != node)
				return;
			const normalized = ((rotation % 360) + 360 + 270) % 360;
			const pointerAngle = (360 - normalized) % 360;
			const segmentAngle = 360 / segments.length;
			const index = Math.floor(pointerAngle / segmentAngle) % segments.length;

			setSpinning(false);
			onFinish({ index, label: segments[index] });
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

		if (spinning || e.button != 0)
			return;
		setSpinning(true);
		const extraTurns = Math.floor(Math.random() * 3) + 2;
		const offset = Math.random() * 360;
		setRotation((r) => r + extraTurns * 360 + offset);
	}

	const segmentAngle = 360 / segments.length;

	const look = (i: number) => {
		if (i % looks.length == 0 && i == segments.length - 1)
			return looks[1];
		return looks[i % looks.length]
	}
	const gradient = segments
		.map(
			(_, i) =>
				`${look(i)} ${i * segmentAngle}deg ${
					(i + 1) * segmentAngle
				}deg`
		)
		.join(", ");

	return (
		<div className="wheel-wrapper"
			onContextMenu={e => {
				e.preventDefault();
				onRightClick?.();
			}}
		>

			{!splitTarget || <div className="pointer wleft">◀</div>}

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
						background: `conic-gradient(${gradient})`,
					}}
				>
					{segments.map((label, i) => {
						const r = i * segmentAngle + segmentAngle / 2;
						let transformation = `
							translate(-50%, -50%)
							rotate(${r}deg)
							rotate(-90deg)
							translate(${size * (segments.length == 2 ? 0.22 : 0.32)}px)
						`
						if (segments.length == 2 || (hovered == i && !spinning))
							transformation += `rotate(${- r - (rotation % 360) + 90}deg)`
						return <div
							key={label}
							className="segment-label"
							style={{
								transform: transformation, padding: 4
							}}
            				onMouseLeave={() => setHovered(null)}
						>
							<span onMouseEnter={() => setHovered(i)}>{label}</span>
						</div>
					})}
				</div>
			</div>

			<div className="pointer wright">{splitTarget ? "▶" : "◀"}</div>

		</div>
	);
};

export default SpinnableWheel;
