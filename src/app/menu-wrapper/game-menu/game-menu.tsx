import {observer} from "mobx-react-lite";
import styles from './game-menu.module.css';
import {app, fonts} from "@src/app/app.controller";
import {cls} from "@src/app/app.view";
import {BaseButton} from "@src/app/_components/buttons/base.button";
import {authRequest} from "@src/infra/request/impl/auth.request";
import googleLogo from "@pic/google_px.webp";
import {router} from "@src/infra/router";

export const GameMenu = observer(() => {
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
                            PLAY
                        </BaseButton>

                        <div className={styles.loginServiceBtn}
                             style={{backgroundImage: `url(${googleLogo})`}}
                             title={'Google'}>
                            <div ref={(node) => {
                                if (!node) return;

                                app.google!.accounts.id.initialize({
                                    client_id: process.env.GOOGLE_APP_ID!,
                                    callback: async ({credential}) => {
                                        const res = await authRequest(credential);
                                        if (!res) return;

                                        router.goto('/game');
                                    }
                                });

                                app.google!.accounts.id.renderButton(node, {
                                    type: 'icon'
                                });


                            }}/>
                        </div>
                    </li>
                }

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

            </ul>

        </div>
    )
})

