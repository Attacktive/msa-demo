export interface NewProduct {
	name: string;
	description?: string;
	price: number;
	stock: number;
}

export interface Product extends NewProduct {
	id: number;
}
