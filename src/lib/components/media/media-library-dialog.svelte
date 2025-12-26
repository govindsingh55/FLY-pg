<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Search, Upload, FileText, Video, ImageIcon } from 'lucide-svelte';
	import { getMedias } from '../../../routes/admin/media/media.remote';
	import UploadMediaSheet from '../../../routes/admin/media/_components/upload-media-sheet.svelte';
	import { getMediaType } from '$lib/utils';

	interface MediaLibraryDialogProps {
		open: boolean;
		mode: 'single' | 'multiple';
		propertyId?: string;
		roomId?: string;
		currentSelection: string[];
		onConfirm: (urls: string[]) => void;
	}

	let {
		open = $bindable(),
		mode,
		propertyId,
		roomId,
		currentSelection,
		onConfirm
	}: MediaLibraryDialogProps = $props();

	let searchTerm = $state('');
	let selectedUrls = $state<string[]>([]);
	let uploadSheetOpen = $state(false);
	let refreshTrigger = $state(0);

	// Fetch media with optional filters
	let mediaPromise = $derived.by(() => {
		if (!open) return Promise.resolve({ media: [] });
		// Access refreshTrigger to ensure dependency tracking
		refreshTrigger;
		return getMedias({ propertyId, roomId });
	});

	// Filter media by search term
	let filteredMedia = $derived.by(() => {
		return mediaPromise.then(({ media }) => {
			if (!searchTerm) return media;
			const term = searchTerm.toLowerCase();
			return media.filter(
				(m: any) =>
					(m.url?.toLowerCase() || '').includes(term) ||
					(m.type?.toLowerCase() || '').includes(term) ||
					(m.property?.name?.toLowerCase() || '').includes(term) ||
					(m.room?.number?.toLowerCase() || '').includes(term)
			);
		});
	});

	// Reset selection when dialog opens
	$effect(() => {
		if (open) {
			selectedUrls = [...currentSelection];
		}
	});

	function toggleSelection(url: string) {
		if (mode === 'single') {
			selectedUrls = [url];
		} else {
			if (selectedUrls.includes(url)) {
				selectedUrls = selectedUrls.filter((u) => u !== url);
			} else {
				selectedUrls = [...selectedUrls, url];
			}
		}
	}

	function handleConfirm() {
		onConfirm(selectedUrls);
		open = false;
	}

	function handleUploadSuccess() {
		// Trigger refresh by updating the trigger
		refreshTrigger++;
	}

	function getMediaIcon(type: string | null) {
		switch (type) {
			case 'video':
				return Video;
			case 'document':
				return FileText;
			default:
				return ImageIcon;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
		<Dialog.Header>
			<Dialog.Title>Select Media</Dialog.Title>
			<Dialog.Description>
				Choose {mode === 'single' ? 'a media file' : 'media files'} from your library or upload new ones.
			</Dialog.Description>
		</Dialog.Header>

		<!-- Search and Upload -->
		<div class="flex gap-2 py-4">
			<div class="relative flex-1">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input type="text" placeholder="Search media..." class="pl-9" bind:value={searchTerm} />
			</div>
			<Button type="button" variant="outline" onclick={() => (uploadSheetOpen = true)}>
				<Upload class="mr-2 h-4 w-4" />
				Upload
			</Button>
		</div>

		<!-- Media Grid -->
		<div class="flex-1 overflow-y-auto border rounded-lg p-4">
			{#await filteredMedia}
				<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{#each Array(8) as _}
						<div class="aspect-square bg-muted animate-pulse rounded-lg"></div>
					{/each}
				</div>
			{:then media}
				{#if media.length > 0}
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
						{#each media as item}
							{@const isSelected = selectedUrls.includes(item.url)}
							<button
								type="button"
								class="relative group aspect-square rounded-lg overflow-hidden border-2 transition-all {isSelected
									? 'border-primary ring-2 ring-primary/20'
									: 'border-transparent hover:border-muted-foreground/20'}"
								onclick={() => toggleSelection(item.url)}
							>
								<!-- Media Preview -->
								<div class="w-full h-full bg-muted flex items-center justify-center">
									{#if getMediaType(item.url) === 'video'}
										<!-- svelte-ignore a11y_media_has_caption -->
										<video
											src={item.url}
											class="w-full h-full object-cover"
											muted
											loop
											playsinline
											autoplay
										></video>
									{:else if item.type === 'image'}
										<img src={item.url} alt="" class="w-full h-full object-cover" />
									{:else}
										{@const Icon = getMediaIcon(item.type)}
										<Icon class="h-12 w-12 text-muted-foreground" />
									{/if}
								</div>

								<!-- Checkbox Overlay -->
								<div
									class="absolute top-2 right-2 bg-background/80 rounded p-1 {isSelected
										? 'opacity-100'
										: 'opacity-0 group-hover:opacity-100'} transition-opacity"
								>
									<Checkbox checked={isSelected} />
								</div>

								<!-- Info Overlay -->
								<div
									class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity"
								>
									<p class="text-xs text-white truncate">{item.url.split('/').pop()}</p>
								</div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<ImageIcon class="h-12 w-12 text-muted-foreground mb-4" />
						<p class="text-muted-foreground">No media found.</p>
						<Button
							type="button"
							variant="outline"
							class="mt-4"
							onclick={() => (uploadSheetOpen = true)}
						>
							<Upload class="mr-2 h-4 w-4" />
							Upload Media
						</Button>
					</div>
				{/if}
			{:catch error}
				<div class="text-center text-destructive py-8">{error.message}</div>
			{/await}
		</div>

		<!-- Footer -->
		<Dialog.Footer class="flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				{selectedUrls.length} selected
			</p>
			<div class="flex gap-2">
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="button" onclick={handleConfirm} disabled={selectedUrls.length === 0}>
					Confirm Selection
				</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<UploadMediaSheet
	bind:open={uploadSheetOpen}
	onOpenChange={(isOpen) => (uploadSheetOpen = isOpen)}
	onSuccess={handleUploadSuccess}
/>
