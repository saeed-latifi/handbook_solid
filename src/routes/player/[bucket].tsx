import { onMount } from "solid-js";
import Hls from "hls.js";
import { useParams } from "@solidjs/router";

interface HlsPlayerProps {
	src: string; // URL to your .m3u8 file
	width?: number;
	height?: number;
}

export default function TestPage() {
	const params = useParams();
	// const { response, data, onChange } = useAccount();

	console.log({ params: JSON.stringify(params) });

	const src = `https://storage.saeedlatifi.ir/${params.bucket}/playlist.m3u8`;
	// const src = `http://localhost:9000/${params.bucket}/playlist.m3u8`;
	// const src = `https://dastan.storage.iran.liara.space/${params.bucket}/playlist.m3u8`;
	return (
		<div class="w-full flex flex-col gap-4 p-4">
			<HlsPlayer src={src} />
		</div>
	);
}

export function HlsPlayer(props: HlsPlayerProps) {
	let videoRef: HTMLVideoElement | undefined;

	onMount(() => {
		console.log(1111);

		if (!videoRef) return;
		console.log(2222);

		// Safari can play HLS natively
		if (videoRef.canPlayType("application/vnd.apple.mpegurl")) {
			console.log(3333);

			videoRef.src = props.src;
		} else if (Hls.isSupported()) {
			console.log(4444);
			const hls = new Hls();
			hls.loadSource(props.src);
			hls.attachMedia(videoRef);
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				console.log(5555);

				videoRef.play();
			});
		} else {
			console.error("HLS not supported in this browser");
		}
	});

	return <video ref={videoRef!} controls width={props.width ?? 640} height={props.height ?? 360} />;
}
