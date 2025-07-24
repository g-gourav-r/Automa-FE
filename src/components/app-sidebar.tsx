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
  LayoutDashboard,
  FilePlus,
  FileText,
  Upload,
  Folder,
  Eye,
  Loader,
  ListChecks,
  BarChart2,
  CheckCircle2,
  Brain,
  Key,
  Users,
  ScrollText,
  Layers,
  Settings,
  GalleryVerticalEnd, // <--- Added this import
} from "lucide-react";
import * as React from "react";

export const data = { // Corrected object definition
  teams: [
    {
      name: "Automa",
      logo: Layers,
      plan: "Enterprise",
    },
  ],
  navMain: [ // Changed from NavMain = to navMain:
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Create a Template",
      url: "/templates/create",
      icon: FilePlus,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: FileText,
    },
    {
      title: "Upload File",
      url: "/document/upload",
      icon: Upload,
    },
    {
      title: "My Documents",
      url: "/documents",
      icon: Folder,
    },
    {
      title: "Review Documents",
      url: "/documents/review",
      icon: Eye,
    },
    {
      title: "Processing Status",
      url: "/templates/processing-status",
      icon: Loader,
    },
    {
      title: "Process Queue",
      url: "#",
      icon: ListChecks,
      disabled: true,
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart2,
      disabled: true,
    },
    {
      title: "Validation Rules",
      url: "#",
      icon: CheckCircle2,
      disabled: true,
    },
    {
      title: "AI Models & OCR Config",
      url: "#",
      icon: Brain,
      disabled: true,
    },
    {
      title: "API Keys & Integrations",
      url: "#",
      icon: Key,
      disabled: true,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      disabled: true,
    },
    {
      title: "Audit Logs",
      url: "#",
      icon: ScrollText,
      disabled: true,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      disabled: true,
    },
  ],
}; // Corrected closing of data object

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
        {/* Make sure NavMain component correctly accepts an 'items' prop */}
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}