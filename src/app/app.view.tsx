import {useState} from "react";
import {AppController} from "@src/app/app.controller";
import {observer} from "mobx-react-lite";
import {Loader} from "@src/app/opening/loader";
import c from "classnames";
import {Game, GameMenu} from "@src/app/app-loaded/app-loaded.view";
import {Routes, Route} from "react-router";

export const cls = c;

export const App = observer(() => {
    const [controller] = useState(() => new AppController());

    if (!controller.isReady)
        return <Loader text={'PIXEL WAR'}/>;

    if (!controller.isInitSuccessful)
        return <Loader text={'ERROR'}/>

    return (
        <Routes>
            <Route path={"/"} element={<GameMenu/>}/>
            <Route path={"/game"} element={<Game/>}/>
            <Route path={"*"} element={null}/>
        </Routes>
    )
});
