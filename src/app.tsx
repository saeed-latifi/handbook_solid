import "./app.css";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { DomainProvider } from "./context/domainContext";
import { SimpleDomainProvider } from "./context/simpleContext";
import { ModalInit, ModalProvider } from "./context/modal.context";
import { Toaster } from "solid-toast";
import { AuthChecker } from "./layout/AuthChecker";

export default function App() {
	console.log("ooo", process.env.TEST_PRIVATE_ENV);

	return (
		<Router
			root={(props) => (
				<>
					<DomainProvider>
						<SimpleDomainProvider>
							<ModalProvider>
								<Suspense>
									<AuthChecker>{props.children}</AuthChecker>
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
