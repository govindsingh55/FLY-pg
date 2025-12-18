<script lang="ts">
	import Header from './_components/layout/header.svelte';
	import Footer from './_components/layout/footer.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col font-sans">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
