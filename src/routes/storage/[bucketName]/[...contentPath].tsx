import { useBucketInfo } from "~/hooks/useBucket";
import { For, Match, Switch } from "solid-js";
import { useParams } from "@solidjs/router";
import { CardLoading } from "~/components/card/CardLoading";
import { CardS3Item } from "~/components/card/CardS3Item";
import { CardS3Folder } from "~/components/card/CardS3Folder";
import { CardS3AddFolder } from "~/components/card/CardS3AddFolder";
import { CardS3UploadFile } from "~/components/card/CardS3UploadFile";

export default function StorageFolderPage() {
	const params = useParams();
	const { data, isLoading, mutateValue } = useBucketInfo({ name: () => params.bucketName, prefix: () => params.contentPath });

	return (
		<Switch>
			<Match when={isLoading()}>
				<CardLoading />
			</Match>

			<Match when={data()}>
				<div class="w-full flex flex-col gap-4">
					<div class="w-full grid grid-cols-3 gap-4">
						<CardS3AddFolder bucketName={params.bucketName} data={data()!} mutate={mutateValue} />
						<CardS3UploadFile bucketName={params.bucketName} data={data()!} />
						<For each={data()?.CommonPrefixes}>{(item) => <CardS3Folder item={item} bucketName={params.bucketName} data={data()!} mutate={mutateValue} />}</For>
						<For each={data()?.Contents}>{(item) => <CardS3Item item={item} bucketName={params.bucketName} data={data()!} />}</For>
					</div>
				</div>
			</Match>
		</Switch>
	);
}
