import { useBucketList } from "~/hooks/useBucket";
import { IconBucket } from "../icons/IconBucket";
import IconDelete from "../icons/IconDelete";
import { useNavigate } from "@solidjs/router";
import { useModal } from "~/context/modal.context";
import ModalBase from "../modal/modal.base";
import CardModal from "./CardModal";
import { Button } from "../button/Button";
import { IBucket } from "~/types/S3";

export function CardBucket({ bucket }: { bucket: IBucket }) {
	const { deleteBucket } = useBucketList();
	const navigate = useNavigate();

	const { closeModal: onClear, showModal: onModal } = useModal();

	function onCheckModal() {
		onModal(
			<ModalBase onClear={onClear}>
				<CardModal>
					<div class="font-peyda-bold px-2 py-4 text-gray-700 flex flex-col gap-2">
						<p>
							آیا از حذف باکت <span class="text-rose-900 px-2">{bucket.Name}</span> اطمینان دارید؟
						</p>
						<p>با حذف باکت تمام دیتای آن از بین میرود!</p>
					</div>
					<div class="flex w-full items-center justify-evenly gap-4">
						<Button onClick={onClear}>خیر</Button>
						<Button
							class="bg-rose-900"
							onClick={async (e) => {
								await deleteBucket(bucket.Name);
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

	return (
		<div onClick={() => navigate(`/${bucket.Name}`)} class="clicker bg-white rounded-lg aspect-square w-full flex flex-col border border-border relative items-center justify-center overflow-hidden">
			<div class="flex p-2 flex-1 aspect-square">
				<IconBucket class="fill-gray-500" />
			</div>
			<p class="w-full bg-gray-200 px-4 py-1 font-peyda-bold truncate">{bucket.Name}</p>

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
