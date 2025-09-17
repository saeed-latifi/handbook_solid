import { For, Match, Switch } from "solid-js";
import { useDataList } from "~/hooks/useDataList";
import { IResponse, IUserSimple, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentListUser() {
	const { data, isLoading, isReady } = useDataList<IUserSimple, undefined>({
		domain: "user",
		fetcher: async () => {
			console.log("D start");

			await sleep(500);
			const res: IResponse<IUserSimple[], undefined> = {
				responseState: ResponseState.Success,
				data: [
					{ id: 123, name: "user one" },
					{ id: 2, name: "user two" },
				],
			};
			console.log("D end");

			return res;
		},
		isReady: async () => {
			await sleep(500);
			return true;
		},
	});

	return (
		<Switch fallback={<p>Unknown status</p>}>
			<Match when={!isReady()}>
				<div class="flex w-full h-full p-8 bg-cyan-100 rounded-xl">!isReady</div>
			</Match>
			<Match when={isLoading()}>
				<div class="flex w-full h-full p-8 bg-purple-200 rounded-xl">isLoading</div>
			</Match>
			<Match when={true}>
				<div class="w-full flex flex-col gap-4 ">
					<For each={data()}>{(item) => <div class="rounded-xl p-2 bg-indigo-400">{item.name}</div>}</For>
				</div>
			</Match>
		</Switch>
	);
}
