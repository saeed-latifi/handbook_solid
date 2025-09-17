import { For, Match, Switch } from "solid-js";
import { useDataList } from "~/hooks/useDataList";
import { ILessonSimple, IResponse, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentListWait() {
	const { data, isLoading, isReady } = useDataList<ILessonSimple, undefined>({
		domain: "some",
		fetcher: async () => {
			console.log("D start");

			await sleep(500);
			const res: IResponse<ILessonSimple[], undefined> = {
				responseState: ResponseState.Success,
				data: [
					{ id: 1, title: "D1" },
					{ id: 2, title: "D2" },
				],
			};
			console.log("D end");

			return res;
		},
		isReady: async () => {
			await sleep(1500);
			return true;
		},
	});

	return (
		<Switch fallback={<p>Unknown status</p>}>
			<Match when={!isReady()}>
				<div class="flex w-full h-full p-8 bg-cyan-400">...</div>
			</Match>
			<Match when={isLoading()}>
				<div class="flex w-full h-full p-8 bg-purple-600">...</div>
			</Match>
			<Match when={true}>
				<div class="w-full flex flex-col gap-4 p-4">
					<For each={data()}>{(item) => <div>{item.title}</div>}</For>
				</div>
			</Match>
		</Switch>
	);
}
