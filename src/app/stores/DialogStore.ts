import { action, computed, observable } from "mobx";
import React from "react";
import { RootStore } from "./RootStore";
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

	private _dialogStore: IDialogStore<any> | null = null;

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

	public open (component: React.FC, title: string, size: Optional<Partial<PanelSize>>, options: Optional<DialogOptions>): void;
	public open<T extends IDialogStore<any>>(component: React.FC, title: string, size: Optional<Partial<PanelSize>>, options: Optional<DialogOptions>, store: DialogStoreType<T>, args: InferIDialogStoreArgs<T>): void;
	public open<T extends IDialogStore<any>>(component: React.FC, title: string, size: Optional<Partial<PanelSize>>, options: Optional<DialogOptions>, store?: DialogStoreType<T>, args?: InferIDialogStoreArgs<T>)
	{
		this._isOpen = true;
		this._component = component;
		this._title = title;
		if (size)
			this._size = DialogStore.mergeSize(size);
		if (options)
			this._options = DialogStore.mergeOptions(options);
		
		this._dialogStore = store ? RootStore.get(store) : null;

		if(this._dialogStore)
			this._dialogStore.onShow(args);
	}

	public readonly close = (force: boolean = false) =>
	{
		if (!this._isOpen || (!this.isClosable && !force))
			return;

		this.setOpen(false);

		if(this._dialogStore)
		{
			this._dialogStore.onClose();
			this._dialogStore = null;
		}
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

export interface IDialogStore<Args extends {} = {}>
{
	onShow(args: Args): void;
	onClose(): void;
}

export type InferIDialogStoreArgs<T> = T extends IDialogStore<infer Args> ? Args : never;

export type DialogStoreType<T extends IDialogStore<any>> = new (...args: any) => T;
