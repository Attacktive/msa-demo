<script lang="ts">
	import type { Product } from "$types/product";
	import axios from "axios";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
	import AddProductModal from "$components/products/AddProductModal.svelte";
	import EditProductModal from "$components/products/EditProductModal.svelte";

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

	const removeProduct = (productId: number) => {
		axios.delete(`${apiRoot}/${productId}`)
			.then(fetchProducts);
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

	<Button on:click={showAddProductModal}>Add product</Button>
</div>

<AddProductModal bind:toShow={toShowAddProductModal} on:submit={fetchProducts}/>
<EditProductModal bind:toShow={toShowEditProductModal} productId={currentProductId} on:submit={fetchProducts}/>
