import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { IS3Prefix } from "~/types/S3";
import { IconFolder } from "../icons/IconFolder";
import { useModal } from "~/context/modal.context";
import ModalBase from "../modal/modal.base";
import CardModal from "./CardModal";
import { Button } from "../button/Button";
import IconDelete from "../icons/IconDelete";
import { http } from "../http";
import { IResponse } from "~/types/response.type";
import { useBucketInfo } from "~/hooks/useBucket";

export function CardS3Folder({ item, bucketName }: { item: IS3Prefix; bucketName: string }) {
	const navigate = useNavigate();
	const params = useParams();

	const { pathname } = useLocation();
	const { data, isLoading, mutateValue } = useBucketInfo({ name: () => params.bucketName, prefix: () => params.contentPath });

	function onClick() {
		navigate(`/storage/${bucketName}/${item.Prefix}`);
	}

	const { onClear, onModal } = useModal();

	function onCheckModal() {
		onModal(
			<ModalBase onClear={onClear}>
				<CardModal>
					<div class="font-peyda-bold px-2 py-4 text-gray-700 flex flex-col gap-2">
						<p>
							آیا از حذف باکت <span class="text-rose-900 px-2">{item.Prefix}</span> اطمینان دارید؟
						</p>
						<p>با حذف باکت تمام دیتای آن از بین میرود!</p>
					</div>
					<div class="flex w-full items-center justify-evenly gap-4">
						<Button onClick={onClear}>خیر</Button>
						<Button
							class="bg-rose-900"
							onClick={async (e) => {
								await onDeleteFolder();
								onClear();
							}}
						>
							حذف
						</Button>
					</div>
				</CardModal>
			</ModalBase>
		);
	}

	async function onDeleteFolder() {
		const parents = extractPathSegments({ bucketName, pathname });
		if (!data()) return;
		const { data: res } = await http.post<IResponse<{ bucketName: string; folderName: string }>>("/storage/folder/delete", { bucketName, folderName: getLastWord(item.Prefix), parents });

		if (!res.data) return;
		const CommonPrefixes: IS3Prefix[] = data()?.CommonPrefixes?.filter((i) => i.Prefix !== item.Prefix) ?? [];

		console.log({ CommonPrefixes });
		await mutateValue({ CommonPrefixes });
		onClear();
	}

	return (
		<div onClick={onClick} class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
			<div class="flex flex-1 overflow-hidden">
				<div class="w-full h-full flex items-center justify-center">
					<IconFolder class="fill-gray-500 w-full h-full aspect-square max-w-24" />
				</div>
			</div>
			<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">{getLastWord(item.Prefix)}</p>

			<button
				class="flex items-center justify-center bg-white rounded-full border border-red-600 p-1 absolute top-2 left-2"
				onClick={async (e) => {
					e.stopPropagation();
					onCheckModal();
				}}
			>
				<IconDelete class="fill-red-600 w-5 h-5 min-w-5" />
			</button>
		</div>
	);
}

function getLastWord(str: string) {
	return str.split("/").filter(Boolean).pop() || "";
}

function extractPathSegments({ bucketName, pathname }: { pathname: string; bucketName: string }) {
	// Remove leading/trailing slashes and split
	const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");

	// Find FIRST occurrence of base
	const baseIndex = segments.indexOf(bucketName);

	if (baseIndex === -1) return [];

	// Return segments after first base occurrence
	return segments.slice(baseIndex + 1).filter((segment) => segment !== "");
}
