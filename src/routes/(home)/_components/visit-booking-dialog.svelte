<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { requestVisit } from '../properties/bookings.remote';
	import { toast } from 'svelte-sonner';
	import { CalendarDays } from '@lucide/svelte';

	interface Props {
		propertyId: string;
		propertyName: string;
	}

	let { propertyId, propertyName }: Props = $props();

	let open = $state(false);

	// Get tomorrow's date as minimum
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const minDate = tomorrow.toISOString().split('T')[0];
</script>

<Dialog bind:open>
	<DialogTrigger>
		<Button variant="outline" class="w-full">
			<CalendarDays class="mr-2 h-4 w-4" />
			Schedule Visit
		</Button>
	</DialogTrigger>
	<DialogContent class="sm:max-w-[500px]">
		<DialogHeader>
			<DialogTitle>Schedule a Visit</DialogTitle>
			<DialogDescription>
				Book a time to visit {propertyName}. We'll confirm your visit shortly.
			</DialogDescription>
		</DialogHeader>

		<form
			{...requestVisit.enhance(async ({ submit, form }) => {
				try {
					await submit();
					toast.success('Visit request submitted successfully!');
					form.reset();
					open = false;
				} catch (error: any) {
					toast.error(error.message || 'Failed to submit visit request');
				}
			})}
		>
			<input type="hidden" name="propertyId" value={propertyId} />

			<div class="grid gap-6 py-4">
				<div class="grid gap-2">
					<Label for="visitDate">
						Visit Date <span class="text-destructive">*</span>
					</Label>
					<Input
						id="visitDate"
						name="visitDate"
						type="date"
						min={minDate}
						required
						class="w-full"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="visitTime">
						Preferred Time <span class="text-destructive">*</span>
					</Label>
					<Input
						id="visitTime"
						name="visitTime"
						type="time"
						required
						class="w-full"
						placeholder="HH:MM"
					/>
					<p class="text-xs text-muted-foreground">
						Choose your preferred visit time (we'll confirm availability)
					</p>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button {...requestVisit.buttonProps}>
					{requestVisit.pending ? 'Submitting...' : 'Submit Request'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
