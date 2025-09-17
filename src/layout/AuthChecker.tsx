import { JSXElement, Match, Switch } from "solid-js";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { WidthFixer } from "./WidthFixer";

import { useInterceptor } from "../hooks/useInterceptor";
import { useAccount } from "../hooks/useAccount";
import { CardCenter } from "../components/card/CardCenter";
import { LoadingSpinner } from "../components/animations/LoadingSpinner";
import { CardError } from "../components/card/CardError";
import { LoginPage } from "../pages/login";
import { ResponseState } from "~/types/response.type";

export function AuthChecker(props: { children: JSXElement }) {
	useInterceptor();

	const { data, isLoading, isValidating, response } = useAccount();

	return (
		<Switch>
			<Match when={isLoading() || isValidating()}>
				<CardCenter>
					<LoadingSpinner />
				</CardCenter>
			</Match>

			{/* <Match when={!data().}>
				<CardError />
			</Match> */}

			<Match when={response()?.responseState === ResponseState.Success}>
				<>
					<Header />
					<WidthFixer>{props.children}</WidthFixer>
					<Footer />
				</>
			</Match>

			<Match when={true}>
				<WidthFixer>
					<LoginPage />
					{/* {props.children} */}
				</WidthFixer>
			</Match>
		</Switch>
	);
}
