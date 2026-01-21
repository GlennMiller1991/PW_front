import {Component, PropsWithChildren} from "react";
import {router} from "@src/infra/router";
import {convertErrorToString} from "@src/app/_components/error-boundary/utils";
import {logRequest} from "@src/infra/request/impl/log.request";

type IErrorBoundaryProps = PropsWithChildren<{}>

type IErrorBoundaryState = {
    hasError: boolean,
    hasReacted: boolean,
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
    constructor(props: IErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            hasReacted: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
            hasReacted: false,
        };
    }

    componentDidCatch(error: Error) {
        if (this.state.hasReacted) return;

        this.setState(prev => ({...prev, hasReacted: true}))
        const message = convertErrorToString(error);
        logRequest(message);
        router.redirect('/error');
    }

    render() {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}

