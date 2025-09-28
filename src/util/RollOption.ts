interface RollOption {
    label: string;

    add?: (rolled: string, max: number, teams: string[][]) => void;
    target: (teams: string[][]) => number;
}

export function fastRoll() : RollOption {
    return {
        label: "Fast",
        add: (rolled, _, teams) => {
            const firstMax = Math.ceil((teams[0].length + teams[1].length + 1) / 2);
            const target = teams.flat().length < firstMax ? 0 : 1;
            teams[target].push(rolled);
        },
        target: (teams) => {
            const firstMax = Math.ceil((teams[0].length + teams[1].length + 1) / 2);
            return teams.flat().length < firstMax ? 0 : 1;
        }
    }
}

export function separateRoll() : RollOption {
    return {
        label: "Separate",
        target: (teams) => {
            const min = teams.reduce(
                (minIdx, arr, i, all) => arr.length < all[minIdx].length ? i : minIdx, 0
			);
            return min;
            //return teams.flat().length % teams.length;
        }
    }
}