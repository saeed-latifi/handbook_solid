import { JSX, splitProps } from "solid-js";
import { cm } from "~/utils/classMerger";

export function LoadingSpinner(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
	const [local, others] = splitProps(props, ["class"]);

	return (
		<svg aria-hidden="true" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" class={cm(`w-8 h-8 animate-spin text-gray-300 fill-base`, local.class)} {...others}>
			<path
				d="M506 256c0 138.07-111.929 250-250 250S6 394.07 6 256C6 117.928 117.929 6 256 6s250 111.929 250 250zm-454.593 0c0 112.993 91.6 204.592 204.593 204.592S460.593 368.992 460.593 256 368.993 51.407 256 51.407c-112.994 0-204.593 91.6-204.593 204.592z"
				fill="currentColor"
			/>
			<path
				d="M256 6C117.929 6 6 117.93 6 256c0 0 2.973 18.503 21.995 17.854C47.017 273.206 51.406 256 51.406 256c0-112.993 91.6-204.594 204.594-204.594 0 0 20.414-4.939 20.801-22.978C277.188 10.39 256 6 256 6z"
				fill="currentFill"
			/>
		</svg>
	);
}
