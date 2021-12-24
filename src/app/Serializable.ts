export interface Serializable<T>
{
	parse(data: SerializedType<T>): T;
	serialize(): SerializedType<T>;
}

export type SerializedType<T> = {
	[K in keyof T]: T[K] extends Serializable<infer P> ? SerializedType<P> : T[K] extends Serializable<infer P>[] ? Array<SerializedType<P>> : T[K];
};

