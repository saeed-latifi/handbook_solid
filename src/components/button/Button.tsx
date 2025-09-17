import { splitProps } from "solid-js";
import { cm } from "~/utils/classMerger";

// Button props

export function Button(props: any) {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<button class={cm("flex items-center  justify-center gap-3  outline-none cursor-pointer p-4 rounded-sm  text-[1rem] w-full mx-auto bg-base text-white font-peyda-bold", local?.class)} {...others}>
			{local.children}
		</button>
	);
}
