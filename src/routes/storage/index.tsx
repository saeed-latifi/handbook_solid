import { Input } from "~/components/form/Input";
import { Button } from "~/components/button/Button";
import { createSignal, For, Match, Switch } from "solid-js";
import { CardBucket } from "~/components/card/CardBucket";
import { useBucketList } from "~/hooks/useBucket";

export default function BucketsList() {
	const { data, isLoading, createBucket, response } = useBucketList();

	const [bucketName, setBucketName] = createSignal("");

	return (
		<div class="w-full flex flex-col gap-4 p-4">
			<Input errors={(response()?.validations as any)?.name} value={bucketName()} oninput={(e) => setBucketName(e.target.value)} />

			<Button
				onClick={async () => {
					const res = await createBucket(bucketName().trim());
					if (res) setBucketName("");
				}}
			>
				onCreate
			</Button>

			<Switch>
				<Match when={isLoading()}>
					<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">isLoading</div>
				</Match>
				<Match when={response()?.messages?.notFound}>
					<div class="flex w-full h-full p-8 bg-fuchsia-200 rounded-xl">
						<For each={response()?.messages?.notFound} children={(i) => <div>{i}</div>} />
					</div>
				</Match>
				<Match when={true}>
					<div class="grid grid-cols-3 w-full gap-4">
						<For each={data()}>{(item) => <CardBucket bucket={item} />}</For>
					</div>
				</Match>
			</Switch>
		</div>
	);
}
