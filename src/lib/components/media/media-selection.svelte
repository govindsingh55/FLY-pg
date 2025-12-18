<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { X, Plus, Image as ImageIcon } from 'lucide-svelte';
	import MediaLibraryDialog from './media-library-dialog.svelte';

	interface MediaSelectionProps {
		value: string | string[];
		onValueChange: (urls: string | string[]) => void;
		mode?: 'single' | 'multiple';
		propertyId?: string;
		roomId?: string;
		maxSelection?: number;
		label?: string;
		name?: string;
		addButtonText?: string;
		buttonClass?: string;
		gridClass?: string;
	}

	let {
		value = $bindable([]),
		onValueChange,
		mode = 'multiple',
		propertyId,
		roomId,
		maxSelection,
		label = 'Media',
		name = 'images',
		addButtonText = 'Add Media',
		buttonClass = '',
		gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
	}: MediaSelectionProps = $props();

	let dialogOpen = $state(false);

	// Normalize value to array for internal handling
	let selectedUrls = $derived(Array.isArray(value) ? value : value ? [value as string] : []);

	function handleSelectionChange(urls: string[]) {
		if (mode === 'single') {
			onValueChange(urls[0] || '');
		} else {
			onValueChange(urls);
		}
	}

	function removeMedia(url: string) {
		const newUrls = selectedUrls.filter((u) => u !== url);
		handleSelectionChange(newUrls);
	}

	function openDialog() {
		dialogOpen = true;
	}
</script>

<div class="space-y-3">
	{#if label}
		<Label>{label}</Label>
	{/if}

	<!-- Hidden input for form submission -->
	{#if mode === 'multiple'}
		<input type="hidden" {name} value={selectedUrls.join(',')} />
	{:else}
		<input type="hidden" {name} value={selectedUrls[0] || ''} />
	{/if}

	<div class="grid {gridClass} gap-3">
		<!-- Selected Media Cards -->
		{#each selectedUrls as url}
			<div class="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
				<img src={url} alt="" class="w-full h-full object-cover" />
				<button
					type="button"
					class="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
					onclick={() => removeMedia(url)}
				>
					<X class="h-3 w-3" />
				</button>
			</div>
		{/each}

		<!-- Add Media Button as Card -->
		{#if mode === 'multiple' || selectedUrls.length === 0}
			{#if !maxSelection || selectedUrls.length < maxSelection}
				<button
					type="button"
					onclick={openDialog}
					class="aspect-square flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group/add {buttonClass}"
				>
					<div class="p-2 rounded-full bg-muted group-hover/add:bg-primary/10 transition-colors">
						<Plus class="h-6 w-6" />
					</div>
					<span class="text-xs font-medium">{addButtonText || 'Add Media'}</span>
				</button>
			{/if}
		{/if}
	</div>

	{#if mode === 'multiple' && selectedUrls.length > 0}
		<p class="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1">
			{selectedUrls.length}
			{selectedUrls.length === 1 ? 'item' : 'items'} selected
			{#if maxSelection}
				/ {maxSelection}{/if}
		</p>
	{/if}
</div>

<MediaLibraryDialog
	bind:open={dialogOpen}
	{mode}
	{propertyId}
	{roomId}
	currentSelection={selectedUrls}
	onConfirm={handleSelectionChange}
/>
