import { For, Match, Switch } from "solid-js";
import { useDataList } from "~/hooks/useDataList";
import { ILessonSimple, IResponse, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";
import { Button } from "../button/Button";

export function ComponentListReady() {
	const { data, isLoading, isReady, mutate } = useDataList<ILessonSimple, undefined, { name: string }>({
		domain: "some",
		fetcher: async (filters) => {
			console.log("E start");

			await sleep(700);
			const res: IResponse<ILessonSimple[], undefined> = {
				responseState: ResponseState.Success,
				data: [
					{ id: 1, title: filters.name + "1" },
					{ id: 2, title: filters.name + "1" },
				],
			};
			console.log("E end");

			return res;
		},
		isReady: () => true,
		filters: { name: "filter" },
	});

	function mutateListA() {
		mutate([
			{ id: 1, title: "mutateList A 1" },
			{ id: 2, title: "mutateList A 2" },
			{ id: 3, title: "mutateList A 3" },
		]);
	}

	function mutateListB() {
		mutate([
			{ id: 1, title: "mutateList B 1" },
			{ id: 2, title: "mutateList B 2" },
			{ id: 3, title: "mutateList B 3" },
		]);
	}

	return (
		<Switch fallback={<p>Unknown status</p>}>
			<Match when={!isReady()}>
				<div class="flex w-full h-full p-8 bg-lime-700">...</div>
			</Match>
			<Match when={isLoading()}>
				<div class="flex w-full h-full p-8 bg-rose-950">...</div>
			</Match>
			<Match when={true}>
				<div class="w-full flex flex-col gap-4 p-4">
					<For each={data()}>{(item) => <div>{item.title}</div>}</For>
					<Button onClick={mutateListA}>mutate list A</Button>
					<Button onClick={mutateListB}>mutate list B</Button>
				</div>
			</Match>
		</Switch>
	);
}
