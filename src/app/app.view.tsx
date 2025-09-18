import {useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {OpeningView} from "@src/app/opening/opening.view";

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    if (!controller.isReady) return <OpeningView/>;
    return 'app was loaded';
})