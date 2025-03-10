<script lang="ts">
	import type { Product } from "$types/product";
	import type { InboundOrder, Order } from "$types/order";
	import type { SelectOptionType } from "flowbite-svelte";
	import { Button, Label, Modal, NumberInput, Select } from "flowbite-svelte";
	import axios from "axios";

	interface Props {
		toShow?: boolean;
		orderId: number | undefined;
		submit: () => Promise<void>;
		reportError: (event: CustomEvent<Error>) => void;
	}

	let { toShow = $bindable(false), orderId, submit, reportError }: Props = $props();

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

	const fetchOrder = () => {
		axios.get<InboundOrder>(`${orderApiRoot}/${orderId}`)
			.then(({ data }) => {
				order = {
					id: data.id,
					productId: data.product.id,
					quantity: data.quantity
				};
			})
			.catch(reportError);
	};

	const editOrder = () => {
		axios.put(`${orderApiRoot}/${orderId}`, order)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	const removeProduct = () => {
		axios.delete(`${orderApiRoot}/${orderId}`)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	$effect(() => {
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
