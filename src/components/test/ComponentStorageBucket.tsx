import { useBucket } from "~/hooks/useBucket";
import { Button } from "../button/Button";
import Scroller from "../observer/scroller";
import { createResource, createSignal, For, Match, Switch } from "solid-js";
import { Input } from "../form/Input";
import IconClose from "../icons/IconClose";
import { IconBucket } from "../icons/IconBucket";
import { CardBucket } from "../card/CardBucket";

Scroller;

export function ComponentStorageBucket() {
	const { getBucketLists, createBucket, deleteBucket, detail } = useBucket();

	const [bucketName, setBucketName] = createSignal("");
	const [preFix, setPrefix] = createSignal("");
	const [buckets, { refetch }] = createResource("allBuckets", getBucketLists);

	return (
		<>
			<Input value={bucketName()} oninput={(e) => setBucketName(e.target.value)} />
			<Input value={preFix()} oninput={(e) => setPrefix(e.target.value)} />

			<Button
				onClick={async () => {
					await createBucket(bucketName());
					refetch();
				}}
			>
				onCreate
			</Button>

			<Button
				onClick={async () => {
					await detail(bucketName(), preFix());
				}}
			>
				get detail
			</Button>

			<Switch>
				<Match when={!buckets()}>
					<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
				</Match>
				<Match when={true}>
					<div class="grid grid-cols-3 w-full gap-4">
						<For each={buckets()}>{(item) => <CardBucket bucket={item} />}</For>
					</div>
				</Match>
			</Switch>
		</>
	);
}
