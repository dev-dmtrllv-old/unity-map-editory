import React from "react";
import { toSnakeCase } from "./string";

export const getClassFromProps = (cn: string, { className, ...props }: { [key: string]: any } = {}) =>
{
	cn = toSnakeCase(cn);
	for (const prop in props)
	{
		if (props[prop] === true)
			cn += ` ${toSnakeCase(prop)}`;
		else if (typeof props[prop] === "string")
			cn += ` ${toSnakeCase(prop)}-${toSnakeCase(props[prop])}`;
	}
	return className ? `${className} ${cn}` : cn;
}

export const stopEvents = (e: React.MouseEvent | React.FormEvent) =>
{
	e.preventDefault();
	e.stopPropagation();
}

export const useMounter = (onMount: Function, onUnMount: Function) => React.useEffect(() => { onMount(); return () => onUnMount(); }, []);
