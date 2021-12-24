export const loop = (times: number, cb: (index: number) => any) =>
{
	for(let i = 0; i < times; i++)
		cb(i);
}

export const loopMap = <T>(times: number, cb: (index: number) => T): T[] =>
{
	const arr: T[] = [];
	for(let i = 0; i < times; i++)
		arr.push(cb(i));
	return arr;
}
