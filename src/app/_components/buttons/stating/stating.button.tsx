import {IButtonDetailedProps} from "@src/infra/utils/type-utils";
import {FC, MouseEvent, FocusEvent, memo, JSX, CSSProperties, useMemo, useEffect, useCallback} from "react";
import {useFlag} from "@src/infra/flag/useFlag";
import {BaseButton} from "@src/app/_components/buttons/base/base.button";
import styles from './stating-button.module.css';
import {debounce} from "@fbltd/async";
import {cls} from "@src/app/app.view";

type IRectPosition = 'left' | 'top' | 'right' | 'bottom' | 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom';

type IStatingButton = IButtonDetailedProps &
    {
        enabledContent: JSX.Element
        contentPosition?: IRectPosition;
    }

export const StatingButton: FC<IStatingButton> = memo(({
                                                           onBlur,
                                                           onFocus,
                                                           onMouseDown,
                                                           enabledContent,
                                                           children,
                                                           contentPosition = 'leftTop',
                                                           style = {},
                                                           className,
                                                           ...props
                                                       }) => {
    const {flag} = useFlag();
    let position = style.position ?? 'relative';
    if (position === 'static')
        position = 'relative';

    const onBlurMemoized = useMemo(() => {
        return debounce((e: FocusEvent<HTMLButtonElement>) => {
            onFocusMemoized.dispose();
            onBlur?.(e);
            flag.off();
        }, 20);
    }, []);

    const onFocusMemoized = useMemo(() => {
        return debounce((e: FocusEvent<HTMLButtonElement>) => {
            onBlurMemoized.dispose();
            if (e.currentTarget && e.target !== e.currentTarget) return;

            onFocus?.(e);
            flag.on();
        }, 20);
    }, []);

    const onMouseDownMemoized = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        if (event.currentTarget !== event.target) return;

        onBlurMemoized.dispose();
        onFocusMemoized.dispose();

        onMouseDown?.(event)
        flag.invert();
    }, [])

    useEffect(() => onBlurMemoized.dispose, []);

    return <BaseButton
        className={cls(styles.active, className)}
        style={{
            ...style,
            position
        }}

        tabIndex={1}
        onMouseDown={onMouseDownMemoized}
        onBlur={onBlurMemoized}
        onFocus={onFocusMemoized}
        onKeyDown={e => {
            if (e.key !== 'Escape') return;
            if (!flag.state) return;

            onBlurMemoized.dispose();
            onFocusMemoized.dispose();

            flag.off();
            (document.activeElement as any)?.blur?.()
        }}
        {...props}>

        {
            children
        }

        <div className={styles.statingButton}
             style={calculateCssPosition(contentPosition)}
        >
            {
                // flag.state &&
                enabledContent
            }
        </div>


    </BaseButton>
});

function calculateCssPosition(pos: IRectPosition): CSSProperties {
    const styles: CSSProperties = {};
    pos = pos.toLowerCase() as typeof pos;
    const isLeft = pos.indexOf('left') !== -1;
    const isTop = pos.indexOf('top') !== -1;

    if (isLeft) {
        styles.right = '0';
    } else {
        styles.left = '0';
    }

    if (isTop) {
        styles.bottom = '0';
    } else {
        styles.top = '0';
    }

    return styles;
}