import {FC, memo} from "react";
import {fonts} from "@src/app/app.controller";
import styles from './rules.module.css';

export const RulesView: FC = memo(() => {
    return (
        <div style={{fontFamily: fonts.pixel.family}}
             className={styles.container}
        >
            <h1>Welcome to PixelWar!</h1>

            <p>
                Your mission, soldier, is to fire pixels at the canvas — hoping to either create something meaningful or
                blast someone else’s artwork to bits. You can always team up with your internet buddies to form a squad
                and defend your creations more easily.
            </p>

            <h2>
                Quick field guide to what’s happening:
            </h2>

            <p>
                After dropping into the game page, you land in a basic training zone (aka view‑only mode). From there,
                you
                might get deployed straight to the battlefield if we’re short on troops.
            </p>

            <p>
                Once deployed, you gain the ability to attack the canvas with your mouse, firing pixels in your chosen
                color. Not every shot hits its mark — your rifle has a cooldown between rounds.
            </p>

            <p>
                If you’re away from combat for more than 2 minutes, Command will discharge you back to civilian life.
            </p>

            <p>
                The size of the combat zone is unpredictable, so stay sharp: use your mouse to zoom, scroll, and move
                around
                the front.
            </p>
        </div>
    );
})