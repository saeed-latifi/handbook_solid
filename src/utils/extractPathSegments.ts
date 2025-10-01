export function s3FolderPathExtractor({ bucketName, pathname }: { pathname: string; bucketName: string }) {
	// Remove leading/trailing slashes and split
	const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");

	// Find FIRST occurrence of base
	const baseIndex = segments.indexOf(bucketName);

	if (baseIndex === -1) return [];

	// Return segments after first base occurrence
	return segments.slice(baseIndex + 1).filter((segment) => segment !== "");
}
