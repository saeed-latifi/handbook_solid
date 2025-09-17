import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { IDomainNames, IResponse, IFetchState, IListData, IRecordData, IDomainStore, ResponseState } from "~/types/response.type";
interface DomainContextValue {
	domains: { [K in IDomainNames]?: IDomainStore<unknown, unknown> };
	getDomain: <T, X>(domain: IDomainNames) => IDomainStore<T, X>;
	getList: <T, X>(domain: IDomainNames, key: string) => IListData<T, X> | undefined;
	getRecord: <T, X>(domain: IDomainNames, id: string | number) => IRecordData<T, X> | undefined;
	updateList: <T, X>(args: { domain: IDomainNames; key: string; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }) => void;
	updateListFetchState: (args: { domain: IDomainNames; key: string; fetchState: Partial<IFetchState> }) => void;
	updateRecord: <T, X>(args: { domain: IDomainNames; id: string | number; data: IResponse<T, X>; fetchState: Partial<IFetchState> }) => void;
	updateRecordFetchState: (args: { domain: IDomainNames; id: string | number; fetchState: Partial<IFetchState> }) => void;
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
	const [domains, onDomain] = createStore<AllDomains>({});

	function getDomain<T, X>(name: IDomainNames): IDomainStore<T, X> {
		if (domains[name]) return domains[name] as IDomainStore<T, X>;
		const emptyDomain = createEmptyDomain<T, X>(name);
		onDomain(name, emptyDomain);
		return emptyDomain;
	}

	function getList<T, X>(name: IDomainNames, key: string): IListData<T, X> | undefined {
		return domains[name]?.lists[key] as IListData<T, X> | undefined;
	}

	function getRecord<T, X>(name: IDomainNames, id: string | number): IRecordData<T, X> | undefined {
		return domains[name]?.records[id] as IRecordData<T, X> | undefined;
	}

	function updateList<T, X>({ domain, key, data, fetchState }: { domain: IDomainNames; key: string; data: IResponse<T[], X>; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) onDomain(domain, { ...createEmptyDomain<T, X>(domain), lists: { [key]: listHandler({ data, fetchState }) } });
		else onDomain(domain, "lists", key, listHandler({ data, fetchState }));
	}

	function updateListFetchState<T, X>({ domain, key, fetchState }: { domain: IDomainNames; key: string; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) onDomain(domain, { ...createEmptyDomain<T, X>(domain), lists: { [key]: listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }) } });
		else if (!domains[domain].lists[key]) onDomain(domain, "lists", key, listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }));
		else onDomain(domain, "lists", key, "fetchState", (prev) => ({ ...prev, ...fetchState }));
	}

	function updateRecord<T, X>({ data, domain, fetchState, id }: { domain: IDomainNames; id: string | number; data: IResponse<T, X>; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) onDomain(domain, { ...createEmptyDomain<T, X>(domain), records: { [id]: recordHandler({ data, fetchState }) } });
		else onDomain(domain, "records", id, recordHandler({ data, fetchState }));
	}

	function updateRecordFetchState<T, X>({ domain, fetchState, id }: { domain: IDomainNames; id: string | number; fetchState: Partial<IFetchState> }) {
		if (!domains[domain]) onDomain(domain, { ...createEmptyDomain<T, X>(domain), records: { [id]: listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }) } });
		else if (!domains[domain].records[id]) onDomain(domain, "records", id, listHandler({ data: { responseState: ResponseState.Success }, fetchState, initialized: false }));
		else onDomain(domain, "records", id, "fetchState", (prev) => ({ ...prev, ...fetchState }));
	}

	const contextValue: DomainContextValue = {
		domains,
		getDomain,
		getList,
		getRecord,
		updateList,
		updateListFetchState,
		updateRecord,
		updateRecordFetchState,
	};

	return <DomainContext.Provider value={contextValue}>{props.children}</DomainContext.Provider>;
}

export { DomainContext };
