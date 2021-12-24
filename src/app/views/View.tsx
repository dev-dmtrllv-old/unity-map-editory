import React from "react";
import { utils } from "../../utils";

import "./styles/view.scss";

export const View: React.FC<WithReactProps<ViewProps>> = ({ type = "div", children, className, position = "relative", center, fill, theme = "inherit", forwardRef, ...props }) => 
{
	const cn = utils.react.getClassFromProps("view", {
		[position || "relative"]: true,
		center,
		fill,
		className,
		[theme]: true
	});

	return React.createElement(type, { ...props, className: cn, ref: forwardRef }, children);
};

export type WithViewProps<Props extends {}, T extends HTMLElement = HTMLElement> = WithReactProps<ViewProps & Props, T>;

export type WithReactProps<Props extends {}, T extends HTMLElement = HTMLElement> = React.HTMLAttributes<T> & Props;

export type ViewProps = {
	type?: keyof React.ReactHTML;
	fill?: boolean | ViewDirection;
	center?: boolean | ViewDirection;
	position?: ViewPosition;
	theme?: "primary" | "secundary" | "tertiary" | "inherit" | "custom";
	forwardRef?: React.LegacyRef<HTMLDivElement>;
}

export type ViewPosition = "relative" | "static" | "absolute" | "fixed";

export type ViewDirection = "horizontal" | "vertical";
