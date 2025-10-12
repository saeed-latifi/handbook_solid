import { createEffect, createSignal, Match, Switch } from "solid-js";
import { useDataRecord } from "~/hooks/useDataRecord";
import { useDataSimple } from "~/hooks/useDataSimple";
import { IResponse, IUserSimple, ResponseState } from "~/types/response.type";
import { sleep } from "~/utils/sleep";
import { Button } from "../button/Button";
import { useGStore } from "~/hooks/useGStore";
import { Input } from "../form/Input";
import { useParams, useSearchParams } from "@solidjs/router";

function useUser({ id }: { id: () => string }) {
	const { key, data, mutate, fetchState, isReady } = useGStore({
		domain: "user",
		isReady: async () => {
			await sleep(700);
			return true;
		},
		fetcher: async (w) => {
			await sleep(3000);
			w.rrrr;
			return { id: w.rrrr, name: "wyumumy" };
		},
		filters: () => ({ rrrr: id() }),
		storeType: "base",
	});

	return { key, data, mutate, fetchState, isReady };
}

export function CC() {
	const [params, setParams] = useSearchParams();
	const { data, fetchState, isReady, key, mutate } = useUser({ id: () => params.x?.toString() ?? "" });

	return (
		<Switch>
			<Match when={!isReady()}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-emerald-600">not ready!</div>
			</Match>

			<Match when={!fetchState().initialized}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-rose-500">initializing ...</div>
			</Match>

			<Match when={fetchState().isLoading}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-amber-500">isLoading ...</div>
			</Match>

			<Match when={fetchState().error}>
				<div class="px-6 py-2 rounded-full flex items-center justify-center bg-rose-950">{JSON.stringify({ error: fetchState().error })}</div>
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

export function CCU() {
	const [params, setParams] = useSearchParams();

	const [value, setValue] = createSignal("");
	const { data, fetchState, isReady, key, mutate } = useUser({ id: () => params.x?.toString() ?? "" });

	return (
		<div class="flex flex-col gap-4 w-full">
			<Input value={value()} onInput={(e) => setValue(e.target.value)} type="text" />

			<Button onClick={() => mutate("name", value())}>mutate value</Button>

			<Button onClick={() => setParams?.({ x: value() })}>mutate filter</Button>

			<div class="px-6 py-2 rounded-full flex items-center justify-center bg-indigo-400">{key()}</div>
		</div>
	);
}
