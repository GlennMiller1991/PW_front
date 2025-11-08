import {createContext, useContext} from "react";
import {AppController} from "@src/app/app.controller";

export const AppContext = createContext<AppController>(null as any);
export function useAppContext() {
    return useContext(AppContext);
}