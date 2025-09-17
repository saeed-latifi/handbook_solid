import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { DomainContext, listHandler } from "~/context/domainContext";
import { IDomainNames, IListData, IResponse, ResponseState } from "~/types/response.type";
import { createDomainListKey, keyGenerator } from "~/utils/keyGenerator";

interface UseListOptions<T, X, F extends Record<string, any> = Record<string, any>> {
	filters?: F;
	isReady?: boolean | (() => boolean) | (() => Promise<boolean>);
	fetcher: (filters: Partial<F>) => Promise<IResponse<T[], X>>;
	domain: IDomainNames;
}

const globalListFetchMap = new Map<string, Promise<any>>();

export function useDataList<T = unknown, X = unknown, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = true }: UseListOptions<T, X, F>) {
	const context = useContext(DomainContext);
	if (!context) throw new Error("useList must be used within DomainProvider");

	const filterObject = keyGenerator(filters) as Partial<F>;
	const key = createDomainListKey(domain, filters);

	const listData = createMemo(() => context?.getList<T, X>(domain, key));

	const [isReadyState, setIsReadyState] = createSignal(typeof isReady === "boolean" ? isReady : isReady.constructor.name === "AsyncFunction" ? false : isReady());

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
		if (isReadyState() && (!listData() || !listData()?.fetchState.initialized)) {
			executeFetch().catch((error) => {
				console.error("Fetch failed:", error);
			});
		}
	});

	async function executeFetch(): Promise<IResponse<T[], X>> {
		if (globalListFetchMap.has(key)) return (await globalListFetchMap.get(key)!) as IResponse<T[], X>;

		context?.updateListFetchState({ domain, key, fetchState: { isLoading: true, isValidating: false, error: undefined } });

		try {
			const fetchPromise = fetcher(filterObject);
			globalListFetchMap.set(key, fetchPromise);

			const response = await fetchPromise;
			context?.updateList<T, X>({ domain, key, data: response, fetchState: { isLoading: false, isValidating: false, error: undefined } });

			return response;
		} catch (error) {
			const errorResponse: IResponse<T[], X> = { responseState: "ServerError" };

			context?.updateList<T, X>({ domain, key, data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: error } });

			throw error;
		} finally {
			globalListFetchMap.delete(key);
		}
	}

	async function mutate(updater: ((currentData: T[] | undefined) => T[] | Promise<T[]> | undefined) | T[] | undefined) {
		const existingList = context?.getList<T, X>(domain, key);
		const currentData = existingList?.data.data;

		let newData: T[];

		// TODO isValidating on async fetch
		if (typeof updater === "function") {
			const result = updater(currentData);
			if (!result) return;

			newData = result instanceof Promise ? await result : result;
		} else if (updater) newData = updater;
		else return;

		context?.updateList<T, X>({ domain, key, data: { ...(existingList?.data ?? { responseState: ResponseState.Success }), data: newData }, fetchState: {} });
	}

	const refetch = () => executeFetch();

	return {
		domain: context?.getDomain<T, X>(domain),

		data: () => listData()?.data.data,
		response: () => listData()?.data,

		isLoading: () => !listData()?.fetchState.initialized || listData()?.fetchState.isLoading || false,
		isValidating: () => listData()?.fetchState.isValidating || false,
		error: () => listData()?.fetchState.error,
		isInit: () => listData()?.fetchState.initialized || false,

		isReady: isReadyState,

		refetch,
		mutate,

		key,
		filters: filterObject,
	};
}
