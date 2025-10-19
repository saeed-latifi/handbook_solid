import { useModal } from "~/context/modal.context";
import ModalBase from "../modal/modal.base";
import CardModal from "./CardModal";
import { IconAddFile } from "../icons/IconAddFile";
import S3UploadBox from "../S3UploadBox";
import { IS3BucketInfo } from "~/types/S3";

export function CardS3UploadFile({ bucketName, data }: { bucketName: string; data: IS3BucketInfo }) {
	const parents = data?.Prefix.split("/").filter((item) => item !== "");
	const { closeModal: onClear, showModal: onModal } = useModal();

	function onClick() {
		onModal(
			<ModalBase onClear={onClear}>
				<CardModal>
					<S3UploadBox bucketName={bucketName} parents={parents} />
				</CardModal>
			</ModalBase>
		);
	}

	return (
		<button onClick={onClick} class="bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
			<div class="flex flex-1 overflow-hidden">
				<div class="w-full h-full flex items-center justify-center p-4">
					<IconAddFile class="fill-emerald-600 w-full h-full aspect-square max-w-20" />
				</div>
			</div>
			<p class="w-full bg-gray-200 px-2 py-0.5 font-peyda-bold text-sm truncate min-h-fit">آپلود فایل</p>
		</button>
	);
}
