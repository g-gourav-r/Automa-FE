import logo from "@/assets/optiextract_logo.png";
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
  Settings,
} from "lucide-react";
import * as React from "react";

export const data = {
  teams: [
    {
      name: "Optiextract",
      logo: logo,
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
      title: "My Documents",
      url: "/documents",
      icon: Folder,
    },
    {
      title: "Create a Template",
      url: "/templates/create",
      icon: FilePlus,
    },
    {
      title: "Review Documents",
      url: "/documents/review",
      icon: Eye,
    },
    {
      title: "Upload File",
      url: "/document/upload",
      icon: Upload,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: FileText,
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  const navUserData = user
    ? {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        avatar: "/avatars/shadcn.jpg",
      }
    : {
        name: "Guest",
        email: "guest@example.com",
        avatar: "/avatars/default.jpg",
      };

  return (
    // The `group` class on the Sidebar itself is essential for Tailwind's data attributes
    <Sidebar collapsible="icon" className="group" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="flex items-center justify-center text-lg">
                  <img
                    alt="OptiExtract Logo"
                    // Apply transition for smooth scaling
                    className="h-8 w-8 transition-all duration-200 ease-in-out group-data-[state=collapsed]:h-5 group-data-[state=collapsed]:w-5"
                    src={logo}
                  />
                  {/* The text with conditional visibility */}
                  <span className="font-bold whitespace-nowrap group-data-[state=collapsed]:hidden">
                    Opti<span className="text-purple-600">Extract</span>
                  </span>
                </div>
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
