import { http } from "~/components/http";
import { IBucket } from "~/types/bucket.type copy";

export function useBucket() {
	async function getBucketLists() {
		const { data } = await http.get("/storage/bucket/list");
		return data as IBucket[];
	}
	async function createBucket(name: string) {
		const { data } = await http.post("/storage/bucket", { name });
		return data;
	}

	async function deleteBucket(name: string) {
		const { data } = await http.delete("/storage/bucket/" + name);
		return data;
	}
	async function detail(name: string, prefix: string) {
		const { data } = await http.get("/storage/bucket/detail/" + name, { params: { prefix } });
		return data;
	}

	return { getBucketLists, createBucket, deleteBucket, detail };
}
