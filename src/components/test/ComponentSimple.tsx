import { Match, Switch } from "solid-js";
import { useDataSimple } from "~/hooks/useDataSimple";
import { IResponse, IUserSimple, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";

export function ComponentSimple() {
	const {
		isLoading,
		isValidating,
		isReady,
		error,
		data,
		refetch,
		mutateResponse: mutate,
		response,
	} = useDataSimple<IUserSimple, undefined>({
		domain: "profile",
		fetcher: async () => {
			await sleep(3000);
			// throw new Error("errrrrr");

			const user: IResponse<IUserSimple, undefined> = { data: { name: "888", id: 8 }, responseState: ResponseState.Success };
			return user;
		},
		isReady: async () => {
			await sleep(1000);
			return true;
		},
	});

	function onA() {
		mutate({
			data: { name: "A", id: 8 },
			validations: undefined, // Clear validations
		});
	}
	function onB() {
		mutate((current) => ({
			...current,
			data: { id: 8, name: "B" },
			responseState: ResponseState.Success,
		}));
	}
	function onC() {
		mutate(async (current) => {
			const freshData = await sleep(3000);
			return {
				...current,
				data: { id: 8, name: "C" },
				responseState: ResponseState.Success,
			};
		});
	}

	return (
		<div class="w-full flex flex-col gap-4 p-4">
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

			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={onA}>
				on A
			</button>
			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={onB}>
				on B
			</button>
			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={onC}>
				on C
			</button>
			<button class="w-full p-2 bg-amber-300 rounded-xl text-center" onClick={refetch}>
				refetch
			</button>
		</div>
	);
}
