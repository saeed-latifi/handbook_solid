import { createSignal, For, Show } from "solid-js";
import { Button } from "~/components/button/Button";
import { Input } from "~/components/form/Input";
import { CCInfinite } from "~/components/test/CCInfinite";
import { useDataList } from "~/hooks/useDataList";

export default function Home() {
	const [filter, setFilter] = createSignal("");
	const [text, setTExt] = createSignal("");

	const { data } = useDataList<{ gg: string }>({
		domain: "some",
		filters: () => ({ f: filter() ?? undefined }),
		fetcher: async ({ f }) => {
			// return [{ id: 1 + (id ?? "") }, { id: 2 + (id ?? "") }];
			return { data: [{ gg: 1 + (f ?? "") }, { gg: 2 + (f ?? "") }], responseState: "Ok" };
		},
	});
	return (
		<div class="w-full flex flex-col gap-4 p-4">
			{/* <CCInfinite /> */}
			<a href="/storage" class="w-full flex items-center justify-center text-white fill-white px-4 py-1 rounded-md bg-indigo-950">
				storage
			</a>
			<a href="/course" class="w-full flex items-center justify-center text-white fill-white px-4 py-1 rounded-md bg-indigo-950">
				list loader
			</a>

			<Input value={text()} onInput={(e) => setTExt(e.target.value)} />
			<Button
				onClick={() => {
					setFilter(text());
				}}
			>
				setFilter
			</Button>

			<Show when={data()}>
				<For each={data()}>{(item) => <div>{item.gg}</div>}</For>
			</Show>
		</div>
	);
}
