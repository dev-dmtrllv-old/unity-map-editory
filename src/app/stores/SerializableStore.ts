import { Serializable, SerializedType } from "app/Serializable";
import { action, computed, observable } from "mobx";
import { InitializableStore } from "./Store";

export abstract class SerializableStore<SerializableData extends StorageData> extends InitializableStore<SerializableStoreProps> implements Serializable<SerializableData>
{
	public readonly namespace = `SerializableStore.${this.constructor.name}`;

	@observable
	private _serializableData!: SerializableData;

	private _alwaysSync: boolean = true;

	public get alwaysSync() { return this._alwaysSync; }

	protected abstract get defaultData(): SerializableData;

	protected onInit = () => {  }

	protected init = (props: SerializableStoreProps) =>
	{
		const dataString = localStorage.getItem(this.namespace);

		this._alwaysSync = props.alwaysSync === undefined ? true : props.alwaysSync;

		if (dataString)
		{
			this._serializableData = this.parse(JSON.parse(dataString));
		}
		else
		{
			localStorage.setItem(this.namespace, JSON.stringify(this.defaultData));
			this._serializableData = { ...this.defaultData };
		}

		this.onInit();
	}

	public abstract parse(serializedString: SerializedType<SerializableData>): SerializableData;
	public abstract serialize(): SerializedType<SerializableData>;


	public readonly get = <K extends keyof SerializableData>(key: K): SerializableData[K] => this._serializableData[key];

	@action
	public readonly set = <K extends keyof SerializableData>(key: K, data: SerializableData[K]): void =>
	{
		this._serializableData = { ...this._serializableData, [key]: data };
		if (this.alwaysSync)
			localStorage.setItem(this.namespace, JSON.stringify(this.serialize()));
	}

	@action
	public readonly update = <K extends keyof SerializableData>(key: K, updater: (oldValue: SerializableData[K]) => SerializableData[K]): SerializableData[K] => 
	{
		const newVal = updater(this.get(key));
		this.set(key, newVal);
		return newVal;
	}

	@action
	public readonly clear = () =>
	{

	}
}

export type StorageData = {
	[key: string]: any;
};

export type SerializableStoreProps = {
	alwaysSync?: boolean;
};
