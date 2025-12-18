<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { FileText, ImageIcon, Video } from 'lucide-svelte';

	interface MediaDetailsSheetProps {
		open: boolean;
		media: any;
		onOpenChange: (open: boolean) => void;
		onReplace: (id: string) => void;
		onDelete: (id: string) => void;
	}

	let {
		open = $bindable(),
		media,
		onOpenChange,
		onReplace,
		onDelete
	}: MediaDetailsSheetProps = $props();
</script>

<Sheet.Root {open} {onOpenChange}>
	<Sheet.Content class="sm:max-w-[500px] p-4">
		<Sheet.Header>
			<Sheet.Title>Media Details</Sheet.Title>
			<Sheet.Description>View and manage this media file.</Sheet.Description>
		</Sheet.Header>

		{#if media}
			<div class="space-y-6 py-4">
				<!-- Preview -->
				<div class="flex items-center justify-center bg-muted rounded-lg overflow-hidden">
					{#if media.type === 'image'}
						<img src={media.url} alt="" class="max-h-[300px] w-full object-contain" />
					{:else if media.type === 'video'}
						<video src={media.url} controls class="w-full rounded-lg">
							<track kind="captions" />
						</video>
					{:else}
						<div class="p-12 flex flex-col items-center gap-4">
							{#if media.type === 'document'}
								<FileText class="h-16 w-16 text-muted-foreground" />
							{:else}
								<ImageIcon class="h-16 w-16 text-muted-foreground" />
							{/if}
							<span class="text-sm font-medium">{media.url.split('/').pop()}</span>
						</div>
					{/if}
				</div>

				<!-- Details Grid -->
				<div class="grid gap-4">
					<div class="grid gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase">File Name</span>
						<span class="text-sm">{media.url.split('/').pop()}</span>
					</div>

					<div class="grid gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase">Type</span>
						<span class="text-sm capitalize">{media.type}</span>
					</div>

					<div class="grid gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase">Linked To</span>
						<span class="text-sm">
							{#if media.property}
								Property: {media.property.name}
							{:else if media.room}
								Room: {media.room.number}
							{:else}
								<span class="text-muted-foreground italic">Not linked</span>
							{/if}
						</span>
					</div>

					<div class="grid gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase">URL</span>
						<a
							href={media.url}
							target="_blank"
							rel="noreferrer"
							class="text-sm text-blue-500 hover:underline break-all"
						>
							{media.url}
						</a>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-2 pt-4 border-t">
					<Button
						variant="outline"
						class="flex-1"
						onclick={() => {
							onReplace(media.id);
							onOpenChange(false);
						}}
					>
						Replace File
					</Button>
					<Button
						variant="destructive"
						class="flex-1"
						onclick={() => {
							if (confirm('Are you sure you want to delete this media?')) {
								onDelete(media.id);
								onOpenChange(false);
							}
						}}
					>
						Delete
					</Button>
				</div>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
