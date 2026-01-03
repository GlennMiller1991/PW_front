import styles from './top-panel.module.css';
import {Logo} from "@src/app/logo/logo.view";
import {observer} from 'mobx-react-lite';
import {BiLogOutCircle} from "react-icons/bi";
import {ButtonHTMLAttributes, DetailedHTMLProps, FC, HTMLAttributes, PropsWithChildren} from "react";
import {BaseButton} from "@src/app/top-panel/buttons/base.button";
import {app} from "@src/app/app.controller";

export const TopPanelView: FC<PropsWithChildren> = observer(({
                                                                 children,
                                                             }) => {

    return (
        <div className={styles.container}>
            <Logo/>
            <div>

                {
                    app.isAuthorized &&
                    <BaseButton
                        title={'Logout'}
                        style={{
                            ['--base_button_size']: '3em',
                        }}>
                        <BiLogOutCircle/>
                    </BaseButton>
                }
            </div>
        </div>
    )
});


export type IDetailedHTMLProps<T extends HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T>;
export type IReactBtnProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;



