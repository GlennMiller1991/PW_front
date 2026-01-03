import {FC, memo} from "react";
import {cls} from "@src/app/app.view";
import {IReactBtnProps} from "@src/app/top-panel/top-panel.view";
import styles from './base_button.module.scss';

export const BaseButton: FC<IReactBtnProps> = memo(({
                                                        children,
                                                        className,
                                                        ...rest
                                                    }) => {

    return (
        <button
            className={cls(
            'flex_center',
            styles.styling,
            styles.sizing,
            className,
        )}
                {...rest}>
            {
                children
            }
        </button>
    )
})