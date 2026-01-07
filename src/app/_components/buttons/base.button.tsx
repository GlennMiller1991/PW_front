import {FC, memo} from "react";
import {cls} from "@src/app/app.view";
import styles from './base_button.module.scss';
import {IButtonDetailedProps} from "@src/infra/utils/type-utils";

export const BaseButton: FC<IButtonDetailedProps> = memo(({
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