<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { replaceMedia } from '../media.remote';

	interface ReplaceMediaSheetProps {
		open: boolean;
		mediaId: string | null;
		onOpenChange: (open: boolean) => void;
		onSuccess: () => void;
	}

	let { open = $bindable(), mediaId, onOpenChange, onSuccess }: ReplaceMediaSheetProps = $props();
</script>

<Sheet.Root {open} {onOpenChange}>
	<Sheet.Content class="sm:max-w-[400px] p-4">
		<Sheet.Header>
			<Sheet.Title>Replace Media File</Sheet.Title>
			<Sheet.Description>Select a new file to replace the existing one.</Sheet.Description>
		</Sheet.Header>
		<form
			enctype="multipart/form-data"
			class="grid gap-4 py-4"
			{...replaceMedia.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Media replaced successfully');
					onOpenChange(false);
					onSuccess();
				} catch (e: any) {
					toast.error(e.message || 'Failed to replace media');
				}
			})}
		>
			<input type="hidden" name="id" value={mediaId} />
			<div class="grid gap-2">
				<Label for="replace-file">New File</Label>
				<Input id="replace-file" name="file" type="file" required />
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={Boolean(replaceMedia.pending)}>
					{replaceMedia.pending ? 'Replacing...' : 'Replace File'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
