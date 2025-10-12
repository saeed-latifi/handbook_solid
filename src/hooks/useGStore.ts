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

	const storeSection = createMemo(() => {
		if (!gStore[domain]) gStore[domain] = { freeze: false };
		if (!gStore[domain][storeType]) gStore[domain][storeType] = { base: {}, freeze: false };

		const currentKey = key();
		if (!gStore[domain][storeType].base[currentKey]) {
			gStore[domain][storeType].base[currentKey] = {
				data: createStore<T>({} as T),
				fetchState: createStore<IFetchState>(defaultFetchState),
			};
		}

		// return gStore[domain][storeType].base[currentKey];

		const store = gStore[domain][storeType].base[currentKey];
		return {
			data: store.data[0],
			setData: store.data[1],
			fetchState: store.fetchState[0],
			setFetchState: store.fetchState[1],
		};
	});

	// Reactively access data and fetchState - these MUST be memos too
	// const data = createMemo(() => storeSection().data);
	// const setData = createMemo(() => storeSection().setData);
	// const fetchState = createMemo(() => storeSection().fetchState);
	// const setFetchState = createMemo(() => storeSection().setFetchState);

	const [isReadyState, setReady] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
	const canAct = createMemo(() => isReadyState() && !storeSection().fetchState.isLoading && !storeSection().fetchState.isValidating);

	createEffect(async () => {
		try {
			setReady(await isReady());
		} catch {
			setReady(false);
		}
	});

	// This effect will now properly react to key changes
	createEffect(() => {
		// const currentKey = key();
		const currentData = storeSection().data[0];
		const currentFetchState = storeSection().fetchState;
		const ready = isReadyState();

		console.log("Current key:", key(), "Data:", currentData);

		if (ready && (!currentData || Object.keys(currentData).length === 0 || !currentFetchState.initialized)) {
			executeFetch();
		}
	});

	async function executeFetch() {
		const fetchKey = `:${domain}:${storeType}:${key()}:`;
		if (globalFetchMap.has(fetchKey)) return globalFetchMap.get(fetchKey)!;

		console.log("fetch ", fetchKey);

		batch(() => {
			storeSection().setFetchState("isLoading", true);
			storeSection().setFetchState("initialized", true);
		});

		try {
			const promise = fetcher(purgedFilters());
			globalFetchMap.set(fetchKey, promise);
			const res = await promise;

			console.log("xz 1", JSON.stringify(storeSection().data[0]));
			storeSection().setData(res);
			console.log("xz 2", JSON.stringify(storeSection().data[0]));

			batch(() => {
				storeSection().setFetchState("isLoading", false);
				storeSection().setFetchState("error", undefined);
			});
			return res;
		} catch (error) {
			batch(() => {
				storeSection().setFetchState("isLoading", false);
				storeSection().setFetchState("error", error);
			});
		} finally {
			globalFetchMap.delete(fetchKey);
		}
	}

	const mutate: SetStoreFunction<T> = ((...args: any[]) => {
		if (!canAct()) return;
		return (storeSection().setData as any)(...args);
	}) as SetStoreFunction<T>;

	return {
		key,
		data: () => storeSection().data,
		fetchState: () => storeSection().fetchState,
		isReady: isReadyState,
		mutate,
	};
}
