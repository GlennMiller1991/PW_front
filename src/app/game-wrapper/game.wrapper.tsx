import {FC, memo} from "react";
import {app} from "@src/app/app.controller";
import {router} from "@src/infra/router";

import {Game} from "@src/app/game-wrapper/game/game";

export const GameWrapper: FC = memo(() => {
    if (!app.isAuthorized) {
        router.goto('/');
        return null;
    }

    return <Game/>;
})