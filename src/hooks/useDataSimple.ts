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

	const simpleData = createMemo(() => context.getSimpleDomain<T, X>(domain));

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

	const canAct = createMemo(() => isReadyState() && !simpleData()?.fetchState?.isLoading && !simpleData()?.fetchState?.isValidating);

	createEffect(() => {
		if (canAct() && !simpleData()?.fetchState?.initialized) executeFetch().catch((error) => console.error("Fetch failed:", error));
	});

	async function executeFetch(): Promise<IResponse<T, X> | undefined> {
		if (onGoingFetch.has(domain)) return (await onGoingFetch.get(domain)!) as IResponse<T, X>;

		if (!canAct()) return;
		console.log("fetch");

		context?.updateSimpleDomainFetchState({ domain, fetchState: { isLoading: true, isValidating: false, error: undefined } });

		try {
			const fetchPromise = fetcher();
			onGoingFetch.set(domain, fetchPromise);

			const response = await fetchPromise;
			context?.updateSimpleDomain<T, X>({ domain, data: response, fetchState: { isLoading: false, isValidating: false, error: undefined } });

			return response;
		} catch (error) {
			const errorResponse: IResponse<T, X> = { responseState: "ServerError" };

			context?.updateSimpleDomain<T, X>({ domain, data: errorResponse, fetchState: { isLoading: false, isValidating: false, error: (error as Error).message } });

			return errorResponse;
			// throw error;
		} finally {
			onGoingFetch.delete(domain);
		}
	}

	async function mutate(updater: ((currentResponse?: Partial<IResponse<T, X>>) => Partial<IResponse<T, X>> | Promise<Partial<IResponse<T, X>>> | undefined) | Partial<IResponse<T, X>> | undefined) {
		try {
			if (!updater || !canAct()) return;
			console.log("mutate");

			const currentResponse = context?.getSimpleDomain<T, X>(domain)?.data;

			if (typeof updater === "function") {
				context?.updateSimpleDomainFetchState({ domain, fetchState: { isValidating: true } });
				const res = await updater(currentResponse);
				context?.updateSimpleDomainFetchState({ domain, fetchState: { isValidating: false } });
				if (!res) return;

				context?.updateSimpleDomain<T, X>({ domain, data: res, fetchState: {} });
			} else context?.updateSimpleDomain<T, X>({ domain, data: updater, fetchState: {} });
		} catch (error) {
			context?.updateSimpleDomainFetchState({ domain, fetchState: { error: error instanceof Error ? error : new Error(String(error)) } });
		}
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
		mutate,
	};
}
