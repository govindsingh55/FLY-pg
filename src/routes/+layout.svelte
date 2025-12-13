<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { test } from '$lib/remote/index.remote';

	let { children } = $props();
	const data = await test();
	$inspect(data);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
