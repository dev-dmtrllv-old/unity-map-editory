import React from "react";
import { utils } from "../../utils";
import { View } from "./View";

import "./styles/check-box.scss";

export const CheckBox: React.FC<CheckBoxProps> = ({ children, className, name, placeholder, selected = false, onChange, ...props }) => 
{
	const [isSelected, setSelected] = React.useState(selected);

	if (!name && !placeholder)
		console.warn(`missing placeholder and name!`);

	if (!name && placeholder)
		name = placeholder;
	else if (!placeholder && name)
		placeholder = name;

	const cn = utils.react.getClassFromProps("check-box", { className, selected: isSelected });

	const handleClick = () =>
	{
		setSelected(!isSelected);
		onChange && onChange({ name: name!, selected: !isSelected });
	}

	return (
		<View className="check-box-wrapper">
			<View className="flex-wrapper">
				<View className="placeholder">{placeholder}:</View>
				<View tabIndex={0} className={cn} onClick={handleClick} {...props}>
					<View fill />
				</View>
			</View>
		</View>
	);
};

type CheckBoxProps = {
	className?: string;
	onChange?: (e: SelectChangeEvent) => any;
	placeholder?: string;
	value?: string | number;
	name?: string;
	selected?: boolean;
};

export type SelectChangeEvent = {
	name: string;
	selected: boolean;
}
