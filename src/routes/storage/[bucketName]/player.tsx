import { useLocation, useParams } from "@solidjs/router";
import { s3FolderPathExtractor } from "~/utils/extractPathSegments";
import { HlsPlayer } from "~/components/HlsPlayer";

export default function TestPage() {
	const params = useParams();
	const { pathname } = useLocation();
	const bucketName = params.bucketName;

	const parents = s3FolderPathExtractor({ bucketName, pathname });

	return (
		<div class="w-full aspect-video border border-border rounded-lg  ">
			<HlsPlayer bucketName={bucketName} parents={parents} />
		</div>
	);
}
