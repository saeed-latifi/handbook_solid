import { useNavigate } from "@solidjs/router";
import { IS3Prefix } from "~/types/S3";
import { IconFolder } from "../icons/IconFolder";

export function CardS3Folder({ item, bucketName }: { item: IS3Prefix; bucketName: string }) {
	const navigate = useNavigate();

	function onClick() {
		navigate(`/storage/${bucketName}/${item.Prefix}`);
	}

	return (
		<button onClick={onClick} class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
			<div class="flex flex-1 overflow-hidden">
				<div class="w-full h-full flex items-center justify-center">
					<IconFolder class="fill-gray-500 w-full h-full aspect-square max-w-24" />
				</div>
			</div>
			<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">{getLastWord(item.Prefix)}</p>
		</button>
	);
}

function getLastWord(str: string) {
	return str.split("/").filter(Boolean).pop() || "";
}
