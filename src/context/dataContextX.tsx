import { createContext, createEffect, createMemo, createSignal, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

//#region Helpers
/* --------------------------------- Helpers -------------------------------- */

export function keyGenerator(filters?: Record<string, any>): Record<string, any> {
	if (!filters) return {};
	const purged = objectPurger(filters);
	return purged ? objectSorter(purged) : {};
}

export function objectPurger(obj: any): any {
	if (obj == null || Number.isNaN(obj)) return undefined;
	if (typeof obj !== "object") return obj === "" ? undefined : obj;
	if (Array.isArray(obj)) {
		const arr = obj.map(objectPurger).filter((v) => v !== undefined);
		return arr.length ? arr : undefined;
	}
	const out: Record<string, any> = {};
	let has = false;
	for (const [k, v] of Object.entries(obj)) {
		const val = objectPurger(v);
		if (val !== undefined) {
			out[k] = val;
			has = true;
		}
	}
	return has ? out : undefined;
}

export function objectSorter(obj: any): any {
	if (obj == null || typeof obj !== "object") return obj;
	if (Array.isArray(obj)) return obj.map(objectSorter).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
	const sorted: Record<string, any> = {};
	for (const key of Object.keys(obj).sort()) sorted[key] = objectSorter(obj[key]);
	return sorted;
}

export function listHandler<T>({ data, fetchState, initialized = true }: { data: T[]; fetchState: Partial<IFetchState>; initialized?: boolean }): IListData<T[]> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

export function recordHandler<T>({ data, fetchState, initialized = true }: { data?: T; fetchState: Partial<IFetchState>; initialized?: boolean }): IRecordData<T> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

function createEmptyDomain<T>(name: string): IDomainStore<T> {
	return { name, lists: {}, records: {} };
}

//#endregion

// #region states
/* --------------------------------- States --------------------------------- */

export interface IFetchState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: any;
}

export interface IListData<T> {
	data: T;
	fetchState: IFetchState;
}

export interface IRecordData<T> {
	data?: T;
	fetchState: IFetchState;
}

export interface IDomainStore<T> {
	name: string;
	lists: Record<string, IListData<T[]>>; // List data contains arrays
	records: Record<string | number, IRecordData<T>>; // Record data contains single items
}

const initFetchState: IFetchState = {
	isLoading: false,
	isValidating: false,
	initialized: false,
	error: undefined,
};
//#endregion

/* --------------------------- Domain Factory System -------------------------- */

type AllDomains = Record<string, IDomainStore<any>>;

export interface DomainContextValue<DomainNames extends string> {
	get domains(): AllDomains;
	getDomain<T>(domain: DomainNames): IDomainStore<T>;
	getList<T>(domain: DomainNames, key: string): IListData<T[]> | undefined;
	getRecord<T>(domain: DomainNames, id: string | number): IRecordData<T> | undefined;
	updateListResponse<T>(args: { domain: DomainNames; key: string; data: T[]; fetchState: Partial<IFetchState> }): void;
	updateListState(args: { domain: DomainNames; key: string; fetchState: Partial<IFetchState> }): void;
	updateListValue<T>(args: { domain: DomainNames; key: string; data: T[] }): void;
	updateRecordResponse<T>(args: { domain: DomainNames; id: string | number; data?: T; fetchState: Partial<IFetchState> }): void;
	updateRecordFetchState(args: { domain: DomainNames; id: string | number; fetchState: Partial<IFetchState> }): void;
	updateRecordValue<T>(args: { domain: DomainNames; id: string | number; data: Partial<T> }): void;
}

// Type utilities for domain configuration
export interface DomainConfig<T = any> {
	name: string;
	type: T;
}

export type DomainTypeMap<DomainConfigs extends readonly DomainConfig[]> = {
	[K in DomainConfigs[number] as K["name"]]: K["type"];
};

export function createDomainContext<DomainNames extends string, DomainConfigs extends readonly DomainConfig[]>(domains: DomainConfigs) {
	type DomainTypeMap = {
		[K in DomainConfigs[number] as K["name"]]: K["type"];
	};

	const DomainContext = createContext<DomainContextValue<DomainNames>>();

	function createDomainFactory(): DomainContextValue<DomainNames> {
		const [domainsStore, setDomainsStore] = createStore<AllDomains>({});

		function getDomain<T>(domain: DomainNames): IDomainStore<T> {
			if (!domainsStore[domain]) {
				const d = createEmptyDomain<T>(domain);
				setDomainsStore(
					produce((state) => {
						state[domain] = d;
					})
				);
			}
			return domainsStore[domain] as IDomainStore<T>;
		}

		function getList<T>(domain: DomainNames, key: string) {
			return domainsStore[domain]?.lists[key] as IListData<T[]> | undefined;
		}

		function getRecord<T>(domain: DomainNames, id: string | number) {
			return domainsStore[domain]?.records[id] as IRecordData<T> | undefined;
		}

		function updateListResponse<T>({ domain, key, data, fetchState }: { domain: DomainNames; key: string; data: T[]; fetchState: Partial<IFetchState> }) {
			setDomainsStore(
				produce((state) => {
					if (!state[domain]) {
						state[domain] = createEmptyDomain(domain);
					}
					state[domain].lists[key] = listHandler({ data, fetchState });
				})
			);
		}

		function updateListState({ domain, key, fetchState }: { domain: DomainNames; key: string; fetchState: Partial<IFetchState> }) {
			setDomainsStore(
				produce((state) => {
					if (!state[domain]) {
						state[domain] = createEmptyDomain(domain);
					}
					if (!state[domain].lists[key]) {
						state[domain].lists[key] = listHandler({
							data: [],
							fetchState,
							initialized: false,
						});
					} else {
						state[domain].lists[key].fetchState = {
							...state[domain].lists[key].fetchState,
							...fetchState,
						};
					}
				})
			);
		}

		function updateListValue<T>({ domain, key, data }: { domain: DomainNames; key: string; data: T[] }) {
			setDomainsStore(
				produce((state) => {
					const list = state[domain]?.lists[key];
					if (list) {
						list.data = data;
					}
				})
			);
		}

		function updateRecordResponse<T>({ domain, id, data, fetchState }: { domain: DomainNames; id: string | number; data?: T; fetchState: Partial<IFetchState> }) {
			setDomainsStore(
				produce((state) => {
					if (!state[domain]) {
						state[domain] = createEmptyDomain(domain);
					}
					state[domain].records[id] = recordHandler({ data, fetchState });
				})
			);
		}

		function updateRecordFetchState({ domain, id, fetchState }: { domain: DomainNames; id: string | number; fetchState: Partial<IFetchState> }) {
			setDomainsStore(
				produce((state) => {
					if (!state[domain]) {
						state[domain] = createEmptyDomain(domain);
					}
					if (!state[domain].records[id]) {
						state[domain].records[id] = recordHandler({
							data: undefined,
							fetchState,
							initialized: false,
						});
					} else {
						state[domain].records[id].fetchState = {
							...state[domain].records[id].fetchState,
							...fetchState,
						};
					}
				})
			);
		}

		function updateRecordValue<T>({ domain, id, data }: { domain: DomainNames; id: string | number; data: Partial<T> }) {
			setDomainsStore(
				produce((state) => {
					const recordData = state[domain]?.records[id]?.data;
					if (recordData) {
						Object.assign(recordData, data);
					}
				})
			);
		}

		return {
			get domains() {
				return domainsStore;
			},
			getDomain,
			getList,
			getRecord,
			updateListResponse,
			updateListState,
			updateListValue,
			updateRecordResponse,
			updateRecordFetchState,
			updateRecordValue,
		};
	}

	/* --------------------------- Domain Provider --------------------------- */

	function DomainProvider(props: { children: any }) {
		const factory = createDomainFactory();
		return <DomainContext.Provider value={factory}>{props.children}</DomainContext.Provider>;
	}

	/* --------------------------- useDataList Hook --------------------------- */

	const globalListFetchMap = new Map<string, Promise<any>>();

	function useDataList<Domain extends DomainNames, T extends DomainTypeMap[Domain], F extends Record<string, any> = Record<string, any>>({
		domain,
		fetcher,
		filters,
		isReady = () => true,
	}: {
		domain: Domain;
		fetcher: (filters: Partial<F>) => Promise<T[]>;
		filters?: () => F;
		isReady?: () => boolean | Promise<boolean>;
	}) {
		const ctx = useContext(DomainContext)!;
		const key = createMemo(() => JSON.stringify({ domain, filters: keyGenerator(filters?.()) }));
		const purgedFilters = createMemo(() => keyGenerator(filters?.()) as Partial<F>);
		const listData = createMemo(() => ctx.getList<T>(domain, key()));
		const data = createMemo(() => listData()?.data);

		const [isReadyState, setReady] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
		const canAct = createMemo(() => isReadyState() && !listData()?.fetchState.isLoading && !listData()?.fetchState.isValidating);

		createEffect(async () => {
			try {
				setReady(await isReady());
			} catch {
				setReady(false);
			}
		});

		createEffect(() => {
			if (isReadyState() && (!listData() || !listData()?.fetchState.initialized)) executeFetch();
		});

		async function executeFetch() {
			if (globalListFetchMap.has(key())) return globalListFetchMap.get(key())!;
			ctx.updateListState({ domain, key: key(), fetchState: { isLoading: true } });
			try {
				const promise = fetcher(purgedFilters());
				globalListFetchMap.set(key(), promise);
				const res = await promise;
				ctx.updateListResponse({
					domain,
					key: key(),
					data: res,
					fetchState: { isLoading: false },
				});
				return res;
			} catch (e) {
				ctx.updateListResponse({
					domain,
					key: key(),
					data: [],
					fetchState: { isLoading: false, error: e },
				});
				throw e;
			} finally {
				globalListFetchMap.delete(key());
			}
		}

		return {
			data,
			fetchState: createMemo(() => listData()?.fetchState),
			isLoading: createMemo(() => listData()?.fetchState.isLoading || false),
			isValidating: createMemo(() => listData()?.fetchState.isValidating || false),
			error: createMemo(() => listData()?.fetchState.error),
			refetch: executeFetch,
			mutate: async (updater: T[] | ((curr?: T[]) => T[] | Promise<T[]>)) => {
				if (!canAct()) return;
				if (typeof updater === "function") {
					const current = data();
					const res = await updater(current);
					ctx.updateListValue({ domain, key: key(), data: res });
				} else {
					ctx.updateListValue({ domain, key: key(), data: updater });
				}
			},
			key,
			filters: purgedFilters,
		};
	}

	/* -------------------------- useDataRecord Hook -------------------------- */

	const onGoingRecordFetch = new Map<string, Promise<any>>();

	function useDataRecord<Domain extends DomainNames, T extends DomainTypeMap[Domain]>({
		domain,
		fetcher,
		id,
		isReady = () => true,
	}: {
		domain: Domain;
		id: () => string | number;
		fetcher: (id: string | number) => Promise<T>;
		isReady?: () => boolean | Promise<boolean>;
	}) {
		const ctx = useContext(DomainContext)!;
		const recordData = createMemo(() => ctx.getRecord<T>(domain, id()));
		const [ready, setReady] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
		const fetchId = `${domain}:${id()}`;

		createEffect(async () => {
			try {
				setReady(await isReady());
			} catch {
				setReady(false);
			}
		});

		createEffect(() => {
			if (ready() && !recordData()?.fetchState.initialized) executeFetch();
		});

		async function executeFetch() {
			if (onGoingRecordFetch.has(fetchId)) return onGoingRecordFetch.get(fetchId)!;
			ctx.updateRecordFetchState({ domain, id: id(), fetchState: { isLoading: true } });
			try {
				const promise = fetcher(id());
				onGoingRecordFetch.set(fetchId, promise);
				const res = await promise;
				ctx.updateRecordResponse({
					domain,
					id: id(),
					data: res,
					fetchState: { isLoading: false },
				});
				return res;
			} catch (e) {
				ctx.updateRecordResponse({
					domain,
					id: id(),
					data: undefined,
					fetchState: { isLoading: false, error: e },
				});
				throw e;
			} finally {
				onGoingRecordFetch.delete(fetchId);
			}
		}

		return {
			data: createMemo(() => recordData()?.data),
			fetchState: createMemo(() => recordData()?.fetchState),
			isLoading: createMemo(() => recordData()?.fetchState.isLoading || false),
			isValidating: createMemo(() => recordData()?.fetchState.isValidating || false),
			refetch: executeFetch,
			mutateValue: (val: Partial<T>) => ctx.updateRecordValue({ domain, id: id(), data: val }),
		};
	}

	return {
		DomainProvider,
		useDataList,
		useDataRecord,
	};
}

// Usage example:
/*\\
interface User {
	id: number;
	name: string;
	email: string;
}

interface Product {
	id: number;
	title: string;
	price: number;
}

const domains = [
	{ name: "users" as const, type: {} as User },
	{ name: "products" as const, type: {} as Product },
] as const;

const { DomainProvider, useDataList, useDataRecord } = createDomainContext(domains);

// Now you get full type safety with simple data structures:
function UsersComponent() {
	const { data } = useDataList({
		domain: "users", // ✅ Only "users" | "products" allowed
		fetcher: async (filters) => {
			// Your API call - return simple array
			return [{ id: 1, name: "John", email: "john@example.com" }];
		},
	});

	// data() is automatically typed as User[] | undefined
}

function UserDetailComponent() {
	const { data } = useDataRecord({
		domain: "users", // ✅ Only "users" | "products" allowed
		id: () => 1,
		fetcher: async (id) => {
			// Your API call - return simple object
			return { id: 1, name: "John", email: "john@example.com" };
		},
	});

	// data() is automatically typed as User | undefined
}
*/
