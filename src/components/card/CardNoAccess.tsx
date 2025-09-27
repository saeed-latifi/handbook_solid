import { For } from "solid-js";
import { CardCenter } from "./CardCenter";

export function CardNoAccess({ noAccess }: { noAccess: string[] }) {
	return (
		<CardCenter>
			<div class="flex flex-col gap-2 text-error fill-error items-center justify-center bg-white border border-border rounded-2xl p-8 font-peyda-bold">
				<For each={noAccess}>{(item) => <p>{item}</p>}</For>
			</div>
		</CardCenter>
	);
}
