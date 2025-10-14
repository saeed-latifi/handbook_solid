import { createSignal, Match, Switch } from "solid-js";
import { sleep } from "~/utils/sleep";
import { Button } from "../button/Button";
import { Input } from "../form/Input";
import { useSearchParams } from "@solidjs/router";
import { useBarn } from "solid-barn";
import { useBarnRecord } from "~/hooks/useBarnRecord";

function useUser({ id }: { id: () => string }) {
	const { key, data, mutate, dataState, isReady } = useBarnRecord({
		domain: "user",
		isReady: async () => {
			await sleep(700);
			return true;
		},
		fetcher: async ({ id }) => {
			await sleep(3000);
			return { id, name: "the user name" };
		},
		filters: () => ({ id: id() }),
		devLog: true,
	});

	return { key, data, mutate, dataState, isReady };
}

export function ShowUser() {
	const [params, setParams] = useSearchParams();
	const { data, dataState, isReady, key, mutate } = useUser({ id: () => params.x?.toString() ?? "" });

	return (
		<Switch>
			<Match when={!isReady()}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-emerald-600">not ready!</div>
			</Match>

			<Match when={!dataState().initialized}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-rose-500">initializing ...</div>
			</Match>

			<Match when={dataState().isLoading}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-amber-500">isLoading ...</div>
			</Match>

			<Match when={dataState().error}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-rose-950">{JSON.stringify({ error: dataState().error })}</div>
			</Match>

			<Match when={data()}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-yellow-100">{JSON.stringify(data())}</div>
			</Match>

			<Match when={true}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-red-600">some happened!!!</div>
			</Match>
		</Switch>
	);
}

export function MutateUser() {
	const [params, setParams] = useSearchParams();

	const [value, setValue] = createSignal("");
	const { key, mutate, data } = useUser({ id: () => params.x?.toString() ?? "" });

	return (
		<div class="flex flex-col gap-4 w-full">
			<Input label="independent input" value={value()} onInput={(e) => setValue(e.target.value)} type="text" />
			<Input label="sync input" value={data().name} onInput={(e) => mutate("name", e.target.value)} type="text" />

			<Button onClick={() => mutate("name", value())}>mutate value from independent</Button>

			<Button onClick={() => setParams?.({ x: value() })}>mutate filter from independent</Button>

			<div class="px-6 py-2 rounded-full flex items-center justify-center bg-indigo-400">{key()}</div>
		</div>
	);
}
