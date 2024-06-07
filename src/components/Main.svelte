<script>
	import { Breadcrumb, BreadcrumbItem, Button } from "flowbite-svelte";
</script>

<main>
	<Breadcrumb solid class="my-5">
		<BreadcrumbItem home>Home</BreadcrumbItem>
	</Breadcrumb>

	<Button href="products">Products</Button>
	<Button href="orders">Order</Button>
</main>
