import {JSX, useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/_components/opening/loader";
import c from "classnames";
import {router} from "@src/infra/router";
import {useRaceStream} from "@fbltd/async";
import {GameWrapper} from "@src/app/game-wrapper/game.wrapper";
import {MenuWrapper} from "@src/app/menu-wrapper/menu.wrapper";
import {ErrorBoundary} from "@src/app/_components/error-boundary/error-boundary";
import {RulesView} from "@src/app/rules/rules.view";
import {AboutView} from "@src/app/about/about.view";

export const cls = c;

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    const {value: {segments}} = useRaceStream({segments: router.segments});


    if (!controller.isReady)
        return <Loader text={'PIXEL WAR'}/>;

    let content: JSX.Element;
    switch (segments[0]) {
        case '/':
            content = <MenuWrapper/>;
            break;
        case '/game':
            content = <GameWrapper key={'static'}/>;
            break;

        case '/rules':
            content = <RulesView/>
            break;

        case '/about':
            content = <AboutView/>
            break;

        case '/error':
            content = <Loader text={'ERROR'}/>
            break;

        default:
            content = <Loader text={'404'}/>;
            break;
    }

    return (
        <ErrorBoundary key={segments[0]}>
            {content}
        </ErrorBoundary>
    )
});


