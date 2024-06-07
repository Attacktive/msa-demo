<script lang="ts">
	import type { Product } from "$types/product";
	import { createEventDispatcher, onDestroy } from "svelte";
	import { Button, Input, Label, Modal, NumberInput, Spinner } from "flowbite-svelte";
	import axios from "axios";

	export let toShow = false;
	export let productId: number | undefined;

	const dispatch = createEventDispatcher();

	let product: Product = {
		id: 0,
		name: "",
		description: "",
		price: 0,
		stock: 0
	};

	const clearData = () => {
		product = {
			id: 0,
			name: "",
			description: "",
			price: 0,
			stock: 0
		};
	};

	const apiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;

	let toShowSpinner = false;
	const fetchProduct = async () => {
		toShowSpinner = true;
		const { data } = await axios.get<Product>(`${apiRoot}/${productId}`);

		product = data;
		toShowSpinner = false;
	};

	const editProduct = () => {
		axios.put(`${apiRoot}/${productId}`, product)
			.then(() => dispatch("submit"))
			.catch(error => dispatch("report-error", error))
			.finally(() => toShow = false);
	};

	const removeProduct = () => {
		axios.delete(`${apiRoot}/${product.id}`)
			.then(() => dispatch("submit"))
			.catch(error => dispatch("report-error", error))
			.finally(() => toShow = false);
	};

	$: {
		if (toShow === true) {
			fetchProduct();
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
		<Input id="id" readonly value={product.id}/>
	</div>
	<div>
		<Label for="name">Name</Label>
		<Input id="name" placeholder="Name" required bind:value={product.name}/>
	</div>
	<div>
		<Label for="description">Description</Label>
		<Input id="description" placeholder="Description" bind:value={product.description}/>
	</div>
	<div>
		<Label for="price">Price</Label>
		<NumberInput id="price" placeholder="Price in KRW" required bind:value={product.price}/>
	</div>
	<div>
		<Label for="quantity">Quantity</Label>
		<NumberInput id="quantity" placeholder="Quantity" required bind:value={product.stock}/>
	</div>
	<div class="flex flex-row-reverse">
		<Button class="mt-3 mx-3" on:click={editProduct}>Edit</Button>
		<Button color="alternative" class="mt-3" on:click={removeProduct}>Remove</Button>
	</div>
</Modal>
