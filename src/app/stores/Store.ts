import { observer } from "mobx-react";
import React from "react";
import { RootStore } from "./RootStore";

export abstract class Store { }

export abstract class InitializableStore<Props extends {} = any> extends Store
{
	protected abstract init: (props: Props) => void;
}

export type StoreType<T extends Store> = new (props: any) => T;

export type InitStoreType<T extends InitializableStore<any>> = new () => T;

export type InferStoreProps<T extends InitializableStore<any>> = T extends InitializableStore<infer P> ? P : never;

export const useStores = <T extends { [key: string]: Store }, Props extends {} = {}>(types: { [K in keyof T]: StoreType<T[K]> }, component: React.FC<Props & { [K in keyof T]: T[K] }>) => 
{
	let stores: any = null;
	return (props: Props) => 
	{
		if (!stores)
		{
			stores = {};
			Object.keys(types).forEach(k => stores[k] = RootStore.get(types[k]));
		}
		return React.createElement(observer(component), { ...props, ...stores });
	};
};

export const useStore = <S extends Store, P extends {} = {}>(type: StoreType<S>, component: React.FC<P & { store: S }>) => 
{
	const Component = observer(component);
	let store: any = null;
	return ({ ...props }) => 
	{
		if(!store)
			store = RootStore.get(type);
		return React.createElement(Component, { ...props, store } as any);
	};
}
