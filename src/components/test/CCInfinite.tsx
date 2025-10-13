import { LoadingSpinner } from "../animations/LoadingSpinner";
import Scroller from "../observer/scroller";
import { For, Match, Switch } from "solid-js";
import { http } from "../http";
import { IResponse } from "~/types/response.type";
import { ICourse } from "~/types/course.type";
import { pageSize } from "~/appConfig";
import { useBarnRecord } from "~/hooks/useBarnRecord";
import { sleep } from "~/utils/sleep";

function useInfinite() {
	const { key, data, mutate, dataState, isReady, canAct, refetch, onValidate, asyncMutate } = useBarnRecord({
		domain: "courses",
		isReady: () => true,
		fetcher: async ({ id }) => {
			const users: ICourse[] = (await fetcher(0)).data ?? [];
			return users;
		},
		filters: () => ({
			id: 1,
		}),
	});

	function hasMore() {
		console.log("canAct", canAct());

		if (!canAct()) return false;
		if (!data() || (data()?.length ?? 0) < 50) return true;
		// if (!data() || (data()?.length ?? 0) < (data().length ?? 0)) return true;
		return false;
	}

	return { key, data, mutate, dataState, isReady, hasMore, onValidate };
}

async function fetcher(skip: number) {
	const res = await http.get("/dashboard/courses", { params: { take: pageSize, skip } });

	const data: IResponse<ICourse[]> = res.data;
	return data;
}

export function CCInfinite() {
	const { data, hasMore, dataState, onValidate, mutate } = useInfinite();

	async function loadMore() {
		const fff = data();
		onValidate(true);
		const userPage = await fetcher(fff?.length ?? 0);
		// const asdasd = [...(data() ?? []), ...(userPage.data ?? [])];
		// console.log(asdasd);
		if (userPage.data) mutate((p) => [...fff, ...(userPage.data ?? [])]);
		await sleep(2000);
		onValidate(false);
	}

	return (
		<Switch>
			<Match when={dataState().isLoading}>
				<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
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
					<For each={data()}>
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
