import { makeObservable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { InferStoreProps, InitializableStore, InitStoreType, Store, StoreType } from "./Store";

export class RootStore
{
	private static readonly stores: Store[] = [];

	public static init<T extends InitializableStore<any>>(type: InitStoreType<T>, props: InferStoreProps<T>): T
	{
		let s = this.stores.find(s => s.constructor === type);
		if (!s)
		{
			s = new type();
			(s as InitializableStore<InferStoreProps<T>>)["init"](props);
			try
			{
				makeObservable(s!);
			}
			catch (e)
			{

			}
			this.stores.push(s!);
		}
		else
		{
			console.warn(`${type.name} is already initialized!`);
		}
		return s as T;
	}

	// public static initMultiple(...initGroups: InitStoreGroup<any>[])
	// {
	// 	initGroups.forEach(([type, props]) => this.init(type, props));
	// }

	public static get<T extends Store>(type: StoreType<T>): T
	{
		let s = this.stores.find(s => s.constructor === type);

		if (type.prototype instanceof InitializableStore && !s)
		{
			throw new Error(`Store ${type.name} is not initialized!`);
		}
		else if (!s)
		{
			s = new type(undefined);
			try
			{
				makeObservable(s!);
			}
			catch (e)
			{

			}
			this.stores.push(s!);
		}

		return s! as T;
	}

	public static readonly use = <S extends Store, P extends {} = {}>(type: StoreType<S>, component: React.FC<P & { store: S }>) => 
	{
		const Component = observer(component);
		return ({ ...props }) => React.createElement(Component, { ...props, store: this.get(type) } as any);
	}
}

type InitStoreGroup<T extends InitializableStore<any>> = [T, InferStoreProps<T>];
