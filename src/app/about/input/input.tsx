import {FC, memo} from "react";
import {cls} from "@src/app/app.view";
import styles from "./input.module.css";

type IInputProps = {
    name: string,
    asTextArea?: boolean,
    containerClass?: string,
    focusedBackgroundClass?: string,
    [key: string]: any
}
export const Input: FC<IInputProps> = memo(({
                                                name,
                                                asTextArea,
                                                containerClass,
                                                focusedBackgroundClass,
                                                ...props
                                            }) => {
    return (
        <div className={cls(styles.fieldContainer, containerClass)}>
            {
                asTextArea ?
                    <textarea className={cls(styles.input, styles.field, styles.textarea)}
                              {...props}
                    /> :
                    <input className={cls(styles.input, styles.field)}
                           {...props}
                    />
            }
            <div className={cls(styles.underField, props.value && styles.focusedDiv)}/>
            <div className={cls(styles.text, props.value && styles.focusedText)}>
                {name}
            </div>
        </div>
    )
})