import { JSXElement } from "solid-js";
import { LoadingSpinner } from "../animations/LoadingSpinner";

export function CardLoading(props: { children?: JSXElement }) {
	return (
		<div class="flex flex-col flex-1 items-center justify-center w-full h-full gap-4 p-4">
			<LoadingSpinner class="w-7 h-7" />
		</div>
	);
}
