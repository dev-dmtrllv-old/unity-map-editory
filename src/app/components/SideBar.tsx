import { RootStore } from "app/stores/RootStore";
import { SidebarStore } from "app/stores/SidebarStore";
import { FlexItem, View } from "app/views";
import React from "react";
import { utils } from "utils";
import { PanelSlider } from "./PanelSlider";

import "./styles/side-bar.scss";

const PropertiesPanel = RootStore.use(SidebarStore, ({ store }) =>
{
	return (
		<View>
			{store.editor.activeMap?.selectedObject ? "selected object" : "No object is selected!"}
		</View>
	);
});

const LayersPanel = RootStore.use(SidebarStore, ({ store }) =>
{
	const map = store.editor.activeMap;
	return (
		<View>
			{map && map.layers.map((l ,i) => 
			{
				return (
					<View key={i}>
						Layer {i}
					</View>
				)
			})}
		</View>
	);
});

const SIDEBAR_PANELS: { [key: string]: React.FC } = {
	properties: PropertiesPanel,
	layers: LayersPanel
};

export const Panel: React.FC<{ index: number, name: string, isCollapsed: boolean }> = RootStore.use(SidebarStore, ({ store, index, isCollapsed, name }) =>
{
	return (
		<View className={utils.react.getClassFromProps("panel", { collapsed: isCollapsed })}>
			<View className="top-bar">
				{utils.string.capitalize(name)}
			</View>
			{React.createElement(SIDEBAR_PANELS[name])}
		</View>
	);
})

export const SideBar = RootStore.use(SidebarStore, ({ store }) =>
{
	const [base, setBase] = React.useState(320);

	store.loadTabs(Object.keys(SIDEBAR_PANELS));

	return (
		<FlexItem base={base}>
			<PanelSlider position="left" onChange={setBase} base={base} popBarier={15} />
			<View className="side-bar" position="absolute" fill theme="secundary">
				{Object.keys(SIDEBAR_PANELS).map((k, i) => <Panel index={i} key={i} isCollapsed={store.isCollapsed(i)} name={k} />)}
			</View>
		</FlexItem>
	)
});
