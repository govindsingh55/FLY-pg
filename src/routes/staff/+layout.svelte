<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { LayoutDashboard, Ticket, LogOut } from 'lucide-svelte';

	import type { LayoutData } from './$types';
	import { authClient } from '$lib/auth-client';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const navItems = [
		{ title: 'Dashboard', href: '/staff', icon: LayoutDashboard },
		{ title: 'Tickets', href: '/staff/tickets', icon: Ticket }
	];

	async function handleLogout() {
		await authClient.signOut();
		window.location.href = '/login';
	}
</script>

<Sidebar.Provider>
	<Sidebar.Sidebar>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						<a href="/staff" class="flex items-center gap-3">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
							>
								<Ticket class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-semibold">Staff Portal</span>
							</div>
						</a>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navItems as item}
							{@const Icon = item.icon}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={$page.url.pathname === item.href}>
									<a href={item.href} class="flex items-center gap-2 w-full">
										<Icon class="h-4 w-4" />
										<span>{item.title}</span>
									</a>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<div class="flex items-center gap-2 px-2 py-1.5 text-sm">
						<div
							class="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
						>
							{data.user.name?.charAt(0).toUpperCase() || 'S'}
						</div>
						<div class="flex flex-col">
							<span class="font-medium">{data.user.name}</span>
							<span class="text-xs text-muted-foreground">{data.user.email}</span>
						</div>
					</div>
				</Sidebar.MenuItem>
				<Sidebar.MenuItem>
					<Button variant="ghost" class="w-full justify-start" onclick={handleLogout}>
						<LogOut class="mr-2 h-4 w-4" />
						Logout
					</Button>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	</Sidebar.Sidebar>

	<main class="flex flex-1 flex-col">
		<header
			class="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 backdrop-blur supports-backdrop-filter:bg-background/60"
		>
			<Sidebar.Trigger />
			<Separator orientation="vertical" class="h-6" />
			<div class="flex-1"></div>
			<div class="flex items-center gap-4">
				{#if data.session?.impersonatedBy}
					<Button
						variant="destructive"
						size="sm"
						onclick={async () => {
							await authClient.admin.stopImpersonating();
							window.location.reload();
						}}
					>
						Stop Impersonation
					</Button>
				{/if}
				<ThemeToggle />
			</div>
		</header>

		<div class="flex-1">
			{@render children()}
		</div>
	</main>
</Sidebar.Provider>
