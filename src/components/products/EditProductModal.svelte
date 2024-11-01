<script lang="ts">
	import type { Product } from "$types/product";
	import { Button, Input, Label, Modal, NumberInput } from "flowbite-svelte";
	import axios from "axios";

	interface Props {
		toShow?: boolean;
		productId: number | undefined;
		submit: Promise<() => void>;
		reportError: (event: CustomEvent<Error>) => void;
	}

	let { toShow = $bindable(false), productId, submit, reportError }: Props = $props();

	let product: Product = $state({
		id: 0,
		name: "",
		description: "",
		price: 0,
		stock: 0
	});

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

	const fetchProduct = async () => {
		try {
			const { data } = await axios.get<Product>(`${apiRoot}/${productId}`);

			product = data;
		} catch (error) {
			reportError(error);
		}
	};

	const editProduct = () => {
		axios.put(`${apiRoot}/${productId}`, product)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	const removeProduct = () => {
		axios.delete(`${apiRoot}/${product.id}`)
			.catch(reportError)
			.finally(submit)
			.finally(() => toShow = false);
	};

	$effect(() => {
		if (toShow === true) {
			fetchProduct();
		} else {
			clearData();
		}
	});
</script>

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
