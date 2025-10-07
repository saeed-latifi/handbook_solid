import { createEffect, createSignal, onMount, splitProps } from "solid-js";
import Hls from "hls.js";
import { http } from "~/components/http";
import { IResponse } from "~/types/response.type";
import toast from "solid-toast";
import { IS3Item } from "~/types/S3";

interface HlsPlayerProps {
	bucketName: string;
	// parents?: string[];
	controls?: boolean;
	item: IS3Item;
}

export function HlsPlayer(props: HlsPlayerProps) {
	const [local] = splitProps(props, ["bucketName", "item", "controls"]);
	const [url, setUrl] = createSignal("");

	let videoRef: HTMLVideoElement | undefined;

	onMount(async () => {
		const { data } = await http.post<IResponse<{ url: string }>>("/storage/file/download", { bucketName: local.bucketName, key: local.item.Key });
		const url = data.data?.url;
		if (url) setUrl(url);
		else toast.error("خطا در دریافت لینک ویدیو");
	});

	createEffect(() => {
		if (!url()) return;
		if (!videoRef) return;

		// Safari can play HLS natively
		if (videoRef.canPlayType("application/vnd.apple.mpegurl")) {
			videoRef.src = url();
		} else if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(url());
			hls.attachMedia(videoRef);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				// videoRef.play();
			});
		} else {
			console.error("HLS not supported in this browser");
		}
	});

	return <video ref={videoRef!} autoplay={false} controls={local.controls ?? true} class="w-full h-full" />;
}
