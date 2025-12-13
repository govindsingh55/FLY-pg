<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
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
			<CardTitle>Raise a Ticket</CardTitle>
			<CardDescription>Report an issue with your room or property.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="subject">Subject</Label>
					<Input id="subject" name="subject" placeholder="e.g. Leaking Tap" required />
					{#if form?.errors?.subject}
						<p class="text-destructive text-sm">{form.errors.subject[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="type">Issue Type</Label>
						<select
							name="type"
							id="type"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="electricity">Electricity</option>
							<option value="plumbing">Plumbing</option>
							<option value="furniture">Furniture</option>
							<option value="wifi">Wifi</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="priority">Priority</Label>
						<select
							name="priority"
							id="priority"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="low">Low</option>
							<option value="medium" selected>Medium</option>
							<option value="high">High</option>
							<option value="urgent">Urgent</option>
						</select>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Textarea
						id="description"
						name="description"
						placeholder="Please describe the issue in detail..."
						required
					/>
					{#if form?.errors?.description}
						<p class="text-destructive text-sm">{form.errors.description[0]}</p>
					{/if}
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/dashboard">Cancel</Button>
				<Button type="submit">Submit Ticket</Button>
			</CardFooter>
		</form>
	</Card>
</div>
