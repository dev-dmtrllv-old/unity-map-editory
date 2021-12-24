import { action, computed, observable } from "mobx";
import React from "react";
import { InitializableStore } from "./Store";

export class DialogStore extends InitializableStore<InitDialogProps>
{
	public static defaultSize: Required<PanelSize> = {
		width: "70vw",
		height: "65vh",
		min: {
			width: "320px",
			height: "200px"
		},
		max: {
			width: "90vw",
			height: "90vh",
		}
	};

	public static defaultOptions: Required<DialogOptions> = {
		closable: true,
	};

	public static mergeSize(size: Partial<PanelSize>): Required<PanelSize> { return { ...this.defaultSize, ...size }; }
	public static mergeOptions(options: DialogOptions): Required<DialogOptions> { return { ...this.defaultOptions, ...options }; }

	@observable
	private _isOpen: boolean = false;

	@observable
	private _title: string = "";

	private _component: React.FC | null = null;

	private _size: Required<PanelSize> = DialogStore.defaultSize;

	@observable
	private _options: DialogOptions = DialogStore.defaultOptions;


	@computed
	public get isOpen() { return this._isOpen; }

	@computed
	public get title() { return this._title; }

	public get body() { return this._component ? React.createElement(this._component) : null; }

	public get size() { return this._size; }

	@computed
	public get options() { return this._options; }

	@computed
	public get isClosable() { return this._options.closable; }

	@computed
	public get style(): React.CSSProperties
	{
		return {
			width: this._size.width,
			height: this._size.height,
			minWidth: this._size.min.width,
			minHeight: this._size.min.height,
			maxWidth: this._size.max.width,
			maxHeight: this._size.max.height,
		};
	}


	protected init = (props: InitDialogProps) =>
	{
		this._isOpen = props.open;
		if (props.open)
			this.open(props.component, props.title, props.size, props.options);
	}

	@action
	public readonly open = (component: React.FC, title: string, size?: Partial<PanelSize>, options?: DialogOptions) =>
	{
		this._isOpen = true;
		this._component = component;
		this._title = title;
		if (size)
			this._size = DialogStore.mergeSize(size);
		if (options)
			this._options = DialogStore.mergeOptions(options);
	}

	public readonly close = (force: boolean = false) =>
	{
		if (!this._isOpen || (!this.isClosable && !force))
			return;

		this.setOpen(false);
	}

	@action
	public setOpen(open: boolean) { this._isOpen = open; }

	@action
	private updateOptions(options: Partial<DialogOptions>)
	{
		this._options = { ...this._options, ...options };
	}

	public setClosable(closable: boolean)
	{
		if(closable != this._options.closable)
			this.updateOptions({ closable });
	}

	@action
	public setTitle = (title: string) => this._title = title;
}

type InitDialogProps = {
	open: false;
} | {
	open: true;
	component: React.FC;
	title: string;
	size?: Partial<PanelSize>;
	options?: DialogOptions;
};

type DialogOptions = {
	closable?: boolean;
};

type Size = {
	width: number | string;
	height: number | string;
};

type PanelSize = Size & {
	min?: Size;
	max?: Size;
};
