import { JSXElement, onMount, createSignal } from "solid-js";

type Props = {
	onClear: () => void;
	onOutClose?: boolean;
	children: JSXElement;
	withAnimation?: boolean;
};

export default function ModalBase({ children, onClear, onOutClose = true, withAnimation = true }: Props) {
	const wrapperBase = "w-full min-h-[100.1%] h-full overflow-y-auto bg-fixed transition-all bg-black duration-200 bg-black";
	const wrapperClose = wrapperBase + " " + "bg-opacity-0";
	const wrapperOpen = wrapperBase + " " + "bg-opacity-70";

	const backBase = "flex items-center justify-center px-4 py-12 w-full h-max min-h-full transition-all duration-200";
	const backClose = backBase + " " + " opacity-0 scale-90";
	const backOpen = backBase + " " + " opacity-100 scale-100";

	const [backgroundStyle, setBackgroundStyle] = createSignal(withAnimation ? backClose : backOpen);
	const [wrapperStyle, setWrapperStyle] = createSignal(withAnimation ? wrapperClose : wrapperOpen);
	const [onClose, setOnClose] = createSignal(false);

	onMount(() => {
		if (withAnimation) {
			setBackgroundStyle(backOpen);
			setWrapperStyle(wrapperOpen);
		}
	});

	const handleWrapperClick = () => {
		if (onOutClose) {
			setOnClose(true);
			if (withAnimation) {
				setBackgroundStyle(backClose);
				setWrapperStyle(wrapperClose);
			} else {
				onClear();
			}
		}
	};

	const handleTransitionEnd = (e: TransitionEvent) => {
		if (onClose() && e.propertyName === "opacity") {
			onClear();
		}
	};

	return (
		<div class="fixed top-0 right-0 bottom-0 left-0 z-50 bg-fixed overscroll-none overflow-y-scroll w-full">
			<div style={{ height: "100%" }} class={wrapperStyle()} onClick={handleWrapperClick}>
				<div class={backgroundStyle()} onTransitionEnd={handleTransitionEnd}>
					<div class="flex items-center justify-center max-w-full" onClick={(e) => e.stopPropagation()}>
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
