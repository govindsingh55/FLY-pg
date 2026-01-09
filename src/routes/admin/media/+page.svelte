<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Upload } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getMedias, deleteMedia } from './media.remote';
	import MediaCard from './_components/media-card.svelte';
	import MediaDetailsSheet from './_components/media-details-sheet.svelte';
	import UploadMediaSheet from './_components/upload-media-sheet.svelte';
	import ReplaceMediaSheet from './_components/replace-media-sheet.svelte';

	let uploadSheetOpen = $state(false);
	let replaceSheetOpen = $state(false);
	let detailsSheetOpen = $state(false);
	let selectedMedia = $state<any>(null);
	let replaceId = $state<string | null>(null);

	let dataPromise = $derived(getMedias({}));

	function handlePreview(item: any) {
		selectedMedia = item;
		detailsSheetOpen = true;
	}

	function handleReplace(id: string) {
		replaceId = id;
		replaceSheetOpen = true;
	}

	async function handleDelete(id: string) {
		try {
			await deleteMedia.for(`deleteMedia-${id}`);
			toast.success('Media deleted successfully');
			dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to delete media');
		}
	}

	function refreshData() {
		dataPromise.refresh();
	}
</script>

<div class="p-6 space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Media Management</h1>
			<p class="text-muted-foreground">Manage property and room media assets.</p>
		</div>
		<Button onclick={() => (uploadSheetOpen = true)}>
			<Upload class="mr-2 h-4 w-4" />
			Upload Media
		</Button>
	</div>

	<!-- Media Grid -->
	<div class="border rounded-lg bg-card p-6">
		{#await dataPromise}
			<div
				class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
			>
				{#each Array(10) as _}
					<div class="h-[280px] bg-muted animate-pulse rounded-lg"></div>
				{/each}
			</div>
		{:then { media }}
			{#if media.length > 0}
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
				>
					{#each media as item}
						<MediaCard
							{item}
							onPreview={handlePreview}
							onReplace={handleReplace}
							onRefresh={refreshData}
						/>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-muted-foreground text-lg">No media found.</p>
					<p class="text-sm text-muted-foreground mt-2">
						Upload your first media file to get started.
					</p>
					<Button class="mt-4" onclick={() => (uploadSheetOpen = true)}>
						<Upload class="mr-2 h-4 w-4" />
						Upload Media
					</Button>
				</div>
			{/if}
		{:catch e}
			<div class="p-8 text-center text-destructive">{e.message || 'Failed to load media'}</div>
		{/await}
	</div>
</div>

<!-- Sheets -->
<UploadMediaSheet
	bind:open={uploadSheetOpen}
	onOpenChange={(open) => (uploadSheetOpen = open)}
	onSuccess={refreshData}
/>

<ReplaceMediaSheet
	bind:open={replaceSheetOpen}
	mediaId={replaceId}
	onOpenChange={(open) => (replaceSheetOpen = open)}
	onSuccess={refreshData}
/>

<MediaDetailsSheet
	bind:open={detailsSheetOpen}
	media={selectedMedia}
	onOpenChange={(open) => (detailsSheetOpen = open)}
	onReplace={handleReplace}
	onDelete={handleDelete}
/>
