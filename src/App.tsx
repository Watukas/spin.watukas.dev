import { useEffect, useRef, useState } from "react";
import "./App.css";
import TeamBox from "./widgets/TeamBox";
import SpinnableWheel from "./widgets/Wheel";
import { fastRoll, separateRoll } from "./util/RollOption";

function App() {

	const [input, setInput] = useState([
		"Watukas",
		"Ikiliikkuja",
		"Oire",
		"Jauuu",
		"Pumppu",
		"oMazes",
		"Keksih",
		"Arde",
		"Cauze",
		"Aksuw"
	].join("\n"));

	const [editing, setEditing] = useState(false);

	const people = input.split("\n").map(s => s.trim()).filter(s => s.length > 0).sort();

	const [members, setMembers] = useState([[], []] as string[][]);
	const removeMember = (name: string) => {
		let copy = [...members]
		setMembers(copy.map(a => a.filter(n => n != name)))
	}

	const firstMax = Math.ceil(people.length / 2);
	
	const ref = useRef<HTMLDivElement>(null);
	const scale = useScale(ref.current!);

	const segments = people.filter(p => !members.flat().includes(p));
	
	const rollOption = separateRoll();
	const target =
		  segments.length == 0 ? -1
		: segments.length == 2 ? -2
		: rollOption.target(members);

	return (
		<div ref={ref} style={{
			transform:"scale(" + scale + ")",
			display: "flex",
			padding: 128,
			gap: 128,
		}}>
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
				<textarea spellCheck={false} className="name-list" autoFocus value={input} onChange={e => setInput(e.target.value)}
					onBlur={_ => setEditing(false)}
				/>
			: segments.length == 0 ?
				<div style={{cursor:"pointer", fontSize: 48, alignSelf:"center"}}
					onClick={() => setMembers([[], []])}
				>
					👌
				</div>
			: <SpinnableWheel
				splitTarget={target == -2}
				segments={segments}
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
		</div>
	);
}

function useScale(ref: HTMLDivElement | null) {
    const [info, setInfo] = useState({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});
    const handle = () => setInfo({ratio:window.devicePixelRatio, width:window.innerWidth, height:window.innerHeight});

    useEffect(() => {
        window.addEventListener('resize', handle);
        return () => window.removeEventListener('resize', handle);
    }, []);

    const width = ((ref?.clientWidth ?? 1028) + 30) / info.ratio;
    const height = ((ref?.clientHeight ?? 530) + 30) / info.ratio;
    let scaleWidth = (1 / (width / info.width)) / info.ratio;
    let scaleHeight = (1 / (height / info.height)) / info.ratio;
    return Math.min(scaleWidth, scaleHeight);
}

export default App;
