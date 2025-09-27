import { createSignal, For, Show } from "solid-js";
import { Button } from "~/components/button/Button";
import { Input } from "~/components/form/Input";
import { useDataList } from "~/hooks/useDataList";

export default function Home() {
	const [filter, setFilter] = createSignal("");
	const [text, setTExt] = createSignal("");

	const { data } = useDataList<{ id: string }>({
		domain: "some",
		filters: () => ({ id: filter() ?? undefined }),
		fetcher: async ({ id }) => {
			// return [{ id: 1 + (id ?? "") }, { id: 2 + (id ?? "") }];
			return { data: [{ id: 1 + (id ?? "") }, { id: 2 + (id ?? "") }], responseState: "Ok" };
		},
	});
	return (
		<div class="w-full flex flex-col gap-4 p-4">
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
				<For each={data()}>{(item) => <div>{item.id}</div>}</For>
			</Show>
		</div>
	);
}
