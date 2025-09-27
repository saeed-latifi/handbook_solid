import { useBucketInfo } from "~/hooks/useBucket";
import { createMemo, For, Match, Switch } from "solid-js";
import { useParams } from "@solidjs/router";
import { CardLoading } from "~/components/card/CardLoading";
import { CardS3Item } from "~/components/card/CardS3Item";
import { CardNotFound } from "~/components/card/CardNotFound";

export default function Home() {
	const params = useParams();

	const bucketName = createMemo(() => params.bucketName);
	const prefix = createMemo(() => params.contentPath);

	const { data, isLoading } = useBucketInfo({ name: bucketName, prefix: prefix });

	function Header() {
		return (
			<div class="flex justify-between items-center gap-4 w-full border-b border-border pb-1">
				<span class="font-peyda-bold px-4 py-2 bg-gray-500 rounded-lg text-white">{bucketName()}</span>
				{data()?.policy.IsPublic ? <span class="px-4 py-2 bg-green-600 rounded-lg text-white">عمومی</span> : <span class="px-4 py-2 bg-orange-500 rounded-lg text-white">خصوصی</span>}
			</div>
		);
	}

	return (
		<Switch>
			<Match when={isLoading()}>
				<CardLoading />
			</Match>

			<Match when={data() && !data()?.Contents?.length}>
				<div class="w-full flex flex-col gap-4 flex-1">
					<Header />
					<div class="flex-1 w-full h-full items-center justify-center flex">
						<CardNotFound messages={["محتوایی وجود ندارد"]} />
					</div>
				</div>
			</Match>

			<Match when={data()}>
				<div class="w-full flex flex-col gap-4">
					<Header />
					<div class="w-full grid grid-cols-3 gap-4">
						<For each={data()?.Contents}>{(item) => <CardS3Item path={useParams().contentPath} item={item} bucketName={bucketName()} />}</For>
					</div>
				</div>
			</Match>
		</Switch>
	);
}
