<script lang="ts">
	import type { NewProduct } from "$types/product";
	import { Button, Input, Label, Modal, NumberInput } from "flowbite-svelte";
	import axios from "axios";

	interface Props {
		toShow?: boolean;
		submit: () => Promise<void>;
		reportError: (event: CustomEvent<Error>) => void;
	}

	let { toShow = $bindable(false), submit, reportError }: Props = $props();

	let newProduct: NewProduct = $state({
		name: "",
		description: "",
		price: 0,
		stock: 0
	});

	const clearData = () => {
		newProduct = {
			name: "",
			description: "",
			price: 0,
			stock: 0
		};
	};

	const apiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const addProduct = () => {
		axios.post(apiRoot, newProduct)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	$effect(() => {
		if (toShow === false) {
			clearData();
		}
	});
</script>

<Modal title="Add product" autoclose bind:open={toShow}>
	<div>
		<Label for="name">Name</Label>
		<Input id="name" placeholder="Name" required bind:value={newProduct.name}/>
	</div>
	<div>
		<Label for="description">Description</Label>
		<Input id="description" placeholder="Description" bind:value={newProduct.description}/>
	</div>
	<div>
		<Label for="price">Price</Label>
		<NumberInput id="price" placeholder="Price in KRW" required bind:value={newProduct.price}/>
	</div>
	<div>
		<Label for="quantity">Quantity</Label>
		<NumberInput id="quantity" placeholder="Quantity" required bind:value={newProduct.stock}/>
	</div>
	<div class="flex flex-row-reverse">
		<Button class="mt-3" on:click={addProduct}>Add</Button>
	</div>
</Modal>
