import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts/UserContext";
import {
  Layers,
  GalleryVerticalEnd,
  LayoutDashboard,
  Files,
  ListChecks,
  Settings2,
  Users2,
} from "lucide-react";
import * as React from "react";

export const data = {
  teams: [
    {
      name: "Automa",
      logo: Layers,
      plan: "Enterprise",
    },
  ],
  navMain: [
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
        {
          title: "Upload File",
          url: "/templates/upload",
          items: [
            { title: "Single Upload", url: "/templates/upload/single" },
            { title: "Bulk Upload", url: "/templates/upload/bulk" },
          ],
        },
        { title: "Entries", url: "/templates/review" },
        { title: "Processing Status", url: "/templates/processing-status" },
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
  const { user } = useUser();

  const navUserData = user
    ? {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: "/avatars/shadcn.jpg", // or user.avatar if you have it
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      };
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
                <span className="font-bold text-xl text-purple-600">
                  Automa
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
