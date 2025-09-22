import { pageSize } from "~/appConfig";
import { http } from "~/components/http";
import { IResponse } from "~/types/response.type";
import { useDataList } from "./useDataList";
import { createEffect } from "solid-js";
import { ICourse } from "~/types/course.type";

export function useCoursesList() {
	const { data, isValidating, isLoading, mutate, response } = useDataList({
		domain: "user",
		fetcher: async () => {
			const users: IResponse<ICourse[]> = await fetcher(0);
			return users;
		},
	});

	createEffect(() => {
		const a = isValidating();
		console.log({ a });
	});

	async function loadMore() {
		const newData = mutate(async (prev) => {
			const userPage = await fetcher(prev?.length ?? 0);

			if (userPage.data) return [...(prev ?? []), ...userPage.data];
		});
	}

	function hasMore() {
		const length = response()?.length ?? 0;
		const count = data()?.length ?? 0;

		console.log({ count });

		if (!data() || count < length) return true;
		return false;
	}

	return { data, isLoading, isValidating, hasMore, loadMore };
}

async function fetcher(skip: number) {
	const res = await http.get("/dashboard/courses", { params: { take: pageSize, skip } });

	const data: IResponse<ICourse[]> = res.data;
	return data;
}
