import { splitProps } from "solid-js";
import { cm } from "~/utils/classMerger";

// Button props

export function ButtonRound(props: any) {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<button class={cm("rounded-full w-8 h-8 p-2 bg-base shadow-center fill-white text-white", local?.class)} {...others}>
			{local.children}
		</button>
	);
}
