export const toSnakeCase = (str: string, sep: string = "-") => str.split("").map((p, i) => 
{
	if (p === p.toUpperCase() && i !== 0 && /[a-z0-9]/ig.test(p))
		return `${sep}${p}`;
	return p;
}).join("").toLowerCase();

export const capitalize = (str: string) => str ? (str[0].toUpperCase() + str.substr(1, str.length)) : "";

export const toCamelCase = (str: string, cap: boolean = true) => 
{
	let wasSymbol = false;

	str = str.split("").map((p) => 
	{
		if (/[a-z]/ig.test(p)) 
		{
			wasSymbol = false;
			if (wasSymbol)
				return p.toUpperCase();
			return p.toLowerCase();
		}
		else
		{
			wasSymbol = true;
			return "";
		}
	}).join("");

	return cap ? capitalize(str) : cap;
};

export const countCharsBefore = (str: string, char: string) =>
{
	let count = 0;
	for (let i = 0, l = str.length; i < l; i++)
	{
		if (str[i] === char)
			count++;
		else
			break;
	}

	return count;
}
