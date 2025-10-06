import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { DomainContext } from "~/context/domainContext";
import { IDomainNames, IResponse } from "~/types/response.type";
import { createDomainListKey, keyGenerator } from "~/utils/keyGenerator";

interface UseListOptions<T, X, F extends Record<string, any> = Record<string, any>> {
	filters?: () => F;
	isReady?: (() => boolean) | (() => Promise<boolean>);
	fetcher: (filters: Partial<F>) => Promise<IResponse<T[], X>> | Promise<IResponse<T[], X>>;
	domain: IDomainNames;
}

const globalListFetchMap = new Map<string, Promise<any>>();

export function useDataList<T = unknown, X = unknown, F extends Record<string, any> = Record<string, any>>({ domain, fetcher, filters, isReady = () => true }: UseListOptions<T, X, F>) {
	type responseType = IResponse<T[], X>;

	const context = useContext(DomainContext);
	if (!context) throw new Error("useList must be used within DomainProvider");

	const key = createMemo(() => createDomainListKey(domain, filters?.()));
	const filterObject = createMemo(() => keyGenerator(filters?.()) as Partial<F>);
	const listData = createMemo(() => context?.getList<T, X>(domain, key()));
	const data = createMemo(() => listData()?.data.data);

	const [isReadyState, setIsReadyState] = createSignal(isReady.constructor.name === "AsyncFunction" ? false : isReady());
	const canAct = createMemo(() => isReadyState() && !listData()?.fetchState?.isLoading && !listData()?.fetchState?.isValidating);

	// Reactive computed values for state
	const isLoading = createMemo(
		() => !listData()?.fetchState.initialized || listData()?.fetchState.isLoading || false
		// TODO  undefined, { equals: (prev, next) => prev === next }
	);
	const isValidating = createMemo(() => listData()?.fetchState.isValidating || false);
	const error = createMemo(() => listData()?.fetchState.error);
	const isInit = createMemo(() => listData()?.fetchState.initialized || false);
	const response = createMemo(() => listData()?.data);

	createEffect(async () => {
		try {
			const result = await isReady();
			setIsReadyState(result);
		} catch (error) {
			console.error(`Ready check failed for domain ${domain}:`, error);
			setIsReadyState(false);
		}
	});

	createEffect(() => {
		if (isReadyState() && (!listData() || !listData()?.fetchState.initialized)) executeFetch();
	});

	async function executeFetch() {
		if (globalListFetchMap.has(key())) return (await globalListFetchMap.get(key())!) as responseType;

		context?.updateListState({ domain, key: key(), fetchState: { isLoading: true, isValidating: false, error: undefined } });

		try {
			const fetchPromise = fetcher(filterObject());
			globalListFetchMap.set(key(), fetchPromise);

			const response = await fetchPromise;
			context?.updateListResponse<T, X>({ domain, key: key(), data: response, fetchState: { isLoading: false, isValidating: false, error: undefined } });

			return response;
		} catch (error) {
			const errorResponse: responseType = { responseState: "ServerError" };
			context?.updateListResponse<T, X>({ domain, key: key(), data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: error } });
		} finally {
			globalListFetchMap.delete(key());
		}
	}

	async function mutate(updater?: T[] | ((currentData?: T[]) => T[] | Promise<T[] | undefined> | undefined)) {
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

	async function mutateResponse(updater?: ((currentData?: responseType) => responseType | Promise<responseType | undefined>) | undefined) {
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

	return {
		domain: context?.getDomain<T, X>(domain),

		data,
		response,

		isLoading,
		isValidating,
		error,
		isInit,

		isReady: isReadyState,

		refetch,
		mutate,
		mutateResponse,

		key,
		filters: filterObject,
	};
}
