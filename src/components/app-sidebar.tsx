import * as React from "react"
import {
  Layers,
  GalleryVerticalEnd,
  LayoutDashboard,
  Files,
  ListChecks,
  Settings2,
  Users2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Automa",
      logo: Layers,
      plan: "Enterprise",
    },
  ],
  navMain : [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Document Management",
    url: "#",
    icon: Files,
    items: [
      { title: "Templates", url: "#" },
      { title: "Create a Template", url: "/templates/create" },
      { title: "Upload File", url: "/templates/upload" },
      { title: "All Documents", url: "/templates/review" },
    ],
  },
  {
    title: "Operations",
    url: "#",
    icon: ListChecks,
    disabled: true,
    items: [
      { title: "Process Queue", url: "#" },
      { title: "Reports", url: "#" },
    ],
  },
  {
    title: "Configurations",
    url: "#",
    icon: Settings2,
    disabled: true,
    items: [
      { title: "Validation Rules", url: "#" },
      { title: "AI Models & OCR Config", url: "#" },
      { title: "API Keys & Integrations", url: "#" },
    ],
  },
  {
    title: "Admin & Security",
    url: "#",
    icon: Users2,
    disabled: true,
    items: [
      { title: "User Management", url: "#" },
      { title: "Audit Logs", url: "#" },
      { title: "Settings", url: "#" },
    ],
  },
],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
              <a href="#">
                <GalleryVerticalEnd className="h-5 w-5" />
                <span className="font-bold text-xl text-purple-600">Automa</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
