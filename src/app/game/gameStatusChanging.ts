import {Spectator} from "@src/app/game-roles/spectator";
import {Challenger} from "@src/app/game-roles/challenger";
import {Player} from "@src/app/game-roles/player";
import {makeAutoObservable} from "mobx";
import {GameController} from "@src/app/game/game.controller";

export class GameStatusChanging {
    status: Spectator | Challenger | Player;

    constructor(private gameController: GameController) {
        makeAutoObservable(this, {
            status: true,
        });

        this.startIteration();
    }

    get isSpectator() {
        return this.status instanceof Spectator;
    }

    get isChallenger() {
        return this.status instanceof Challenger;
    }

    get isPlayer() {
        return this.status instanceof Player;
    }

    async startIteration(): Promise<any> {
        do {
            let nextRole!: Challenger | Player;
            if (this.isChallenger) nextRole = new Player(this.gameController);
            else nextRole = new Challenger(this.gameController);

            this.status?.dispose();
            this.status = nextRole;

            try {
                await this.status.do();
            } catch (err) {
                this.gameController.navigate('/');
            }

        } while (true);

    }

    dispose() {
        this.status?.dispose();
        this.status = null as any;
    }
}