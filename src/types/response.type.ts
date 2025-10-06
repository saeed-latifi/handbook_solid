export const ResponseState = {
	Success: "Ok",
	NoAccount: "NoAccount",
	NoAccess: "NoAccess",
	NotFound: "NotFound",
	ServerError: "ServerError",
	Validations: "Validations",
} as const;

export type ResponseState = (typeof ResponseState)[keyof typeof ResponseState];

export type IValidations<T> = { [K in keyof T]?: string[] };

// T BaseDataType
// X metadata Data
// F Filters
export interface IResponse<T = undefined, X = undefined> {
	responseState?: ResponseState;
	data?: T;
	metadata?: X;
	length?: number;

	messages?: Partial<Record<"Success" | "error" | "warning" | "noAccess" | "notFound", string[]>>;
	validations?: IValidations<T>;
	redirectPath?: string;
}

export type IDomainNames = "user" | "lesson" | "some" | "buckets";

export interface IFetchState {
	isLoading: boolean;
	isValidating: boolean;
	initialized: boolean;
	error?: Error | any;
}

export interface IListData<T, X> {
	data: IResponse<T[], X>;
	fetchState: IFetchState;
}

export interface IRecordData<T, X> {
	data?: IResponse<T, X>;
	fetchState: IFetchState;
}

export interface IDomainStore<T, X> {
	name: IDomainNames;
	lists: Record<string, IListData<T, X>>;
	records: Record<string | number, IRecordData<T, X>>;
}

export type IDomainSimpleNames = "settings" | "account";
export type ISimpleStore<T, X> = {
	[key in IDomainSimpleNames]?: IRecordData<T, X>;
};

//

//
export interface IUserSimple {
	id: number;
	name: string;
}

export interface ILessonSimple {
	id: number;
	title: string;
}
