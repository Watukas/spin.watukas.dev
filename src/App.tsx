import { useEffect, useRef, useState } from "react";
import "./App.css";
import TeamBox from "./widgets/TeamBox";
import SpinnableWheel from "./widgets/Wheel";

function App() {
	const people = [
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
	].sort();

	const [members, setMembers] = useState([[], []] as string[][]);

	const addMember = (team: number, member: string) => setMembers(m => {
		const copy = [...m];
		copy[team] = [...copy[team], member];
		return copy;
	})

	const firstMax = Math.ceil(people.length / 2);
	const target = members.flat().length < firstMax ? 0 : 1;

	const ref = useRef<HTMLDivElement>(null);
	const scale = useScale(ref.current!);

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
				name="T-Team"
				max={firstMax}
				members={members[0]}
				unfocused={target == 1}
			/>
			<SpinnableWheel
				segments={people.filter((p) => !members.flat().includes(p))}
				onFinish={(result) => addMember(target, result.label)}
			/>
			<TeamBox
				key="CT"
				color="#173682"
				name="CT-Team"
				max={people.length - firstMax}
				members={members[1]}
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
