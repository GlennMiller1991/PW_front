import {useState} from "react";
import {useRaceStream} from "@fbltd/async";
import {Flag} from "@src/infra/flag/flag";

export function useFlag(initial: boolean = false) {
    const [flag] = useState(() => new Flag(initial));

    useRaceStream({flag: flag.stateDep});

    return {
        flag,
        value: flag.state,
        invert: flag.invert,
        on: flag.on,
        off: flag.off,
        drop: flag.drop,
    }

}