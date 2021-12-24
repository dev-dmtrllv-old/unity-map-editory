import React from "react";
import { utils } from "utils";
import { View } from "./View";

import "./styles/number-input.scss";
import { FormContext } from "./Form";

export const NumberInput: React.FC<NumberInputProps> = ({ min, max, name, placeholder, value = 0, onChange }) =>
{
	const inputRef = React.createRef<HTMLInputElement>();
	const ctx = React.useContext(FormContext);

	const [hasFocus, setHasFocus] = React.useState(false);

	if (!name && !placeholder)
		throw new Error(`Missing name and placeholder for number-input!`);

	if (!placeholder)
		placeholder = utils.string.capitalize(name!);
	else if (!name)
		name = placeholder!.toLowerCase();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		e.preventDefault();
		e.stopPropagation();
		onChange && onChange(e.target.valueAsNumber);
		ctx?.onChange(e.target.name, e.target.value);
	}

	const focus = () => inputRef.current?.focus()

	const handleKeyDown = (e: React.KeyboardEvent) =>
	{
		if(ctx && (e.key === "Enter"))
			ctx.submit();
	}

	return (
		<View className={utils.react.getClassFromProps("number-input", { focus: hasFocus })}>
			<View className="placeholder" onClick={focus}>{placeholder}:</View>
			<input onKeyDown={handleKeyDown} ref={inputRef} type="number" name={name} min={min} max={max} value={ctx ? (ctx.getValue(name!) || 0) : value} onChange={handleChange} onFocus={() => setHasFocus(true)} onBlur={() => setHasFocus(false)} />
		</View>
	);
};

type NumberInputProps = {
	min?: number;
	max?: number;
	name?: string;
	placeholder?: string;
	value?: number;
	onChange?: (value: number) => void;
};
