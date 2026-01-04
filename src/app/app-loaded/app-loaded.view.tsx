import {observer} from "mobx-react-lite";
import styles from './app-loaded.module.css';
import {useEffect, useState} from "react";
import {GameController} from "@src/app/game/game.controller";
import {app, fonts} from "@src/app/app.controller";
import {cls} from "@src/app/app.view";
import {BaseButton} from "@src/app/top-panel/buttons/base.button";
import {authRequest} from "@src/request/impl/auth.request";
import googleLogo from "@pic/google_px.webp";
import {GameView} from "@src/app/game/game.view";
import {FieldControls} from "@src/app/spectator-view/spectator.view";
import {useNavigate} from "react-router";

export const GameMenu = observer(() => {
    const navigate = useNavigate();
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

                        <div className={styles.loginServiceBtn}
                             style={{backgroundImage: `url(${googleLogo})`}}
                             title={'Google'}>
                            <div ref={(node) => {
                                if (!node) return;

                                app.google!.accounts.id.initialize({
                                    client_id: process.env.GOOGLE_APP_ID!,
                                    callback: async ({credential}) =>
                                        authRequest(credential)
                                });

                                app.google!.accounts.id.renderButton(node, {
                                    type: 'icon'
                                });


                            }}/>
                        </div>

                    </li>
                }

                <li>
                    <BaseButton disabled={!app.isAuthorized}
                                onClick={() => navigate('/game')}>
                        PLAY
                    </BaseButton>
                </li>

                <li>
                    <BaseButton>
                        SETTINGS
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

        </div>
    )
})

export const Game = observer(() => {
    const [gameCont] = useState(() => new GameController());

    useEffect(() => {
        return () => gameCont.dispose();
    }, []);


    return (
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <GameView controller={gameCont}/>
            <FieldControls gameController={gameCont}/>
        </div>
    );
})