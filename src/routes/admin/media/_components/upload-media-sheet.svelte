<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import { toast } from 'svelte-sonner';
	import { getProperties } from '../../properties/properties.remote';
	import { uploadMedia } from '../media.remote';

	interface UploadMediaSheetProps {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onSuccess: () => void;
	}

	let { open = $bindable(), onOpenChange, onSuccess }: UploadMediaSheetProps = $props();

	let uploadType = $state<'image' | 'document' | 'video' | 'other'>('image');
	let propertyId = $state<string | undefined>(undefined);

	let propertiesPromise = $derived(
		open ? getProperties({ pageSize: 100 }) : Promise.resolve({ properties: [] })
	);
</script>

<Sheet.Root {open} {onOpenChange}>
	<Sheet.Content class="sm:max-w-[400px] p-4">
		<Sheet.Header>
			<Sheet.Title>Upload Media</Sheet.Title>
			<Sheet.Description>Upload a file to the configured storage provider.</Sheet.Description>
		</Sheet.Header>
		<form
			enctype="multipart/form-data"
			class="grid gap-4 py-4"
			{...uploadMedia.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Media uploaded successfully');
					onOpenChange(false);
					onSuccess();
				} catch (e: any) {
					toast.error(e.message || 'Failed to upload media');
				}
			})}
		>
			<div class="grid gap-2">
				<Label for="file">File</Label>
				<Input id="file" name="file" type="file" required />
			</div>

			<div class="grid gap-2">
				<Label>Media Type</Label>
				<Select.Root type="single" bind:value={uploadType}>
					<Select.Trigger class="w-full capitalize">
						{uploadType || 'Select type'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="image">Image</Select.Item>
						<Select.Item value="video">Video</Select.Item>
						<Select.Item value="document">Document</Select.Item>
						<Select.Item value="other">Other</Select.Item>
					</Select.Content>
				</Select.Root>
				<input type="hidden" name="type" value={uploadType} />
			</div>

			<div class="grid gap-2">
				<Label>Link to Property (Optional)</Label>
				{#await propertiesPromise}
					<div class="h-10 w-full animate-pulse bg-muted rounded"></div>
				{:then { properties }}
					<Select.Root type="single" bind:value={propertyId}>
						<Select.Trigger class="w-full">
							{properties.find((p) => p.id === propertyId)?.name || 'Select Property'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="">None</Select.Item>
							{#each properties as prop}
								<Select.Item value={prop.id}>{prop.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/await}
				<input type="hidden" name="propertyId" value={propertyId || ''} />
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={Boolean(uploadMedia.pending)}>
					{uploadMedia.pending ? 'Uploading...' : 'Start Upload'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
