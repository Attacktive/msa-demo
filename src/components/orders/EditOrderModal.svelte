<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Product } from "$types/product";
	import type { InboundOrder, Order } from "$types/order";
	import type { SelectOptionType } from "flowbite-svelte";
	import { Button, Label, Modal, NumberInput, Select } from "flowbite-svelte";
	import { createEventDispatcher } from "svelte";
	import axios from "axios";

	interface Props {
		toShow?: boolean;
		orderId: number | undefined;
	}

	let { toShow = $bindable(false), orderId }: Props = $props();

	const dispatch = createEventDispatcher();

	let order: Order = $state({
		id: 0,
		productId: 0,
		quantity: 0
	});

	const clearData = () => {
		order = {
			id: 0,
			productId: 0,
			quantity: 0
		};
	};

	let productOptions: SelectOptionType<number>[] = $state([]);
	const productApiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const fetchProducts = async () => {
		const { data } = await axios.get<Product[]>(productApiRoot);

		productOptions = data.map(product => ({
			name: product.name,
			value: product.id
		}));
	};

	const orderApiRoot = import.meta.env.VITE_ORDER_API_ROOT;

	const fetchOrder = async () => {
		try {
			const { data } = await axios.get<InboundOrder>(`${orderApiRoot}/${orderId}`);

			order = {
				id: data.id,
				productId: data.product.id,
				quantity: data.quantity
			};
		} catch (error) {
			dispatch("report-error", error);
		}
	};

	const editOrder = () => {
		axios.put(`${orderApiRoot}/${orderId}`, order)
			.catch(error => dispatch("report-error", error))
			.finally(() => dispatch("submit"))
			.finally(() => toShow = false);
	};

	const removeProduct = () => {
		axios.delete(`${orderApiRoot}/${orderId}`)
			.catch(error => dispatch("report-error", error))
			.finally(() => dispatch("submit"))
			.finally(() => toShow = false);
	};

	run(() => {
		if (toShow === true) {
			fetchOrder();
			fetchProducts();
		} else {
			clearData();
		}
	});
</script>

<Modal title="Add product" autoclose bind:open={toShow}>
	<div>
		<Label for="id">ID</Label>
		<NumberInput id="id" readonly value={order.id}/>
	</div>
	<div>
		<Label for="product">Product</Label>
		<Select id="product" items={productOptions} bind:value={order.productId}/>
	</div>
	<div>
		<Label for="quantity">Quantity</Label>
		<NumberInput id="quantity" placeholder="Quantity" bind:value={order.quantity}/>
	</div>
	<div class="flex flex-row-reverse">
		<Button class="mt-3 mx-3" on:click={editOrder}>Edit</Button>
		<Button color="alternative" class="mt-3" on:click={removeProduct}>Remove</Button>
	</div>
</Modal>
