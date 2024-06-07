<script lang="ts">
	import type { NewProduct, Product } from "$types/product";
	import axios, { AxiosError } from "axios";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toast } from "flowbite-svelte";
	import { BellRingSolid } from "flowbite-svelte-icons";
	import AddProductModal from "$components/products/AddProductModal.svelte";
	import EditProductModal from "$components/products/EditProductModal.svelte";

	let toShowToast = false;
	let toShowToastIcon = false;
	let toastContent = "";
	const showToast = (content: string, toShowIcon = false, durationInSeconds = 5) => {
		toShowToastIcon = toShowIcon;
		toastContent = content;
		toShowToast = true;
		if (durationInSeconds > 0) {
			setTimeout(() => toShowToast = false, durationInSeconds * 1000);
		}
	};

	const reportError = (event: CustomEvent<Error>) => {
		if (event.detail instanceof AxiosError && event.detail.response?.data?.message) {
			showToast(event.detail.response.data.message, true);
		} else {
			showToast(event.detail.message, true);
		}
	}

	const apiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;

	let products: Product[] = [];
	let currentProductId: number | undefined;

	const fetchProducts = async () => {
		const { data } = await axios.get<Product[]>(apiRoot);

		products = data;
	};

	let toShowAddProductModal = false;
	const showAddProductModal = () => toShowAddProductModal = true;

	let toShowEditProductModal = false;
	const showEditProductModal = (productId: number) => {
		currentProductId = productId;
		toShowEditProductModal = true;
	};

	const addTestProducts = () => {
		const products: NewProduct[] = [
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
		];

		const requests = products.map(product => axios.post(apiRoot, product))
		axios.all(requests).then(fetchProducts);
	};

	const removeProduct = (productId: number) => {
		if (confirm(`Are you sure you want to delete the product #${productId}?`)) {
			axios.delete(`${apiRoot}/${productId}`)
				.then(fetchProducts);
		}
	};

	fetchProducts();
</script>

<div>
	<Breadcrumb solid class="my-5">
		<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
		<BreadcrumbItem>Products</BreadcrumbItem>
	</Breadcrumb>

	<div class="my-2">
		{#if products.length > 0}
			<Table>
				<TableHead>
					<TableHeadCell>ID</TableHeadCell>
					<TableHeadCell>Name</TableHeadCell>
					<TableHeadCell>Price</TableHeadCell>
					<TableHeadCell>Stock</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only">Edit</span>
					</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only">Remove</span>
					</TableHeadCell>
				</TableHead>
				{#each products as product (product.id)}
					<TableBodyRow>
						<TableBodyCell>{product.id}</TableBodyCell>
						<TableBodyCell>{product.name}</TableBodyCell>
						<TableBodyCell>{product.price}</TableBodyCell>
						<TableBodyCell>{product.stock}</TableBodyCell>
						<TableBodyCell>
							<Button on:click={() => showEditProductModal(product.id)}>Edit</Button>
						</TableBodyCell>
						<TableBodyCell>
							<Button on:click={() => removeProduct(product.id)}>Remove</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</Table>
		{/if}
	</div>

	<Button class="mx-3" on:click={showAddProductModal}>Add product</Button>
	<Button class="mx-3" on:click={addTestProducts}>Add test products</Button>
</div>

<AddProductModal bind:toShow={toShowAddProductModal} on:submit={fetchProducts} on:report-error={reportError}/>
<EditProductModal bind:toShow={toShowEditProductModal} productId={currentProductId} on:submit={fetchProducts} on:report-error={reportError}/>
<Toast class="my-5 w-96" bind:open={toShowToast}>
	{#if toShowToastIcon}
		<BellRingSolid slot="icon" class="w-12 h-12"/>
	{/if}
	{toastContent}
</Toast>
