<script lang="ts">
	import type { SelectOptionType } from "flowbite-svelte";
	import { Button, Checkbox, Label, Modal, NumberInput, Select, Tooltip } from "flowbite-svelte";
	import type { Product } from "$types/product";
	import type { NewOrder } from "$types/order";
	import axios from "axios";

	interface Props {
		toShow?: boolean;
		submit: () => Promise<void>;
		reportError: (event: CustomEvent<Error>) => void;
	}

	let { toShow = $bindable(false), submit, reportError }: Props = $props();

	let toEnableDoubleOrdering = $state(false);

	let newOrder: NewOrder = $state({
		productId: 0,
		quantity: 0
	});

	const clearData = () => {
		newOrder = {
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
	const orderProduct = () => {
		const requests = [axios.post(orderApiRoot, newOrder)];
		if (toEnableDoubleOrdering) {
			requests.push(axios.post(orderApiRoot, newOrder));
		}

		axios.all(requests)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	$effect(() => {
		if (toShow === false) {
			clearData();
		}
	});

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
	<div class="flex flex-row-reverse py-3">
		<Button class="mx-3" on:click={orderProduct}>Add</Button>
		<div class="mx-3">
			<Checkbox bind:checked={toEnableDoubleOrdering}>Double Ordering (debugging ☠)</Checkbox>
			<Tooltip>Ordering request is going to be sent TWICE.</Tooltip>
		</div>
	</div>
</Modal>
