<script lang="ts">
	import type { Snippet } from "svelte";
	import "$/app.css";

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<main class="m-5">
	{@render children?.()}
</main>
