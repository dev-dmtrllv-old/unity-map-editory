import React from "react";
import { utils } from "../../utils";
import { View } from "./View";

import "./styles/select.scss";

export const Select: React.FC<SelectProps> = ({ children, className, type = "text", name, placeholder, ...props }) => 
{
	const [hasFocus, setFocus] = React.useState(false);

	if (!name && placeholder)
		name = placeholder;
	else if (!placeholder && name)
		placeholder = name;

	const onFocus = () => setFocus(true);
	const onBlur = () => setFocus(false);

	const cn = utils.react.getClassFromProps("select", { className, type, focus: hasFocus });

	return (
		<View className="select-wrapper">
			<View position="absolute" className="placeholder">{placeholder}:</View>
			<select className={cn} onBlur={onBlur} onFocus={onFocus} {...props}>
				{children}
			</select>
		</View>
	);
};

type SelectProps = {
	className?: string;
	type?: "text" | "password" | "email";
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => any;
	placeholder?: string;
	value?: string | number;
	name?: string;
};
