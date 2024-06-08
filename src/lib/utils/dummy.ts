import type { NewProduct, Product } from "$types/product";
import type { NewOrder } from "$types/order";

export const useDummyData = () => {
	const generateDummyProducts = () => [
		{
			name: "Lenovo Laptop",
			description: "An awesome Laptop manufactured by Lenovo.",
			price: 1_234_567,
			stock: 30
		},
		{
			name: "Monstargear Mechanical Keyboard",
			description: "A TKL mechanical keyboard which supports Bluetooth connection.",
			price: 202_020,
			stock: 23
		},
		{
			name: "Logitech MX Master 3S",
			description: undefined,
			price: 123_456,
			stock: 116
		},
		{
			name: "Apple Magic Trackpad II",
			description: "Don't bother with the description. 😈",
			price: 222_222,
			stock: 8
		}
	] satisfies NewProduct[];

	const generateRandomInteger = (minimum: number, maximum: number) => {
		const minimumCeiled = Math.ceil(minimum);
		const maximumFloored = Math.floor(maximum);

		return Math.floor(Math.random() * (maximumFloored - minimumCeiled) + minimumCeiled);
	};

	const generateDummyOrders = (products: Product[], numberOfOrders = 3) => {
		const orders: NewOrder[] = [];

		for (let i = 0; i < numberOfOrders; i++) {
			const productIndex = generateRandomInteger(1, products.length);
			const product = products[productIndex];

			const quantity = generateRandomInteger(1, product.stock / numberOfOrders);
			if (quantity <= 0) {
				continue;
			}

			const order = {
				productId: product.id,
				quantity
			};

			orders.push(order);
		}

		return orders;
	};

	return {
		generateDummyProducts,
		generateDummyOrders
	};
};
