import { createUniqueId, JSX, JSXElement, splitProps } from "solid-js";

interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	label?: string;
	errors?: string[];
	containerStyle?: JSX.CSSProperties;
	icon?: JSXElement;
}

export function Input(props: InputProps) {
	const [local, others] = splitProps(props, ["label", "errors", "containerStyle", "class", "id", "icon", "value"]);

	const id = local.id || createUniqueId();

	return (
		<div class="flex w-full flex-1 flex-col gap-2" style={local.containerStyle}>
			{local.label && (
				<label class="text-base font-bold px-2" for={id}>
					{local.label}
				</label>
			)}
			<label
				class={`w-full border bg-white ${local.errors?.length ? "border-error" : "border-border"} px-4 ${local.icon ? "pr-2" : ""} py-2 rounded-xl flex items-center gap-2 ${
					local.class || ""
				} focus-within:border-base`}
			>
				{local.icon && <>{local.icon}</>}
				<input {...others} value={local.value ?? ""} class="min-w-0 flex-1 text-text" id={id} />
			</label>
			{local.errors?.map((e) => (
				<span class="text-error pr-2">{e}</span>
			))}
		</div>
	);
}
