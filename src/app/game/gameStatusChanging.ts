import {Spectator} from "@src/app/game-roles/spectator";
import {Challenger} from "@src/app/game-roles/challenger";
import {Player} from "@src/app/game-roles/player";
import {makeAutoObservable} from "mobx";
import {GameController} from "@src/app/game/game.controller";
import {app} from "@src/app/app.controller";

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
            let nextRole!: Spectator | Challenger | Player;
            if (this.isSpectator) nextRole = new Challenger(this.gameController);
            else if (this.isChallenger) nextRole = new Player(this.gameController);
            else nextRole = new Spectator(this.gameController);

            this.status?.dispose();
            this.status = nextRole;

            try {
                await this.status.do();
            } catch (err) {
                app.logout();
                this.status.dispose();
                this.status = null as any;
            }

        } while (true);

    }

    dispose() {
        console.log('disposed')
    }
}