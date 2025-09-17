import { createSignal, JSX, onMount } from "solid-js";

export function ChatTextarea(props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>) {
	const [content, setContent] = createSignal("");
	let textareaRef: HTMLTextAreaElement | undefined;

	const handleInput = (e: InputEvent) => {
		const target = e.target as HTMLTextAreaElement;
		const value = target.value;
		setContent(value);

		// Reset height and calculate new height
		target.style.height = "auto";
		const newHeight = Math.min(target.scrollHeight, 5 * 24); // 24px per row, max 5 rows
		target.style.height = `${newHeight}px`;
	};

	// Optional: Adjust height when content changes externally
	onMount(() => {
		if (textareaRef && props.value) {
			textareaRef.style.height = "auto";
			const newHeight = Math.min(textareaRef.scrollHeight, 5 * 24);
			textareaRef.style.height = `${newHeight}px`;
		}
	});

	return (
		<textarea
			ref={textareaRef}
			class="w-full p-2 text-gray-900 border border-gray-300 rounded-lg resize-none overflow-y-auto"
			value={content()}
			onInput={handleInput}
			placeholder="Type your message..."
			rows={1}
			style={{ "max-height": "120px" }} // 5 rows * 24px
			{...props}
		/>
	);
}
