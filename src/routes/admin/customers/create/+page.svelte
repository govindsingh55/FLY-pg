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
			<CardTitle>Add Customer</CardTitle>
			<CardDescription>Register a new tenant/customer.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Full Name</Label>
					<Input id="name" name="name" placeholder="John Doe" required value={form?.data?.name} />
					{#if form?.errors?.name}
						<p class="text-destructive text-sm">{form.errors.name[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							type="email"
							id="email"
							name="email"
							placeholder="john@example.com"
							required
							value={form?.data?.email}
						/>
						{#if form?.errors?.email}
							<p class="text-destructive text-sm">{form.errors.email[0]}</p>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="phone">Phone</Label>
						<Input
							id="phone"
							name="phone"
							placeholder="+1234567890"
							required
							value={form?.data?.phone}
						/>
						{#if form?.errors?.phone}
							<p class="text-destructive text-sm">{form.errors.phone[0]}</p>
						{/if}
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="addressPermanent">Permanent Address</Label>
					<Input
						id="addressPermanent"
						name="addressPermanent"
						value={form?.data?.addressPermanent}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="idProofType">ID Proof Type</Label>
						<Input
							id="idProofType"
							name="idProofType"
							placeholder="Passport / Drivers License"
							value={form?.data?.idProofType}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="idProofNumber">ID Proof Number</Label>
						<Input id="idProofNumber" name="idProofNumber" value={form?.data?.idProofNumber} />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="emergencyContactName">Emergency Contact Name</Label>
						<Input
							id="emergencyContactName"
							name="emergencyContactName"
							value={form?.data?.emergencyContactName}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="emergencyContactPhone">Emergency Contact Phone</Label>
						<Input
							id="emergencyContactPhone"
							name="emergencyContactPhone"
							value={form?.data?.emergencyContactPhone}
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="active" selected={form?.data?.status === 'active'}>Active</option>
						<option value="inactive" selected={form?.data?.status === 'inactive'}>Inactive</option>
					</select>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/customers">Cancel</Button>
				<Button type="submit">Create Customer</Button>
			</CardFooter>
		</form>
	</Card>
</div>
