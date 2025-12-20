<script lang="ts">
	import { page } from '$app/state';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		Building,
		ChevronLeft,
		Home as HomeIcon,
		Send,
		User,
		UserCheck,
		UserPlus
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import {
		getStaffTicket,
		sendStaffTicketMessage,
		updateStaffTicketStatus
	} from '../tickets.remote';

	const id = $derived(page.params.id ?? '');
	let dataPromise = $derived(getStaffTicket(id));

	let messageContent = $state('');

	async function handleSendMessage() {
		if (!messageContent.trim()) return;
		try {
			await sendStaffTicketMessage({ ticketId: id, content: messageContent });
			messageContent = '';
			await dataPromise.refresh();
			toast.success('Message sent');
		} catch (e: any) {
			toast.error(e.message || 'Failed to send message');
		}
	}

	async function updateStatus(status: any) {
		try {
			await updateStaffTicketStatus({ id, status });
			toast.success(`Status updated to ${status}`);
			await dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to update status');
		}
	}

	async function updatePriority(priority: any) {
		try {
			const ticket = await dataPromise;
			await updateStaffTicketStatus({ id, status: ticket.status as any, priority });
			toast.success(`Priority updated to ${priority}`);
			await dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to update priority');
		}
	}

	async function assignToSelf() {
		try {
			const ticket = await dataPromise;
			await updateStaffTicketStatus({ id, status: ticket.status as any, assignToSelf: true });
			toast.success('Ticket assigned to you');
			await dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to assign ticket');
		}
	}

	const statusColors: Record<string, string> = {
		open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
		in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
		resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
		closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
	};
</script>

<div class="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
	<header class="flex items-center gap-4 border-b bg-background px-6 py-4 shrink-0">
		<Button variant="ghost" size="icon" href="/staff/tickets">
			<ChevronLeft class="h-4 w-4" />
		</Button>
		<div class="flex flex-col">
			<h1 class="text-xl font-semibold">Ticket Details</h1>
			<p class="text-xs text-muted-foreground">ID: {id}</p>
		</div>
	</header>

	<div class="flex-1 flex flex-col min-h-0">
		{#await dataPromise}
			<div class="p-6 space-y-4">
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-1/2 ml-auto" />
				<Skeleton class="h-20 w-3/4" />
			</div>
		{:then ticket}
			<div class="p-6 border-b bg-muted/30 shrink-0">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-2xl font-bold">{ticket.subject}</h2>
					<div class="flex items-center gap-2">
						<Badge
							class={`capitalize border ${statusColors[ticket.status!] || ''}`}
							variant="outline"
						>
							{ticket.status?.replace('_', ' ')}
						</Badge>
						{#if !ticket.assignedTo}
							<Button size="sm" variant="default" onclick={assignToSelf}>
								<UserPlus class="h-4 w-4 mr-2" />
								Assign to Me
							</Button>
						{/if}
					</div>
				</div>
				<p class="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
			</div>

			<!-- Customer & All Info Accordion -->
			<Accordion.Root type="single" class="border-b bg-background shrink-0">
				<Accordion.Item value="info">
					<Accordion.Trigger class="px-6 py-3 hover:bg-muted/50 transition-colors">
						<div class="flex items-center gap-3">
							<User class="h-4 w-4 text-muted-foreground" />
							<div class="flex flex-col text-left">
								<span class="text-sm font-semibold">{ticket.customer?.name}</span>
								<span class="text-xs text-muted-foreground">{ticket.customer?.phone}</span>
							</div>
						</div>
					</Accordion.Trigger>
					<Accordion.Content class="px-6 pb-6 pt-2 bg-muted/5 space-y-6">
						<!-- Accordion Context: Split into columns -->
						<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
							<!-- Customer Details -->
							<div class="space-y-3">
								<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Customer
								</h4>
								<div class="space-y-1">
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Email:</span>
										<span class="font-medium truncate ml-2">{ticket.customer?.email || 'N/A'}</span>
									</div>
									<div class="flex justify-between text-sm">
										<span class="text-muted-foreground">Member Since:</span>
										<span class="font-medium">
											{ticket.customer?.createdAt
												? new Date(ticket.customer.createdAt).toLocaleDateString()
												: 'N/A'}
										</span>
									</div>
								</div>
							</div>

							<!-- Property & Room Info -->
							<div class="space-y-3">
								<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Location
								</h4>
								<div class="space-y-2">
									<div class="flex items-center gap-2 text-sm">
										<Building class="h-3 w-3 text-muted-foreground" />
										<span class="font-medium">{ticket.property?.name || 'N/A'}</span>
									</div>
									<div class="flex items-center gap-2 text-sm">
										<HomeIcon class="h-3 w-3 text-muted-foreground" />
										<span class="font-medium">
											Room {ticket.room?.number || 'N/A'} ({ticket.room?.type || 'N/A'})
										</span>
									</div>
									<div class="text-xs text-muted-foreground pl-5 border-l-2 border-muted">
										{ticket.property?.city}, {ticket.property?.state}
									</div>
								</div>
							</div>

							<!-- Ticket Controls -->
							<div class="space-y-3">
								<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Controls
								</h4>
								<div class="space-y-3">
									<div class="grid gap-1.5">
										<Label class="text-[10px]">Status</Label>
										<Select.Root
											type="single"
											value={ticket.status ?? undefined}
											onValueChange={updateStatus}
										>
											<Select.Trigger class="h-8 text-xs capitalize">
												{ticket.status?.replace('_', ' ')}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="open">Open</Select.Item>
												<Select.Item value="in_progress">In Progress</Select.Item>
												<Select.Item value="resolved">Resolved</Select.Item>
												<Select.Item value="closed">Closed</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
									<div class="grid gap-1.5">
										<Label class="text-[10px]">Priority</Label>
										<Select.Root
											type="single"
											value={ticket.priority ?? undefined}
											onValueChange={updatePriority}
										>
											<Select.Trigger class="h-8 text-xs capitalize">
												{ticket.priority}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="low">Low</Select.Item>
												<Select.Item value="medium">Medium</Select.Item>
												<Select.Item value="high">High</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
								</div>
							</div>

							<!-- Metadata -->
							<div class="space-y-3">
								<h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Metadata
								</h4>
								<div class="space-y-1.5 text-xs">
									<div class="flex justify-between">
										<span class="text-muted-foreground">Created:</span>
										<span class="font-medium">
											{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
										</span>
									</div>
									<div class="flex justify-between">
										<span class="text-muted-foreground">Updated:</span>
										<span class="font-medium">
											{ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : 'N/A'}
										</span>
									</div>
									<div class="flex justify-between">
										<span class="text-muted-foreground">Total Messages:</span>
										<span class="font-medium">{ticket.messages?.length || 0}</span>
									</div>
									<div class="flex justify-between">
										<span class="text-muted-foreground">Issue Type:</span>
										<span class="font-medium capitalize">{ticket.type}</span>
									</div>
								</div>
							</div>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>

			<!-- Chat Area -->
			<ScrollArea class="flex-1 p-6 bg-background min-h-0">
				<div class="max-w-4xl mx-auto flex flex-col gap-6">
					<!-- Original Message (Description) -->
					<div class="flex gap-3">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<User class="h-4 w-4" />
						</div>
						<div class="flex flex-col gap-1 max-w-[80%]">
							<div class="flex items-center gap-2">
								<span class="text-sm font-semibold">{ticket.customer?.name}</span>
								<span class="text-[10px] text-muted-foreground">Original Ticket</span>
							</div>
							<div class="rounded-2xl rounded-tl-none bg-muted p-3 text-sm leading-relaxed">
								{ticket.description}
							</div>
						</div>
					</div>

					{#each ticket.messages as msg}
						{@const isMe = msg.senderId === ticket.assignedStaff?.id}
						<div class={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
							<div
								class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isMe ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}
							>
								{#if isMe}
									<UserCheck class="h-4 w-4" />
								{:else}
									<User class="h-4 w-4" />
								{/if}
							</div>
							<div class={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
								<div class="flex items-center gap-2 px-1">
									<span class="text-sm font-semibold">{msg.sender?.name}</span>
									<span class="text-[10px] text-muted-foreground">
										{msg.createdAt
											? new Date(msg.createdAt).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit'
												})
											: ''}
									</span>
								</div>
								<div
									class={`rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}
								>
									{msg.content}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</ScrollArea>

			{#if ticket.assignedTo}
				<footer class="p-4 border-t bg-background shrink-0">
					<div class="max-w-4xl mx-auto">
						<form
							class="flex items-end gap-2"
							onsubmit={(e) => {
								e.preventDefault();
								handleSendMessage();
							}}
						>
							<div class="flex-1">
								<textarea
									name="message"
									rows="1"
									bind:value={messageContent}
									placeholder="Type your response..."
									class="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
									onkeydown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
								></textarea>
							</div>
							<Button
								type="submit"
								size="icon"
								class="h-10 w-10 shrink-0 rounded-full shadow-lg transition-transform active:scale-95"
								disabled={!messageContent.trim()}
							>
								<Send class="h-4 w-4" />
							</Button>
						</form>
					</div>
				</footer>
			{:else}
				<div class="p-4 border-t bg-muted/50 text-center shrink-0">
					<p class="text-sm text-muted-foreground">
						Assign this ticket to yourself to start messaging
					</p>
				</div>
			{/if}
		{/await}
	</div>
</div>
