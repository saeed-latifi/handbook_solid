import { replaceNullWithUndefined } from "~/utils/replaceNullWithUndefined";
import { http } from "../components/rest";
import { IResponse } from "../types/response.type";
import { IUser } from "../types/user.type";
import { useDataSimple } from "./useDataSimple";

type UserResponse = IResponse<Partial<IUser>>;

export function useAccount() {
	const { data, isLoading, isValidating, mutate, refetch, response, isReady } = useDataSimple<Partial<IUser>, unknown>({
		domain: "profile",
		fetcher: async () => {
			try {
				const res = await http.get("/account/check");
				return res.data as UserResponse;
			} catch (_error) {
				// Return an error response if the fetch fails
				return { responseState: "ServerError" } as UserResponse;
			}
		},
		isReady: true,
	});

	function onChange(newData: Partial<IUser>) {
		mutate((currentData) => {
			console.log(currentData);

			if (!currentData) return undefined;

			const updatedData = { ...currentData, data: { ...currentData.data, ...newData } };
			return updatedData;
		});
	}

	async function onLogin({ password, phone }: { phone?: string; password?: string }) {
		const cleaned = replaceNullWithUndefined({ password, phone });

		try {
			const { data: response } = await http.post("/account/login", {
				password,
				phone,
				student: 1,
			});

			mutate(response);
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	async function onLogout() {
		try {
			const { data } = await http.get("/account/logout");
			mutate(data);
		} catch (error) {
			// Clear user data on logout regardless of server response
			mutate({ responseState: "ServerError", messages: { error: [JSON.stringify(error)] } });
		}
	}

	async function onForget(phone?: string) {
		try {
			const cleaned = replaceNullWithUndefined({ phone });
			const { data: response } = await http.post("/account/forget", {
				phone,
				student: 1,
			});

			mutate({ ...cleaned, ...response?.data });
		} catch (_error) {
			console.error("Forget password failed:", _error);
		}
	}

	return {
		data,
		isLoading,
		isValidating,
		onLogin,
		onLogout,
		onChange,
		onForget,
		refetch,
		response,
		isReady,
	};
}
