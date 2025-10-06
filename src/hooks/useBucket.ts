import { http } from "~/components/http";
import { useDataList } from "./useDataList";
import { IResponse } from "~/types/response.type";
import { useDataRecord } from "./useDataRecord";
import toast from "solid-toast";
import { arrayPurger } from "~/utils/arrayPurger";
import { IBucket, IS3BucketInfo } from "~/types/S3";

export function useBucketList() {
	const { data, isLoading, response, mutateResponse, mutate } = useDataList({
		domain: "buckets",
		fetcher: async () => {
			const { data } = await http.get("/storage/bucket/list");
			return data as IResponse<IBucket[]>;
		},
	});

	async function createBucket(name: string) {
		if (!name) return;
		for (const item of data() ?? []) {
			if (item.Name.toLowerCase() === name.toLowerCase()) {
				toast.error("این باکت وجود دارد", { id: "createBucket", style: { fill: "orange", "border-color": "orange" } });
				return;
			}
		}

		const { data: res } = await http.post<IResponse<IBucket>>("/storage/bucket", { name });

		if (res.validations) {
			mutateResponse(async (list) => {
				const response: IResponse<IBucket[]> = { ...list, validations: res.validations as any };
				return response;
			});
		}

		if (res.data) {
			mutateResponse(async (list) => {
				if (!list?.data) return { data: [{ Name: name, CreationDate: new Date().toString() }] };

				const purged = arrayPurger([...list.data, res.data!], "Name");
				console.log({ purged });

				const response: IResponse<IBucket[]> = { data: purged, validations: undefined };
				return response;
			});
		}
		if (res.responseState === "Ok") return true;
	}

	async function deleteBucket(name: string) {
		const { data } = await http.delete<IResponse<IBucket>>("/storage/bucket/" + name);

		// if (data.data?.Name) {
		mutate(async (list) => {
			if (!list) return;
			return list.filter((i) => i.Name !== data.data?.Name);
		});
		// }

		return data;
	}

	return { data, isLoading, createBucket, deleteBucket, response };
}

export function useBucketInfo({ name, prefix }: { name: () => string; prefix: () => string | undefined }) {
	const record = useDataRecord({
		domain: "buckets",
		id: () => name() + "/" + (prefix?.() ?? ""),
		fetcher: async () => {
			const { data } = await http.get(`/storage/bucket/detail/${name()}`, { params: { prefix: prefix() ? prefix() + "/" : "" } });
			return data as IResponse<IS3BucketInfo>;
		},
	});
	return record;
}
