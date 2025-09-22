// useSimple.ts
import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { SimpleDomainContext } from "~/context/simpleContext";
import { IDomainSimpleNames, IResponse } from "~/types/response.type";
interface UseSimpleOptions<T, X> {
	isReady?: boolean | (() => boolean) | (() => Promise<boolean>);
	fetcher: () => Promise<IResponse<T, X>>;
	domain: IDomainSimpleNames;
}

const onGoingFetch = new Map<string, Promise<any>>();

export function useDataSimple<T = unknown, X = unknown>({ domain, fetcher, isReady = true }: UseSimpleOptions<T, X>) {
	const context = useContext(SimpleDomainContext);
	if (!context) throw new Error("useSimple must be used within SimpleDomainProvider");

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
		if (canAct() && !simpleData()?.fetchState?.initialized) executeFetch().catch((error) => console.error("Fetch failed:", error));
	});

	async function executeFetch(): Promise<IResponse<T, X> | undefined> {
		if (onGoingFetch.has(domain)) return (await onGoingFetch.get(domain)!) as IResponse<T, X>;

		if (!canAct()) return;
		console.log("fetch");

		context?.updateState({ domain, fetchState: { isLoading: true, isValidating: false, error: undefined } });

		try {
			const fetchPromise = fetcher();
			onGoingFetch.set(domain, fetchPromise);

			const response = await fetchPromise;
			context?.updateResponse<T, X>({ domain, data: response, fetchState: { isLoading: false, isValidating: false, error: undefined } });

			return response;
		} catch (error) {
			const errorResponse: IResponse<T, X> = { responseState: "ServerError" };

			context?.updateResponse<T, X>({ domain, data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: (error as Error).message } });

			return errorResponse;
			// throw error;
		} finally {
			onGoingFetch.delete(domain);
		}
	}

	async function mutateResponse(updater: ((currentResponse?: Partial<IResponse<T, X>>) => Partial<IResponse<T, X>> | Promise<Partial<IResponse<T, X>>> | undefined) | Partial<IResponse<T, X>> | undefined) {
		try {
			if (!updater || !canAct()) return;
			console.log("mutate response");

			const currentResponse = context?.get<T, X>(domain)?.data;

			if (typeof updater === "function") {
				context?.updateState({ domain, fetchState: { isValidating: true } });
				const res = await updater(currentResponse);
				context?.updateState({ domain, fetchState: { isValidating: false } });
				if (!res) return;

				context?.updateResponse<T, X>({ domain, data: res, fetchState: {} });
			} else context?.updateResponse<T, X>({ domain, data: updater, fetchState: {} });
		} catch (error) {
			context?.updateState({ domain, fetchState: { error: error instanceof Error ? error : new Error(String(error)) } });
		}
	}

	async function mutateValue(newData: Partial<T>) {
		if (!canAct()) return;

		context?.updateValue<T>({ domain, data: newData });
	}

	return {
		data: () => simpleData()?.data?.data,
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
