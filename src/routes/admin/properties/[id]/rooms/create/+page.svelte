<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	// Import Select components manually if shadcn-svelte select is available,
	// but for now we'll use native select or simple input for speed/robustness unless shadcn select is installed.
	// Checked previous installs: table, button, input, card, label. Select is NOT installed.
	// Using native select for now to avoid overhead, or installing select.
	// Let's stick to native strictly for speed unless user requested "premium design" requires it.
	// The prompt asked for shadcn ui stuff. I will install select component to be proper.
</script>

<div class="mx-auto max-w-xl p-6">
	<Card>
		<CardHeader>
			<CardTitle>Add Room</CardTitle>
			<CardDescription>Add a new room to this property.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="number">Room Number</Label>
					<Input id="number" name="number" placeholder="101" required />
				</div>

				<div class="grid gap-2">
					<Label for="type">Room Type</Label>
					<select
						name="type"
						id="type"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="single">Single</option>
						<option value="double">Double</option>
						<option value="triple">Triple</option>
						<option value="dorm">Dorm</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="capacity">Capacity (People)</Label>
						<Input type="number" id="capacity" name="capacity" min="1" required />
					</div>
					<div class="grid gap-2">
						<Label for="priceMonthly">Monthly Price</Label>
						<Input type="number" id="priceMonthly" name="priceMonthly" min="0" required />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="depositAmount">Security Deposit</Label>
					<Input type="number" id="depositAmount" name="depositAmount" min="0" />
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="available">Available</option>
						<option value="occupied">Occupied</option>
						<option value="maintenance">Maintenance</option>
					</select>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/properties/{$page.params.id}">Cancel</Button>
				<Button type="submit">Create Room</Button>
			</CardFooter>
		</form>
	</Card>
</div>
