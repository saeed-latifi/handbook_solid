import { useNavigate, useLocation, useParams } from "@solidjs/router";
import { IS3Item } from "~/types/S3";
import { Match, Switch } from "solid-js";
import { IconAlert } from "../icons/IconAlert";
import { IconVideo } from "../icons/IconVideo";
import { storageUrl } from "~/appConfig";
import { IconBack } from "../icons/IconBack";
import { HlsPlayer } from "../HlsPlayer";

export function CardS3Item({ item, bucketName, parents }: { item: IS3Item; bucketName: string; parents?: string[] }) {
	const navigate = useNavigate();
	const location = useLocation();

	const { name, type } = s3ContentType(item.Key);

	function onClick() {
		if (type === "back") navigate(goBackOneLevel(location.pathname));
	}

	return (
		<button
			onClick={onClick}
			//  onClick={() => navigate(`/storage/${item.Key}`)}
			class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden"
		>
			<div class="flex flex-1 overflow-hidden">
				<Switch>
					<Match when={type === "image"}>
						<img src={storageUrl + "/" + bucketName + "/" + item.Key} alt="" class="w-full h-full" />
					</Match>

					<Match when={type === "hls"}>
						<div class="w-full h-full flex items-center justify-center">
							<HlsPlayer bucketName={bucketName} parents={parents} />
						</div>
					</Match>

					<Match when={type === "video"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconVideo class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>
					<Match when={type === "back"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconBack class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>

					<Match when={type === "none"}>
						<div class="w-full h-full flex items-center justify-center">
							<IconAlert class="fill-gray-500 w-full h-full aspect-square max-w-24" />
						</div>
					</Match>
				</Switch>
			</div>
			<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">{type === "back" ? "بازگشت" : type === "none" ? getLastWord(item.Key) : getLastWord(name)}</p>
		</button>
	);
}

type IS3ContentType = "image" | "video" | "none" | "back" | "hls";

function s3ContentType(key: string): { type: IS3ContentType; name: string } {
	if (key.endsWith("/")) return { type: "back", name: key.slice(0, -1) };

	const { name, type } = parseFileName(key);

	if (type === "webp" || type === "jpg" || type === "png") return { name, type: "image" };
	if (type === "mp4") return { name, type: "video" };
	if (type === "m3u8") return { name, type: "hls" };
	return { type: "none", name };
}

function parseFileName(filename: string) {
	if (!filename || filename.indexOf(".") === -1) return { type: "", name: filename };

	const lastDotIndex = filename.lastIndexOf(".");
	const name = filename.substring(0, lastDotIndex);
	const type = filename.substring(lastDotIndex + 1);

	return { type: type, name: name };
}

function getLastWord(str: string) {
	return str.split("/").filter(Boolean).pop() || "";
}

function goBackOneLevel(url: string) {
	// Remove trailing slashes and split by '/'
	const parts = url.replace(/\/+$/, "").split("/");

	// Remove the last segment and join back
	const newParts = parts.slice(0, -1);

	return newParts.join("/") + (newParts.length > 0 ? "/" : "");
}
