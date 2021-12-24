import React from "react";
import { utils } from "utils";
import { View, WithViewProps } from ".";

import "./styles/container.scss";

export const Container: React.FC<WithViewProps<{}, HTMLDivElement>> = ({ className, ...props }) => 
{
	return (
		<View className={utils.react.getClassFromProps("container", { className })} {...props}/>
	);
}
