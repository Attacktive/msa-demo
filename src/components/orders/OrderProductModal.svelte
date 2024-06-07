<script lang="ts">
	import type { Product } from "$types/product";
	import type { NewOrder } from "$types/order";
	import type { SelectOptionType } from "flowbite-svelte";
	import { createEventDispatcher, onDestroy } from "svelte";
	import axios from "axios";
	import { Button, Label, Modal, NumberInput, Select } from "flowbite-svelte";

	export let toShow = false;

	const dispatch = createEventDispatcher();

	let newOrder: NewOrder = {
		productId: 0,
		quantity: 0
	};

	const clearData = () => {
		newOrder = {
			productId: 0,
			quantity: 0
		};
	};

	let productOptions: SelectOptionType<number>[] = [];
	const productApiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const fetchProducts = async () => {
		const { data } = await axios.get<Product[]>(productApiRoot);

		productOptions = data.map(product => ({
			name: product.name,
			value: product.id
		}));
	};

	const orderApiRoot = import.meta.env.VITE_ORDER_API_ROOT;
	const orderProduct = () => {
		axios.post(orderApiRoot, newOrder)
			.then(() => dispatch("submit"))
			.catch(error => dispatch("notify", error))
			.finally(() => toShow = false);
	};

	onDestroy(clearData);

	fetchProducts();
</script>

<Modal title="Order product" autoclose bind:open={toShow}>
	<div>
		<Label for="product">Product</Label>
		<Select id="product" items={productOptions} bind:value={newOrder.productId}/>
	</div>
	<div>
		<Label for="quantity">Quantity</Label>
		<NumberInput id="quantity" placeholder="Quantity" bind:value={newOrder.quantity}/>
	</div>
	<div class="flex flex-row-reverse">
		<Button class="mt-3" on:click={orderProduct}>Add</Button>
	</div>
</Modal>
