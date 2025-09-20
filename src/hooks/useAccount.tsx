import { replaceNullWithUndefined } from "~/utils/replaceNullWithUndefined";
import { http } from "../components/http";
import { IResponse } from "../types/response.type";
import { IUser } from "../types/user.type";
import { useDataSimple } from "./useDataSimple";

type UserResponse = IResponse<Partial<IUser>>;

export function useAccount() {
	const { data, isLoading, isValidating, mutateResponse, refetch, response, isReady, mutateValue } = useDataSimple<Partial<IUser>, unknown>({
		domain: "account",
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
		mutateValue(newData);
	}

	async function onLogin({ password, phone }: { phone?: string; password?: string }) {
		try {
			const { data: response } = await http.post("/account/login", {
				password,
				phone,
				student: 1,
			});

			mutateResponse(response);
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	async function onLogout() {
		try {
			const { data } = await http.get("/account/logout");
			mutateResponse(data);
		} catch (error) {
			// Clear user data on logout regardless of server response
			mutateResponse({ responseState: "ServerError", messages: { error: [JSON.stringify(error)] } });
		}
	}

	async function onForget(phone?: string) {
		try {
			const cleaned = replaceNullWithUndefined({ phone });
			const { data: response } = await http.post("/account/forget", {
				phone,
				student: 1,
			});

			mutateResponse({ ...cleaned, ...response?.data });
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
