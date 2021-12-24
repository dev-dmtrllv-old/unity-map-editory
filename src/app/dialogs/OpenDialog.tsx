import { Editor } from "app/editor/Editor";
import { DialogStore } from "app/stores/DialogStore";
import { OpenDialogStore } from "app/stores/OpenDialogStore";
import { RootStore } from "app/stores/RootStore";
import { useStore, useStores } from "app/stores/Store";
import { Button, FlexBox, FlexItem, Input, View } from "app/views";
import { Form } from "app/views/Form";
import { NumberInput } from "app/views/NumberInput";
import React from "react";
import { utils } from "utils";

import "./styles/open-dialog.scss";

export const showOpenDialog = () => RootStore.get(DialogStore).open(OpenDialog,
	"Open Map", {
	max: {
		width: "920px",
		height: "720px"
	}
}, { closable: Editor.get().openMapNames.length > 0 });

const NoProjectFound = useStore(OpenDialogStore, ({ store }) => (
	<View className="not-found">
		<View className="text">No recent projects found!</View>
		<Button onClick={store.openProject}>Open Project</Button>
	</View>
));

const ProjectList = useStore(OpenDialogStore, ({ store }) =>
{
	return (
		<View className="projects-list">
			{store.projects.map((p, i) =>
			{
				const cn = utils.react.getClassFromProps("item", { selected: store.selectedProject === p });
				return (
					<View key={i} className={cn} onClick={() => store.selectProject(i)}>
						<View className="name">{p.name}</View>
						<View className="path">{p.path}</View>
					</View>
				);
			})}
		</View>
	);
});

const OpenMapPanel = useStore(OpenDialogStore, ({ store }) =>
{
	if (!store.selectedProject)
		return (
			<View>
				<h2 className="text">
					Select a project to choose a map!
				</h2>
			</View>
		);

	return (
		<FlexBox fill position="absolute" theme="primary" dir="vertical" className="new-map-panel">
			<FlexItem base={64}>
				<View className="top-bar" position="absolute" fill>
					<View className="title" position="absolute" center>
						Maps
					</View>
					<View className="add-btn" position="absolute" center="vertical" onClick={() => store.showCreateMapPanel(true)}>
						<View />
					</View>
				</View>
			</FlexItem>
			<FlexItem>
				<View position="absolute" fill className="map-list">
					{store.selectedProject.maps.map((m, i) => 
					{
						const handleClick = (e: React.MouseEvent) =>
						{
							utils.react.stopEvents(e);
							store.selectMapDropdown(i);
						}

						const selected = store.selectedDropdown === i;

						return (
							<View key={i} className={utils.react.getClassFromProps("item", { selected })} onClick={(e) => { store.openMap(m); }}>
								<View className="name">{m.name}</View>
								<View className="size">{m.size.x} x {m.size.y}</View>
								<View className="edit-btn" position="absolute" center="vertical" onClick={handleClick}><View position="absolute" center /></View>
								<View className="edit-dropdown" position="absolute" onClick={utils.react.stopEvents}>
									<View onClick={(e) => { utils.react.stopEvents(e); store.editMap(m); }}>Edit</View>
									<View onClick={(e) => { utils.react.stopEvents(e); store.duplicateMap(m); }}>Duplicate</View>
									<View onClick={(e) => { utils.react.stopEvents(e); store.removeMap(m); }}>Delete</View>
								</View>
							</View>
						);
					})}
				</View>
			</FlexItem>
		</FlexBox>
	);
});

const NewMapPanel = useStore(OpenDialogStore, ({ store }) => 
{
	return (
		<FlexBox fill position="absolute" theme="primary" dir="vertical" className="new-map-panel">
			<FlexItem base={64}>
				<View className="top-bar" position="absolute" fill>
					{store.hasSelectedProjectMaps && <Button onClick={() => store.showCreateMapPanel(false)}>
						Back
					</Button>}
					<View className="title" position="absolute" center>
						{store.isEditing ? "Edit Map" : "Create Map"}
					</View>
				</View>
			</FlexItem>
			<FlexItem>
				<View className="form-wrapper">
					<Form onSubmit={store.createMap} values={store.createInputValues} onChange={store.updateInputValues}>
						<Input name="name" placeholder="Map Name" />
						<View className="size-group" center="horizontal">
							<NumberInput name="width" min={0} />
							<View className="cross" />
							<NumberInput name="height" min={0} />
						</View>
						<View center="horizontal">
							<Button name="submit" type="submit">
								{store.isEditing ? "Edit" : "Create"}
							</Button>
						</View>
						<View className="create-map-errors">
							{store.createMapErrors.map((error, i) => (
								<View className="error" key={i}>
									{error}
									<View position="absolute" className="btn-remove" onClick={() => store.removeError(i)} />
								</View>
							))}
						</View>
					</Form>
				</View>
			</FlexItem>
		</FlexBox>
	);
});

export const OpenDialog = useStores({ dialog: DialogStore, openStore: OpenDialogStore }, ({ dialog, openStore }) =>
{
	return (
		<FlexBox fill position="absolute" id="open-map-dialog" dir="horizontal">
			<FlexItem base={280}>
				<FlexBox fill position="absolute" theme="secundary" dir="vertical" className="side-bar">
					<FlexItem base={64}>
						<View className="top-bar" position="absolute" fill>
							<View position="absolute" center="vertical">
								<h3>Projects</h3>
							</View>
							<View className="add-btn" position="absolute" center="vertical" onClick={openStore.openProject}>
								<View />
							</View>
						</View>
					</FlexItem>
					<FlexItem>
						<View className="list">
							{openStore.hasProjects ? <ProjectList /> : <NoProjectFound />}
						</View>
					</FlexItem>
				</FlexBox>
			</FlexItem>
			<FlexItem className="body">
				<View position="absolute" fill>
					{openStore.isCreatePanelShown ? <NewMapPanel /> : <OpenMapPanel />}
				</View>
			</FlexItem>
		</FlexBox>
	);
});
