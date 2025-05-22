import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-hot-toast"
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

const statusOptions = ["Available", "Rented", "DryClean", "Blocked"]

export default function AddProduct() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        itemCode: "",
        itemName: "",
        itemShortDesc: "",
        itemGroupShortDesc: "",
        itemSize: "",
        itemPrice: 0,
        itemDateAdded: new Date(),
        itemMaterialType: "",
        itemMaterialVendor: "",
        itemRemarks: "",
        isSchoolItem: false,
        itemStatus: "Available",
        contributor: "BlazorHub",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

    // Fetch groups on component mount
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoadingGroups(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    import.meta.env.VITE_API_BASE_URL + "/api/groupmaster",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const sortedGroups = response.data.sort((a, b) =>
                    a.groupShortName.localeCompare(b.groupShortName)
                );

                setGroups(sortedGroups);
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                setLoadingGroups(false);
            }
        };

        fetchGroups();
    }, []);

    const handleGroupChange = (value) => {
        setFormData(prev => ({
            ...prev,
            itemGroupShortDesc: value
        }));
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target
        const checked = e.target.checked

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const checkItemCodeExists = async (itemCode) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${itemCode}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return !!response.data;
        } catch (error) {
            // If 404, item does not exist
            if (error.response && error.response.status === 404) return false;
            // Other errors
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Check if item code exists
            const exists = await checkItemCodeExists(formData.itemCode);
            if (exists) {
                toast.error("Item code already exists. Please use a different code.");
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
                import.meta.env.VITE_API_BASE_URL + "/api/itemmaster",
                {
                    ...formData,
                    itemSize: Number(formData.itemSize),
                    itemPrice: Number(formData.itemPrice)
                },
                config
            );
            toast.success("Product added successfully!");
            navigate("/dashboard/itemmaster");
        } catch (error) {
            console.error("Error adding item:", error);
            toast.error("Failed to add product. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
                    <CardDescription>
                        Fill out the form below to add a new product to the inventory
                    </CardDescription>
                </CardHeader>

                <Separator className="mb-6" />

                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="itemCode">Item Code *</Label>
                                    <Input
                                        id="itemCode"
                                        name="itemCode"
                                        value={formData.itemCode}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="itemName">Item Name *</Label>
                                    <Input
                                        id="itemName"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="itemShortDesc">Item Short Description *</Label>
                                    <Input
                                        id="itemShortDesc"
                                        name="itemShortDesc"
                                        value={formData.itemShortDesc}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="itemGroupShortDesc">Group Short Description *</Label>
                                    {loadingGroups ? (
                                        <Input disabled placeholder="Loading groups..." />
                                    ) : (
                                        <Select
                                            value={formData.itemGroupShortDesc}
                                            onValueChange={handleGroupChange}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {groups.map((group) => (
                                                    <SelectItem
                                                        key={group.groupId}
                                                        value={group.groupShortName}
                                                    >
                                                        {group.groupShortName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* <div className="space-y-2">
                                    <Label htmlFor="itemGroupShortDesc">Group Short Description *</Label>
                                    <Input
                                        id="itemGroupShortDesc"
                                        name="itemGroupShortDesc"
                                        value={formData.itemGroupShortDesc}
                                        onChange={handleChange}
                                        required
                                    />
                                </div> */}

                                <div className="space-y-2">
                                    <Label htmlFor="itemSize">Item Size *</Label>
                                    <Input
                                        id="itemSize"
                                        name="itemSize"
                                        type="number"
                                        value={formData.itemSize}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="itemPrice">Item Price *</Label>
                                    <Input
                                        id="itemPrice"
                                        name="itemPrice"
                                        type="number"
                                        value={formData.itemPrice}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date Added</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.itemDateAdded ? (
                                                    format(formData.itemDateAdded, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.itemDateAdded}
                                                onSelect={(date) =>
                                                    setFormData(prev => ({ ...prev, itemDateAdded: date || new Date() }))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="itemMaterialType">Material Type</Label>
                                    <Input
                                        id="itemMaterialType"
                                        name="itemMaterialType"
                                        value={formData.itemMaterialType}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="itemMaterialVendor">Material Vendor</Label>
                                    <Input
                                        id="itemMaterialVendor"
                                        name="itemMaterialVendor"
                                        value={formData.itemMaterialVendor}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="space-y-2 flex flex-row items-center gap-20">
                                    <div>
                                        <Label className="pb-2" htmlFor="itemStatus">Item Status</Label>
                                        <Select
                                            value={formData.itemStatus}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({ ...prev, itemStatus: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="isSchoolItem"
                                            checked={formData.isSchoolItem}
                                            onCheckedChange={(checked) =>
                                                setFormData(prev => ({ ...prev, isSchoolItem: !!checked }))
                                            }
                                        />
                                        <Label htmlFor="isSchoolItem">Is School Item</Label>
                                    </div>
                                </div>


                            </div>
                        </div>

                        {/* Full width field */}
                        <div className="space-y-2 mb-4">
                            <Label htmlFor="itemRemarks">Remarks</Label>
                            <Textarea
                                id="itemRemarks"
                                name="itemRemarks"
                                value={formData.itemRemarks}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/itemmaster")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Product"}
                        </Button>
                    </CardFooter>
                </form>
            </Card >
        </div >
    )
}