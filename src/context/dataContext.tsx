// simpleDomainContext.tsx
import { createContext, createEffect, createMemo, createSignal, useContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

// -----------------------------
// Core Types
// -----------------------------
const ResponseState = {
	Success: "Ok",
	NoAccount: "NoAccount",
	NoAccess: "NoAccess",
	NotFound: "NotFound",
	ServerError: "ServerError",
	Validations: "Validations",
} as const;

type ResponseState = (typeof ResponseState)[keyof typeof ResponseState];

type IValidations<T> = { [K in keyof T]?: string[] };

interface IResponse<T = undefined, X = undefined> {
	responseState?: ResponseState;
	data?: T;
	metadata?: X;
	length?: number;

	messages?: Partial<Record<"success" | "error" | "warning" | "noAccess" | "notFound", string[]>>;
	validations?: IValidations<T>;
	redirectPath?: string;
}

interface IFetchState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: Error | any;
}

export interface IListData<T, X> {
	data: IResponse<T[], X>;
	fetchState: IFetchState;
}

export interface IRecordData<T, X> {
	data?: IResponse<T, X>;
	fetchState: IFetchState;
}

// export interface IDataStore<T, X, DomainNames extends string> {
// 	name: DomainNames;
// 	lists: Record<string, IListData<T, X>>;
// 	records: Record<string | number, IRecordData<T, X>>;
// 	basics: Record<string, IRecordData<T, X>>;
// }

type ISimpleStore<T, X, DomainNames extends string> = {
	[key in DomainNames]?: IRecordData<T, X>;
};

interface SimpleDomainContextValue<DomainNames extends string> {
	simpleDomains: ISimpleStore<unknown, unknown, DomainNames>;
	get: <T, X>(domain: DomainNames) => IRecordData<T, X>;
	updateResponse: <T, X>(args: { domain: DomainNames; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }) => void;
	updateState: (args: { domain: DomainNames; fetchState: Partial<IFetchState> }) => void;
	updateValue: <T>(args: { domain: DomainNames; data: Partial<T> }) => void;
}

// -----------------------------
// Helpers
// -----------------------------
const initFetchState: IFetchState = {
	isLoading: false,
	isValidating: false,
	error: undefined,
	initialized: false,
};

interface UseSimpleOptions<T, X, DomainNames extends string> {
	isReady?: boolean | (() => boolean) | (() => Promise<boolean>);
	fetcher: () => Promise<IResponse<T, X>>;
	domain: DomainNames;
}

function recordHandler<T, X>({ data, fetchState, initialized = true }: { initialized?: boolean; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }): IRecordData<T, X> {
	return { data, fetchState: { ...initFetchState, ...fetchState, initialized } };
}

// Track in-flight requests
const onGoingFetch = new Map<string, Promise<any>>();

// -----------------------------
// Main Context Factory
// -----------------------------
export function createSimpleDomainContext<DomainNames extends string>() {
	const SimpleDomainContext = createContext<SimpleDomainContextValue<DomainNames>>();

	function SimpleDomainProvider(props: { children: any }) {
		const [simpleDomains, setSimpleDomains] = createStore<ISimpleStore<unknown, unknown, DomainNames>>({});

		// -----------------------------
		// Core Store Operations
		// -----------------------------
		function get<T, X>(domain: DomainNames): IRecordData<T, X> {
			const exist = simpleDomains[domain] as IRecordData<T, X>;
			if (exist) return exist;

			const defaultDomain: IRecordData<T, X> = recordHandler({
				data: {},
				fetchState: initFetchState,
				initialized: false,
			});

			setSimpleDomains(
				produce((state) => {
					state[domain] = defaultDomain;
				})
			);

			return defaultDomain;
		}

		function updateResponse<T, X>({ data, domain, fetchState }: { domain: DomainNames; data?: IResponse<T, X>; fetchState?: Partial<IFetchState> }) {
			setSimpleDomains(
				produce((state) => {
					state[domain] = recordHandler({ data, fetchState });
				})
			);
		}

		function updateState({ domain, fetchState }: { domain: DomainNames; fetchState: Partial<IFetchState> }) {
			setSimpleDomains(
				produce((state) => {
					const target = state[domain];

					if (!target) {
						state[domain] = recordHandler({
							fetchState: { ...initFetchState, ...fetchState },
						});
						return;
					}

					target.fetchState = { ...target.fetchState, ...fetchState };
				})
			);
		}

		function updateValue<T>({ domain, data }: { domain: DomainNames; data: Partial<T> }) {
			setSimpleDomains(
				produce((state) => {
					const target = state[domain];
					if (!target?.data?.data) return;

					target.data.data = { ...target.data.data, ...data };
				})
			);
		}

		const contextValue: SimpleDomainContextValue<DomainNames> = {
			simpleDomains,
			get,
			updateResponse,
			updateState,
			updateValue,
		};

		return <SimpleDomainContext.Provider value={contextValue}>{props.children}</SimpleDomainContext.Provider>;
	}

	// -----------------------------
	// Hook: useDataSimple
	// -----------------------------
	function useDataSimple<T = unknown, X = unknown>({ domain, fetcher, isReady = () => true }: UseSimpleOptions<T, X, DomainNames>) {
		const context = useContext(SimpleDomainContext);
		if (!context) throw new Error("useDataSimple must be used within SimpleDomainProvider");

		const simpleData = createMemo(() => context.get<T, X>(domain));

		const [isReadyState, setIsReadyState] = createSignal(typeof isReady === "boolean" ? isReady : isReady.constructor.name === "AsyncFunction" ? false : isReady());

		const canAct = createMemo(() => isReadyState() && !simpleData()?.fetchState?.isLoading && !simpleData()?.fetchState?.isValidating);

		createEffect(async () => {
			if (typeof isReady === "boolean") {
				setIsReadyState(isReady);
				return;
			}

			try {
				const result = await isReady();
				setIsReadyState(result);
			} catch (error) {
				console.error(`Ready check failed for domain ${domain}:`, error);
				setIsReadyState(false);
			}
		});

		createEffect(() => {
			if (canAct() && !simpleData()?.fetchState?.initialized) {
				executeFetch().catch((error) => console.error("Fetch failed:", error));
			}
		});

		async function executeFetch(): Promise<IResponse<T, X> | undefined> {
			if (onGoingFetch.has(domain)) return (await onGoingFetch.get(domain)!) as IResponse<T, X>;

			if (!canAct()) return;

			context?.updateState({
				domain,
				fetchState: { isLoading: true, isValidating: false, error: undefined },
			});

			try {
				const fetchPromise = fetcher();
				onGoingFetch.set(domain, fetchPromise);

				const response = await fetchPromise;
				context?.updateResponse<T, X>({
					domain,
					data: response,
					fetchState: { isLoading: false, isValidating: false, error: undefined },
				});

				return response;
			} catch (error) {
				const errorResponse: IResponse<T, X> = { responseState: "ServerError" };

				context?.updateResponse<T, X>({ domain, data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: (error as Error).message } });

				return errorResponse;
			} finally {
				onGoingFetch.delete(domain);
			}
		}

		async function mutateResponse(
			updater: ((currentResponse?: Partial<IResponse<T, X>>) => Partial<IResponse<T, X>> | Promise<Partial<IResponse<T, X>>> | undefined) | Partial<IResponse<T, X>> | undefined
		) {
			try {
				if (!updater || !canAct()) return;

				const currentResponse = context?.get<T, X>(domain)?.data;

				if (typeof updater === "function") {
					context?.updateState({ domain, fetchState: { isValidating: true } });
					const res = await updater(currentResponse);
					context?.updateState({ domain, fetchState: { isValidating: false } });

					if (!res) return;

					context?.updateResponse<T, X>({ domain, data: res, fetchState: {} });
				} else {
					context?.updateResponse<T, X>({ domain, data: updater, fetchState: {} });
				}
			} catch (error) {
				context?.updateState({ domain, fetchState: { error: error instanceof Error ? error : new Error(String(error)) } });
			}
		}

		async function mutateValue(newData: Partial<T>) {
			if (!canAct()) return;
			context?.updateValue<T>({ domain, data: newData });
		}

		const data = createMemo(() => simpleData()?.data?.data);

		return {
			data,
			response: () => simpleData()?.data,
			isLoading: () => !simpleData()?.fetchState?.initialized || simpleData()?.fetchState?.isLoading,
			isValidating: () => simpleData()?.fetchState?.isValidating || false,
			error: () => simpleData()?.fetchState?.error,
			isInit: () => simpleData()?.fetchState?.initialized || false,
			isReady: isReadyState,
			refetch: executeFetch,
			mutateResponse,
			mutateValue,
		};
	}

	return { SimpleDomainProvider, useDataSimple };
}
