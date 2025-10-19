import { useLocation } from "@solidjs/router";
import { createContext, useContext, JSXElement, ParentComponent, createSignal, createEffect, Show, onMount } from "solid-js";
import { Portal } from "solid-js/web";

type ModalContextType = {
	showModal: (modal: JSXElement) => void;
	closeModal: () => void;
	modalContent: () => JSXElement | undefined;
};

const ModalContext = createContext<ModalContextType>();

export const ModalProvider: ParentComponent = (props) => {
	const [modalContent, setRawModal] = createSignal<JSXElement | undefined>();
	const location = useLocation();

	function showModal(modal: JSXElement) {
		setRawModal(modal);
	}

	function closeModal() {
		setRawModal(undefined);
	}

	createEffect(() => {
		location.pathname;
		closeModal();
	});

	const value: ModalContextType = {
		showModal,
		closeModal,
		modalContent,
	};

	return <ModalContext.Provider value={value}>{props.children}</ModalContext.Provider>;
};

export function useModal() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	const { closeModal, showModal } = context;
	return { closeModal, showModal };
}

export function ModalInit() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}

	return (
		// <Portal>
		<Show when={!!context.modalContent()}>{context.modalContent()}</Show>
		// </Portal>
	);
}

type Props = {
	closeModal: () => void;
	outClose?: boolean;
	children: JSXElement;
	withAnimation?: boolean;
};

export default function ModalBase({ children, closeModal, outClose = true, withAnimation = true }: Props) {
	const wrapperBase = "w-full min-h-[100.1%] h-full overflow-y-auto bg-fixed transition-all bg-black duration-200 bg-black";
	const wrapperClose = wrapperBase + " " + "bg-opacity-0";
	const wrapperOpen = wrapperBase + " " + "bg-opacity-70";

	const backBase = "flex items-center justify-center px-4 py-12 w-full h-max min-h-full transition-all duration-200";
	const backClose = backBase + " " + " opacity-0 scale-90";
	const backOpen = backBase + " " + " opacity-100 scale-100";

	const [backgroundStyle, setBackgroundStyle] = createSignal(withAnimation ? backClose : backOpen);
	const [wrapperStyle, setWrapperStyle] = createSignal(withAnimation ? wrapperClose : wrapperOpen);
	const [canClose, setCanClose] = createSignal(false);

	onMount(() => {
		if (withAnimation) {
			setBackgroundStyle(backOpen);
			setWrapperStyle(wrapperOpen);
		}
	});

	const handleWrapperClick = () => {
		if (outClose) {
			setCanClose(true);
			if (withAnimation) {
				setBackgroundStyle(backClose);
				setWrapperStyle(wrapperClose);
			} else {
				closeModal();
			}
		}
	};

	const handleTransitionEnd = (e: TransitionEvent) => {
		if (canClose() && e.propertyName === "opacity") {
			closeModal();
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
