import {useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/_components/opening/loader";
import c from "classnames";
import {router} from "@src/infra/router";
import {useRaceStream} from "@fbltd/async";
import {GameWrapper} from "@src/app/game-wrapper/game.wrapper";
import {MenuWrapper} from "@src/app/menu-wrapper/menu.wrapper";

export const cls = c;

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    const {value: {segments}} = useRaceStream({segments: router.segments});


    if (!controller.isReady)
        return <Loader text={'PIXEL WAR'}/>;

    if (!controller.isInitSuccessful)
        return <Loader text={'ERROR'}/>


    switch (segments[0]) {
        case '/':
            return <MenuWrapper/>;

        case '/game':
            return <GameWrapper key={'static'}/>;

        default:
            return <Loader text={'WRONG PAGE'}/>;
    }
});

