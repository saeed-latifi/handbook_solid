import { createSignal } from "solid-js";
import axios from "axios";
import { IResponse } from "~/types/response.type";
import { http } from "~/components/http";
import toast from "solid-toast";

export default function UploadImage() {
	const [file, setFile] = createSignal<File | null>(null);
	const [progress, setProgress] = createSignal(0);

	const handleFileChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			setFile(input.files[0]);
		}
	};

	const handleUpload = async () => {
		const selectedFile = file();
		if (!selectedFile) return;

		try {
			// 1. Ask backend for presigned URL
			const { data } = await http.post<IResponse<{ url: string }>>("/storage/file/sign", { bucketName: "test", fileName: selectedFile.name, type: selectedFile.type });

			const url = data.data?.url;
			if (!url) return toast.error("bad url");
			// 2. Upload directly to S3
			await axios.put(url, selectedFile, {
				headers: { "Content-Type": selectedFile.type },
				onUploadProgress: (e) => {
					if (e.total) {
						setProgress(Math.round((e.loaded * 100) / e.total));
					}
				},
			});

			toast.success("Upload complete ✅");
		} catch (err) {
			console.error(err);
			toast.error("Upload failed ❌");
		}
	};

	return (
		<div>
			<input type="file" accept="video/*" onChange={handleFileChange} />
			<button onClick={handleUpload}>Upload</button>
			{progress() > 0 && <p>Progress: {progress()}%</p>}
		</div>
	);
}
