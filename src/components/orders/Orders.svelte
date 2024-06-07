<script lang="ts">
	import type { Product } from "$types/product";
	import type { InboundOrder, NewOrder } from "$types/order";
	import axios from "axios";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toast } from "flowbite-svelte";
	import OrderProductModal from "$components/orders/OrderProductModal.svelte";
	import EditOrderModal from "$components/orders/EditOrderModal.svelte";

	let toShowToast = false;
	let toastContent = "";
	const showToast = (content: string, durationInSeconds: number = 5) => {
		toastContent = content;
		toShowToast = true;
		if (durationInSeconds > 0) {
			setTimeout(() => toShowToast = false, durationInSeconds * 1000);
		}
	};

	const notify = (event) => showToast(event.detail);

	const productApiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const orderApiRoot = import.meta.env.VITE_ORDER_API_ROOT;

	let orders: InboundOrder[] = [];
	let currentOrderId: number | undefined;

	const fetchOrders = async () => {
		const { data } = await axios.get<InboundOrder[]>(orderApiRoot);

		orders = data;
	};

	let toShowOrderProductModal = false;
	const showOrderProductModal = () => toShowOrderProductModal = true;

	let toShowEditOrderModal = false;
	const showEditOrderModal = (orderId: number) => {
		currentOrderId = orderId;
		toShowEditOrderModal = true;
	}

	const addTestOrders = async () => {
		const { data } = await axios.get<Product[]>(productApiRoot);
		if (data.length) {
			const orders: NewOrder[] = [
				{
					productId: data[0].id,
					quantity: data[0].stock / 2
				}
			];

			if (data.length > 1) {
				orders.push({
					productId: data[1].id,
					quantity: data[1].stock / 3
				});
			}

			const requests = orders.map(order => axios.post(orderApiRoot, order));
			axios.all(requests).then(fetchOrders);
		} else {
			showToast("No product is available now. 😞");
		}
	};

	const removeOrder = (orderId: number) => {
		axios.delete(`${orderApiRoot}/${orderId}`)
			.then(fetchOrders);
	}

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

<OrderProductModal bind:toShow={toShowOrderProductModal} on:submit={fetchOrders} on:notify/>
<EditOrderModal bind:toShow={toShowEditOrderModal} orderId={currentOrderId} on:submit={fetchOrders} on:notify/>
<Toast bind:open={toShowToast}>
	{toastContent}
</Toast>
