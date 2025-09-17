import { JSXElement, createSignal, onMount, onCleanup, createEffect } from "solid-js";
import { cm } from "~/utils/classMerger";

export type PopupItemType = { id: number | string; onClick: () => void; title: JSXElement };
type Props = {
	content: (PopupItemType | undefined)[];
	label: JSXElement;
	selected?: number | string;
	position: PositionType;
	itemPadding: string;
	class?: string;
};
type PositionType = { top?: number; bottom?: number; left?: number; right?: number };

export default function Popup(props: Props) {
	let wrapperRef: HTMLDivElement | undefined;
	const [isOpen, setIsOpen] = createSignal(false);
	const [show, setShow] = createSignal(false);

	createEffect(() => {
		if (isOpen()) {
			setShow(true);
		}
	});

	const handleClickOutside = (event: Event) => {
		if (wrapperRef && !wrapperRef.contains(event.target as Node)) {
			setShow(false);
		}
	};

	onMount(() => {
		document.addEventListener("mousedown", handleClickOutside);
	});

	onCleanup(() => {
		document.removeEventListener("mousedown", handleClickOutside);
	});

	const togglePopup = () => {
		if (props.content.length > 0) {
			if (isOpen()) {
				setShow(false);
			} else {
				setIsOpen(true);
			}
		}
	};

	const handleItemClick = (item: PopupItemType) => {
		item.onClick();
		setShow(false);
	};

	const handleTransitionEnd = (e: TransitionEvent) => {
		if (!show() && e.propertyName === "opacity") {
			setIsOpen(false);
		}
	};

	return (
		<div ref={wrapperRef} class={`relative flex items-center z-[3] ${props.class || ""}`}>
			<div class="flex items-center justify-center w-full" onClick={togglePopup}>
				{props.label}
			</div>

			{isOpen() && (
				<div
					style={{
						top: props.position?.top !== undefined ? `${props.position.top}px` : undefined,
						bottom: props.position?.bottom !== undefined ? `${props.position.bottom}px` : undefined,
						left: props.position?.left !== undefined ? `${props.position.left}px` : undefined,
						right: props.position?.right !== undefined ? `${props.position.right}px` : undefined,
					}}
					class={cm("absolute bg-background rounded-md border-base flex-col overflow-hidden w-max h-max transition-all duration-200 border", show() ? "opacity-100 scale-100" : "opacity-10 scale-90")}
					onTransitionEnd={handleTransitionEnd}
				>
					{props.content.map((c) => {
						if (c) {
							return (
								<button
									class={cm(
										"flex items-center w-full clicker select-none hover:bg-theme-popup-active active:opacity-80 clicker hover:bg-amber-100",
										props.itemPadding,
										props.selected === c.id ? "bg-theme-secondary bg-opacity-40" : ""
									)}
									onClick={() => handleItemClick(c)}
								>
									{c.title}
								</button>
							);
						}
					})}
				</div>
			)}
		</div>
	);
}
