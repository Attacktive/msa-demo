<script>
	import { Breadcrumb, BreadcrumbItem, Card } from "flowbite-svelte";
</script>

<main>
	<Breadcrumb solid class="my-5">
		<BreadcrumbItem home>Home</BreadcrumbItem>
	</Breadcrumb>

	<Card size="lg" class="my-4">
		<a href="products">Products</a>
	</Card>
	<Card size="lg" class="my-4">
		<a href="orders">Order</a>
	</Card>
</main>
