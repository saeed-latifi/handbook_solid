import { createEffect, JSXElement, Match, Switch } from "solid-js";
import { LoadingSpinner } from "~/components/animations/LoadingSpinner";
import { CardCenter } from "~/components/card/CardCenter";
import { useAccount } from "~/hooks/useAccount";
import { useInterceptor } from "~/hooks/useInterceptor";
import { LoginPage } from "~/pages/login";
import { ResponseState } from "~/types/response.type";
import { Header } from "./Header";
import { WidthFixer } from "./WidthFixer";

export function AuthChecker(props: { children: JSXElement }) {
	useInterceptor();

	const { data, isLoading, isValidating, response, isReady } = useAccount();

	return (
		<Switch fallback={<div class="bg-green-400 w-full p-8 flex flex-col in-checked: justify-center">initializing ...</div>}>
			<Match when={!isReady() || isLoading() || isValidating()}>
				<CardCenter>
					<LoadingSpinner />
				</CardCenter>
			</Match>

			<Match when={response()?.responseState === ResponseState.Success}>
				<>
					<Header />
					<WidthFixer>{props.children}</WidthFixer>
				</>
			</Match>

			<Match when={response()?.responseState}>
				<WidthFixer>
					<LoginPage />
				</WidthFixer>
			</Match>

			<Match when={true}>
				<div class="bg-rose-400 w-full p-8 flex flex-col in-checked: justify-center">some happened ...</div>
			</Match>
		</Switch>
	);
}
