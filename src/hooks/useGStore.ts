import { batch, createEffect, createMemo, createSignal } from "solid-js";
import { createStore, SetStoreFunction, Store, StoreSetter } from "solid-js/store";
import { keyGenerator } from "~/utils/keyGenerator";

interface IFetchState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: any;
}

interface IGStoreSection {
	base: {
		[filterKey: string]: {
			data: [get: Store<any>, set: SetStoreFunction<any>];
			fetchState: [get: Store<IFetchState>, set: SetStoreFunction<IFetchState>];
		};
	};
	freeze: boolean;
}

interface GStore {
	[domain: string]: {
		list?: IGStoreSection;
		record?: IGStoreSection;
		base?: IGStoreSection;
		freeze: boolean;
	};
}

interface IStoreArgs<T, F> {
	domain: string;
	fetcher: (filters: Partial<F>) => Promise<T>;
	filters?: () => F;
	isReady?: () => boolean | Promise<boolean>;
	storeType?: "list" | "record" | "base";
}

const gStore: GStore = {};
const globalFetchMap = new Map<string, Promise<any>>();

const defaultFetchState: IFetchState = {
	isLoading: false,
	isValidating: false,
	initialized: false,
	error: undefined,
};

export function useGStore<T extends object, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = () => true, storeType = "base" }: IStoreArgs<T, F>) {
	const purgedFilters = createMemo(() => keyGenerator(filters?.()) as Partial<F>);
	const key = createMemo(() => JSON.stringify(purgedFilters() || {}));

	if (!gStore[domain]) gStore[domain] = { freeze: false };
	if (!gStore[domain][storeType]) gStore[domain][storeType] = { base: {}, freeze: false };

	if (!gStore[domain][storeType].base[key()]) {
		gStore[domain][storeType].base[key()] = {
			data: createStore(),
			fetchState: createStore(defaultFetchState),
		};
	}

	const [data, setData]: [get: T, set: SetStoreFunction<T>] = gStore[domain][storeType].base[key()]?.data;
	const [fetchState, setFetchState] = gStore[domain][storeType].base[key()]?.fetchState;

	const [isReadyState, setReady] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
	const canAct = createMemo(() => isReadyState() && !fetchState.isLoading && !fetchState.isValidating);

	createEffect(async () => {
		try {
			setReady(await isReady());
		} catch {
			setReady(false);
		}
	});

	createEffect(() => {
		console.log("ppppp", data);

		if (isReadyState() && (!data || !fetchState.initialized)) executeFetch();
	});

	async function executeFetch() {
		const fetchKey = `:${domain}:${storeType}:${key()}:`;
		if (globalFetchMap.has(fetchKey)) return globalFetchMap.get(fetchKey)!;

		console.log("fetch ", fetchKey);

		batch(() => {
			setFetchState("isLoading", true);
			setFetchState("initialized", true);
		});

		try {
			const promise = fetcher(purgedFilters());
			globalFetchMap.set(fetchKey, promise);
			const res = await promise;
			setData(res);
			batch(() => {
				setFetchState("isLoading", false);
				setFetchState("error", undefined);
			});

			return res;
		} catch (error) {
			batch(() => {
				setFetchState("isLoading", false);
				setFetchState("error", error);
			});
		} finally {
			globalFetchMap.delete(fetchKey);
		}
	}

	return {
		key,
		data,
		fetchState,

		isReady: isReadyState,
		mutate: canAct() ? setData : undefined,
	};
}
