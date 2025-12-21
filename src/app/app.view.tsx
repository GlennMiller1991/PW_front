import {FC, useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/opening/loader";
import {TopPanelView} from "@src/app/top-panel/top-panel.view";
import {AppContext} from "@src/app/app.context";
import {GameView} from "@src/app/game/game.view";
import {GameController} from "@src/app/game/game.controller";
import {Spectator} from "@src/app/game-roles/spectator";
import {GameStatusChanging} from "@src/app/game/gameStatusChanging";
import {PlayerView, SpectatorView} from "@src/app/spectator-view/spectator.view";
import c from "classnames";

export const cls = c;

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    if (!controller.isReady) return <Loader backgroundText={'PIXEL WAR'}/>;
    return (
        <AppContext value={controller}>
            <div style={{position: 'fixed', inset: 0, display: 'grid', gridTemplateRows: 'max-content 1fr'}}>
                {
                    controller.isInitSuccessful ?
                        <AppContentView/> :
                        <Loader backgroundText={'ERROR'}/>
                }
            </div>
        </AppContext>

    );
});


export const AppContentView: FC = observer(() => {
    const [gameCont] = useState(() => new GameController());
    const gameStatusCont = gameCont.gameStatusChanging;
    return (
        <>
            <TopPanelView/>
            <div style={{position: 'relative'}}>
                <GameView controller={gameCont}/>
                {
                    gameCont.domWasMounted &&
                    <>
                        {
                            gameStatusCont.isSpectator &&
                            <SpectatorView onProceed={() => (gameStatusCont.status as Spectator).complete()}/>
                        }
                        {
                            !gameStatusCont.isSpectator &&
                            <PlayerView gameController={gameCont}/>
                        }
                    </>
                }
            </div>

        </>
    )
});


