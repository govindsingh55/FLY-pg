<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import {
		X,
		Plus,
		Image as ImageIcon,
		ChevronLeft,
		ChevronRight,
		Star,
		Trash2
	} from '@lucide/svelte';
	import MediaLibraryDialog from './media-library-dialog.svelte';
	import { getMediaType } from '$lib/utils';

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

	function moveMedia(index: number, direction: 'left' | 'right') {
		if (direction === 'left' && index > 0) {
			const newUrls = [...selectedUrls];
			[newUrls[index - 1], newUrls[index]] = [newUrls[index], newUrls[index - 1]];
			handleSelectionChange(newUrls);
		} else if (direction === 'right' && index < selectedUrls.length - 1) {
			const newUrls = [...selectedUrls];
			[newUrls[index + 1], newUrls[index]] = [newUrls[index], newUrls[index + 1]];
			handleSelectionChange(newUrls);
		}
	}

	function makeFeatured(index: number) {
		if (index === 0) return;
		const newUrls = [...selectedUrls];
		const item = newUrls.splice(index, 1)[0];
		newUrls.unshift(item);
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
		{#each selectedUrls as url, index}
			{@const isFeatured = index === 0}
			<div
				class="relative group aspect-square rounded-lg overflow-hidden border bg-muted {isFeatured
					? 'ring-2 ring-yellow-400 border-yellow-400'
					: ''}"
			>
				{#if getMediaType(url) === 'video'}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={url} class="w-full h-full object-cover" muted loop playsinline autoplay
					></video>
				{:else}
					<img src={url} alt="" class="w-full h-full object-cover" />
				{/if}

				<!-- Controls Overlay -->
				<div
					class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
				>
					<div class="flex justify-between">
						<button
							type="button"
							class="p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors {isFeatured
								? 'text-yellow-500'
								: 'text-muted-foreground hover:text-yellow-500'}"
							onclick={() => makeFeatured(index)}
							title="Make Featured"
						>
							<Star class="h-3.5 w-3.5 {isFeatured ? 'fill-yellow-500' : ''}" />
						</button>
						<button
							type="button"
							class="p-1.5 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground transition-colors"
							onclick={() => removeMedia(url)}
							title="Remove"
						>
							<Trash2 class="h-3.5 w-3.5" />
						</button>
					</div>

					<div class="flex justify-between">
						<button
							type="button"
							class="p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors disabled:opacity-50"
							onclick={() => moveMedia(index, 'left')}
							disabled={index === 0}
							title="Move Left"
						>
							<ChevronLeft class="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							class="p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors disabled:opacity-50"
							onclick={() => moveMedia(index, 'right')}
							disabled={index === selectedUrls.length - 1}
							title="Move Right"
						>
							<ChevronRight class="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
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
