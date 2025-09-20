import { onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { toast } from "solid-toast"; // Using solid-toast instead of react-hot-toast
import { http } from "../components/http";
import { IResponse } from "../types/response.type";

export function useInterceptor() {
	const navigate = useNavigate();

	onMount(() => {
		// Response interceptor
		http.interceptors.response.use(
			(response) => {
				const data: IResponse = response.data;

				if (data.messages?.Success) toast.success(data.messages.Success, { id: response.config.url });
				if (data.messages?.error) toast.error(data.messages.error, { id: response.config.url });

				// TODO add warn
				if (data.messages?.warning) toast.error(data.messages.warning, { id: response.config.url });

				if (data?.redirectPath) {
					navigate(data.redirectPath);
				}

				return response;
			},
			(error) => {
				if (error.response?.data?.redirectPath) {
					navigate(error.response.data.redirectPath);
				}
				return Promise.reject(error);
			}
		);

		// Cleanup on unmount
		return () => {
			// Remove interceptors if needed
			http.interceptors.response.clear();
		};
	});
}
