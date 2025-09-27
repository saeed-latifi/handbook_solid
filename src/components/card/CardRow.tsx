import { A } from "@solidjs/router";
import { JSX } from "solid-js";

export function CardRow({ children, href }: { href?: string; children: JSX.Element }) {
	if (href)
		return (
			<A href={href} class="flex w-full gap-2 items-center clicker bg-white border border-border even:bg-gray-500 even:text-white font-peyda-bold px-3 py-1 rounded-md overflow-hidden flex-wrap">
				{children}
			</A>
		);

	return <div class="flex w-full gap-2 items-center select-none bg-white border border-border even:bg-gray-500 even:text-white font-peyda-bold px-3 py-1 rounded-md overflow-hidden flex-wrap">{children}</div>;
}
