import * as String from "./string";
import * as Math from "./math";
import * as React from "./react";

export namespace utils
{
	export const string = String;
	export const math = Math;
	export const react = React;

	export const arrayEquals = (a: any[], b: any[]) => 
	{
		if (a.length !== b.length)
			return false;
		for (let i = 0; i < a.length; i++)
			if (!equals(a[i], b[i]))
				return false;
		return true;
	}

	export const objectEquals = (a: any, b: any) =>
	{
		const ka = Object.keys(a);
		const kb = Object.keys(b);

		if (!arrayEquals(ka, kb))
			return false;

		for (let i = 0; i < ka.length; i++)
			if (!equals(a[ka[i]], b[kb[i]]))
				return false;

		return true;
	}

	export const equals = <T = any>(a: T, b: T) =>
	{
		if (Array.isArray(a) && Array.isArray(b))
			return arrayEquals(a, b);

		if (typeof a !== typeof b)
			return false;

		switch (typeof a)
		{
			case "boolean":
			case "string":
			case "number":
			case "bigint":
			case "symbol":
			case "function":
			case "undefined":
				return a === b;
			case "object":
				return objectEquals(a, b);
		}
		return false;
	}
}
