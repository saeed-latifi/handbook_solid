import { batch, createEffect, createMemo, createSignal } from "solid-js";
import { createStore, SetStoreFunction, Store, produce } from "solid-js/store";
import { keyGenerator } from "~/utils/keyGenerator";

export const utils = { keyGenerator };

interface IBarnDataState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: any;
}

interface IBarnRecordSection<T> {
	data: [get: Store<T>, set: SetStoreFunction<T>];
	dataState: [get: Store<IBarnDataState>, set: SetStoreFunction<IBarnDataState>];
}

// TODO implement Freeze actions on global, domain and record state
// TODO add isValidating
interface IBarnRecord<T> {
	[domain: string]: {
		records?: { [filterKey: string]: IBarnRecordSection<T> };
		freeze: boolean;
	};
}

interface IBarnRecordArgs<T, F> {
	domain: string;
	fetcher: (filters: Partial<F>) => Promise<T>;
	filters?: () => F;
	isReady?: () => boolean | Promise<boolean>;
	devLog?: boolean;
}

const BarnRecords: IBarnRecord<any> = {};
const barnRecordsFetchMap = new Map<string, Promise<any>>();

export function useBarnRecord<T extends object, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = () => true, devLog }: IBarnRecordArgs<T, F>) {
	const purgedFilters = createMemo(() => keyGenerator(filters?.()) as Partial<F>);
	const key = createMemo(() => JSON.stringify(purgedFilters()));

	const storeSection = createMemo(() => {
		const currentKey = key();

		if (!BarnRecords[domain]) BarnRecords[domain] = { freeze: false };
		if (!BarnRecords[domain].records) BarnRecords[domain].records = {};
		if (!BarnRecords[domain].records[currentKey]) {
			BarnRecords[domain].records[currentKey] = {
				data: createStore<T>({} as T),
				dataState: createStore<IBarnDataState>({ initialized: false, isLoading: false, isValidating: false }),
			};
		}

		const store: IBarnRecordSection<T> = BarnRecords[domain].records[currentKey];

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
			executeFetch();
		}
	});

	async function executeFetch(): Promise<T | undefined> {
		const fetchKey = `:${domain}:record:${key()}:`;
		if (barnRecordsFetchMap.has(fetchKey)) return barnRecordsFetchMap.get(fetchKey)!;

		if (devLog) console.log("fetch ", fetchKey);

		batch(() => {
			storeSection().setDataState("isLoading", true);
			storeSection().setDataState("initialized", true);
		});

		const promise = fetcher(purgedFilters());
		try {
			barnRecordsFetchMap.set(fetchKey, promise);
			const res: T = await promise;

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
			if (barnRecordsFetchMap.get(fetchKey) === promise) {
				barnRecordsFetchMap.delete(fetchKey);
			}
		}
	}

	const mutate: SetStoreFunction<T> = ((...args: any[]) => {
		if (!canAct()) return;
		return (storeSection().setData as any)(...args);
	}) as SetStoreFunction<T>;

	async function asyncMutate(updater: (mutator: SetStoreFunction<T>, data: T, filters: Partial<F>) => Promise<T | void> | T | void) {
		if (!updater || !canAct()) return;

		storeSection().setDataState("isValidating", true);
		await updater(storeSection().setData, storeSection().data, purgedFilters());
		storeSection().setDataState("isValidating", false);
	}

	return {
		key,
		filters: purgedFilters,
		data: () => storeSection().data,
		dataState: () => storeSection().dataState,
		isReady: isReadyState,
		// onValidate: (v: boolean) => storeSection().setDataState("isValidating", v),
		mutate,
		refetch: executeFetch,
		canAct,
		asyncMutate,
	};
}
