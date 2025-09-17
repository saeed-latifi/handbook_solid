import { useLocation } from "@solidjs/router";
import { createContext, useContext, JSXElement, ParentComponent, createSignal, createEffect, Show } from "solid-js";
import { Portal } from "solid-js/web";

type ModalContextType = {
	onModal: (modal: JSXElement) => void;
	onClear: () => void;
	rawModal: () => JSXElement | undefined;
};

const ModalContext = createContext<ModalContextType>();

export const ModalProvider: ParentComponent = (props) => {
	const [rawModal, setRawModal] = createSignal<JSXElement | undefined>();
	const location = useLocation();

	function onModal(modal: JSXElement) {
		setRawModal(modal);
	}

	function onClear() {
		setRawModal(undefined);
	}

	createEffect(() => {
		location.pathname;
		onClear();
	});

	const value: ModalContextType = {
		onModal,
		onClear,
		rawModal,
	};

	return <ModalContext.Provider value={value}>{props.children}</ModalContext.Provider>;
};

export function useModal() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	const { onClear, onModal } = context;
	return { onClear, onModal };
}

export function ModalInit() {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}

	return (
		// <Portal>
		<Show when={!!context.rawModal()}>{context.rawModal()}</Show>
		// </Portal>
	);
}
