import { useEffect, useRef, useState } from "react";
import "./App.css";
import TeamBox from "./widgets/TeamBox";
import SpinnableWheel from "./widgets/Wheel";
import { separateRoll } from "./util/RollOption";
import SpinnableMapWheel, { type MapInfo } from "./widgets/MapWheel";

const allMaps: MapInfo[] = [
	{ label: "Anubis", image: "/maps/de_anubis.png" },
	{ label: "Nuke", image: "/maps/de_nuke.png" },
	{ label: "Inferno", image: "/maps/de_inferno.png" },
	{ label: "Mirage", image: "/maps/de_mirage.png" },
	{ label: "Overpass", image: "/maps/de_overpass.png" },
	{ label: "Vertigo", image: "/maps/de_vertigo.png" },
	{ label: "Ancient", image: "/maps/de_ancient.png" },
	{ label: "Dust II", image: "/maps/de_dust2.png" },
	//{ label: "Train", image: "/maps/de_train.png" },
	//{ label: "Italy", image: "/maps/cs_italy.png" },
	{ label: "Office", image: "/maps/cs_office.png" },
	//{ label: "Agency", image: "/maps/cs_agency.png" }
]

function App() {

	const [input, setInput] = useState(localStorage.getItem("people-input") ?? "");
	const [editing, setEditing] = useState(false);

	const [mapView, setMapView] = useState(false);
	const [bannedMaps, setBannedMaps] = useState<MapInfo[]>([]);

	const mapSegments = allMaps.filter(m => !bannedMaps.includes(m));

	useEffect(() => {
		localStorage.setItem("people-input", input)
	}, [input])

	const people = [...new Set(input.split("\n").map(s => s.trim()).filter(s => s.length > 0))].sort();

	useEffect(() => {
		if (people.length == 0) setEditing(true)
	}, [people])

	const [members, setMembers] = useState([[], []] as string[][]);
	const removeMember = (name: string) => {
		let copy = [...members]
		setMembers(copy.map(a => a.filter(n => n != name)))
	}

	const firstMax = Math.ceil(people.length / 2);

	const ref = useRef<HTMLDivElement>(null);
	const scale = useScale(ref);

	const segments = people.filter(p => !members.flat().includes(p));

	const rollOption = separateRoll();
	const target =
		  segments.length == 0 ? -1
		: segments.length == 2 ? -2
		: rollOption.target(members);


	let content;

	if (mapView) {
		content = <div style={{display:"flex", flexDirection:"column", alignItems:"center"}}>

			<SpinnableMapWheel segments={mapSegments} onFinish={result => setBannedMaps([...bannedMaps, result])}
				onMiddleClick={() => setMapView(false)}
				onRightClick={() => setBannedMaps([])}
			/>

			<div style={{display:"flex", gap:8, marginTop:16, transition:"all 0.5s ease-in-out"}}>
				{bannedMaps.map(m =>
					<div key={m.label} title={m.label} onClick={() => setBannedMaps(bannedMaps.filter(x => x != m))}>
						<div style={{ position: "relative", display: "inline-block", height: 48 }}>
							<img src={m.image} style={{ height: 48 }}/>
							<div
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: "100%",
									background: "rgba(255,0,0,0.3)",
									backdropFilter: "brightness(1) blur(0px)",
								}}
							/>
							<span style={{
								position:"absolute",
								top: 0, left: 0, width:"100%", height:"100%",
								textAlign: "center", fontSize: 32,
								color: "red", textShadow: "0 0 4px black",
								userSelect: "none"
							}}>X</span>
							</div>
					</div>
				)}
			</div>
		</div>
	} else {
		content = <>
			<TeamBox
				key="T"
				color="#eca100ff"
				name="Team 1"
				max={firstMax}
				members={members[0]}
				onNameClick={removeMember}
				unfocused={target == 1}
			/>

			{
			editing ?
				<div style={{display:"flex", flexDirection:"column", gap:8}}>
					<textarea style={{fontSize:Math.min(17, 210 / input.split("\n").length)}} spellCheck={false} className="name-list" autoFocus value={input} onChange={e => setInput(e.target.value)}
						onBlur={_ => setEditing(false)}
					/>
					<span style={{fontFamily:"monospace"}}>{firstMax} v {people.length - firstMax}</span>
				</div>
			: segments.length == 0 ?
				<div style={{cursor:"pointer", fontSize: 48, alignSelf:"center"}}
					onMouseDown={e => e.button == 1 && setMapView(true)}
					onClick={() => setMembers([[], []])}
				>
					👌
				</div>
			: <SpinnableWheel
				splitTarget={target == -2}
				segments={segments}
				onMiddleClick={() => setMapView(true)}
				onRightClick={() => setEditing(!editing)}
				onFinish={(result) => {
					const copy = [...members]
					if (rollOption.add)
						rollOption.add(result.label, people.length, copy);
					else {
						if (target == -2) {
							copy[1].push(result.label);
							copy[0].push(segments.find(s => s != result.label)!);
						} else  {
							copy[target].push(result.label);
						}
					}
					setMembers(copy);
				}}
			/>
			}

			<TeamBox
				key="CT"
				color="#173682"
				name="Team 2"
				max={people.length - firstMax}
				members={members[1]}
				onNameClick={removeMember}
				unfocused={target == 0}
			/>
		</>
	}

	return (
		<div ref={ref} style={{
			transform:"scale(" + scale + ")",
			display: "flex",
			padding: 64,
			gap: 128,
			transition: "transform 0.5s ease-in-out"
		}}>
			{content}
		</div>
	);
}

function useScale(ref: React.RefObject<HTMLDivElement | null>) {
	const [scale, setScale] = useState(1);

    useEffect(() => {
        function handle() {
            if (!ref.current) return;
            const containerWidth = ref.current.offsetWidth;
            const containerHeight = ref.current.offsetHeight;
            const scaleX = window.innerWidth / containerWidth;
            const scaleY = window.innerHeight / containerHeight;
            setScale(Math.min(scaleX, scaleY));
        }

        handle();
        window.addEventListener("resize", handle);

        let observer: ResizeObserver | undefined;
        if (ref.current) {
            observer = new ResizeObserver(handle);
            observer.observe(ref.current);
        }

        return () => {
            window.removeEventListener("resize", handle);
            if (observer && ref.current) observer.disconnect();
        };
    }, [ref]);

    return scale;
}

export default App;
