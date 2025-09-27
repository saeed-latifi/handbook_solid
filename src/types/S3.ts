export interface IS3Item {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
}

export interface IS3BucketInfo {
	Contents: IS3Item[];
	IsTruncated: boolean;
	KeyCount: number;
	MaxKeys: number;
	Name: string;
	Prefix: string;
	policy: {
		IsPublic: boolean;
	};
}
