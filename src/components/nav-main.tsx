"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    disabled?: boolean;  // added
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0 ? (
            // For collapsible items with submenus
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
              // prevent opening if disabled by controlling open state (optional)
              // here we prevent toggle by stopping event in trigger
            >
              <SidebarMenuItem
                className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
              >
                <CollapsibleTrigger
                  asChild
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <SidebarMenuButton tooltip={item.title} disabled={item.disabled}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {!item.disabled && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            // For single items without submenu
            <SidebarMenuItem
              key={item.title}
              className={item.disabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              <SidebarMenuButton asChild tooltip={item.title} disabled={item.disabled}>
                <a
                  href={item.disabled ? "#" : item.url}
                  className={`flex items-center gap-2 w-full ${
                    item.disabled ? "pointer-events-none" : ""
                  }`}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
