export function arrayPurger<T, K extends keyof T>(arr: T[], key: K): T[] {
	return arr.reduce((acc: T[], current) => {
		if (!acc.some((item) => item[key] === current[key])) {
			acc.push(current);
		}
		return acc;
	}, []);
}
