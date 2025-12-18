<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import {
		Briefcase,
		Building,
		Calendar,
		ClipboardList,
		CreditCard,
		Home,
		ImageIcon,
		LayoutDashboard,
		List,
		LogOut,
		Menu,
		Settings,
		UserCog,
		Users
	} from 'lucide-svelte';

	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const allNavGroups = [
		{
			label: 'System',
			items: [
				{
					title: 'Dashboard',
					href: '/admin',
					icon: LayoutDashboard,
					roles: ['admin', 'manager', 'property_manager', 'staff']
				},
				{ title: 'Staff', href: '/admin/staff', icon: UserCog, roles: ['admin'] },
				{ title: 'Assignments', href: '/admin/assignments', icon: ClipboardList, roles: ['admin'] },
				{ title: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] }
			]
		},
		{
			label: 'Property',
			items: [
				{
					title: 'Properties',
					href: '/admin/properties',
					icon: Building,
					roles: ['admin', 'manager', 'property_manager', 'staff']
				},
				{
					title: 'Amenities',
					href: '/admin/amenities',
					icon: List,
					roles: ['admin', 'manager']
				},
				{
					title: 'Media',
					href: '/admin/media',
					icon: ImageIcon,
					roles: ['admin', 'manager']
				}
			]
		},
		{
			label: 'Customer',
			items: [
				{
					title: 'Customers',
					href: '/admin/customers',
					icon: Users,
					roles: ['admin', 'manager', 'property_manager', 'staff']
				},
				{
					title: 'Bookings',
					href: '/admin/bookings',
					icon: Calendar,
					roles: ['admin', 'manager', 'property_manager', 'staff']
				},
				{
					title: 'Property Visits',
					href: '/admin/visits',
					icon: Briefcase,
					roles: ['admin', 'manager', 'property_manager', 'staff']
				},
				{
					title: 'Payments',
					href: '/admin/payments',
					icon: CreditCard,
					roles: ['admin', 'manager']
				}
			]
		}
	];

	// Filter items based on user role
	const navGroups = allNavGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => item.roles.includes(data.user?.role ?? ''))
		}))
		.filter((group) => group.items.length > 0);

	function isActive(href: string): boolean {
		if (href === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<Sidebar.Provider>
	<Sidebar.Root>
		<Sidebar.Header>
			<div class="flex items-center gap-2 px-4 py-2">
				<Home class="h-6 w-6" />
				<span class="text-lg font-semibold">PMS Admin</span>
			</div>
			<Separator />
		</Sidebar.Header>

		<Sidebar.Content>
			{#each navGroups as group}
				<Sidebar.Group>
					<Sidebar.GroupLabel>{group.label}</Sidebar.GroupLabel>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each group.items as item}
								{@const Icon = item.icon}
								<Sidebar.MenuItem>
									<div class="flex items-center justify-between w-full">
										<Sidebar.MenuButton isActive={isActive(item.href)} class="grow">
											<a href={item.href} class="flex items-center gap-2 w-full">
												<Icon class="h-4 w-4" />
												<span>{item.title}</span>
											</a>
										</Sidebar.MenuButton>
									</div>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</Sidebar.Group>
			{/each}
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<div class="px-4 py-2">
						<p class="text-sm font-medium">{data.user.name}</p>
						<p class="text-xs text-muted-foreground">{data.user.email}</p>
						<p class="text-xs uppercase text-muted-foreground mt-1">
							{data.user.role?.replace('_', ' ')}
						</p>
					</div>
				</Sidebar.MenuItem>
				<Sidebar.MenuItem>
					<form method="POST" action="/logout">
						<Sidebar.MenuButton class="w-full flex items-center gap-2" type="submit">
							<LogOut class="h-4 w-4" />
							<span>Logout</span>
						</Sidebar.MenuButton>
					</form>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	</Sidebar.Root>

	<Sidebar.Inset>
		<header class="flex h-14 items-center gap-4 border-b bg-background px-6">
			<Sidebar.Trigger>
				<Menu class="h-5 w-5" />
			</Sidebar.Trigger>
			<h1 class="text-lg font-semibold">
				{#if $page.url.pathname === '/admin'}
					Dashboard
				{:else if $page.url.pathname.includes('properties')}
					Properties
				{:else if $page.url.pathname.includes('customers')}
					Customers
				{:else if $page.url.pathname.includes('bookings')}
					Bookings
				{:else if $page.url.pathname.includes('visits')}
					Home Visits
				{:else if $page.url.pathname.includes('payments')}
					Payments
				{:else if $page.url.pathname.includes('staff')}
					Staff Management
				{:else if $page.url.pathname.includes('assignments')}
					Assignments
				{:else if $page.url.pathname.includes('media')}
					Media Management
				{:else if $page.url.pathname.includes('amenities')}
					Amenities
				{:else if $page.url.pathname.includes('settings')}
					System Settings
				{/if}
			</h1>
			<div class="ml-auto">
				<ThemeToggle />
			</div>
		</header>

		<main class="flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
