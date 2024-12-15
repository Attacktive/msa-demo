<script lang="ts">
	import type { Product } from "$types/product";
	import axios from "axios";
	import { useErrorHelper } from "$utils/error";
	import { useFormatter } from "$utils/format";
	import { useDummyData } from "$utils/dummy";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toast } from "flowbite-svelte";
	import { BellRingSolid } from "flowbite-svelte-icons";
	import AddProductModal from "$components/products/AddProductModal.svelte";
	import EditProductModal from "$components/products/EditProductModal.svelte";

	const { getErrorMessage } = useErrorHelper();
	const { formatCount, formatCurrency } = useFormatter();
	const { generateDummyProducts } = useDummyData();

	let toShowToast = $state(false);
	let toShowToastIcon = $state(false);
	let toastContent = $state("");
	const showToast = (content: string, toShowIcon = false, durationInSeconds = 5) => {
		toShowToastIcon = toShowIcon;
		toastContent = content;
		toShowToast = true;
		if (durationInSeconds > 0) {
			setTimeout(() => toShowToast = false, durationInSeconds * 1000);
		}
	};

	const reportError = (event: CustomEvent<Error>) => {
		showToast(getErrorMessage(event.detail), true);
	};

	const apiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;

	let products = $state<Product[]>([]);
	let currentProductId = $state<number>();

	const fetchProducts = async () => {
		try {
			const { data } = await axios.get<Product[]>(apiRoot);

			products = data;
		} catch (error) {
			showToast(getErrorMessage(error), true);
		}
	};

	let toShowAddProductModal = $state(false);
	const showAddProductModal = () => toShowAddProductModal = true;

	let toShowEditProductModal = $state(false);
	const showEditProductModal = (productId: number) => {
		currentProductId = productId;
		toShowEditProductModal = true;
	};

	const addTestProducts = () => {
		const dummyProducts = generateDummyProducts();

		const requests = dummyProducts.map(product => axios.post(apiRoot, product));
		axios.all(requests)
			.then(fetchProducts)
			.catch(error => showToast(error.response.data.message, true));
	};

	const removeProduct = (productId: number) => {
		if (confirm(`Are you sure you want to delete the product #${productId}?`)) {
			axios.delete(`${apiRoot}/${productId}`)
				.then(fetchProducts)
				.catch(error => showToast(error.response.data.message, true));
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
						<TableBodyCell>{formatCurrency(product.price)}</TableBodyCell>
						<TableBodyCell>{formatCount(product.stock)}</TableBodyCell>
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

<AddProductModal bind:toShow={toShowAddProductModal} submit={fetchProducts} reportError={reportError}/>
<EditProductModal bind:toShow={toShowEditProductModal} productId={currentProductId} submit={fetchProducts} reportError={reportError}/>
{#if toShowToast}
	<Toast class="my-5 w-96">
		<svelte:fragment slot="icon">
			{#if toShowToastIcon}
				<BellRingSolid class="w-12 h-12"/>
			{/if}
		</svelte:fragment>
		{toastContent}
	</Toast>
{/if}
