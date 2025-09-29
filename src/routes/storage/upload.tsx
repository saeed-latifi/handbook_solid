import { createSignal } from "solid-js";
import axios from "axios";
import { IResponse } from "~/types/response.type";
import { http } from "~/components/http";
import toast from "solid-toast";

export default function UploadFiles({ prefix }: { prefix?: string }) {
	const [files, setFiles] = createSignal<File[]>([]);
	const [progressMap, setProgressMap] = createSignal<Record<string, number>>({});

	const handleFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			setFiles(Array.from(input.files));
			setProgressMap({});
		}
	};

	const handleUpload = async () => {
		const selectedFiles = files();
		if (!selectedFiles.length) return;

		try {
			await Promise.all(
				selectedFiles.map(async (file) => {
					// 1. Request presigned URL for each file
					const { data } = await http.post<IResponse<{ url: string }>>("/storage/file/sign", { bucketName: "lufy", fileName: file.name, type: file.type });
					const url = data.data?.url;
					if (!url) throw new Error("Bad presigned URL");

					// 2. Upload file directly to S3
					console.log(file);
					await axios.put(url, file, {
						headers: { "Content-Type": getContentType(file) },
						onUploadProgress: (e) => {
							if (e.total) {
								setProgressMap((prev) => ({
									...prev,
									[file.name]: Math.round((e.loaded * 100) / (e?.total ?? 1)),
								}));
							}
						},
					});
				})
			);

			toast.success("All files uploaded ✅");
		} catch (err) {
			console.error(err);
			toast.error("Some uploads failed ❌");
		}
	};

	return (
		<div>
			<input type="file" multiple onChange={handleFileChange} />
			<button onClick={handleUpload}>Upload All</button>
			{files().map((file, index) => (
				<p>
					{file.name}: {progressMap()[file.name] ?? 0}%
				</p>
			))}
		</div>
	);
}

function getContentType(file: File) {
	if (file.name.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
	if (file.type) return file.type;
	return "application/octet-stream"; // fallback
}
