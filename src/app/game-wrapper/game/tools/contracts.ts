import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {IButtonDetailedProps} from "@src/infra/utils/type-utils";

export type IFieldControlBaseProps = {
    active?: boolean,
    gameController: GameController,
} & IButtonDetailedProps;