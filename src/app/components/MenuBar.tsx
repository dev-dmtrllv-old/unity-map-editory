import { MenuBarStore, MenuItemType } from "app/stores/MenuBarStore";
import { RootStore } from "app/stores/RootStore";
import { View } from "app/views";
import React from "react";
import { utils } from "utils";

import "./styles/menu-bar.scss";

export const renderChildItems = (children: MenuItemType[]) =>
{
	if (children.length <= 0)
		return null;

	return (
		<View className="list">
			{children.map((item, i) => <MenuItemComponent key={i} item={item} />)}
		</View>
	);
}

export const MenuItemComponent = RootStore.use<MenuBarStore, { item: MenuItemType }>(MenuBarStore, ({ store, item }) =>
{
	if (typeof item === "symbol")
		return <View className="menu-item-sep" />

	const cn = utils.react.getClassFromProps("menu-item", { active: item.isActive, selected: item.isSelected });

	const onClick = (e: React.MouseEvent) => store.onMenuItemClick(e, item);

	const mouseEnter = (e: React.MouseEvent) => store.onMouseEnter(e, item);

	return (
		<View className={cn} onClick={onClick} onMouseEnter={mouseEnter}>
			<View className="name">
				{item.name}
			</View>
			{renderChildItems(item.children)}
		</View>
	);
});

export const MenuBar = RootStore.use(MenuBarStore, ({ store }) =>
{
	return (
		<View className={utils.react.getClassFromProps("menu-bar", { active: store.isActive })} position="absolute" fill theme="custom">
			{store.menuItems.map((item, i) => <MenuItemComponent key={i} item={item} />)}
		</View>
	);
});
