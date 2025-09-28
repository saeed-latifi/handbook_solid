import { useBucketInfo } from "~/hooks/useBucket";
import { For, Match, Switch } from "solid-js";
import { useParams, useLocation, useNavigate } from "@solidjs/router";
import { CardLoading } from "~/components/card/CardLoading";
import { CardS3Item } from "~/components/card/CardS3Item";
import { CardNotFound } from "~/components/card/CardNotFound";
import { CardS3Folder } from "~/components/card/CardS3Folder";
import { CardS3AddFolder } from "~/components/card/CardS3AddFolder";
import { CardS3UploadFile } from "~/components/card/CardS3UploadFile";

export default function StorageFolderPage() {
	const params = useParams();
	const navigator = useNavigate();
	const { pathname } = useLocation();

	const { data, isLoading } = useBucketInfo({ name: () => params.bucketName, prefix: () => params.contentPath });

	function Header() {
		return (
			<div class="flex justify-between items-center gap-4 w-full border-b border-border pb-1">
				<span class="font-peyda-bold px-4 py-2 bg-gray-500 rounded-lg text-white">{params.bucketName}</span>
				{data()?.policy.IsPublic ? <span class="px-4 py-2 bg-green-600 rounded-lg text-white">عمومی</span> : <span class="px-4 py-2 bg-orange-500 rounded-lg text-white">خصوصی</span>}
			</div>
		);
	}

	return (
		<Switch>
			<Match when={isLoading()}>
				<CardLoading />
			</Match>

			<Match when={data() && !data()?.Contents?.length && !data()?.CommonPrefixes?.length}>
				<div class="w-full flex flex-col gap-4 flex-1">
					{/* <Header /> */}
					<div class="flex-1 w-full h-full items-center justify-center flex">
						<CardNotFound
							messages={["محتوایی وجود ندارد"]}
							createFirst={
								<div class="w-full max-w-40 flex items-center justify-center gap-4">
									<CardS3AddFolder bucketName={params.bucketName} />
								</div>
							}
						/>
					</div>
				</div>
			</Match>

			<Match when={data()}>
				<div class="w-full flex flex-col gap-4">
					{/* <Header /> */}
					<div class="w-full grid grid-cols-3 gap-4">
						<CardS3AddFolder bucketName={params.bucketName} />
						<CardS3UploadFile bucketName="" />
						<For each={data()?.CommonPrefixes}>{(item) => <CardS3Folder item={item} bucketName={params.bucketName} />}</For>
						<For each={data()?.Contents}>{(item) => <CardS3Item item={item} bucketName={params.bucketName} />}</For>
					</div>
				</div>
			</Match>
		</Switch>
	);
}
