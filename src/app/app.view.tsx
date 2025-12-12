import {FC, useState} from "react";
import {app, AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/opening/loader";
import {TopPanelView} from "@src/app/top-panel/top-panel.view";
import {AppContext} from "@src/app/app.context";
import {GameView} from "@src/app/game/game.view";
import {GameController, GameStatusChanging} from "@src/app/game/game.controller";
import {Spectator} from "@src/app/game-roles/spectator";

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
    const [gameStatusCont] = useState(() => new GameStatusChanging(gameCont));
    return (
        <>
            <TopPanelView>
                {
                    gameStatusCont.isSpectator &&
                    <SpectatorTopMenu onProceed={() => (gameStatusCont.status as Spectator).complete()}/>
                }
            </TopPanelView>
            <GameView controller={gameCont}/>
        </>
    )
});


type ISpectatorTopMenu = {
    onProceed: () => void;
}
export const SpectatorTopMenu: FC<ISpectatorTopMenu> = observer(({
                                                                     onProceed,
                                                                 }) => {

    if (!app.isAuthorized) return <div>You should authorize</div>

    return <button onClick={onProceed}>Play</button>
})