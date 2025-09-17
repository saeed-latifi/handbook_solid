export function objectSorter<T extends { [key: string]: any }>({ params, excludes }: { params?: T; excludes?: (keyof T)[] }) {
	if (!params) return;
	const instance = structuredClone(params);
	excludes?.forEach((key) => delete instance[key]);
	const sorted = Object.entries(instance).sort((a, b) => {
		const x = a[0];
		const y = b[0];
		if (x < y) return -1;
		if (x > y) return 1;
		return 0;
	});

	let filters: any = {};
	sorted.forEach((item) => (filters[item[0]] = item[1]));

	return filters as T;
}

export function objectChangeCheck<F>({ newFilters, oldFilters, loading }: Readonly<{ newFilters?: Partial<F>; oldFilters?: Partial<F>; loading?: boolean }>) {
	if (!newFilters || loading) return;

	const filters: Partial<F> = { ...oldFilters, ...newFilters };
	const sorted = objectSorter({ params: filters });
	if (sorted && JSON.stringify(sorted) !== JSON.stringify(oldFilters)) return sorted;
}
