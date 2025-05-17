// "use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useSession, signOut } from "@/lib/auth-client";
import { LogOut, Settings, User } from "lucide-react";
// import { redirect } from "next/navigation";

export default function UserNav() {
    // const { data: session } = useSession();
    // console.log("Session: ", session);

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    redirect("/login");
                },
            },
        });
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                >
                    <Avatar className="h-10 w-10 border-2 border-blue-500">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-blue-900" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-muted-foreground" >
                    <div className="flex flex-col ">
                        <p className="font-bold text-lg loading-none text-muted-foreground">
                            {/* {session?.user?.name} */}
                        </p>
                        <p className="text-sm font-medium loading-none text-muted-foreground">
                            {/* {session?.user?.email} */}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup >
                    <DropdownMenuItem className="text-primary-400  hover:animate-pulse">
                        <User className="mr-2 h-4 w-4 " />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className=" hover:animate-pulse">
                        <Settings className="mr-2 h-4 w-4 text-primary-400" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className=" hover:animate-pulse">
                    <LogOut className="mr-2 h-4 w-4 text-primary-400" />
                    <span>LogOut</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
