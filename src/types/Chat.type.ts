export interface IChatMessage {
	id: number;
	isMine: boolean;
	content: string;
	createAt: Date;
}
