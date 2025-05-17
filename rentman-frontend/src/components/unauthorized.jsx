// src/components/Unauthorized.jsx
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function Unauthorized() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole') || 'guest';

    const roleDisplayNames = {
        admin: "Administrator",
        manager: "Manager",
        cashier: "Cashier",
        guest: "Guest"
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        Your account ({roleDisplayNames[userRole]}) doesn't have permission
                        to access this page.
                    </AlertDescription>
                </Alert>

                <div className="flex flex-col space-y-2">
                    <Button onClick={() => navigate(-1)} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
                        <Home className="mr-2 h-4 w-4" />
                        Return to Dashboard
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center pt-4">
                    Need elevated permissions? Contact{" "}
                    <a
                        href="mailto:admin@rentalapp.com"
                        className="text-primary underline hover:text-primary/80"
                    >
                        admin@rentalapp.com
                    </a>
                </p>
            </div>
        </div>
    );
}
export default Unauthorized;