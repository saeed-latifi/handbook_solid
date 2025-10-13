import { batch, createEffect, createMemo, createSignal } from "solid-js";
import { createStore, SetStoreFunction, Store } from "solid-js/store";
import { keyGenerator } from "~/utils/keyGenerator";

export const utils = { keyGenerator };

interface IBarnDataState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: any;
}

interface IBarnInfiniteSection<T> {
	data: [get: Store<T[]>, set: SetStoreFunction<T[]>];
	dataState: [get: Store<IBarnDataState>, set: SetStoreFunction<IBarnDataState>];
}

// TODO implement Freeze actions on global, domain and record state
// TODO add isValidating
interface IBarnList<T> {
	[domain: string]: {
		lists?: { [filterKey: string]: IBarnInfiniteSection<T> };
		freeze: boolean;
	};
}

interface IStoreArgs<T, F> {
	domain: string;
	fetcher: (args: { filters: Partial<F>; length: number }) => Promise<T[]>;
	filters?: () => F;
	isReady?: () => boolean | Promise<boolean>;
	devLog: boolean;
}

const Barn: IBarnList<any> = {};
const globalFetchMap = new Map<string, Promise<any>>();

export function useBarnInfinite<T extends object, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = () => true, devLog }: IStoreArgs<T, F>) {
	const purgedFilters = createMemo(() => keyGenerator(filters?.()) as Partial<F>);
	const key = createMemo(() => JSON.stringify(purgedFilters()));

	const storeSection = createMemo(() => {
		const currentKey = key();

		if (!Barn[domain]) Barn[domain] = { freeze: false };
		if (!Barn[domain].lists) Barn[domain].lists = {};
		if (!Barn[domain].lists[currentKey]) {
			Barn[domain].lists[currentKey] = {
				data: createStore<T[]>([]),
				dataState: createStore<IBarnDataState>({ initialized: false, isLoading: false, isValidating: false }),
			};
		}

		const store: IBarnInfiniteSection<T> = Barn[domain].lists[currentKey];

		return {
			data: store.data[0],
			setData: store.data[1],
			dataState: store.dataState[0],
			setDataState: store.dataState[1],
		};
	});

	const [isReadyState, setReady] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
	const canAct = createMemo(() => isReadyState() && storeSection().dataState.initialized && !storeSection().dataState.isLoading && !storeSection().dataState.isValidating);

	createEffect(async () => {
		try {
			setReady(await isReady());
		} catch {
			setReady(false);
		}
	});

	createEffect(() => {
		const { dataState } = storeSection();
		const ready = isReadyState();

		if (ready && !dataState.initialized) {
			executeFetch(0);
		}
	});

	async function executeFetch(length: number): Promise<T[] | undefined> {
		const fetchKey = `:${domain}:list:${key()}:`;
		if (globalFetchMap.has(fetchKey)) return globalFetchMap.get(fetchKey)!;

		if (devLog) console.log("fetch ", fetchKey);

		batch(() => {
			storeSection().setDataState("isLoading", true);
			storeSection().setDataState("initialized", true);
		});

		const promise = fetcher({ filters: purgedFilters(), length });
		try {
			globalFetchMap.set(fetchKey, promise);
			const res: T[] = await promise;

			batch(() => {
				storeSection().setData(res);
				storeSection().setDataState("isLoading", false);
				storeSection().setDataState("error", undefined);
			});

			return res;
		} catch (error) {
			batch(() => {
				storeSection().setDataState("isLoading", false);
				storeSection().setDataState("error", error);
			});
		} finally {
			if (globalFetchMap.get(fetchKey) === promise) {
				globalFetchMap.delete(fetchKey);
			}
		}
	}

	const mutate: SetStoreFunction<T> = ((...args: any[]) => {
		if (!canAct()) return;
		return (storeSection().setData as any)(...args);
	}) as SetStoreFunction<T>;

	// async function mutateResponse(updater?: ((currentData?: responseType) => responseType | Promise<responseType | undefined>) | undefined) {
	// 	if (!updater || !canAct()) return;

	// 	const existingList = context?.getList<T, X>(domain, key());

	// 	if (typeof updater === "function") {
	// 		context?.updateListState({ domain, fetchState: { isValidating: true }, key: key() });
	// 		const res = await updater(existingList?.data);
	// 		context?.updateListState({ domain, fetchState: { isValidating: false }, key: key() });
	// 		if (!res) return;

	// 		context?.updateListResponse({ domain, data: res, key: key(), fetchState: {} });
	// 	} else context?.updateListResponse({ domain, key: key(), data: updater, fetchState: {} });
	// }
	// async function loadMore() {
	// 	const newData = mutate(async (prev) => {
	// 		const userPage = await fetcher(prev?.length ?? 0);

	// 		if (userPage.data) return [...(prev ?? []), ...userPage.data];
	// 	});
	// }

	// function hasMore() {
	// 	const length = response()?.length ?? 0;
	// 	const count = data()?.length ?? 0;

	// 	console.log({ count });

	// 	if (!data() || count < length) return true;
	// 	return false;
	// }

	return {
		key,
		data: () => storeSection().data,
		dataState: () => storeSection().dataState,
		isReady: isReadyState,
		onValidate: (v: boolean) => storeSection().setDataState("isValidating", v),
		mutate,
	};
}
