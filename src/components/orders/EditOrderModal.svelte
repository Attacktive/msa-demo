<script lang="ts">
	import type { Product } from "$types/product";
	import type { InboundOrder, Order } from "$types/order";
	import type { SelectOptionType } from "flowbite-svelte";
	import { Button, Label, Modal, NumberInput, Select, Spinner } from "flowbite-svelte";
	import { createEventDispatcher, onDestroy } from "svelte";
	import axios from "axios";

	export let toShow = false;
	export let orderId: number | undefined;

	const dispatch = createEventDispatcher();

	let order: Order = {
		id: 0,
		productId: 0,
		quantity: 0
	};

	const clearData = () => {
		order = {
			id: 0,
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

	let toShowSpinner = false;
	const fetchOrder = async () => {
		toShowSpinner = true;
		const { data } = await axios.get<InboundOrder>(`${orderApiRoot}/${orderId}`);

		order = {
			id: data.id,
			productId: data.product.id,
			quantity: data.quantity
		};

		toShowSpinner = false;
	};

	const editOrder = () => {
		axios.put(`${orderApiRoot}/${orderId}`, order)
			.then(() => dispatch("submit"))
			.catch(error => dispatch("report-error", error))
			.finally(() => toShow = false);
	};

	const removeProduct = () => {
		axios.delete(`${orderApiRoot}/${orderId}`)
			.then(() => dispatch("submit"))
			.catch(error => dispatch("report-error", error))
			.finally(() => toShow = false);
	};

	$: {
		if (toShow === true) {
			fetchOrder();
			fetchProducts();
		}
	}

	onDestroy(clearData);
</script>

{#if toShowSpinner}
	<Spinner />
{/if}

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
