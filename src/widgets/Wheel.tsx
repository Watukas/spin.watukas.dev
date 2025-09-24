import React, { useState, useRef, useEffect } from "react";
import "./Wheel.css";

export interface SpinResult {
	index: number;
	label: string;
}

interface SpinnableWheelProps {
	segments: string[];
	onFinish: (result: SpinResult) => void;
	size?: number;
}

const looks = [
	"#d23b52ff",
	"#f59e0b",
	"#f97316",
	"#9fe976ff",
	"#a78bfa",
	"#fb7185"
];

const SpinnableWheel: React.FC<SpinnableWheelProps> = ({
	segments,
	onFinish,
	size = 250,
}) => {
	const wheelRef = useRef<HTMLDivElement | null>(null);
	const [rotation, setRotation] = useState(0);
	const [spinning, setSpinning] = useState(false);

	const DURATION = 4000;

	useEffect(() => {
		const node = wheelRef.current;
		if (!node) return;

		function onTransitionEnd(e: TransitionEvent) {
			if (e.propertyName !== "transform") return;
			const normalized = ((rotation % 360) + 360) % 360;
			const pointerAngle = (360 - normalized) % 360;
			const segmentAngle = 360 / segments.length;
			const index = Math.floor(pointerAngle / segmentAngle) % segments.length;

			setSpinning(false);
			onFinish({ index, label: segments[index] });
		}

		node.addEventListener("transitionend", onTransitionEnd);
		return () => node.removeEventListener("transitionend", onTransitionEnd);
	}, [rotation, segments, onFinish]);

	function spin() {
		if (spinning) return;
		setSpinning(true);
		const extraTurns = Math.floor(Math.random() * 3) + 4;
		const offset = Math.random() * 360;
		setRotation((r) => r + extraTurns * 360 + offset);
	}

	const segmentAngle = 360 / segments.length;
	const gradient = segments
		.map(
			(_, i) =>
				`${looks[i % looks.length]} ${i * segmentAngle}deg ${
					(i + 1) * segmentAngle
				}deg`
		)
		.join(", ");

	return (
		<div className="wheel-wrapper">
			<div className="wheel-container" style={{width: size}}>

				<div
					ref={wheelRef}
					onClick={spin}
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
					{segments.map((label, i) => (
						<div
							key={i}
							className="segment-label"
							style={{
								transform: `translate(-50%, -50%) rotate(${
									i * segmentAngle + segmentAngle / 2
								}deg) rotate(-90deg) translate(${size * 0.32}px)`,
							}}
						>
							<span>
								{label}
							</span>
						</div>
					))}
				</div>
			</div>

			<div className="pointer">◀</div>

		</div>
	);
};

export default SpinnableWheel;
