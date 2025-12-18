<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import {
		ChevronLeft,
		Send,
		User,
		Home as HomeIcon,
		Clock,
		UserCheck,
		CheckCircle2
	} from 'lucide-svelte';
	import { page } from '$app/state';
	import {
		getTicket,
		sendTicketMessage,
		updateTicketStatus
	} from '../../../admin/tickets/tickets.remote';
	import { toast } from 'svelte-sonner';

	const id = $derived(page.params.id ?? '');
	let dataPromise = $derived(getTicket(id));

	let messageContent = $state('');

	async function handleSendMessage() {
		if (!messageContent.trim()) return;
		try {
			await sendTicketMessage({ ticketId: id, content: messageContent });
			messageContent = '';
			await dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to send message');
		}
	}

	async function closeTicket() {
		try {
			await updateTicketStatus({ id, status: 'closed' });
			toast.success('Ticket closed');
			await dataPromise.refresh();
		} catch (e: any) {
			toast.error(e.message || 'Failed to close ticket');
		}
	}

	const statusColors: Record<string, string> = {
		open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
		in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
		resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
		closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
	};
</script>

<div class="flex flex-col h-full bg-background mt-safe">
	<header class="flex items-center gap-4 border-b px-6 py-4 bg-background z-10">
		<Button variant="ghost" size="icon" href="/dashboard/tickets">
			<ChevronLeft class="h-4 w-4" />
		</Button>
		<div class="flex-1 min-w-0">
			{#await dataPromise}
				<Skeleton class="h-6 w-48 mb-1" />
				<Skeleton class="h-3 w-32" />
			{:then ticket}
				<h1 class="text-lg font-semibold truncate group relative">
					{ticket.subject}
					<span
						class="hidden group-hover:block absolute left-0 -bottom-8 bg-popover text-popover-foreground text-xs p-1 rounded border shadow-lg z-50 capitalize"
					>
						{ticket.type} Issue
					</span>
				</h1>
				<div class="flex items-center gap-2 overflow-hidden">
					<Badge
						class={`capitalize text-[10px] h-4 px-1 ${statusColors[ticket.status!] || ''}`}
						variant="outline"
					>
						{ticket.status?.replace('_', ' ')}
					</Badge>
					<span class="text-[10px] text-muted-foreground truncate font-mono">#{id.slice(0, 8)}</span
					>
				</div>
			{/await}
		</div>
		{#await dataPromise then ticket}
			{#if ticket.status !== 'closed'}
				<Button variant="outline" size="sm" onclick={closeTicket} class="shrink-0 text-xs h-8">
					Close Ticket
				</Button>
			{/if}
		{/await}
	</header>

	<div class="flex-1 flex flex-col overflow-hidden relative">
		{#await dataPromise}
			<div class="p-6 space-y-4">
				<Skeleton class="h-20 w-3/4" />
				<Skeleton class="h-20 w-1/2 ml-auto" />
			</div>
		{:then ticket}
			<ScrollArea class="flex-1 p-4 sm:p-6 bg-slate-50/30 dark:bg-slate-900/10">
				<div class="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
					<div class="p-4 bg-background border rounded-lg shadow-sm">
						<div class="flex items-center justify-between mb-2">
							<span class="text-xs font-semibold text-muted-foreground uppercase"
								>Initial Request</span
							>
							<span class="text-[10px] text-muted-foreground">
								{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
							</span>
						</div>
						<p class="text-sm whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
					</div>

					<div class="flex flex-col gap-6">
						{#each ticket.messages as msg}
							{@const isMe = msg.senderId === ticket.customer?.userId}
							<div class={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
								<div
									class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isMe ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground border'}`}
								>
									{#if isMe}
										<User class="h-4 w-4" />
									{:else}
										<UserCheck class="h-4 w-4" />
									{/if}
								</div>
								<div
									class={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : ''}`}
								>
									<div class="flex items-center gap-2 px-1">
										<span class="text-[10px] font-semibold"
											>{isMe ? 'You' : msg.sender?.name || 'Staff'}</span
										>
										<span class="text-[9px] text-muted-foreground">
											{msg.createdAt
												? new Date(msg.createdAt).toLocaleTimeString([], {
														hour: '2-digit',
														minute: '2-digit'
													})
												: ''}
										</span>
									</div>
									<div
										class={`rounded-2xl p-3 text-sm shadow-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-background border rounded-tl-none'}`}
									>
										{msg.content}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</ScrollArea>

			<footer class="p-4 bg-background border-t">
				<div class="max-w-3xl mx-auto">
					{#if ticket.status === 'closed'}
						<div
							class="flex items-center justify-center gap-2 p-3 text-xs text-muted-foreground bg-muted rounded-lg border border-dashed text-center"
						>
							<CheckCircle2 class="h-3 w-3" />
							This ticket is closed. You cannot send new messages.
						</div>
					{:else}
						<form
							class="flex items-end gap-2"
							onsubmit={(e) => {
								e.preventDefault();
								handleSendMessage();
							}}
						>
							<div class="flex-1">
								<textarea
									bind:value={messageContent}
									placeholder="Ask for an update or provide more info..."
									class="flex min-h-[40px] max-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
								class="h-10 w-10 shrink-0 rounded-full shadow-md"
								disabled={!messageContent.trim()}
							>
								<Send class="h-4 w-4" />
							</Button>
						</form>
					{/if}
				</div>
			</footer>
		{/await}
	</div>
</div>
