import React from "react";
import { getClassFromProps } from "../../utils/react";
import { View, ViewDirection, WithViewProps } from "./View";

import "./styles/flex.scss";

const FlexContext = React.createContext<ViewDirection>("horizontal");

export const FlexBox: React.FC<FlexBoxProps> = ({ className, dir = "horizontal", children, reversed, ...props }) =>
{
	const cn = getClassFromProps("flex-box", { className, [dir]: true, reversed });

	return (
		<View className={cn} {...props}>
			<FlexContext.Provider value={dir}>
				{children}
			</FlexContext.Provider>
		</View>
	);
}

export const FlexItem: React.FC<FlexItemProps> = ({ className, base, shrink = 1, grow = 1, style = {}, ...props }) =>
{
	const cn = getClassFromProps("flex-item", { className });

	const dir = React.useContext(FlexContext);

	if (typeof base === "number")
	{
		if (dir === "horizontal")
			style.width = style.maxWidth = style.minWidth = style.flexBasis = `${base}px`;
		else
			style.height = style.maxHeight = style.minHeight = style.flexBasis = `${base}px`;
	}
	else
	{
		style.flex = `${shrink} ${grow} 0`;
	}

	return (
		<View className={cn} style={style} {...props} />
	);
}

type FlexBoxProps = WithViewProps<{
	dir?: ViewDirection;
	reversed?: boolean;
}>;

type FlexItemProps = WithViewProps<{
	base?: number;
	grow?: number;
	shrink?: number;
}>;
