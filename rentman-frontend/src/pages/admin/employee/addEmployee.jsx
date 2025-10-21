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

const statusOptions = ["active", "inactive", "onleave"]
const departments = ["sales", "tailoring", "manager", "cashier"]

export default function AddEmployee() {
    const navigate = useNavigate()
    const inputRef = useRef(null);
    const [employeesList, setEmployeesList] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        // itemCode: "",
        firstName: "",
        lastName: "",
        email: "",
        nic: "",
        telephone1: "",
        telephone2: "",
        address: "",
        joinedDate: format(new Date(), "dd-mmm-yyyy"),
        salary: "",
        department: "sales",
        designation: "staff",
        status: "active",
        imgURL: "",
        // role: "cashier",
        // isBlocked: false,
        // createdOn: new Date(),
        // modifiedOn: new Date(),        
        customerJoinedDate: new Date(),
        customerDiscountPercentage: "0",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({});

    // useEffect(() => {
    //     // Focus the item code input when the component mounts
    //     if (inputRef.current) {
    //         inputRef.current.focus();
    //     }
    // }, []);

    useEffect(() => {
        // Fetch existing customers list on component mount
        const fetchEmployees = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/employees`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEmployeesList(response.data);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const checked = e.target.checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear field error on change
        setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const validatePhone = (phone) => {
        if (!phone) return false;
        // simple check: digits, optional +, length 7-15
        return /^\+?[0-9\s-]{7,15}$/.test(phone);
    }

    const validateForm = () => {
        const newErrors = {};

        // if (!formData.employeeId || formData.employeeId.trim() === "") newErrors.employeeId = "Employee Id is required";
        if (!formData.firstName || formData.firstName.trim() === "") newErrors.firstName = "First name is required";
        if (!formData.lastName || formData.lastName.trim() === "") newErrors.lastName = "Last name is required";
        if (!formData.email || !validateEmail(formData.email)) newErrors.email = "Valid email is required";
        if (formData.nic && formData.nic.length < 5) newErrors.nic = "NIC seems too short";
        if (!formData.telephone1 || !validatePhone(formData.telephone1)) newErrors.telephone1 = "Valid telephone is required";
        if (formData.telephone2 && !validatePhone(formData.telephone2)) newErrors.telephone2 = "Telephone 2 is invalid";
        if (formData.salary && Number(formData.salary) < 0) newErrors.salary = "Salary cannot be negative";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // const checkItemCodeExists = async (itemCode) => {
    // const checkEmployeeIdExists = async (employeeId) => {
    //     const token = localStorage.getItem("token");
    //     try {
    //         const response = await axios.get(
    //             `${import.meta.env.VITE_API_BASE_URL}/api/employees/${employeeId}`,
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );
    //         console.log("EmployeeId check response:", response);
    //         return !!response.data;
    //     } catch (error) {
    //         // If 404, item does not exist
    //         if (error.response && error.response.status === 404) return false;
    //         // Other errors
    //         // throw error;
    //         return null; // Indicate an error occurred
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Run client-side validation first
        const valid = validateForm();
        if (!valid) {
            setIsSubmitting(false);
            return;
        }
        {
            Swal.fire({
                title: "Add Employee",
                text: "Are you sure you want to add this Employee?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Yes, add it!",
                cancelButtonText: "No, cancel",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        // Check if item code exists
                        // const exists = await checkEmployeeIdExists(formData.employeeId);
                        // if (exists) {
                        // toast.error("Item code already exists. Please use a different code.");
                        // Swal.error("EmployeeId already exists. Please use a different code.");
                        // setIsSubmitting(false);
                        // return;
                        // }
                        const token = localStorage.getItem("token");
                        const config = {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        };
                        const response = await axios.post(
                            import.meta.env.VITE_API_BASE_URL + "/api/employees",
                            {
                                ...formData,
                                // itemSize: Number(formData.itemSize),
                                // itemPrice: Number(formData.itemPrice)
                            },
                            config
                        );
                        // toast.success("Customer added successfully!");
                        Swal.fire({
                            title: "Success",
                            text: "Employee added successfully!",
                            icon: "success",
                            confirmButtonText: "OK",
                        });
                        navigate("/dashboard/employeelist");
                    } catch (error) {
                        console.error("Error adding employee:", error);
                        Swal.fire({
                            title: "Error",
                            text: "Failed to add employee. Please try again.",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                        // Swal.error("Failed to add customer. Please try again.");
                    } finally {
                        setIsSubmitting(false);
                    }

                } else {
                    setIsSubmitting(false);
                }
            })
        }




    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card>
                <CardHeader className="bg-blue-300 text-white px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 w-full">
                        <div>
                            <CardTitle className="text-2xl font-bold">Add New Employee</CardTitle>
                            <CardDescription>
                                Fill out the form below to add a new employee to the system. All fields marked with * are required.
                            </CardDescription>
                        </div>
                        <Link
                            to="/dashboard/employeeList"
                            className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors items-center mt-3 md:mt-0"
                        >
                            <FaEye className="mr-2" /> View Employees List
                        </Link>
                    </div>
                </CardHeader>

                <Separator className="mb-6" />

                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Form columns: fields will occupy columns responsively */}
                            <div className="md:col-span-2 space-y-4">
                                {/* <div className="space-y-2">
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
                                </div> */}

                                <div className="space-y-2">
                                    <Label htmlFor="employeeId">Employee Id *</Label>
                                    <Input
                                        id="employeeId"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nic">NIC No</Label>
                                        <Input
                                            id="nic"
                                            name="nic"
                                            value={formData.nic}
                                            onChange={handleChange}
                                        />
                                        {errors.nic && <p className="text-red-600 text-sm">{errors.nic}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone1">Tele-1 *</Label>
                                        <Input
                                            id="telephone1"
                                            name="telephone1"
                                            value={formData.telephone1}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone2">Tele-2</Label>
                                        <Input
                                            id="telephone2"
                                            name="telephone2"
                                            value={formData.telephone2}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="joinedDate">Joined Date</Label>
                                        <Input
                                            type={"date"}
                                            id="joinedDate"
                                            name="joinedDate"
                                            value={(() => {
                                                const d = new Date(formData.joinedDate);
                                                if (isNaN(d)) return "";
                                                return d.toISOString().slice(0, 10);
                                            })()}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, joinedDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salary">Salary</Label>
                                        <Input
                                            className="text-right"
                                            type="number"
                                            id="salary"
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                        />
                                        {errors.salary && <p className="text-red-600 text-sm">{errors.salary}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                setFormData((prev) => ({ ...prev, department: value }));
                                                setErrors((prev) => ({ ...prev, department: undefined }));
                                            }}
                                            defaultValue={formData.department}
                                            value={formData.department}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept} value={dept}>
                                                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                setFormData((prev) => ({ ...prev, designation: value }));
                                                setErrors((prev) => ({ ...prev, designation: undefined }));
                                            }}
                                            defaultValue={formData.designation}
                                            value={formData.designation}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Designation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["staff", "supervisor", "manager", "admin", "cashier", "tailor", "helper"].map((desig) => (
                                                    <SelectItem key={desig} value={desig}>
                                                        {desig.charAt(0).toUpperCase() + desig.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                setFormData((prev) => ({ ...prev, status: value }));
                                                setErrors((prev) => ({ ...prev, status: undefined }));
                                            }}
                                            defaultValue={formData.status}
                                            value={formData.status}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="imgURL">Image URL</Label>
                                    <Input
                                        id="imgURL"
                                        name="imgURL"
                                        value={formData.imgURL}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData((prev) => ({ ...prev, imgURL: val }));
                                        }}
                                    />
                                </div>

                                {/* Image preview */}
                                {formData.imgURL && (
                                    <div className="mt-2">
                                        <Label>Preview</Label>
                                        <div className="mt-1 w-40 h-40 border rounded-md overflow-hidden bg-white">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={formData.imgURL}
                                                alt="employee"
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                            />
                                        </div>
                                    </div>
                                )}


                            </div>


                            {/* Right Column: live employees list */}
                            <div className="space-y-4">
                                <div className="flex flex-col items-start h-full border border-dashed border-blue-200 bg-gray-50 rounded-lg p-3">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Employees</h2>
                                    <div className="w-full max-h-80 overflow-y-auto">
                                        {employeesList.length === 0 ? (
                                            <div className="text-sm text-gray-500">No employees found.</div>
                                        ) : (
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-xs text-gray-600">
                                                        <th className="pb-2">ID</th>
                                                        <th className="pb-2">Name</th>
                                                        <th className="pb-2">Telephone</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {employeesList.map((emp) => (
                                                        <tr key={emp.employeeId} className="py-1">
                                                            <td className="py-2">{emp.employeeId}</td>
                                                            <td className="py-2">{(emp.firstName || '') + ' ' + (emp.lastName || '')}</td>
                                                            <td className="py-2">{emp.telephone1 || emp.telephone2 || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
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
                        </div>

                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
                        <Button
                            className={"bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"}
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/dashboard/employeelist")}
                        >
                            Cancel
                        </Button>
                        <Button className={"bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"} type="submit" disabled={isSubmitting}>
                            {
                                isSubmitting ? "Adding..." : "Add Employee"
                            }
                        </Button>
                    </CardFooter>
                </form>
            </Card >
        </div >
    )
}