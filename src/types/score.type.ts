export interface IScore {
	id: number;
	createdAt: Date;
	active: boolean;
	userId: number;
	score: number;
	lessonId?: number;
	giftId?: number;
	challengeId?: number;
}
