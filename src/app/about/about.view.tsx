import {FC, memo} from "react";
import styles from './about.module.css';
import {fonts} from "@src/app/app.controller";

export const AboutView: FC = memo(() => {
    return (
        <div className={styles.container}
             style={{fontFamily: fonts.pixel.family}}
        >
            <h1>About</h1>
            <p>
                This is a non‑commercial project, created for entertainment and educational purposes.
                It was built entirely by hand and brain by Alexandr Basalov.
            </p>

            <p>
                For any feedback — from bug reports to suggestions — you can reach me on
                <a href={'https://t.me/alexandroBas'} target={'_blank'}> Telegram </a>
                or use the contact
                form
                below.
            </p>

            <p>
                You can also visit my
                <a href={'https://дев.залетай-дорогой.рф'}> portfolio page </a>. Maybe something else interesting will show up there eventually.
            </p>

            <p>
                Thanks for stopping by.
            </p>
        </div>
    );
})