import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Award, Users, Briefcase, FileText } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Sertifikasi Kompetensi',
        href: '/admin/sertifikasi-kompetensi',
        icon: Award,
    },
    {
        title: 'Praktik Kerja Lapangan',
        href: '/admin/praktik-kerja-lapangan',
        icon: Briefcase,
    },
    {
        title: 'Penilaian',
        href: '/admin/penilaian',
        icon: Users,
        items: [
            {
                title: 'PKL',
                href: '/admin/penilaian-pkl',
            },
            {
                title: 'Sertifikasi',
                href: '/admin/penilaian-sertifikasi',
            }
        ]
    },
    {
        title: 'Manajemen Konten',
        href: '#',
        icon: FileText,
        items: [
            {
                title: 'Blog',
                href: '/admin/manajemen-blog',
            },
            {
                title: 'Video',
                href: '/admin/manajemen-video',
            }
        ]
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/admin/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
