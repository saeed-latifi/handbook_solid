export const ChallengeItemType = { Text: "Text", Audio: "Audio", Video: "Video" } as const;
export type ChallengeItemType = (typeof ChallengeItemType)[keyof typeof ChallengeItemType];

export const ChallengeType = { BusinessClass: "BusinessClass", FirstClass: "FirstClass" } as const;
export type ChallengeType = (typeof ChallengeType)[keyof typeof ChallengeType];

export const ChallengeStatus = { Pending: "Pending", Complete: "Complete", Failed: "Failed" } as const;
export type ChallengeStatus = (typeof ChallengeStatus)[keyof typeof ChallengeStatus];

export type IChallenge = {
	id: number;
	createdAt: Date;
	active: boolean;
	description: string;
	title: string;
	price: number;
	seasonId: number;
	type: ChallengeType;
	level: number;
	expire: number;
	creatorId: number;
	autoComplete: boolean;
	lessonId?: number;
	reward: number;

	owners: { userId: number }[];
};

export type IChallengeOwning = {
	active: boolean | null;
	createdAt: Date | null;
	status: "Pending" | "Complete" | "Failed";
	challengeId: number;
	userId: number;
	review: string | null;
	answerId: number | null;
};
