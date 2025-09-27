import { IconBucket } from "../icons/IconBucket";
import { useNavigate } from "@solidjs/router";
import { IS3Item } from "~/types/S3";
import { Match, Switch } from "solid-js";
import { IconFolder } from "../icons/IconFolder";
import { IconAlert } from "../icons/IconAlert";
import { IconVideo } from "../icons/IconVideo";

export function CardS3Item({ item, bucketName, path }: { item: IS3Item; bucketName: string; path: string }) {
	const navigate = useNavigate();

	const { name, type } = s3ContentType(item.Key);

	const storageURL = "http://localhost:9000/";

	function onClick() {
		console.log("uuu", item);

		if (type === "folder") {
			navigate(`/storage/${bucketName}/${path}${item.Key}`);
		}
	}

	return (
		<button
			onClick={onClick}
			//  onClick={() => navigate(`/storage/${item.Key}`)}
			class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden"
		>
			<div class="flex flex-1 overflow-hidden">
				<Switch>
					<Match when={type === "folder"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconFolder class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>
					<Match when={type === "image"}>
						<img src={storageURL + bucketName + "/" + item.Key} alt="" class="w-full h-full" />
					</Match>
					<Match when={type === "video"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconVideo class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>
					<Match when={type === "none"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconAlert class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>
				</Switch>
			</div>
			<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">{type === "none" ? item.Key : name}</p>
		</button>
	);
}

type IS3ContentType = "folder" | "image" | "video" | "none";

function s3ContentType(key: string): { type: IS3ContentType; name: string } {
	if (key.endsWith("/")) return { type: "folder", name: key.slice(0, -1) };

	const { name, type } = parseFileName(key);
	console.log({ name, type });

	if (type === "webp" || type === "jpg" || type === "png") {
		return { name, type: "image" };
	}

	if (type === "mp4") {
		return { name, type: "video" };
	}

	return { type: "none", name };
}

function parseFileName(filename: string) {
	if (!filename || filename.indexOf(".") === -1) return { type: "", name: filename };

	const lastDotIndex = filename.lastIndexOf(".");
	const name = filename.substring(0, lastDotIndex);
	const type = filename.substring(lastDotIndex + 1);

	return { type: type, name: name };
}
