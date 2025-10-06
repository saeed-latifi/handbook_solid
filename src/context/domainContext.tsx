import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { IDomainNames, IResponse, IFetchState, IListData, IRecordData, IDomainStore, ResponseState } from "~/types/response.type";

interface DomainContextValue {
	get domains(): { [K in IDomainNames]?: IDomainStore<unknown, unknown> };
	getDomain: <T, X>(domain: IDomainNames) => IDomainStore<T, X>;
	getList: <T, X>(domain: IDomainNames, key: string) => IListData<T, X> | undefined;
	getRecord: <T, X>(props: { domain: IDomainNames; id: string | number }) => IRecordData<T, X> | undefined;
	updateListResponse: <T, X>(args: { domain: IDomainNames; key: string; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }) => void;
	updateListState: (args: { domain: IDomainNames; key: string; fetchState: Partial<IFetchState> }) => void;
	updateListValue: <T>({ domain, key, data }: { domain: IDomainNames; key: string; data: T[] }) => void;
	updateRecordResponse: <T, X>(args: { domain: IDomainNames; id: string | number; data: IResponse<T, X>; fetchState: Partial<IFetchState> }) => void;
	updateRecordFetchState: (args: { domain: IDomainNames; id: string | number; fetchState: Partial<IFetchState> }) => void;
	updateRecordValue: <T>(args: { domain: IDomainNames; data: Partial<T>; id: string | number }) => void;
}

type AllDomains = { [K in IDomainNames]?: IDomainStore<unknown, unknown> };

const DomainContext = createContext<DomainContextValue>();

const initFetchState: IFetchState = {
	isLoading: false,
	isValidating: false,
	error: undefined,
	initialized: false,
};

function createEmptyDomain<T, X>(name: IDomainNames): IDomainStore<T, X> {
	return { name, lists: {}, records: {} };
}

export function listHandler<T, X>({ data, fetchState, initialized = true }: { initialized?: boolean; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }): IListData<T, X> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

export function recordHandler<T, X>({ data, fetchState, initialized = true }: { initialized?: boolean; data: IResponse<T, X>; fetchState: Partial<IFetchState> }): IRecordData<T, X> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

export function DomainProvider(props: { children: any }) {
	const [domains, setDomains] = createStore<AllDomains>({});

	function getDomain<T, X>(name: IDomainNames): IDomainStore<T, X> {
		if (domains[name]) return domains[name] as IDomainStore<T, X>;
		const emptyDomain = createEmptyDomain<T, X>(name);
		setDomains(name, emptyDomain);
		return emptyDomain;
	}

	function getList<T, X>(name: IDomainNames, key: string): IListData<T, X> | undefined {
		return domains[name]?.lists[key] as IListData<T, X> | undefined;
	}

	function getRecord<T, X>({ id, domain }: { domain: IDomainNames; id: string | number }): IRecordData<T, X> | undefined {
		return domains[domain]?.records[id] as IRecordData<T, X> | undefined;
	}

	function updateListResponse<T, X>({ domain, key, data, fetchState }: { domain: IDomainNames; key: string; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) setDomains(domain, { ...createEmptyDomain<T, X>(domain), lists: { [key]: listHandler({ data, fetchState }) } });
		else setDomains(domain, "lists", key, listHandler({ data, fetchState }));
	}

	// TODO batch function updateListResponseX<T, X>({ domain, key, data, fetchState }: { domain: IDomainNames; key: string; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }) {
	// 	batch(() => {
	// 		if (!domains[domain]) setDomains(domain, { ...createEmptyDomain<T, X>(domain), lists: { [key]: listHandler({ data, fetchState }) } });
	// 		else setDomains(domain, "lists", key, listHandler({ data, fetchState }));
	// 	});
	// }

	function updateListState({ domain, key, fetchState }: { domain: IDomainNames; key: string; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) setDomains(domain, { ...createEmptyDomain(domain), lists: { [key]: listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }) } });
		else if (!domains[domain]!.lists[key]) setDomains(domain, "lists", key, listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }));
		else setDomains(domain, "lists", key, "fetchState", (prev) => ({ ...prev, ...fetchState }));
	}

	function updateListValue<T>({ domain, key, data }: { domain: IDomainNames; key: string; data: T[] }) {
		if (!domains[domain]?.lists[key]?.data?.data) return;
		setDomains(domain, "lists", key, "data", "data", data);
	}

	function updateRecordResponse<T, X>({ data, domain, fetchState, id }: { domain: IDomainNames; id: string | number; data: IResponse<T, X>; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) setDomains(domain, { ...createEmptyDomain<T, X>(domain), records: { [id]: recordHandler({ data, fetchState }) } });
		else setDomains(domain, "records", id, recordHandler({ data, fetchState }));
	}

	function updateRecordFetchState({ domain, fetchState, id }: { domain: IDomainNames; id: string | number; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) setDomains(domain, { ...createEmptyDomain(domain), records: { [id]: recordHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }) } });
		else if (!domains[domain]!.records[id]) setDomains(domain, "records", id, recordHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }));
		else setDomains(domain, "records", id, "fetchState", (prev) => ({ ...prev, ...fetchState }));
	}

	function updateRecordValue<T>({ domain, data, id }: { domain: IDomainNames; data: Partial<T>; id: string | number }) {
		if (!domains[domain]?.records[id]?.data?.data) return;

		setDomains(domain, "records", id, "data", "data", (prev: T) => ({ ...prev, ...data }));
	}

	// Reactive context value with getters
	const contextValue: DomainContextValue = {
		// Reactive getter for domains - always returns current state
		get domains() {
			return domains;
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

	return <DomainContext.Provider value={contextValue}>{props.children}</DomainContext.Provider>;
}

export { DomainContext };
