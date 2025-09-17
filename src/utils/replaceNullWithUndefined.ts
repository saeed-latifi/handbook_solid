export function replaceNullWithUndefined<T>(data: T): T {
	if (data === null) return undefined as any;

	if (data instanceof Date) {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(replaceNullWithUndefined) as any;
	}

	if (typeof data === "object") {
		const obj = {} as Record<string, any>;
		for (const key in data) {
			obj[key] = replaceNullWithUndefined(data[key]);
		}
		return obj as T;
	}

	return data;
}
