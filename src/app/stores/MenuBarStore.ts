import { action, computed, makeAutoObservable, observable } from "mobx";
import React from "react";
import { InitializableStore, Store } from "./Store";

export type MenuItemAction = (menuItem: MenuItem) => void;

export const MENU_SEPERATOR = Symbol("MENU_SEPERATOR");

export type MenuItemType = MenuItem | typeof MENU_SEPERATOR;

export class MenuItem
{
	@observable
	private _name: string;

	@observable
	private _action: MenuItemAction;

	@observable
	private _children: MenuItemType[];

	@observable
	private _isActive: boolean = false;

	@observable
	private _isSelected: boolean = false;

	private _parent: MenuItem | null = null;

	public get parent() { return this._parent; }

	private _id: number = 0;

	public get id() { return this._id; }
	public constructor(name: string, children?: MenuItemType[]);
	public constructor(name: string, action?: MenuItemAction, children?: MenuItemType[]);
	public constructor(name: string, actionOrChildren?: MenuItemAction | MenuItemType[], children: MenuItemType[] = [])
	{
		this._name = name;
		const _children = Array.isArray(actionOrChildren) ? actionOrChildren : children;
		const _action = typeof actionOrChildren === "function" ? actionOrChildren : () => { };

		this._action = _action;
		this._children = _children;
		this._children.forEach((c, i) => 
		{
			if (typeof c !== "symbol")
			{
				c._id = i;
				c._parent = this;
			}
		});

		makeAutoObservable(this);
	}

	@computed
	public get isActive() { return this._isActive; }

	@action
	public setActive(active: boolean)
	{
		this._isActive = active;
	}


	@computed
	public get isSelected() { return this._isSelected; }

	@action
	public setSelected(selected: boolean) { this._isSelected = selected; }

	@action
	public setName(name: string)
	{
		this._name = name;
	}

	@action
	public setAction(action: MenuItemAction)
	{
		this._action = action;
	}

	@computed
	public get name()
	{
		return this._name;
	}

	@computed
	public get action()
	{
		return this._action;
	}

	@computed
	public get children()
	{
		return [...this._children];
	}
};

export class MenuBarStore extends InitializableStore<MenuItem[]>
{
	private static findFirstMenuItem(children: MenuItemType[]): MenuItem | null
	{
		return children.find(c => (typeof c !== "symbol")) as MenuItem || null;
	}

	@observable
	private _menuItems: MenuItem[] = [];

	@observable
	private _isActive: boolean = false;

	private _activeRootItem: MenuItem | null = null;
	private _selected: MenuItem | null = null;

	@computed
	public get isActive() { return this._isActive && (this._selected !== null); }

	@computed
	public get menuItems() { return this._menuItems; }

	@action
	public setActive = (active: boolean) =>
	{
		this._isActive = active;
		if (!active)
		{
			this.deactivateSelected();
			this._selected = null;
		}
	}
	
	protected init = (menuItems: MenuItem[]): void =>
	{
		this._menuItems = menuItems;
		window.addEventListener("keydown", (e) => this.onKeyDown(e));
		window.addEventListener("click", (e) => this.onClick(e));
		window.addEventListener("blur", (e) => this.onBlur());
		this._menuItems.forEach((item, i) => item["_id"] = i);
	}
	

	private readonly onKeyDown = (e: KeyboardEvent) =>
	{
		if (e.altKey)
		{
			e.preventDefault();

			if (!this._selected)
			{
				this._selected = this.menuItems[0] as MenuItem;
				this._selected.setSelected(true);
			}
			else
			{
				this.deactivateSelected();
				this.setActive(false);
			}
		}
		else if (this._selected)
		{
			switch (e.key)
			{
				case "ArrowLeft":
					if (this._selected.parent === null)
					{
						let next = this._selected.id - 1;
						if (next < 0)
							next = this.menuItems.length - 1;
						this.deactivateSelected();
						this._selected = this._menuItems[next];
						this._selected.setSelected(true);
						break;
					}
					else
					{
						this._selected.setActive(false);
						this._selected.setSelected(false);
						this._selected = this._selected.parent;
						this._selected.setActive(false);
					}
					e.preventDefault();
					break;

				case "ArrowUp":
					if (this._selected.parent)
					{
						let nextID = this._selected.id - 1;
						if (nextID < 0)
							nextID = this._selected.parent.children.length - 1;

						while (nextID != this._selected.id)
						{
							if (typeof this._selected.parent?.children[nextID] != "symbol")
								break;
							nextID--;
						}

						const next: MenuItem = this._selected.parent.children[nextID] as MenuItem;

						if (next != this._selected)
						{
							this._selected.setSelected(false);
							this._selected.setActive(false);
							this._selected = next;
							next.setSelected(true);
						}

						e.preventDefault();
					}
					break;

				case "ArrowDown":
					if (this._selected.parent)
					{
						let nextID = this._selected.id + 1;
						if (nextID >= this._selected.parent.children.length)
							nextID = 0;

						while (nextID != this._selected.id)
						{
							if (typeof this._selected.parent?.children[nextID] != "symbol")
								break;
							nextID++;
						}

						const next: MenuItem = this._selected.parent.children[nextID] as MenuItem;

						if (next != this._selected)
						{
							this._selected.setSelected(false);
							this._selected.setActive(false);
							this._selected = next;
							next.setSelected(true);
						}

						e.preventDefault();
					}
					break;

				case "ArrowRight":
					if (this._selected.parent === null)
					{
						let next = this._selected.id + 1;
						if (next >= this.menuItems.length)
							next = 0;
						this.deactivateSelected();
						this._selected = this._menuItems[next];
						this._selected.setSelected(true);
					}
					else if (this._selected.children.length > 0)
					{
						const firstItem = MenuBarStore.findFirstMenuItem(this._selected.children);
						if (firstItem)
						{
							this._selected.setActive(true);
							this._selected = firstItem;
							this._selected.setSelected(true);
						}
					}
					else
					{
						let root = this._selected;
						while (root.parent !== null)
							root = root.parent;
						let next = root.id + 1;
						if (next >= this.menuItems.length)
							next = 0;
						this.deactivateSelected();
						this._selected = this._menuItems[next];
						this._selected.setSelected(true);
					}
					e.preventDefault();
					break;

				case "Enter":
					if (this._selected.parent === null)
						this.setActive(true);

					if (this._selected.children.length > 0)
					{
						const firstItem = MenuBarStore.findFirstMenuItem(this._selected.children);
						if (firstItem)
						{
							this._selected.setActive(true);
							this._selected = firstItem;
							this._selected.setSelected(true);
						}
					}
					else if (this._selected.action)
					{
						this._selected.action(this._selected);
						this.setActive(false);
					}

					e.preventDefault();
					break;
			}
		}
	}

	private readonly onClick = (e: MouseEvent) =>
	{
		if (!e.composedPath().find((el) => "classList" in el && (el as HTMLElement).classList.contains("menu-bar")))
			this.setActive(false);
	}

	@action
	public readonly onMenuItemClick = (e: React.MouseEvent, menuItem: MenuItem) => 
	{
		e.preventDefault();
		e.stopPropagation();

		if (menuItem.parent == null)
		{
			if(this._selected === menuItem)
			{
				this.setActive(false);
			}
			else if (this._isActive)
			{
				if (this._activeRootItem != menuItem)
				{
					this.deactivateSelected();
					this._selected = menuItem;
					menuItem.setActive(true);
				}
				else
				{
					this.setActive(false);
				}
			}
			else if (menuItem.children.length > 0)
			{
				this._selected = menuItem;
				menuItem.setActive(true);
				this.setActive(true);
			}
			else if (menuItem.action)
			{
				menuItem.action(menuItem);
				this.setActive(false);
			}
		}
		else if (menuItem.children.length > 0)
		{
			this._selected = menuItem;
			menuItem.setActive(true);
			this.setActive(true);
		}
		else
		{
			menuItem.action(menuItem);
			this.setActive(false);
		}
	}

	@action
	private deactivateSelected = () =>
	{
		if (this._selected)
		{
			let item: MenuItem | null = this._selected;
			while (item)
			{
				item.setActive(false);
				item.setSelected(false);
				item = item.parent;
			}
			this._selected = null;
		}
	}

	public readonly onMouseEnter = (e: React.MouseEvent, menuItem: MenuItem) => 
	{
		if (this._selected === null)
			return;

		if (this._selected && !(e.target as HTMLDivElement).classList.contains("list"))
		{
			if (this._selected != menuItem)
			{
				this.deactivateSelected();
				this._selected = menuItem;
				let i: any = this._selected;
				while (i)
				{
					i.setSelected(true);
					i.setActive(true);
					i = i.parent;
				}
				if (menuItem.parent !== null)
					menuItem.setActive(true);
			}
		}
	}

	private readonly onBlur = () =>
	{
		this.setActive(false);
	}
}
