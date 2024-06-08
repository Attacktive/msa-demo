<script lang="ts">
	import type { Product } from "$types/product";
	import type { InboundOrder, NewOrder } from "$types/order";
	import axios, { AxiosError } from "axios";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toast } from "flowbite-svelte";
	import { BellRingSolid } from "flowbite-svelte-icons";
	import OrderProductModal from "$components/orders/OrderProductModal.svelte";
	import EditOrderModal from "$components/orders/EditOrderModal.svelte";

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
	};

	const productApiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const orderApiRoot = import.meta.env.VITE_ORDER_API_ROOT;

	let orders: InboundOrder[] = [];
	let currentOrderId: number | undefined;

	const fetchOrders = async () => {
		try {
			const { data } = await axios.get<InboundOrder[]>(orderApiRoot);

			orders = data;
		} catch (error) {
			if (error instanceof AxiosError && error.response?.data.message) {
				showToast(error.response.data.message, true);
			} else if (error instanceof Error) {
				showToast(error.message, true);
			} else {
				console.error(error);
			}
		}
	};

	let toShowOrderProductModal = false;
	const showOrderProductModal = () => toShowOrderProductModal = true;

	let toShowEditOrderModal = false;
	const showEditOrderModal = (orderId: number) => {
		currentOrderId = orderId;
		toShowEditOrderModal = true;
	};

	const generateRandomInteger = (minimum: number, maximum: number) => {
		return Math.floor(Math.random() * (maximum - minimum) + minimum);
	};

	const addTestOrders = async () => {
		try {
			const { data } = await axios.get<Product[]>(productApiRoot);
			if (data.length) {
				const orders: NewOrder[] = [
					{
						productId: data[0].id,
						quantity: data[0].stock / 2
					}
				];

				if (data.length > 1) {
					const randomIndex = generateRandomInteger(1, data.length);

					orders.push({
						productId: data[randomIndex].id,
						quantity: data[randomIndex].stock / 3
					});
				}

				const requests = orders.map(order => axios.post(orderApiRoot, order));
				axios.all(requests).then(fetchOrders);
			} else {
				showToast("No product is available now. 😞");
			}
		} catch (error) {
			if (error instanceof AxiosError && error.response?.data.message) {
				showToast(error.response.data.message, true);
			} else if (error instanceof Error) {
				showToast(error.message, true);
			} else {
				console.error(error);
			}
		}
	};

	const removeOrder = (orderId: number) => {
		if (confirm(`Are you sure you want to delete the order #${orderId}?`)) {
			axios.delete(`${orderApiRoot}/${orderId}`)
				.then(fetchOrders)
				.catch(error => showToast(error.response.data.message, true));
		}
	};

	fetchOrders();
</script>

<div>
	<Breadcrumb solid class="my-5">
		<BreadcrumbItem href="/" home>Home</BreadcrumbItem>
		<BreadcrumbItem>Orders</BreadcrumbItem>
	</Breadcrumb>

	<div class="my-2">
		{#if orders.length > 0}
			<Table>
				<TableHead>
					<TableHeadCell>ID</TableHeadCell>
					<TableHeadCell>Product ID</TableHeadCell>
					<TableHeadCell>Product Name</TableHeadCell>
					<TableHeadCell>Product Quantity</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only">Edit</span>
					</TableHeadCell>
					<TableHeadCell>
						<span class="sr-only">Remove</span>
					</TableHeadCell>
				</TableHead>
				{#each orders as order (order.id)}
					<TableBodyRow>
						<TableBodyCell>{order.id}</TableBodyCell>
						<TableBodyCell>{order.product.id}</TableBodyCell>
						<TableBodyCell>{order.product.name}</TableBodyCell>
						<TableBodyCell>{order.quantity}</TableBodyCell>
						<TableBodyCell>
							<Button on:click={() => showEditOrderModal(order.id)}>Edit</Button>
						</TableBodyCell>
						<TableBodyCell>
							<Button on:click={() => removeOrder(order.id)}>Remove</Button>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</Table>
		{/if}
	</div>

	<Button class="mx-3" on:click={showOrderProductModal}>Order product</Button>
	<Button class="mx-3" on:click={addTestOrders}>Add test orders</Button>
</div>

<OrderProductModal bind:toShow={toShowOrderProductModal} on:submit={fetchOrders} on:report-error={reportError}/>
<EditOrderModal bind:toShow={toShowEditOrderModal} orderId={currentOrderId} on:submit={fetchOrders} on:report-error={reportError}/>
<Toast class="my-5" bind:open={toShowToast}>
	{#if toShowToastIcon}
		<BellRingSolid slot="icon" class="w-12 h-12"/>
	{/if}
	{toastContent}
</Toast>
