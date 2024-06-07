<script lang="ts">
	import type { InboundOrder } from "$types/order";
	import axios from "axios";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
	import OrderProductModal from "$components/orders/OrderProductModal.svelte";
	import EditOrderModal from "$components/orders/EditOrderModal.svelte";

	const apiRoot = import.meta.env.VITE_ORDER_API_ROOT;

	let orders: InboundOrder[] = [];
	let currentOrderId: number | undefined;

	const fetchOrders = async () => {
		const { data } = await axios.get<InboundOrder[]>(apiRoot);

		orders = data;
	};

	let toShowOrderProductModal = false;
	const showOrderProductModal = () => toShowOrderProductModal = true;

	let toShowEditOrderModal = false;
	const showEditOrderModal = (orderId: number) => {
		currentOrderId = orderId;
		toShowEditOrderModal = true;
	}

	const removeOrder = (orderId: number) => {
		axios.delete(`${apiRoot}/${orderId}`)
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

	<Button on:click={showOrderProductModal}>Order product</Button>
</div>

<OrderProductModal bind:toShow={toShowOrderProductModal} on:submit={fetchOrders}/>
<EditOrderModal bind:toShow={toShowEditOrderModal} orderId={currentOrderId} on:submit={fetchOrders}/>
