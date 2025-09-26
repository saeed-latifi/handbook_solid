import { useBucketInfo } from "~/hooks/useBucket";
import { Input } from "~/components/form/Input";
import { Button } from "~/components/button/Button";
import { createResource, createSignal, For, Match, Switch } from "solid-js";
import { CardBucket } from "~/components/card/CardBucket";

export default function Home() {
	// const { getBucketLists, createBucket, detail } = useBucketInfo();

	const [bucketName, setBucketName] = createSignal("");
	const [preFix, setPrefix] = createSignal("");
	// const [buckets, { refetch }] = createResource("allBuckets", getBucketLists);

	return (
		<div class="w-full flex flex-col gap-4 p-4">
			<Input value={bucketName()} oninput={(e) => setBucketName(e.target.value)} />
			<Input value={preFix()} oninput={(e) => setPrefix(e.target.value)} />
			<p>wwwwwwwwwwwwwwww</p>
			{/* <Button
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
			</Button> */}

			{/* <Switch>
				<Match when={!buckets()}>
					<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
				</Match>
				<Match when={true}>
					<div class="grid grid-cols-3 w-full gap-4">
						<For each={buckets()}>{(item) => <CardBucket bucket={item} />}</For>
					</div>
				</Match>
			</Switch> */}
		</div>
	);
}
