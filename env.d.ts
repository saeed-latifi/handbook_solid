interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_STORAGE_URL: string;
	readonly VITE_PAGE_SIZE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
	interface ProcessEnv {
		readonly TEST_PRIVATE_ENV: string;
	}
}
