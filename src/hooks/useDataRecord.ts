import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { DomainContext } from "~/context/domainContext";
import { IDomainNames, IResponse } from "~/types/response.type";

interface UseRecordOptions<T, X> {
	id: () => string | number;
	isReady?: () => boolean | Promise<boolean>;
	fetcher: (id: string | number) => Promise<IResponse<T, X>>;
	domain: IDomainNames;
}

const onGoingRecordFetch = new Map<string, Promise<any>>();

export function useDataRecord<T = unknown, X = unknown>({ domain, fetcher, id, isReady = () => true }: UseRecordOptions<T, X>) {
	console.log({ id: id() });

	const context = useContext(DomainContext);
	if (!context) throw new Error("useRecord must be used within DomainProvider");

	const recordData = createMemo(() => context?.getRecord<T, X>({ domain, id: id() }));

	const [isReadyState, setIsReadyState] = createSignal(typeof isReady === "boolean" ? isReady : isReady.constructor.name === "AsyncFunction" ? false : isReady());

	const fetchId = `:${domain}:${id}:`;

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

	const canAct = createMemo(() => isReadyState() && !recordData()?.fetchState?.isLoading && !recordData()?.fetchState?.isValidating);

	createEffect(() => {
		console.log("mmm", id());

		if (canAct() && !recordData()?.fetchState?.initialized) executeFetch().catch((error) => console.error("Fetch failed:", error));
	});

	async function executeFetch(): Promise<IResponse<T, X> | undefined> {
		if (onGoingRecordFetch.has(fetchId)) return (await onGoingRecordFetch.get(fetchId)!) as IResponse<T, X>;

		if (!canAct()) return;
		console.log("fetch");

		context?.updateRecordFetchState({ domain, fetchState: { isLoading: true, isValidating: false, error: undefined }, id: id() });

		try {
			const fetchPromise = fetcher(id());
			onGoingRecordFetch.set(fetchId, fetchPromise);

			const response = await fetchPromise;

			console.log({ response });

			context?.updateRecordResponse<T, X>({ domain, data: response, fetchState: { isLoading: false, isValidating: false, error: undefined }, id: id() });

			return response;
		} catch (error) {
			const errorResponse: IResponse<T, X> = { responseState: "ServerError" };

			context?.updateRecordResponse<T, X>({ domain, data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: (error as Error).message }, id: id() });

			return errorResponse;
		} finally {
			onGoingRecordFetch.delete(fetchId);
		}
	}

	// Helper function to sync record across all lists in the domain
	function syncRecordAcrossLists(updatedRecord: Partial<IResponse<T, X>>) {
		const domainStore = context?.getDomain<T, X>(domain);
		if (!domainStore) return;

		// Iterate through all lists in this domain
		Object.entries(domainStore.lists).forEach(([listKey, listData]) => {
			if (listData.data.data) {
				// Check if the record exists in this list
				const recordIndex = listData.data.data.findIndex((item: any) => item.id === id);

				if (recordIndex !== -1) {
					// Update the record in the list
					const updatedListData = [...listData.data.data];

					if (updatedRecord.data) {
						// Replace the entire record
						updatedListData[recordIndex] = updatedRecord.data;
					} else {
						// Merge partial updates
						updatedListData[recordIndex] = {
							...updatedListData[recordIndex],
							...updatedRecord.data,
						};
					}

					// Update the list with the modified data
					context?.updateListResponse<T, X>({
						domain,
						key: listKey,
						data: { ...listData.data, data: updatedListData },
						fetchState: {},
					});
				}
			}
		});
	}

	async function mutateResponse(
		updater: ((currentResponse?: Partial<IResponse<T, X>>) => Partial<IResponse<T, X>> | Promise<Partial<IResponse<T, X>>> | undefined) | Partial<IResponse<T, X>> | undefined,
		options: { isSync?: boolean } = { isSync: false }
	) {
		try {
			if (!updater || !canAct()) return;
			console.log("mutate");

			const currentResponse = context?.getRecord<T, X>({ domain, id: id() })?.data;

			let updatedResponse: Partial<IResponse<T, X>>;

			if (typeof updater === "function") {
				context?.updateRecordFetchState({ domain, fetchState: { isValidating: true }, id: id() });
				const result = await updater(currentResponse);
				context?.updateRecordFetchState({ domain, fetchState: { isValidating: false }, id: id() });
				if (!result) return;

				updatedResponse = result;
			} else {
				updatedResponse = updater;
			}

			// Update the record
			context?.updateRecordResponse<T, X>({ domain, data: updatedResponse, fetchState: {}, id: id() });

			// Sync across lists if requested
			if (options.isSync) {
				syncRecordAcrossLists(updatedResponse);
			}
		} catch (error) {
			context?.updateRecordFetchState({ domain, fetchState: { error: error instanceof Error ? error : new Error(String(error)) }, id: id() });
		}
	}

	async function mutateValue(newData: Partial<T>) {
		if (!canAct()) return;

		context?.updateRecordValue<T>({ domain, id: id(), data: newData });
	}

	return {
		domain: context?.getDomain<T, X>(domain),

		data: () => recordData()?.data?.data,
		response: () => recordData()?.data,

		isLoading: () => !recordData()?.fetchState.initialized || recordData()?.fetchState.isLoading || false,
		isValidating: () => recordData()?.fetchState.isValidating || false,
		error: () => recordData()?.fetchState.error,
		isInit: () => recordData()?.fetchState.initialized || false,

		isReady: isReadyState,

		refetch: executeFetch,
		mutateResponse,
		mutateValue,

		id,
	};
}
