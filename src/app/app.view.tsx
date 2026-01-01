import {FC, useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/opening/loader";
import {TopPanelView} from "@src/app/top-panel/top-panel.view";
import {AppContext} from "@src/app/app.context";
import {GameView} from "@src/app/game/game.view";
import {GameController} from "@src/app/game/game.controller";
import {Spectator} from "@src/app/game-roles/spectator";
import {FieldControls, SpectatorView} from "@src/app/spectator-view/spectator.view";
import c from "classnames";

export const cls = c;

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    return (
        <>
            {
                !controller.isReady &&
                <Loader text={'PIXEL WAR'}/>
            }

            {
                controller.isReady && !controller.isInitSuccessful &&
                <Loader text={'ERROR'}/>
            }

            <AppContext value={controller}>
                <div style={{position: 'fixed', inset: 0, display: 'grid', gridTemplateRows: 'max-content 1fr'}}>
                    <AppContentView/>
                </div>
            </AppContext>
        </>

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

                        <FieldControls gameController={gameCont}/>
                    </>
                }
            </div>

        </>
    )
});


