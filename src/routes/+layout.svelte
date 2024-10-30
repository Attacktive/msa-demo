<script lang="ts">
	import "$/app.css";
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<main class="m-5">
	{@render children?.()}
</main>
