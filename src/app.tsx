import "./app.css";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { DomainProvider } from "./context/domainContext";
import { SimpleDomainProvider } from "./context/simpleContext";
import { ClientWrapper } from "./layout/ClientWrapper";
import { ModalInit, ModalProvider } from "./context/modal.context";
import { AuthChecker } from "./layout/AuthChecker";
import { Toaster } from "solid-toast";

export default function App() {
	return (
		<Router
			root={(props) => (
				<>
					<DomainProvider>
						<SimpleDomainProvider>
							<ModalProvider>
								<Suspense>
									<ClientWrapper>{props.children}</ClientWrapper>
								</Suspense>
								<Toaster position="top-center" />
								<ModalInit />
							</ModalProvider>
						</SimpleDomainProvider>
					</DomainProvider>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
