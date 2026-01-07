import {FC, memo} from "react";
import {app} from "@src/app/app.controller";
import {router} from "@src/infra/router";
import {GameMenu} from "@src/app/menu-wrapper/game-menu/game-menu";

export const MenuWrapper: FC = memo(() => {

    if (app.isAuthorized) {
        router.goto('/game');
        return null;
    }

    return <GameMenu/>;
});