import { JSXElement } from "solid-js";

export default function CardModal(props: { children: JSXElement }) {
	return <div class="bg-background border border-border rounded-lg flex flex-col p-3 gap-4 w-92 h-max max-w-full">{props.children}</div>;
}
