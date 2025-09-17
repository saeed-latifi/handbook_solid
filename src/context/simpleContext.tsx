// simpleDomainContext.tsx
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { IDomainSimpleNames, IResponse, IFetchState, IRecordData, ISimpleStore } from "~/types/response.type";
interface SimpleDomainContextValue {
	simpleDomains: ISimpleStore<unknown, unknown>;
	getSimpleDomain: <T, X>(domain: IDomainSimpleNames) => IRecordData<T, X>;
	updateSimpleDomain: <T, X>({ domain, fetchState, data }: { domain: IDomainSimpleNames; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }) => void;
	updateSimpleDomainFetchState: ({ domain, fetchState }: { domain: IDomainSimpleNames; fetchState: Partial<IFetchState> }) => void;
}

const initFetchState: IFetchState = {
	isLoading: false,
	isValidating: false,
	error: undefined,
	initialized: false,
};

function recordHandler<T, X>({ data, fetchState, initialized = true }: { initialized?: boolean; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }): IRecordData<T, X> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

const SimpleDomainContext = createContext<SimpleDomainContextValue>();

export function SimpleDomainProvider(props: { children: any }) {
	const [simpleDomains, setSimpleDomains] = createStore<ISimpleStore<unknown, unknown>>({});

	function getSimpleDomain<T, X>(domain: IDomainSimpleNames): IRecordData<T, X> {
		const exist = simpleDomains[domain] as IRecordData<T, X>;
		if (exist) return exist;

		const defaultDomain: IRecordData<T, X> = recordHandler({ data: {}, fetchState: initFetchState, initialized: false });
		setSimpleDomains(domain, defaultDomain);
		return defaultDomain;
	}

	function updateSimpleDomain<T, X>({ data, domain, fetchState }: { domain: IDomainSimpleNames; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }) {
		setSimpleDomains(domain, recordHandler({ data, fetchState }));
	}

	function updateSimpleDomainFetchState({ domain, fetchState }: { domain: IDomainSimpleNames; fetchState: Partial<IFetchState> }) {
		if (!simpleDomains[domain]) setSimpleDomains(domain, recordHandler({ fetchState: { ...initFetchState, ...fetchState } }));
		else setSimpleDomains(domain, "fetchState", (prev) => ({ ...prev, ...fetchState }));
	}

	const contextValue: SimpleDomainContextValue = {
		simpleDomains,
		getSimpleDomain,
		updateSimpleDomain,
		updateSimpleDomainFetchState,
	};

	return <SimpleDomainContext.Provider value={contextValue}>{props.children}</SimpleDomainContext.Provider>;
}

export { SimpleDomainContext };
