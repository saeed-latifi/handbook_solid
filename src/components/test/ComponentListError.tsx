import { createEffect, createSignal } from "solid-js";
import { For, Match, Switch } from "solid-js/web";
import { useDataList } from "~/hooks/useDataList";
import { ILesson, IResponse, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentListError() {
	const [allowed, setAllowed] = createSignal(false);

	const { isLoading, isValidating, isReady, error, data, refetch } = useDataList<ILesson, undefined>({
		domain: "some",
		fetcher: async () => {
			console.log("A start");

			await sleep(3000);
			if (!allowed()) throw new Error("Error test, try again and must fix!");

			const res: IResponse<ILesson[], undefined> = {
				responseState: ResponseState.Success,
				data: [
					{ id: 1, title: "a1" },
					{ id: 2, title: "a2" },
				],
			};

			console.log("A end");
			return res;
		},
		isReady: async () => {
			await sleep(4000);
			return true;
		},
	});

	createEffect(() => {
		if (allowed()) refetch();
	});

	return (
		<Switch fallback={<p>Unknown status</p>}>
			<Match when={!isReady()}>
				<div class="flex w-full h-full p-8 bg-amber-500">...</div>
			</Match>
			<Match when={isLoading()}>
				<div class="flex w-full h-full p-8 bg-fuchsia-200">...</div>
			</Match>
			<Match when={error()}>
				<div class="flex w-full h-full p-8 bg-pink-500  flex-col gap-8 items-center justify-center">
					{JSON.stringify(error()?.message)}
					<button
						class="w-max px-8 py-1 text-center bg-teal-500 rounded-2xl"
						onclick={() => {
							setAllowed(true);
						}}
					>
						retry
					</button>
				</div>
			</Match>
			<Match when={true}>
				<div class="w-full flex flex-col gap-4 p-4">
					<For each={data()}>{(item) => <div>{item.title}</div>}</For>
				</div>
			</Match>
		</Switch>
	);
}
