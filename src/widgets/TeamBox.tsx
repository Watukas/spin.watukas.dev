import "./TeamBox.css";

interface Props {
    name: string;
    color: string;
    max: number;
    members: string[];
    unfocused: boolean;
}

export default function TeamBox({color, name, max = 5, members, unfocused} : Props) {

    return <div className="team-container" style={{outlineColor: color, opacity:unfocused ? 0.5 : 1}}>

        <h1 style={{background: color}} className="team-title">{name}</h1>

        <div className="team-members">
            {[...Array(Math.max(members.length, max)).keys()].map(i => {
                const name = members[i] ?? "???";
                return <div key={i} className="team-member" style={{opacity:members[i] == null ? 0.5 : 1}}>
                    <span>{name}</span>
                </div>
            })}
        </div>

    </div>

}