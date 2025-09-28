import { CardCenter } from "./CardCenter";
import { For, JSX } from "solid-js";

export function CardNotFound({ messages, createFirst }: { messages: string[]; createFirst?: JSX.Element }) {
	return (
		<CardCenter>
			<div class="flex flex-col gap-2 text-action fill-action items-center justify-center bg-white border border-border rounded-2xl p-8 font-peyda-bold">
				<For each={messages}>{(item) => <p>{item}</p>}</For>
				{createFirst}
			</div>
		</CardCenter>
	);
}
