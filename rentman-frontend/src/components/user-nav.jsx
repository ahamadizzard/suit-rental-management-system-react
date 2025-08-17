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
import { LogOut, LogOutIcon, Settings, User } from "lucide-react";
import { TokensIcon } from "@radix-ui/react-icons";
// import { redirect } from "next/navigation";
import Swal from "sweetalert2";
import { Navigate, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

export default function UserNav() {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    // const { data: session } = useSession();
    // console.log("Session: ", session);

    // const handleLogout = async () => {
    //     await signOut({
    //         fetchOptions: {
    //             onSuccess: () => {
    //                 console.log("Logout successful");
    //                 localStorage.removeItem("token");
    //                 redirect("/login");
    //             },
    //         },
    //     });
    // };
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
                        <p className="font-bold text-lg loading-none text-blue-500 ">
                            {localStorage.getItem('user')}
                            {/* {session?.user?.name} */}
                        </p>
                        <p className="text-sm font-medium loading-none text-muted-foreground">
                            {/* {session?.user?.email} */}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup >
                    <DropdownMenuItem className="text-primary-400  hover:animate-pulse"
                        onClick={() => {
                            // console.log("Profile Clicked");
                        }
                        }>
                        <User className="mr-2 h-4 w-4 " />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className=" hover:animate-pulse">
                        <Settings className="mr-2 h-4 w-4 text-primary-400" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {
                    token == null ?
                        <Link to="/login" className="text-[15px] font-bold text-primary bg-accent hover:bg-accent/70 rounded-b-2xl flex flex-col justify-center items-center p-2">
                            <span className="text-sm font-bold">Login</span>
                        </Link>
                        :
                        // <button className=" w-[80px] h-[40px] font-semibold text-primary bg-accent hover:bg-accent/70 rounded-2xl flex flex-col justify-center items-center p-2"
                        <span className="cursor-pointer hover:animate-pulse flex flex-row justify-start font-bold items-center gap-2"
                            onClick={() => {
                                Swal.fire({
                                    title: 'Log-out?',
                                    text: "Would you like to log-out of the page?",
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#6366f1', // Tailwind 'accent'
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: 'Yes, Log-out',
                                    background: '#f9fafb',
                                    cancelButtonText: 'No, Keep Logged-in'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        localStorage.removeItem('token');
                                        navigate("/login");
                                    }
                                });
                            }
                            }
                        >
                            {/* <p className="text-sm font-bold text-blue-300">{localStorage.getItem('user')}</p><p className="text-[12px]">Log-out</p> */}
                            <FiLogOut /> Log-out
                            {/* // </button> */}
                        </span>
                }
                {/* <DropdownMenuItem onClick={handleLogout} className=" hover:animate-pulse">
                    <LogOut className="mr-2 h-4 w-4 text-primary-400" />
                    <span>LogOut</span>
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
