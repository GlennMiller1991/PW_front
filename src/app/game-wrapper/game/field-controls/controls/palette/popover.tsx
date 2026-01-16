import React, {createContext, FC, PropsWithChildren, useContext} from "react";
import {useFlag} from "@src/infra/flag/useFlag";
import {Flag} from "@src/infra/flag/flag";
import {calculateCssPosition, IRectPosition} from "@src/app/_components/buttons/stating/stating.button";

export const Popover: FC<PropsWithChildren<{ position: IRectPosition }>> = ({
                                                                                children,
                                                                                position
                                                                            }) => {

    const {flag} = useFlag();
    children = React.Children.toArray(children).filter(React.isValidElement);
    if (React.Children.toArray(children).length < 2) throw new Error("Unexpected children");

    const shouldBeBtn = React.Children.toArray(children).filter((e, i) => !i);
    const rest = React.Children.toArray(children).filter((e, i) => !!i);
    return (
        <FlagContext value={flag}>
            <div style={{position: 'relative'}}>
                {
                    shouldBeBtn
                }

                <PopoverContent>

                    <div style={{
                        position: 'absolute', width: 0, height: 0, zIndex: 1, pointerEvents: 'all',
                        ...calculateCssPosition(position)
                    }}>
                        {rest}
                    </div>
                </PopoverContent>

            </div>
        </FlagContext>
    )
}

const PopoverContent: FC<PropsWithChildren> = ({
                                                   children,
                                               }) => {

    const flag = useFlagContext();

    return flag.state && children;
}

const FlagContext = createContext<Flag>(null as any);

export function useFlagContext() {
    return useContext(FlagContext);
}

