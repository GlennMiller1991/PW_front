import {memo} from "react";
import logo from "@pic/logo_compressed.webp";

export const Logo = memo(() => {
    return <img
        alt={'app_logo'}
        width={50}
        height={50}
        src={logo}/>
})