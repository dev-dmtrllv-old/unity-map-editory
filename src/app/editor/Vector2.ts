import { Serializable, SerializedType } from "app/Serializable";
import { action, computed, makeAutoObservable, observable } from "mobx";

export class Vector2 implements Serializable<VectorData>
{
	public static readonly add = (a: Vector2, b: Vector2) => new Vector2(a.x + b.x, a.y + b.y);
	public static readonly sub = (a: Vector2, b: Vector2) => new Vector2(a.x - b.x, a.y - b.y);
	public static readonly mul = (a: Vector2, b: Vector2) => new Vector2(a.x * b.x, a.y * b.y);
	public static readonly div = (a: Vector2, b: Vector2) => new Vector2(b.x === 0 ? 0 : a.x / b.x, b.y === 0 ? 0 : a.y / b.y);
	public static readonly equals = (a: Vector2, b: Vector2) => ((a.x === b.x) && (a.y === b.y));
	public static readonly round = (a: Vector2) => new Vector2(Math.round(a.x), Math.round(a.y));
	public static readonly floor = (a: Vector2) => new Vector2(Math.floor(a.x), Math.floor(a.y));
	public static readonly ceil = (a: Vector2) => new Vector2(Math.ceil(a.x), Math.ceil(a.y));
	public static readonly clone = (a: Vector2) => new Vector2(a.x, a.y);

	public static get zero() { return new Vector2(0, 0); }

	@observable
	private _x: number;

	@observable
	private _y: number;

	public constructor(x: number, y: number)
	{
		this._x = x;
		this._y = y;
		makeAutoObservable(this);
	}

	@action
	public parse(data: SerializedType<VectorData>): VectorData
	{
		return data;
	}

	public serialize(): SerializedType<VectorData>
	{
		return {
			x: this.x,
			y: this.y
		};
	}

	@computed
	public get x() { return this._x; }
	@computed
	public get y() { return this._y; }


	@action
	public setX(val: number) { this._x = val; }

	@action
	public setY(val: number) { this._y = val; }
}

type VectorData = {
	x: number;
	y: number;
}
