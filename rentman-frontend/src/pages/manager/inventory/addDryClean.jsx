import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import moment from 'moment';

export default function AddDryClean() {
    // Form and state
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [itemGroups, setItemGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [selectedItems, setSelectedItems] = useState([])
    const [itemBookingInfo, setItemBookingInfo] = useState(null);
    const [showBookingConflict, setShowBookingConflict] = useState(false);
    const [pendingItemToAdd, setPendingItemToAdd] = useState(null);
    const [lastAddedItemCode, setLastAddedItemCode] = useState(null);
    const [itemRentCount, setItemRentCount] = useState("");
    const [previousDryCleans, setPreviousDryCleans] = useState([]);
    const [grid, setGrid] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const itemCodeRef = useRef(null);
    const groupRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch item groups on mount
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/groupmaster`)
            .then(res => setItemGroups(res.data))
            .catch(() => setItemGroups([]));
    }, []);

    // Fetch items when group changes
    useEffect(() => {
        if (!selectedGroup) return;
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/group/${selectedGroup}`)
            .then(res => setItems(res.data))
            .catch(() => setItems([]));
    }, [selectedGroup]);

    // Fetch previous dry clean details when item changes
    useEffect(() => {
        if (!selectedItem) return;
        const fetchPreviousDryCleans = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dryclean/dryclean/${selectedItem}`);
                setPreviousDryCleans(res.data);
            } catch (error) {
                setPreviousDryCleans([]);
            }
        }
        fetchPreviousDryCleans();

        const fetchItemRentCount = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${selectedItem}`);
                setItemRentCount(res.data || "");
            } catch {
                setItemRentCount("");
            }
        }
        fetchItemRentCount();
    }, [selectedItem]);

    function generateDrycleanId() {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `DRC${year}${month}${day}`;
    }

    const handleAddToTable = () => {
        if (!selectedItem || !selectedGroup) return;
        // Prevent adding duplicates
        if (selectedItems.find(i => i.itemCode === selectedItem)) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Item',
                text: 'This item is already added.',
            });
            //
            // alert('This item is already added.');
            return;
        }
        // If there are bookings, show SweetAlert2 modal with booking info and ask for confirmation
        if (itemBookingInfo && Array.isArray(itemBookingInfo) && itemBookingInfo.length > 0) {
            let bookingHtml = '<div style="text-align:left">';
            itemBookingInfo.forEach(booking => {
                bookingHtml += `<div style='margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee;'>` +
                    `<b>Item Code:</b> ${booking.itemCode}<br/>` +
                    `<b>Invoice #:</b> ${booking.invoiceNo}<br/>` +
                    `<b>Name:</b> ${booking.itemShortDesc || '-'}<br/>` +
                    `<b>Size:</b> ${booking.itemSize || '-'}<br/>` +
                    `<b>Delivery:</b> ${booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString() : '-'}<br/>` +
                    `<b>Return:</b> ${booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : '-'}<br/>` +
                    `</div>`;
            });
            bookingHtml += '</div>';
            Swal.fire({
                title: 'This item is already booked!',
                html: bookingHtml + '<br/><b>Do you want to add this item anyway?</b>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Add Anyway',
                cancelButtonText: 'Cancel',
                width: 500,
            }).then(result => {
                if (result.isConfirmed) {
                    setSelectedItems([
                        ...selectedItems,
                        {
                            drycleanId: generateDrycleanId(),
                            drycleanDate: date,
                            itemGroupShortDesc: selectedGroup,
                            itemCode: selectedItem,
                            itemShortDesc: itemRentCount.itemShortDesc || 'N/A',
                            itemSize: itemRentCount.itemSize || 'N/A',
                            itemRentCount: itemRentCount.itemRentCount || 0,
                        }
                    ]);
                    setLastAddedItemCode(selectedItem);
                    setSelectedGroup("");
                    setSelectedItem("");
                    setItemRentCount("");
                    if (groupRef.current) groupRef.current.focus();
                }
            });
            return;
        }
        // Add item to table
        setSelectedItems([
            ...selectedItems,
            {
                drycleanId: generateDrycleanId(),
                drycleanDate: date,
                itemGroupShortDesc: selectedGroup,
                itemCode: selectedItem,
                itemShortDesc: itemRentCount.itemShortDesc || 'N/A',
                itemSize: itemRentCount.itemSize || 'N/A',
                itemRentCount: itemRentCount.itemRentCount || 0,
            }
        ]);
        setLastAddedItemCode(selectedItem);
        // Clear controls
        setSelectedGroup("");
        setSelectedItem("");
        setItemRentCount("");
        // Focus back to group select for fast entry
        if (groupRef.current) groupRef.current.focus();
    };
    // Handle adding item to grid
    const handleAddItem = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!selectedGroup || !selectedItem) {
            setError("Select group and item.");
            return;
        }
        // Check duplicate in grid
        if (grid.some(row => row.itemCode === selectedItem)) {
            setError("Item already added in this invoice.");
            return;
        }
        // Check booking in salesInvoiceDetails
        try {
            const bookingRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/item/${selectedItem}`);
            if (!bookingRes.data || bookingRes.data.length === 0) {
                setError("No booking found for this item.");
                return;
            }
        } catch {
            setError("Booking check failed.");
            return;
        }


        console.log("Dry Clean Id: ", generateDrycleanId())
        // Add to grid
        setGrid(prev => [...prev, {
            drycleanId: generateDrycleanId(),
            drycleanDate: date,
            itemGroupShortDesc: selectedGroup,
            itemCode: selectedItem,
            itemShortDesc: itemRentCount.itemShortDesc || 'N/A',
            itemSize: selectedItem.itemSize || 'N/A',
            itemRentCount: itemRentCount.itemRentCount || 0,
        }]);
        setSelectedItem("");
        setItemRentCount("");
        itemCodeRef.current && itemCodeRef.current.focus();
        groupRef.current && groupRef.current.focus();
    };

    // Save all dry clean entries
    const handleSaveAll = async () => {
        setError("");
        setSuccess("");
        if (selectedItems.length === 0) {
            setError("No items to save.");
            return;
        }
        try {
            console.log("Selected Items: ", selectedItems);
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/dryclean/dryclean/bulk`, { items: selectedItems });
            setSuccess(response.data.message || "All dry clean details saved.");
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message || "All dry clean details saved.",
            });
            setSelectedItems([]);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save dry clean details.");
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || "Failed to save dry clean details.",
            });
        }
    };

    // Handler to delete item from selectedItems
    const handleDeleteItem = (itemCode) => {
        setSelectedItems(selectedItems.filter(item => item.itemCode !== itemCode));
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen ">
            <Card>
                <CardHeader className="h-[70px] bg-blue-300 text-white flex justify-between items-center mb-2 pt-1 px-4">
                    <CardTitle className="text-2xl font-bold">Add new dry clean details</CardTitle>
                    <div className="flex flex-row gap-4 items-center">
                        <label>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1 w-full" />
                    </div>
                    <Link
                        to="/dashboard/dryclean"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <FaEye className="mr-2 cursor-pointer" /> View Dry Clean List
                    </Link>
                </CardHeader>
            </Card>
            <Separator className="" />

            {/* <div className="flex gap-6"> */}
            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* Left: Form */}
                <div className="w-1/2 p-4 bg-white rounded-lg shadow mt-7">
                    {/* <h2 className="text-xl font-bold mb-4">Add Dry Clean Details</h2> */}
                    {/* <form onSubmit={handleAddItem} className="space-y-3"> */}
                    <Card className="mb-2 border-2 border-[#0a174e] shadow-lg bg-gray-100">
                        <CardHeader className="py-1 px-2 border-b-2 flex flex-row justify-center items-center gap-2 bg-gray-400" >
                            <CardTitle className="text-base font-bold tracking-wide text-[#0a174e]" >Item Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 text-sm">
                            {/* group select */}
                            <div className="flex flex-wrap items-end gap-2 mb-2">
                                <div className="flex flex-col" >
                                    <label className="font-semibold">Item Group</label>
                                    <select ref={groupRef} value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="border rounded px-2 py-1 w-[120px]">
                                        <option value="">Select group</option>
                                        {itemGroups.map(g => <option key={g._id} value={g.groupShortName}>{g.groupShortName}</option>)}
                                    </select>
                                </div>
                                {/* itemcode select */}
                                <div className="flex flex-col" >
                                    <label className="font-semibold">Item Code</label>
                                    <input ref={itemCodeRef} list="itemCodes" value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="border rounded px-2 py-1 w-[100px]" />
                                    <datalist id="itemCodes">
                                        {items.map(i => <option key={i.itemCode} value={i.itemCode}>{i.itemShortName}</option>)}
                                    </datalist>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold">Short Description</label>
                                    <input type="text" value={itemRentCount.itemShortDesc ? itemRentCount.itemShortDesc : "N/A"} readOnly className="border rounded px-2 py-1 w-[150px] text-right bg-gray-100" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold">Size</label>
                                    <input type="text" value={itemRentCount.itemSize ? itemRentCount.itemSize : "N/A"} readOnly className="border rounded px-2 py-1 w-[100px] text-right bg-gray-100" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold">Rent Count</label>
                                    <input type="text" value={itemRentCount.itemRentCount ? itemRentCount.itemRentCount : "0"} readOnly className="border rounded px-2 py-1 w-[100px] text-right bg-gray-100" />
                                </div>
                                <div className="flex flex-col ml-4">
                                    <Button className="border rounded-xl px-2 py-1 w-[80px] text-right bg-blue-600" onClick={handleAddToTable} tabIndex={0}>
                                        Add
                                    </Button>
                                </div>

                                {/* {error && <div className="text-red-600 mt-2">{error}</div>} */}
                                {/* {success && <div className="text-green-600 mt-2">{success}</div>} */}
                            </div>
                        </CardContent>
                    </Card>
                    {/* Items Table */}
                    <div className="border-2 border-[#0a174e] rounded-xl bg-white/95 overflow-x-auto max-h-[340px] shadow-md mb-3">
                        <Table className="text-sm">
                            <TableHeader className="bg-gray-400 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="text-[#0a174e] font-bold">Group</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Item Code</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Short Description</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Item Size</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Rent Count</TableHead>
                                    <TableHead className="text-[#d7263d] font-bold">Delete</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <TableRow
                                            key={item.itemCode + '-' + idx}
                                            className={
                                                (item.itemCode === lastAddedItemCode ? 'bg-gradient-to-r from-green-100 to-green-50 ' : '') +
                                                'hover:bg-gradient-to-r hover:from-[#e5e9f7] hover:to-[#f5f7fa] focus-within:bg-blue-100 transition-colors duration-100'
                                            }
                                            tabIndex={0}
                                        >
                                            <TableCell>{item.itemGroupShortDesc || '-'}</TableCell>
                                            <TableCell>{item.itemCode || '-'}</TableCell>
                                            <TableCell>{item.itemShortDesc}</TableCell>
                                            <TableCell>{item.itemSize}</TableCell>
                                            <TableCell>{item.itemRentCount}</TableCell>
                                            <TableCell>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.itemCode)}>
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-[#0a174e]">No items</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* </form> */}


                    </div>



                </div>
                {/* right form */}
                <div className="w-1/2 p-4 bg-white rounded-lg shadow mt-7">
                    {/* Right: Previous dry clean details and grid */}
                    <div className="w-1/2 p-2">
                        <h3 className="font-bold mb-2 text-center text-blue-800">Previous Dry Clean Details</h3>
                        {/* <ul className="mb-4 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                            {previousDryCleans.length === 0 ? <li>No previous records.</li> : previousDryCleans.map((d, idx) => (
                                <li key={idx}>{d.drycleanDate?.slice(0, 10)} - {d.itemCode} ({d.itemShortDesc})- {d.itemSize} - {d.itemRentCount}</li>
                            ))}
                        </ul> */}
                        {/* <h3 className="font-bold mb-2">Current Invoice Items</h3> */}
                        <table className="w-[730px] border">
                            <thead>
                                <tr className="bg-gray-100 border-2">
                                    <th className="w-[120px] border-2">Date</th>
                                    <th className="w-[120px] border-2">Group</th>
                                    <th className="w-[120px] border-2">Item Code</th>
                                    <th className="w-[120px] border-2">Short Desc</th>
                                    <th className="w-[120px] border-2">Item Size</th>
                                    <th className="w-[120px] border-2">Rent Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previousDryCleans.map((row, idx) => (
                                    <tr key={idx} className="border-2 hover:bg-gray-100">
                                        <td className="text-right border-2">{row.drycleanDate ? moment(row.drycleanDate).format("DD-MMM-YYYY") : "N/A"}</td>
                                        <td className="text-right border-2">{row.itemGroupShortDesc}</td>
                                        <td className="text-right border-2">{row.itemCode}</td>
                                        <td className="text-right border-2">{row.itemShortDesc}</td>
                                        <td className="text-right border-2">{row.itemSize}</td>
                                        <td className="text-right border-2">{row.itemRentCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
            <div className="flex justify-end">
                <button
                    // onClick={handleSaveAll}                
                    onClick={() => {
                        if (selectedItems.length === 0) {
                            Swal.fire({
                                icon: 'warning',
                                title: 'No items to save',
                            });
                            return;
                        }
                        Swal.fire({
                            title: 'Are you sure?',
                            text: "YAre you sure you want to save this dry clean details",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                        }
                        ).then((result) => {
                            if (result.isConfirmed) {
                                handleSaveAll();
                            }
                        })
                    }
                    }
                    disabled={isLoading}
                    className="mt-4 mr-4 bg-green-600 text-white px-4 py-2 cursor-pointer rounded"
                    title="Save"
                // className="mt-4 mr-4 bg-green-600 text-white px-4 py-2 cursor-pointer rounded"
                >
                    Save All
                </button>
                <button className="mt-4 mr-4 bg-gray-600 text-white px-4 py-2 rounded cursor-pointer">Cancel</button>
            </div>
        </div >
    );
}