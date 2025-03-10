<script lang="ts">
	import type { Product } from "$types/product";
	import type { InboundOrder } from "$types/order";
	import axios from "axios";
	import { useErrorHelper } from "$utils/error";
	import { useFormatter } from "$utils/format";
	import { useDummyData } from "$utils/dummy";
	import { Breadcrumb, BreadcrumbItem, Button, Table, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Toast } from "flowbite-svelte";
	import { BellRingSolid } from "flowbite-svelte-icons";
	import OrderProductModal from "$components/orders/OrderProductModal.svelte";
	import EditOrderModal from "$components/orders/EditOrderModal.svelte";

	const { getErrorMessage } = useErrorHelper();
	const { formatCount, formatCurrency } = useFormatter();
	const { generateDummyOrders } = useDummyData();

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

	const productApiRoot = import.meta.env.VITE_PRODUCT_API_ROOT;
	const orderApiRoot = import.meta.env.VITE_ORDER_API_ROOT;

	let orders = $state<InboundOrder[]>([]);
	let currentOrderId = $state<number>();

	const fetchOrders = async () => {
		try {
			const { data } = await axios.get<InboundOrder[]>(orderApiRoot);

			orders = data;
		} catch (error) {
			showToast(getErrorMessage(error), true);
		}
	};

	let toShowOrderProductModal = $state(false);
	const showOrderProductModal = () => toShowOrderProductModal = true;

	let toShowEditOrderModal = $state(false);
	const showEditOrderModal = (orderId: number) => {
		currentOrderId = orderId;
		toShowEditOrderModal = true;
	};

	const addTestOrders = async () => {
		try {
			const { data } = await axios.get<Product[]>(productApiRoot);
			if (data.length) {
				const orders = generateDummyOrders(data);

				const requests = orders.map(order => axios.post(orderApiRoot, order));
				axios.all(requests).then(fetchOrders);
			} else {
				showToast("No product is available now. 😞", true);
			}
		} catch (error) {
			showToast(getErrorMessage(error), true);
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
					<TableHeadCell>Order ID</TableHeadCell>
					<TableHeadCell>Product ID</TableHeadCell>
					<TableHeadCell>Product Name</TableHeadCell>
					<TableHeadCell>Product Quantity</TableHeadCell>
					<TableHeadCell>Product Unit Price</TableHeadCell>
					<TableHeadCell>Total Price</TableHeadCell>
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
						<TableBodyCell>{formatCount(order.quantity)}</TableBodyCell>
						<TableBodyCell>{formatCurrency(order.product.price)}</TableBodyCell>
						<TableBodyCell>{formatCurrency(order.quantity * order.product.price)}</TableBodyCell>
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

<OrderProductModal bind:toShow={toShowOrderProductModal} submit={fetchOrders} reportError={reportError}/>
<EditOrderModal bind:toShow={toShowEditOrderModal} orderId={currentOrderId} submit={fetchOrders} reportError={reportError}/>
{#if toShowToast}
	<Toast class="my-5">
		<svelte:fragment slot="icon">
			{#if toShowToastIcon}
				<BellRingSolid class="w-12 h-12"/>
			{/if}
		</svelte:fragment>
		{toastContent}
	</Toast>
{/if}
