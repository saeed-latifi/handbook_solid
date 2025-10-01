import { useLocation, useParams } from "@solidjs/router";
import S3UploadBox from "~/components/S3UploadBox";
import { s3FolderPathExtractor } from "~/utils/extractPathSegments";

export default function UploadFiles() {
	const params = useParams();
	const { pathname } = useLocation();

	return <S3UploadBox bucketName={params.bucketName} parents={s3FolderPathExtractor({ bucketName: params.bucketName, pathname })} />;
}
