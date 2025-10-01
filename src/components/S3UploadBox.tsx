import { createStore } from "solid-js/store";
import axios from "axios";
import { http } from "~/components/http";
import { IResponse } from "~/types/response.type";
import toast from "solid-toast";
import { IconAddFile } from "./icons/IconAddFile";
import { Button } from "./button/Button";

type FileStatus = "waiting" | "uploading" | "completed" | "error";

interface UploadItem {
	file: File;
	progress: number;
	status: FileStatus;
}

export default function S3UploadBox({ bucketName, parents }: { bucketName: string; parents?: string[] }) {
	const [items, setItems] = createStore<UploadItem[]>([]);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			const newItems = Array.from(input.files).map((file) => ({ file, progress: 0, status: "waiting" as FileStatus }));
			setItems(newItems);
		}

		// handleUpload();
	}

	async function handleUpload() {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];

			// mark as uploading
			setItems(i, { status: "uploading", progress: 0 });

			try {
				// 1. Get presigned URL
				const { data } = await http.post<IResponse<{ url: string }>>("/storage/file/upload", { bucketName, fileName: item.file.name, type: item.file.type, parents });
				const url = data.data?.url;
				if (!url) throw new Error("Bad presigned URL");

				// 2. Upload to S3
				await axios.put(url, item.file, {
					headers: { "Content-Type": getContentType(item.file) },
					onUploadProgress: (e) => {
						if (e.total) {
							const percent = Math.round((e.loaded * 100) / e.total);
							setItems(i, "progress", percent);
						}
					},
				});

				setItems(i, { progress: 100, status: "completed" });
			} catch (err) {
				console.error(err);
				setItems(i, "status", "error");
			}
		}

		toast.success("Upload finished ✅");
	}

	return (
		<div class="flex flex-col w-full gap-4">
			<label class="flex items-center justify-center gap-2 bg-base fill-white text-white py-1 px-3 rounded-lg overflow-hidden font-peyda-bold text-lg ">
				<input hidden type="file" multiple onChange={handleFileChange} />
				<p>chose files</p>
				<IconAddFile class="w-5 h-5" />
			</label>

			<Button onClick={handleUpload}>upload</Button>

			<ul class="w-full flex flex-col gap-2">
				{items.map((item) => (
					<li class="flex items-center justify-between gap-2 border border-border rounded-lg py-1 px-3 bg-white">
						<span>{item.file.name}</span>
						{item.status === "uploading" ? (
							<div class="w-full flex-1 relative flex items-center justify-center">
								<div class="flex items-center justify-center absolute bg-action text-white rounded-full aspect-square w-8">{item.progress}</div>
								<div class="w-full h-2 bg-white border border-action rounded-lg overflow-x-hidden ">
									<div class="h-full bg-blue-500 transition-all duration-300" style={{ width: `${item.progress}%` }} />
								</div>
							</div>
						) : null}
						<span>{item.status}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

function getContentType(file: File) {
	if (file.name.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
	if (file.name.endsWith(".ts")) return "video/mp2t";
	if (file.name.endsWith(".key")) return "application/octet-stream";
	if (file.type) return file.type;
	return "application/octet-stream"; // fallback
}
