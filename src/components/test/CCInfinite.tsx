import { LoadingSpinner } from "../animations/LoadingSpinner";
import Scroller from "../observer/scroller";
import { For, Match, Switch } from "solid-js";
import { http } from "../http";
import { IResponse } from "~/types/response.type";
import { ICourse } from "~/types/course.type";
import { pageSize } from "~/appConfig";
import { useBarnRecord } from "~/hooks/useBarnRecord";
import { sleep } from "~/utils/sleep";
import { useSearchParams } from "@solidjs/router";

function useInfinite() {
	const [params, setParams] = useSearchParams();

	const { key, data, mutate, dataState, isReady, canAct, refetch, asyncMutate } = useBarnRecord({
		domain: "courses",
		isReady: async () => {
			await sleep(1000);
			return true;
		},
		fetcher: async () => {
			const users: IResponse<ICourse[]> = await fetcher(0);
			return users;
		},
		filters: () => ({
			id: params.x?.toString() ?? "",
		}),
	});

	function hasMore() {
		// return false;
		console.log("canAct", canAct());

		if (!canAct()) return false;
		if ((data().data?.length ?? 0) < (data().length ?? 0)) return true;
		return false;
	}

	async function loadMore() {
		asyncMutate(async (mutator, prev) => {
			const userPage = await fetcher(prev.data?.length ?? 0);
			await sleep(1000);
			mutator("data", (p) => [...(p ?? []), ...(userPage.data ?? [])]);
		});

		// =============================================
		// const fff = data().data;
		// onValidate(true);
		// const userPage = await fetcher(fff?.length ?? 0);
		// if (userPage.data) mutate("data", (p) => [...(p ?? []), ...(userPage.data ?? [])]);
		// await sleep(100);
		// onValidate(false);
	}

	return { key, data, mutate, dataState, isReady, hasMore, loadMore };
}

async function fetcher(skip: number) {
	const res = await http.get("/dashboard/courses", { params: { take: pageSize, skip } });

	const data: IResponse<ICourse[]> = res.data;
	return data;
}

export function CCInfinite() {
	const { data, hasMore, dataState, mutate, loadMore, isReady } = useInfinite();

	return (
		<Switch>
			<Match when={!isReady()}>
				<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">not ready ...</div>
			</Match>

			<Match when={dataState().isLoading}>
				<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">loading ...</div>
			</Match>

			<Match when={data()}>
				<Scroller
					class="flex flex-col w-full gap-2"
					hasMore={hasMore()}
					loadMore={loadMore}
					loading={{
						isLoading: dataState().isValidating,
						LoadingBox: (
							<div class="flex w-full p-2 items-center justify-center">
								<LoadingSpinner class="w-6 h-6" />
							</div>
						),
					}}
				>
					<For each={data().data}>
						{(item) => (
							<div class="bg-amber-200 rounded-full w-full flex items-center justify-center gap-2">
								<span>{item.title}</span>
								<span>{item.id}</span>
							</div>
						)}
					</For>
				</Scroller>
			</Match>
		</Switch>
	);
}
