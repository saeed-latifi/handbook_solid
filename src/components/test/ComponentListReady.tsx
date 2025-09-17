import { For, Match, Switch } from "solid-js";
import { useDataList } from "~/hooks/useDataList";
import { ILessonSimple, IResponse, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentListReady() {
	const { data, isLoading, isReady } = useDataList<ILessonSimple, undefined, { name: string }>({
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
				</div>
			</Match>
		</Switch>
	);
}
