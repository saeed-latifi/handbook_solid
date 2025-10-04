import { Match, Switch } from "solid-js";
import { useDataRecord } from "~/hooks/useDataRecord";
import { IResponse, IUserSimple, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentRecordTwo() {
	const id = 2;
	const { data, isLoading, refetch, error, isValidating, isReady, mutateResponse } = useDataRecord<IUserSimple, undefined>({
		domain: "user",
		id: () => id,
		fetcher: async (_id) => {
			await sleep(200);
			const res: IResponse<IUserSimple, undefined> = {
				responseState: ResponseState.Success,
				data: { id, name: "user two" },
			};
			return res;
		},
		isReady: async () => {
			await sleep(700);
			return true;
		},
	});

	function immediate() {
		mutateResponse((current) => ({
			...current,
			data: { id: id, name: "immediate two" },
			responseState: ResponseState.Success,
		}));
	}
	function withDelay() {
		mutateResponse(async (current) => {
			const freshData = await sleep(3000);
			return {
				...current,
				data: { id: id, name: "withDelay two" },
				responseState: ResponseState.Success,
			};
		});
	}

	return (
		<>
			<Switch>
				<Match when={!isReady()}>
					<div class="flex w-full h-full p-8 bg-amber-500 rounded-xl">!isReady</div>
				</Match>
				<Match when={isLoading()}>
					<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
				</Match>

				<Match when={isValidating()}>
					<div class="flex w-full h-full p-8 bg-green-200 rounded-xl">isValidating</div>
				</Match>

				<Match when={error()}>
					<div class="flex w-full h-full p-8 bg-pink-600 rounded-xl">{error()}</div>
				</Match>

				<Match when={data()}>
					<div class="w-full flex flex-col gap-4 p-4 bg-blue-500 rounded-xl">
						<div>{data()?.name}</div>
					</div>
				</Match>
			</Switch>

			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={immediate}>
				immediate
			</button>
			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={withDelay}>
				withDelay
			</button>
			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={refetch}>
				refetch
			</button>
		</>
	);
}
