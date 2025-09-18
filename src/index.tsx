import {createRoot} from "react-dom/client";
import {App} from "@src/app/app.view";
import './styles/index.css';

createRoot(document.getElementById('root')!)
    .render(<App/>);
