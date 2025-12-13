<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center text-center">
	<h1 class="text-4xl font-bold">{$page.status}</h1>
	<p class="mt-4 text-lg text-muted-foreground">
		{$page.error?.message ?? 'Something went wrong'}
	</p>
	<a href="/" class="mt-6 text-primary hover:underline">Go back home</a>
</div>
