<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ExternalLink, FileText, ImageIcon, MoreHorizontal, Video } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { deleteMedia } from '../media.remote';

	interface MediaCardProps {
		item: any;
		onPreview: (item: any) => void;
		onReplace: (id: string) => void;
		onRefresh: () => void;
	}

	let { item, onPreview, onReplace, onRefresh }: MediaCardProps = $props();

	function getMediaIcon(type: string) {
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

<div
	class="group relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-all cursor-pointer"
	onclick={() => onPreview(item)}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onPreview(item);
		}
	}}
>
	<!-- Media Preview (150x150) -->
	<div class="w-full h-[150px] bg-muted flex items-center justify-center overflow-hidden">
		{#if item.type === 'image'}
			<img src={item.url} alt="" class="w-full h-full object-cover" />
		{:else if item.type === 'video'}
			<Video class="h-12 w-12 text-muted-foreground" />
		{:else if item.type === 'document'}
			<FileText class="h-12 w-12 text-muted-foreground" />
		{:else}
			<ImageIcon class="h-12 w-12 text-muted-foreground" />
		{/if}
	</div>

	<!-- Card Content -->
	<div class="p-4 space-y-3">
		<!-- File Name -->
		<div class="space-y-1">
			<h3 class="font-medium text-sm truncate" title={item.url.split('/').pop()}>
				{item.url.split('/').pop()}
			</h3>
			<div class="flex items-center gap-2">
				<span class="capitalize px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
					{item.type}
				</span>
			</div>
		</div>

		<!-- Linked To -->
		<div class="text-xs text-muted-foreground">
			{#if item.property}
				<span>Property: {item.property.name}</span>
			{:else if item.room}
				<span>Room: {item.room.number}</span>
			{:else}
				<span class="italic">Not linked</span>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class="flex-1"
				onclick={(e) => {
					e.stopPropagation();
					window.open(item.url, '_blank');
				}}
			>
				<ExternalLink class="h-3 w-3 mr-1" />
				View
			</Button>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Button variant="ghost" size="sm">
						<MoreHorizontal class="h-4 w-4" />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item
						onclick={(e) => {
							e.stopPropagation();
							onPreview(item);
						}}
					>
						Preview
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onclick={(e) => {
							e.stopPropagation();
							onReplace(item.id);
						}}
					>
						Replace File
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item class="text-destructive">
						<form
							{...deleteMedia.for(`deleteMedia-${item.id}`).enhance(async ({ submit }) => {
								try {
									await submit();
									toast.success('Media deleted successfully');
									onRefresh();
								} catch (e: any) {
									toast.error(e.message || 'Failed to delete media');
								}
							})}
						>
							<input type="hidden" name="id" value={item.id} />
							<Button
								type="submit"
								variant="ghost"
								size="sm"
								class="text-destructive w-full justify-start p-0"
							>
								Delete
							</Button>
						</form>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</div>
