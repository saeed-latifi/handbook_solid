import { JSXElement } from "solid-js";

export function CardCenter(props: { children?: JSXElement }) {
	return <div class="flex flex-col flex-1 items-center justify-center w-full h-full gap-4 p-4">{props.children}</div>;
}
