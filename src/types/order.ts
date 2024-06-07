import type { Product } from "$types/product";

export interface InboundOrder {
	id: number;
	product: Product;
	quantity: number;
}

export interface NewOrder {
	productId: number;
	quantity: number;
}

export interface Order extends NewOrder{
	id: number;
}
