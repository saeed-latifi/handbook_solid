import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { DomainContext, listHandler } from "~/context/domainContext";
import { IDomainNames, IListData, IResponse, ResponseState } from "~/types/response.type";
import { createDomainListKey, keyGenerator } from "~/utils/keyGenerator";

interface UseListOptions<T, X, F extends Record<string, any> = Record<string, any>> {
	filters?: () => F;
	isReady?: boolean | (() => boolean) | (() => Promise<boolean>);
	fetcher: (filters: Partial<F>) => Promise<IResponse<T[], X>> | Promise<IResponse<T[], X>>;
	domain: IDomainNames;
}

const globalListFetchMap = new Map<string, Promise<any>>();

export function useDataList<T = unknown, X = unknown, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = true }: UseListOptions<T, X, F>) {
	const context = useContext(DomainContext);
	if (!context) throw new Error("useList must be used within DomainProvider");

	// const filterObject = keyGenerator(filters) as Partial<F>;
	const filterObject = createMemo(() => keyGenerator(filters?.()) as Partial<F>);

	const key = createMemo(() => createDomainListKey(domain, filters?.()));

	const listData = createMemo(() => context?.getList<T, X>(domain, key()));

	const [isReadyState, setIsReadyState] = createSignal(typeof isReady === "boolean" ? isReady : isReady.constructor.name === "AsyncFunction" ? false : isReady());

	const canAct = createMemo(() => isReadyState() && !listData()?.fetchState?.isLoading && !listData()?.fetchState?.isValidating);

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
		console.log({ filterObject: filterObject() });

		if (isReadyState() && (!listData() || !listData()?.fetchState.initialized)) {
			executeFetch().catch((error) => {
				console.error("Fetch failed:", error);
			});
		}
	});

	async function executeFetch(): Promise<IResponse<T[], X>> {
		if (globalListFetchMap.has(key())) return (await globalListFetchMap.get(key())!) as IResponse<T[], X>;

		context?.updateListState({ domain, key: key(), fetchState: { isLoading: true, isValidating: false, error: undefined } });

		try {
			const fetchPromise = fetcher(filterObject());
			globalListFetchMap.set(key(), fetchPromise);

			const response = await fetchPromise;
			context?.updateListResponse<T, X>({ domain, key: key(), data: response, fetchState: { isLoading: false, isValidating: false, error: undefined } });

			return response;
		} catch (error) {
			const errorResponse: IResponse<T[], X> = { responseState: "ServerError" };

			context?.updateListResponse<T, X>({ domain, key: key(), data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: error } });

			throw error;
		} finally {
			globalListFetchMap.delete(key());
		}
	}

	async function mutate(updater: ((currentData: T[] | undefined) => T[] | Promise<T[] | undefined> | undefined) | T[] | undefined) {
		if (!updater || !canAct()) return;

		const existingList = context?.getList<T, X>(domain, key());
		const currentData = existingList?.data.data;

		if (typeof updater === "function") {
			context?.updateListState({ domain, fetchState: { isValidating: true }, key: key() });
			const res = await updater(currentData);
			context?.updateListState({ domain, fetchState: { isValidating: false }, key: key() });
			if (!res) return;

			context?.updateListValue({ domain, data: res, key: key() });
		} else context?.updateListValue({ domain, key: key(), data: updater });
	}

	async function mutateResponse(updater: ((currentData: IResponse<T[], X> | undefined) => IResponse<T[], X> | Promise<IResponse<T[], X> | undefined> | undefined) | IResponse<T[], X> | undefined) {
		if (!updater || !canAct()) return;

		const existingList = context?.getList<T, X>(domain, key());

		if (typeof updater === "function") {
			context?.updateListState({ domain, fetchState: { isValidating: true }, key: key() });
			const res = await updater(existingList?.data);
			context?.updateListState({ domain, fetchState: { isValidating: false }, key: key() });
			if (!res) return;

			context?.updateListResponse({ domain, data: res, key: key(), fetchState: {} });
		} else context?.updateListResponse({ domain, key: key(), data: updater, fetchState: {} });
	}

	const refetch = () => executeFetch();

	const data = createMemo(() => context?.getList<T, X>(domain, key())?.data.data);

	const currentListData = createMemo(() => context?.getList<T, X>(domain, key()));

	createEffect(() => {
		const list = currentListData();
		if (list?.data) {
			console.log("zzzz", list.data.data);
		}
	});

	return {
		domain: context?.getDomain<T, X>(domain),

		data,
		response: () => listData()?.data,

		isLoading: () => !listData()?.fetchState.initialized || listData()?.fetchState.isLoading || false,
		isValidating: () => listData()?.fetchState.isValidating || false,
		error: () => listData()?.fetchState.error,
		isInit: () => listData()?.fetchState.initialized || false,

		isReady: isReadyState,

		refetch,
		mutate,
		mutateResponse,

		key,
		filters: filterObject,
	};
}
