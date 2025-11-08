import styles from './top-panel.module.css';
import {Logo} from "@src/app/logo/logo.view";
import {useAppContext} from "@src/app/app.context";
import {observer} from 'mobx-react-lite';

import {authRequest} from "@src/request/impl/auth.request";
import {FC, PropsWithChildren} from "react";

export const TopPanelView: FC<PropsWithChildren> = observer(({
                                                                 children,
                                                             }) => {
    const app = useAppContext();

    return (
        <div className={styles.container}>
            <Logo/>
            {
                !app.isAuthorized &&
                <div ref={(node) => {
                    if (!node) return;
                    app.google!.accounts.id.initialize({
                        client_id: process.env.GOOGLE_APP_ID!,
                        callback: async ({credential}) =>
                            authRequest(credential)
                    });

                    app.google!.accounts.id.renderButton(node, {
                        type: 'icon',
                    });

                }}/>
            }
            {
                children
            }
        </div>
    )
});



