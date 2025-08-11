import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router";
import axios from "axios"
import toast from "react-hot-toast"
import Swal from "sweetalert2"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// import { Command } from "@/components/ui/command"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { FaEye } from "react-icons/fa";

const statusOptions = ["Available", "Rented", "DryClean", "Blocked"]

export default function AddCustomer() {
    const navigate = useNavigate()
    const inputRef = useRef(null);
    const [formData, setFormData] = useState({
        // itemCode: "",
        customerName: "",
        customerAddress: "",
        customerEmail: "",
        customerTel1: "",
        customerTel2: "",
        customerJoinedDate: new Date(),
        customerDiscountPercentage: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // useEffect(() => {
    //     // Focus the item code input when the component mounts
    //     if (inputRef.current) {
    //         inputRef.current.focus();
    //     }
    // }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target
        const checked = e.target.checked

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    // const checkItemCodeExists = async (itemCode) => {
    const checkCustomerIdExists = async (customerId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/customers/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("CustomerId check response:", response);
            return !!response.data;
        } catch (error) {
            // If 404, item does not exist
            if (error.response && error.response.status === 404) return false;
            // Other errors
            // throw error;
            return null; // Indicate an error occurred
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Check if item code exists
            const exists = await checkCustomerIdExists(formData.customerId);
            if (exists) {
                // toast.error("Item code already exists. Please use a different code.");
                Swal.error("CustomerId already exists. Please use a different code.");
                setIsSubmitting(false);
                return;
            }
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(
                import.meta.env.VITE_API_BASE_URL + "/api/customers",
                {
                    ...formData,
                    // itemSize: Number(formData.itemSize),
                    // itemPrice: Number(formData.itemPrice)
                },
                config
            );
            toast.success("Customer added successfully!");
            navigate("/dashboard/sales/customers");
        } catch (error) {
            console.error("Error adding customer:", error);
            Swal.error("Failed to add customer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card >
                <CardHeader className="bg-blue-300 text-white relative">
                    <CardTitle className="text-2xl font-bold">Add New Customer</CardTitle>
                    <CardDescription>
                        Fill out the form below to add a new customer to the system. All fields marked with * are required.
                    </CardDescription>
                    <div className="flex justify-end items-center">
                        <Link
                            to="/dashboard/sales/customers/viewcustomers"
                            className="absolute flex px-4 py-2 right-2 top-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <FaEye className="mr-2" /> Add New Item
                        </Link>
                    </div>
                </CardHeader>

                <Separator className="mb-6" />

                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerId">Customer ID *</Label>
                                    <Input
                                        id="customerId"
                                        name="customerId"
                                        type="text"
                                        placeholder="Enter a unique customer ID"
                                        ref={inputRef}
                                        value={formData.customerId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Name in Full *</Label>
                                    <Input
                                        id="customerName"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerAddress">Address *</Label>
                                    <Input
                                        id="customerAddress"
                                        name="customerAddress"
                                        value={formData.customerAddress}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email</Label>
                                    <Input
                                        id="customerEmail"
                                        name="customerEmail"
                                        value={formData.customerEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerTel1">Telephone-1 *</Label>
                                    <Input
                                        id="customerTel1"
                                        name="customerTel1"
                                        value={formData.customerTel1}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerTel2">Telephone-2</Label>
                                    <Input
                                        id="customerTel2"
                                        name="customerTel2"
                                        value={formData.customerTel2}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerJoinedDate">Joined Date *</Label>
                                    <Input
                                        type={"date"}
                                        id="customerJoinedDate"
                                        name="customerJoinedDate"
                                        value={formData.customerJoinedDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerDiscountPercentage">Discount %</Label>
                                    <Input
                                        type="number"
                                        id="customerDiscountPercentage"
                                        name="customerDiscountPercentage"
                                        default="0"
                                        value={formData.customerDiscountPercentage}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4 ml-5">
                                <div>
                                    <h2>existing customer list will be displayed here</h2>
                                </div>


                            </div>
                        </div>

                        {/* Full width field */}
                        {/* <div className="space-y-2 mb-4">
                                    <Label htmlFor="itemRemarks">Remarks</Label>
                                    <Textarea
                                        id="itemRemarks"
                                        name="itemRemarks"
                                        value={formData.itemRemarks}
                                        onChange={handleChange}
                                        rows={3}
                                    />
                                </div> */}
                        {/* </div> */}

                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/customers")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Customer"}
                        </Button>
                    </CardFooter>
                </form>
            </Card >
        </div >
    )
}