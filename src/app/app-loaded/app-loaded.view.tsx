import {observer} from "mobx-react-lite";
import styles from './app-loaded.module.css';
import {memo, useState} from "react";
import {GameController} from "@src/app/game/game.controller";
import {app, fonts} from "@src/app/app.controller";
import {cls} from "@src/app/app.view";
import {BaseButton} from "@src/app/top-panel/buttons/base.button";
import {authRequest} from "@src/request/impl/auth.request";

export const AppLoaded = observer(() => {
    const [gameCont] = useState(() => new GameController());
    const gameStatusCont = gameCont.gameStatusChanging;


    return (
        <div className={cls(styles.container, 'flex_center')}
             style={{
                 fontFamily: fonts.pixel.family,
                 ['--font-family']: fonts.pixel.family
             }}>

            <h2>PIXEL WAR</h2>

            <ul className={styles.menu}>

                {
                    !app.isAuthorized &&
                    <li>
                        <BaseButton>
                            LOGIN
                        </BaseButton>

                        <div style={{width: 40, height: 40}}
                             ref={(node) => {
                                 if (!node) return;

                                 app.google!.accounts.id.initialize({
                                     client_id: process.env.GOOGLE_APP_ID!,
                                     callback: async ({credential}) =>
                                         authRequest(credential)
                                 });

                                 app.google!.accounts.id.renderButton(node, {
                                     type: 'icon'
                                 });


                             }}>
                            Hello
                        </div>


                    </li>
                }

                <li>
                    <BaseButton disabled={!app.isAuthorized}>
                        PLAY
                    </BaseButton>
                </li>
                <li>
                    <BaseButton>
                        CONTACTS
                    </BaseButton>
                </li>

                {
                    app.isAuthorized &&
                    <li>
                        <BaseButton onClick={() => app.logout()}>
                            LOGOUT
                        </BaseButton>
                    </li>
                }
            </ul>
            {/*<TopPanelView/>*/}

            {/*<div style={{position: 'relative'}}>*/}
            {/*    <GameView controller={gameCont}/>*/}
            {/*    {*/}
            {/*        gameCont.domWasMounted &&*/}
            {/*        <>*/}
            {/*            {*/}
            {/*                gameStatusCont.isSpectator &&*/}
            {/*                <SpectatorView onProceed={() => (gameStatusCont.status as Spectator).complete()}/>*/}
            {/*            }*/}

            {/*            <FieldControls gameController={gameCont}/>*/}
            {/*        </>*/}
            {/*    }*/}
            {/*</div>*/}
        </div>
    )
})