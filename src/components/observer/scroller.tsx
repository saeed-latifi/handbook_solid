/* eslint-disable solid/reactivity */
import { createEffect, createSignal, onCleanup, JSX, onMount } from "solid-js";

type Props = {
	loadMore: () => void;
	hasMore: boolean;
	children?: JSX.Element;
	class?: string;
	threshold?: number;
	root?: Element | null;
	loading?: { isLoading: boolean; LoadingBox: JSX.Element };
};

export default function Scroller(props: Props) {
	let bottomRef: HTMLDivElement | undefined;
	const [isInView, setIsInView] = createSignal(false);

	// Set up intersection observer
	createEffect(() => {
		if (bottomRef) {
			const observer = new IntersectionObserver(observerHandler, {
				root: props.root,
				rootMargin: props.threshold ? `${props.threshold}px` : undefined,
			});

			observer.observe(bottomRef);

			onCleanup(() => {
				observer.disconnect();
			});
		}
	});

	// Load more when in view and has more
	createEffect(() => {
		if (isInView() && props.hasMore) {
			props.loadMore();
		}
	});

	function observerHandler(entries: IntersectionObserverEntry[]) {
		setIsInView(entries[0].isIntersecting);
	}

	return (
		<div class={props.class}>
			{props.children}
			<div style={{ height: "1px", width: "100%" }} ref={bottomRef} />
			{props.loading?.isLoading && props.loading.LoadingBox}
		</div>
	);
}
