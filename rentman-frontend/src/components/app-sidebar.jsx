import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Sales Module",
      url: "#",
      items: [
        {
          title: "Item Booking",
          url: "#",
          items: [
            {
              title: "Booking List",
              url: "/dashboard/sales/bookinglist",
              isActive: true,
            },
            {
              title: "New Booking",
              url: "/dashboard/sales/newbooking",
              isActive: true,
            },
            {
              title: "Modify Booking",
              url: "/dashboard/sales/modifybooking",
              isActive: true,
            },
            {
              title: "Item Sales",
              url: "#",
              isActive: true,
            },
            {
              title: "Sales Return",
              url: "#",
              isActive: true,
            },

          ]
        },
        {
          title: "Dry Clean",
          url: "#",
          items: [
            {
              title: "View Dry Clean",
              url: "#",
              isActive: true,
            },
            {
              title: "Add Dry Clean",
              url: "#",
              isActive: true,
            }

          ]
        },
        {
          title: "Product Group",
          url: "#",
          items: [
            {
              title: "View Groups",
              url: "/dashboard/groupmaster",
              isActive: true,
            },
            {
              title: "Add a Group",
              url: "/dashboard/groupmaster/add",
              isActive: true,
            }

          ]
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Inventory",
      url: "#",
      items: [
        {
          title: "Item Master",
          url: "#",
          items: [
            {
              title: "View Items",
              url: "/dashboard/itemmaster",
              isActive: true,
            },
            {
              title: "Add Item",
              url: "/dashboard/itemmaster/add",
              isActive: true,
            }

          ]
        },
        {
          title: "Dry Clean",
          url: "#",
          items: [
            {
              title: "View Dry Clean",
              url: "#",
              isActive: true,
            },
            {
              title: "Add Dry Clean",
              url: "#",
              isActive: true,
            }

          ]
        },
        {
          title: "Product Group",
          url: "#",
          items: [
            {
              title: "View Product Group",
              url: "/dashboard/groupmaster",
              isActive: true,
            },
            {
              title: "Add Product Group",
              url: "/dashboard/groupmaster/add",
              isActive: true,
            }

          ]
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Employees",
      url: "#",
      items: [
        {
          title: "View Employees",
          url: "#",
          items: [
            {
              title: "View Products",
              url: "#",
              isActive: true,
            },
            {
              title: "Add Products",
              url: "#",
              isActive: true,
            }

          ]
        },
        {
          title: "Add Employees",
          url: "#",
          items: [
            {
              title: "View Dry Clean",
              url: "#",
              isActive: true,
            },
            {
              title: "Add Dry Clean Details",
              url: "#",
              isActive: true,
            }

          ]
        },
        {
          title: "Edit Employees",
          url: "#",
          items: [
            {
              title: "View Product Group",
              url: "#",
              isActive: true,
            },
            {
              title: "Add Product Group",
              url: "#",
              isActive: true,
            }

          ]
        },
        {
          title: "Employee Drawings",
          url: "#",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      items: [
        {
          title: "Add Customer",
          url: "/dashboard/sales/customers/addcustomer",
        },
        {
          title: "Customers Details List",
          url: "/dashboard/sales/customers/viewcustomers",
        },
        {
          title: "Cust. Purchase History",
          url: "/dashboard/sales/customers/purchasehistory",
          isActive: true,
        },
        {
          title: "Blocked Customers List",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div>
                  <img src="/logoW.png" width="80px" height="80px" alt="logo" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium ml-5">RentManager</span>
                  <span className="ml-5">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="bg-neutral-600" />
        {/* <SearchForm /> */}
      </SidebarHeader>
      {/* ... SidebarHeader remains the same ... */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <Collapsible key={item.title} defaultOpen={index === 0} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="font-bold">
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem, subIndex) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            {subItem.items?.length ? (
                              <Collapsible defaultOpen={subIndex === 0} className="group/sub-collapsible">
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton asChild>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{subItem.title}</span>
                                      <Plus className="ml-auto group-data-[state=open]/sub-collapsible:hidden" />
                                      <Minus className="ml-auto group-data-[state=closed]/sub-collapsible:hidden" />
                                    </div>
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <SidebarMenuSub>
                                    {subItem.items.map((subSubItem) => (
                                      <SidebarMenuSubItem key={subSubItem.title}>
                                        <SidebarMenuSubButton asChild isActive={subSubItem.isActive}>
                                          <Link to={subSubItem.url}>{subSubItem.title}</Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    ))}
                                  </SidebarMenuSub>
                                </CollapsibleContent>
                              </Collapsible>
                            ) : (
                              <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                <Link to={subItem.url}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}