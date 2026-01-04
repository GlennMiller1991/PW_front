import {createRoot} from "react-dom/client";
import {App} from "@src/app/app.view";
import './styles/index.css';
import {BrowserRouter} from 'react-router';

createRoot(document.getElementById('root')!)
    .render(
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    );
