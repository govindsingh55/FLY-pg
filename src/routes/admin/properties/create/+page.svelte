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

	let { form } = $props();
</script>

<div class="mx-auto max-w-2xl p-6">
	<Card>
		<CardHeader>
			<CardTitle>Create Property</CardTitle>
			<CardDescription>Add a new property to your portfolio.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Property Name</Label>
					<Input
						id="name"
						name="name"
						placeholder="e.g. Sunrise Apartments"
						required
						value={form?.data?.name}
					/>
					{#if form?.errors?.name}
						<p class="text-destructive text-sm">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="address">Address</Label>
					<Input
						id="address"
						name="address"
						placeholder="123 Main St"
						required
						value={form?.data?.address}
					/>
					{#if form?.errors?.address}
						<p class="text-destructive text-sm">{form.errors.address[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="city">City</Label>
						<Input id="city" name="city" placeholder="New York" value={form?.data?.city} />
					</div>
					<div class="grid gap-2">
						<Label for="state">State</Label>
						<Input id="state" name="state" placeholder="NY" value={form?.data?.state} />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="zip">Zip / Postal Code</Label>
						<Input id="zip" name="zip" placeholder="10001" value={form?.data?.zip} />
					</div>
					<div class="grid gap-2">
						<Label for="contactPhone">Contact Phone</Label>
						<Input
							id="contactPhone"
							name="contactPhone"
							placeholder="+1234567890"
							value={form?.data?.contactPhone}
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Input
						id="description"
						name="description"
						placeholder="A brief description..."
						value={form?.data?.description}
					/>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/properties">Cancel</Button>
				<Button type="submit">Create Property</Button>
			</CardFooter>
		</form>
	</Card>
</div>
