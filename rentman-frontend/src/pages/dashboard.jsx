import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import UserNav from "@/components/user-nav"
import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"



export default function DashboardLayout() {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const options = {
        weekday: 'long', // Full day name (e.g., "Saturday")
        year: 'numeric', // Full year (e.g., "2023")
        month: 'long',   // Full month name (e.g., "October")
        day: 'numeric',  // Day of the month (e.g., "15")
        hour: '2-digit', // Hour (e.g., "12")
        minute: '2-digit', // Minute (e.g., "34")
        second: '2-digit', // Second (e.g., "56")
        hour12: true,    // Use 12-hour format (e.g., "PM")
    };

    // This useEffect hook is used to update the current date and time every second
    useEffect(() => {
        // Set an interval to update the current date and time every second
        const interval = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, []);

    const formattedDateTime = currentDateTime.toLocaleString('en-US', options);
    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "15rem",
            }}
        >
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 border-3 shadow-2xl items-center gap-2 px-4">
                    {/* Far-left content */}
                    <div className="flex items-center">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>

                    {/* Centered time and far-right UserNav */}
                    <div className="flex flex-1 items-center justify-between">
                        {/* Empty flex-1 pushes time to center */}
                        <div className="flex-1"></div>

                        {/* Centered time */}
                        <div className="flex-1 text-center">
                            <p className="text-xl font-semibold text-blue-600">
                                {formattedDateTime}
                            </p>
                        </div>

                        {/* Far-right UserNav with flex-1 and justify-end */}
                        <div className="flex-1 flex justify-end">
                            <UserNav />
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Replace the existing content with Outlet */}
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}