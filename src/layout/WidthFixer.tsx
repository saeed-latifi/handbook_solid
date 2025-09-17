import { JSXElement } from "solid-js";

export function WidthFixer(props: { children: JSXElement }) {
	return (
		<div class="w-full h-max flex flex-col flex-1 p-4 items-center bg-background bg-tile">
			<div class="w-full h-max flex flex-col flex-1 max-w-5xl">{props.children}</div>
		</div>
	);
}
