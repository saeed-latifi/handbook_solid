export type IPayment = {
	id: number;
	createdAt: Date | null;
	active: boolean;
	userId: number;
	courseId: number;
	price: number;
	paymentId: string;
	state: "Waiting" | "Error" | "OK";
};
