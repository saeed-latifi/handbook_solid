import { LoadingSpinner } from "../animations/LoadingSpinner";
import Scroller from "../observer/scroller";
import { For, Match, Switch } from "solid-js";
import { useCoursesList } from "~/hooks/useCoursesList";

Scroller;

export function ComponentInfinite() {
	const { data, hasMore, isLoading, isValidating, loadMore } = useCoursesList();

	return (
		<Switch>
			<Match when={isLoading()}>
				<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
			</Match>

			<Match when={data()}>
				<Scroller
					class="flex flex-col w-full gap-2"
					hasMore={hasMore()}
					loadMore={loadMore}
					loading={{
						isLoading: isValidating(),
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
