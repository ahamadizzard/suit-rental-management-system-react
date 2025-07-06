// "use client"
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
// import * as Combobox from "@diceui/combobox";
import {
    Combobox,
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxGroupLabel,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxSeparator,
    ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

export default function SalesInvoicePage() {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [items, setItems] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedItem, setSelectedItem] = useState('')
    const [selectedItemCode, setSelectedItemCode] = useState('');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alteration, setAlteration] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [lastAddedItemCode, setLastAddedItemCode] = useState(null);

    const [invoiceNumber, setInvoiceNumber] = useState('')

    const amountInputRef = useRef(null);
    const saveButtonRef = useRef(null);

    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const userName = localStorage.getItem('userFirstName')

    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('')

    const [showRemoveDialog, setShowRemoveDialog] = useState({ open: false, itemCode: null });
    const [bookingStatus, setBookingStatus] = useState('Pending');



    // Keyboard shortcuts: Ctrl+S to save, Esc to close dialog
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                if (saveButtonRef.current) saveButtonRef.current.click();
            }
            if (e.key === 'Escape' && showRemoveDialog.open) {
                cancelRemoveItem();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showRemoveDialog]);

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            customerId: '',
            customerName: '',
            customerAddress: '',
            customerTel1: '',
            customerTel2: '',
            deliveryDate: new Date().toISOString().split('T')[0],
            returnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            totalAmount: 0,
            totalDiscount: 0,
            netTotal: 0,
            payment1: 0,
            payment2: 0,
            payment3: 0,
            advancePaid: 0,
            balanceAmount: 0,
            depositTaken: '',
            depositAmount: 0,
            nic1: '',
            nic2: '',
            remarks: ''
        }
    })

    // ---

    // Calculate totals automatically
    useEffect(() => {
        const subtotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const discount = watch('totalDiscount') || 0;
        const netTotal = subtotal - discount;
        setValue('totalAmount', subtotal);
        setValue('netTotal', netTotal);
        setValue('balanceAmount', netTotal - (watch('advancePaid') || 0));
    }, [selectedItems, watch('totalDiscount'), watch('advancePaid')]);

    function generateInvoiceNumber() {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}${month}${day}${hours}${minutes}`;
    }
    useEffect(() => {
        setInvoiceNumber(generateInvoiceNumber());
    }, []);

    // Load groups
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/groupmaster')
                setGroups(response.data)
            } catch (error) {
                console.error('Error fetching groups:', error)
            }
        }
        fetchGroups()
    }, [])

    //load customers
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers')
                setCustomers(response.data)
            } catch (error) {
                console.error('Error fetching customers:', error)
            }
        }
        fetchCustomers()
    }, [])

    // Load items when group is selected
    useEffect(() => {
        if (selectedGroup) {
            const fetchItems = async () => {
                try {
                    setLoading(true)
                    const response = await axios.get(import.meta.env.VITE_API_BASE_URL + `/api/itemmaster/group/${selectedGroup}`)
                    setItems(response.data)
                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching items:', error)
                    setLoading(false)
                }
            }
            fetchItems()
        }
    }, [selectedGroup])

    // // Load customer details when ID changes
    // useEffect(() => {
    //     const customerId = watch('customerId')
    //     if (customerId && customerId.length > 0) {
    //         const fetchCustomer = async () => {
    //             try {
    //                 const response = await axios.get(`/api/customers/${customerId}`)
    //                 setCustomers(response.data)
    //                 setValue('customerName', response.data.name)
    //                 setValue('customerAddress', response.data.address)
    //                 setValue('customerTel1', response.data.phone1)
    //                 setValue('customerTel2', response.data.phone2)
    //             } catch (error) {
    //                 console.error('Error fetching customer:', error)
    //             }
    //         }
    //         fetchCustomer()
    //     }
    // }, [watch('customerId')])

    // Handle item selection
    const handleItemSelect = (item) => {
        const existingItem = selectedItems.find(i => i.itemCode === item.itemCode)

        if (!existingItem) {
            setSelectedItems([...selectedItems, {
                ...item,
                amount: item.itemPrice,
                deliveryDate: watch('deliveryDate'),
                returnDate: watch('returnDate'),
                alterations: '',
                isCompleted: false
            }])
        }
        calculateTotals()
    }

    // handle customer combobox select
    const handleCustomerSelect = (customerId) => {
        // check if the customer is blocked
        setSelectedCustomer(customerId); // set combobox value
        const selectedCustomerObj = customers.find(customer => customer.customerId === customerId);
        if (selectedCustomerObj?.isBlocked) {
            toast.error('This customer is blocked. Please select another customer.');
            setSelectedCustomer(''); // Clear selection
            setValue('customerId', '');
            setValue('customerName', '');
            setValue('customerAddress', '');
            setValue('customerTel1', '');
            setValue('customerTel2', '');
            setTimeout(() => {
                const combo = document.querySelector('input[placeholder="Customer..."]');
                if (combo) combo.value = '';
                if (combo) combo.focus();
            }, 100);
            return;
        } else {
            setSelectedCustomer(selectedCustomerObj); // set combobox value
            // setValue('customerId', selectedCustomerObj?.customerId || '');
            setValue('customerName', selectedCustomerObj?.customerName || '');
            setValue('customerAddress', selectedCustomerObj?.customerAddress || '');
            setValue('customerTel1', selectedCustomerObj?.customerTel1 || '');
            setValue('customerTel2', selectedCustomerObj?.customerTel2 || '');
            // setTimeout(() => {
            //     if (itemInputRef.current) itemInputRef.current.focus();
            // }, 300);
        }
    };


    // Handle Item Selection in the combobox
    const handleComboBoxItemSelect = (itemCode) => {
        setSelectedItem(itemCode); // set combobox value
        const selectedItemObj = items.find(item => item.itemCode === itemCode);
        setSelectedItemDetails(selectedItemObj);
        setItemPrice(selectedItemObj?.itemPrice || '');
        setAlteration('');
        setTimeout(() => {
            if (amountInputRef.current) amountInputRef.current.focus();
        }, 300);
    };

    // Add selected item to table with alteration and price
    const handleAddToTable = () => {
        if (!selectedItemDetails) return;
        if (!itemPrice || parseFloat(itemPrice) <= 0) {
            alert('Please enter a valid price.');
            return;
        }
        if (selectedItems.find(i => i.itemCode === selectedItemDetails.itemCode)) {
            alert('This item is already added.');
            return;
        }
        setSelectedItems([
            ...selectedItems,
            {
                ...selectedItemDetails,
                amount: parseFloat(itemPrice),
                alteration: alteration || '',
                group: selectedGroup,
                deliveryDate: watch('deliveryDate'),
                returnDate: watch('returnDate'),
                isCompleted: false
            }
        ]);
        setLastAddedItemCode(selectedItemDetails.itemCode);
        setSelectedItemDetails(null);
        setItemPrice('');
        setAlteration('');
        setSelectedItem(''); // Clear combobox value so all items show again
        // Focus back to item combobox for fast entry
        setTimeout(() => {
            const combo = document.querySelector('input[placeholder="Item..."]');
            if (combo) combo.value = '';
            if (combo) combo.focus();
        }, 100);
    };

    // Add item on Enter in amount box
    const handleAmountKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddToTable();
            e.preventDefault();
        }
    };

    // Remove item with confirmation dialog
    const handleRemoveItem = (itemCode) => {
        setShowRemoveDialog({ open: true, itemCode });
        setTimeout(() => {
            const yesBtn = document.getElementById('remove-dialog-yes');
            if (yesBtn) yesBtn.focus();
        }, 100);
    };
    const confirmRemoveItem = () => {
        setSelectedItems(selectedItems.filter(item => item.itemCode !== showRemoveDialog.itemCode));
        setShowRemoveDialog({ open: false, itemCode: null });
    };
    const cancelRemoveItem = () => {
        setShowRemoveDialog({ open: false, itemCode: null });
    };

    // Handle price change
    const handlePriceChange = (itemCode, newPrice) => {
        setSelectedItems(selectedItems.map(item =>
            item.itemCode === itemCode ? { ...item, amount: newPrice } : item
        ));
    };

    // Handle date changes for all items
    const handleDateChange = (field, value) => {
        setSelectedItems(selectedItems.map(item => ({
            ...item,
            [field]: value
        })))
    }

    // Form submission
    const onSubmit = async (data) => {
        if (!data.customerId || selectedItems.length === 0) {
            alert('Please select a customer and add at least one item.');
            return;
        }
        setSaving(true);
        try {
            // 1. Save invoice (without items array)
            const invoiceData = {
                ...data,
                invoiceNo: invoiceNumber,
                invoiceDate: new Date(),
                bookingStatus,
                createdOn: new Date(),
                modifiedOn: new Date()
            };
            await axios.post('/api/invoices', invoiceData);

            // 2. Save each item to bookingMaster (batch or one by one)
            const bookingEntries = selectedItems.map(item => ({
                invoiceNo: invoiceNumber,
                itemCode: item.itemCode,
                group: item.group,
                alteration: item.alteration,
                amount: item.amount,
                deliveryDate: item.deliveryDate,
                returnDate: item.returnDate,
                bookingStatus,
                customerId: data.customerId,
                createdOn: new Date(),
                modifiedOn: new Date()
            }));
            // Try batch endpoint first, fallback to one-by-one if needed
            try {
                await axios.post('/api/bookingmaster/batch', bookingEntries);
            } catch (err) {
                // fallback to one by one if batch fails
                await Promise.all(bookingEntries.map(entry => axios.post('/api/bookingmaster', entry)));
            }

            // 3. Save daily transaction (optional)
            await axios.post('/api/dailytransactions', {
                date: new Date(),
                type: 'RENT_BOOKING',
                invoiceNo: invoiceNumber,
                amount: data.netTotal,
                customerId: data.customerId,
                remarks: data.remarks || '',
                createdOn: new Date()
            });

            toast.success('Invoice, bookings, and daily transaction saved successfully!');
            // Reset form and items
            setSelectedItems([]);
            setInvoiceNumber(generateInvoiceNumber());
            setValue('customerId', '');
            setValue('customerName', '');
            setValue('customerAddress', '');
            setValue('customerTel1', '');
            setValue('customerTel2', '');
            setValue('nic1', '');
            setValue('nic2', '');
            setValue('remarks', '');
            setValue('totalDiscount', 0);
            setValue('advancePaid', 0);
            setValue('depositAmount', 0);
            setBookingStatus('Pending');
        } catch (error) {
            console.error('Error saving invoice or bookings:', error);
            alert('Failed to save invoice or bookings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-2">
            {/* Enhanced Header */}
            <div className="mb-2">
                <Card className="shadow-lg border-2 border-blue-300 bg-gradient-to-r from-blue-200 to-blue-50">
                    <div className="flex flex-row items-center justify-between px-8 py-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-extrabold text-blue-900 tracking-wide drop-shadow">Blazer Hub <span className="text-blue-600">Rental</span></span>
                            <span className="text-xs text-blue-700 font-semibold">Fast, Reliable, and Easy Suit Rental</span>
                        </div>
                        <div className="flex flex-row gap-6 items-center">
                            <span className="text-base font-semibold text-blue-900">Invoice #</span>
                            <Badge variant="default" className="text-lg px-3 py-1 bg-blue-700 text-white">{invoiceNumber}</Badge>
                            <span className="text-base font-semibold text-blue-900">User</span>
                            <Badge variant="destructive" className="text-lg px-3 py-1 bg-red-600 text-white">{userName}</Badge>
                            <span className="text-base font-semibold text-blue-900">Items</span>
                            <Badge className="text-lg px-3 py-1 bg-blue-400 text-white">{selectedItems.length}</Badge>
                            <span className="text-base font-semibold text-blue-900">Total</span>
                            <Badge className="text-lg px-3 py-1 bg-green-500 text-white">{selectedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}</Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content: 2 columns */}
            <div className="flex flex-row gap-6 w-full">
                {/* Left: Item selection and table */}
                <div className="flex-1 min-w-[420px] max-w-[750px]">
                    <Card className="mb-2 border-blue-200">
                        <CardHeader className="py-2 px-4 bg-blue-100 border-b border-blue-200">
                            <CardTitle className="text-base text-blue-900 font-bold">Item Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <div className="flex flex-wrap items-end gap-2">
                                {/* Group Select */}
                                <div className="w-[120px]">
                                    <Label className="text-xs">Group</Label>
                                    <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                                        <SelectTrigger className="h-7 text-xs">
                                            <SelectValue placeholder="Group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group.groupId} value={group.groupShortName}>
                                                    {group.groupShortName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Item Combobox */}
                                <div className="w-[160px]">
                                    <Label className="text-xs">Item</Label>
                                    <Combobox value={selectedItem} onValueChange={handleComboBoxItemSelect}>
                                        <ComboboxAnchor>
                                            <ComboboxInput placeholder="Item..." className="h-7 text-xs" />
                                            <ComboboxTrigger>
                                                <ChevronDown className="h-3 w-3" />
                                            </ComboboxTrigger>
                                        </ComboboxAnchor>
                                        <ComboboxContent>
                                            <ComboboxEmpty>No items</ComboboxEmpty>
                                            {items.map((item) => (
                                                <ComboboxItem key={item.itemCode} value={item.itemCode}>
                                                    {item.itemCode} - {item.itemShortDesc}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxContent>
                                    </Combobox>
                                </div>
                                {/* Item Name */}
                                <div className="w-[100px]">
                                    <Label className="text-xs">Name</Label>
                                    <div className="h-7 flex items-center px-2 text-xs border rounded bg-muted/50">
                                        <span className="truncate">{selectedItemDetails?.itemShortDesc || '-'}</span>
                                    </div>
                                </div>
                                {/* Item Size */}
                                <div className="w-[60px]">
                                    <Label className="text-xs">Size</Label>
                                    <div className="h-7 flex items-center px-2 text-xs border rounded bg-muted/50">
                                        {selectedItemDetails?.itemSize || '-'}
                                    </div>
                                </div>
                                {/* Alteration */}
                                <div className="w-[80px]">
                                    <Label className="text-xs">Alteration</Label>
                                    <Input
                                        className="h-7 text-xs"
                                        name="alteration"
                                        value={alteration || ''}
                                        onChange={(e) => setAlteration(e.target.value)}
                                    />
                                </div>
                                {/* Item Price */}
                                <div className="w-[80px]">
                                    <Label className="text-xs">Price</Label>
                                    <Input
                                        className="h-7 text-xs"
                                        name="itemPrice"
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(e.target.value)}
                                        onKeyDown={handleAmountKeyDown}
                                        ref={amountInputRef}
                                    />
                                </div>
                                {/* add to table button comes here */}
                                <div>
                                    <Button className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700 shadow" onClick={handleAddToTable} tabIndex={0}>
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Items Table */}
                    <div className="border rounded-lg bg-white overflow-x-auto max-h-[340px]">
                        <Table className="text-xs">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alter</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Amt</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <TableRow
                                            key={item.itemCode}
                                            className={
                                                (item.itemCode === lastAddedItemCode ? 'bg-green-100 ' : '') +
                                                'hover:bg-blue-50 focus-within:bg-blue-200 transition-colors duration-100'
                                            }
                                            tabIndex={0}
                                        >
                                            <TableCell>{item.alteration || '-'}</TableCell>
                                            <TableCell>{item.group || selectedGroup}</TableCell>
                                            <TableCell>{item.itemCode}</TableCell>
                                            <TableCell>{item.itemShortDesc}</TableCell>
                                            <TableCell>{item.itemSize}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.amount}
                                                    min={1}
                                                    onChange={e => handlePriceChange(item.itemCode, parseFloat(e.target.value))}
                                                    className="w-16 h-7 text-xs"
                                                    tabIndex={0}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="destructive" size="sm" className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => handleRemoveItem(item.itemCode)} tabIndex={0}>
                                                    Remove
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No items</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Remove confirmation dialog */}
                        {showRemoveDialog.open && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-white p-8 rounded-lg shadow-2xl border-2 border-red-400 animate-fade-in">
                                    <div className="mb-4 text-lg font-semibold text-red-700">Are you sure you want to remove this item?</div>
                                    <div className="flex gap-4 justify-end">
                                        <Button id="remove-dialog-yes" variant="destructive" className="bg-red-700 hover:bg-red-800 text-white" onClick={confirmRemoveItem} tabIndex={0}>Yes, Remove</Button>
                                        <Button variant="outline" className="border-blue-400" onClick={cancelRemoveItem} tabIndex={0}>Cancel</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Right: Customer, Dates, Payment */}
                <div className="flex-1 min-w-[340px] max-w-[700px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Customer & Dates Card */}
                            <Card className="mb-2 border border-blue-200 bg-white/80 shadow-sm">
                                <CardHeader className="py-2 px-4 bg-blue-100 border-b border-blue-200">
                                    <CardTitle className="text-base text-blue-900 font-bold">Customer & Dates</CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="w-[160px]">
                                            <Label className="text-xs">Customer List</Label>
                                            <Combobox value={selectedCustomer} onValueChange={handleCustomerSelect} >

                                                <ComboboxAnchor>
                                                    <ComboboxInput placeholder="Customer..." className="h-7 text-xs" />
                                                    <ComboboxTrigger>
                                                        <ChevronDown className="h-3 w-3" />
                                                    </ComboboxTrigger>
                                                </ComboboxAnchor>
                                                <ComboboxContent>
                                                    <ComboboxEmpty>No customers</ComboboxEmpty>
                                                    {customers.map((customer) => (
                                                        <ComboboxItem key={customer.customerId} value={customer.customerId}>
                                                            {customer.customerId} - {customer.customerName}
                                                        </ComboboxItem>
                                                    ))}
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                        {/* <div>
                                            <Label htmlFor="customerId" className="text-xs">Customer ID</Label>
                                            <Input id="customerId" {...register('customerId')} className="h-7 text-xs" value="01" autoFocus tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('customerName')?.focus(); } }} />
                                        </div> */}
                                        <div>
                                            <Label htmlFor="customerName" className="text-xs">Name</Label>
                                            <Input id="customerName" {...register('customerName')} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('customerAddress')?.focus(); } }} />
                                        </div>
                                        <div className="col-span-2">
                                            <Label htmlFor="customerAddress" className="text-xs">Address</Label>
                                            <Textarea id="customerAddress" {...register('customerAddress')} className="text-xs min-h-[32px]" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('customerTel1')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="customerTel1" className="text-xs">Tel 1</Label>
                                            <Input id="customerTel1" {...register('customerTel1')} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('customerTel2')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="customerTel2" className="text-xs">Tel 2</Label>
                                            <Input id="customerTel2" {...register('customerTel2')} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nic1')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="nic1" className="text-xs">NIC 1</Label>
                                            <Input id="nic1" {...register('nic1')} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('nic2')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="nic2" className="text-xs">NIC 2</Label>
                                            <Input id="nic2" {...register('nic2')} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('deliveryDate')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="deliveryDate" className="text-xs">Delivery</Label>
                                            <Input
                                                type="date"
                                                id="deliveryDate"
                                                {...register('deliveryDate')}
                                                className="h-7 text-xs"
                                                tabIndex={0}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('returnDate')?.focus(); } }}
                                                onChange={(e) => {
                                                    setValue('deliveryDate', e.target.value)
                                                    handleDateChange('deliveryDate', e.target.value)
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="returnDate" className="text-xs">Return</Label>
                                            <Input
                                                type="date"
                                                id="returnDate"
                                                {...register('returnDate')}
                                                className="h-7 text-xs"
                                                tabIndex={0}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('totalDiscount')?.focus(); } }}
                                                onChange={(e) => {
                                                    setValue('returnDate', e.target.value)
                                                    handleDateChange('returnDate', e.target.value)
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Payment Card */}
                            <Card className="mb-2 border border-blue-200 bg-white/80 shadow-sm">
                                <CardHeader className="py-2 px-4 bg-blue-100 border-b border-blue-200">
                                    <CardTitle className="text-base text-blue-900 font-bold">Payment</CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label htmlFor="totalAmount" className="text-xs">Total</Label>
                                            <Input id="totalAmount" type="number" readOnly {...register('totalAmount', { valueAsNumber: true })} className="h-7 text-xs bg-gray-100" tabIndex={0} />
                                        </div>
                                        <div>
                                            <Label htmlFor="totalDiscount" className="text-xs">Discount</Label>
                                            <Input id="totalDiscount" type="number" {...register('totalDiscount', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('advancePaid')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="netTotal" className="text-xs">Net</Label>
                                            <Input id="netTotal" type="number" readOnly {...register('netTotal', { valueAsNumber: true })} className="h-7 text-xs bg-gray-100" tabIndex={0} />
                                        </div>
                                        <div>
                                            <Label htmlFor="advancePaid" className="text-xs">Advance</Label>
                                            <Input id="advancePaid" type="number" {...register('advancePaid', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('depositAmount')?.focus(); } }} />
                                        </div>
                                        <div>
                                            <Label htmlFor="balanceAmount" className="text-xs">Balance</Label>
                                            <Input id="balanceAmount" type="number" readOnly {...register('balanceAmount', { valueAsNumber: true })} className="h-7 text-xs bg-gray-100" tabIndex={0} />
                                        </div>
                                        <div>
                                            <Label htmlFor="depositAmount" className="text-xs">Deposit</Label>
                                            <Input id="depositAmount" type="number" {...register('depositAmount', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('remarks')?.focus(); } }} />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Label htmlFor="remarks" className="text-xs">Remarks</Label>
                                        <Textarea id="remarks" {...register('remarks')} className="text-xs min-h-[32px]" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('bookingStatus')?.focus(); } }} />
                                    </div>
                                    <div className="mt-2">
                                        <Label htmlFor="bookingStatus" className="text-xs">Booking Status</Label>
                                        <Select id="bookingStatus" value={bookingStatus} onValueChange={setBookingStatus}>
                                            <SelectTrigger className="h-7 text-xs" tabIndex={0}>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                ref={saveButtonRef}
                                disabled={selectedItems.length === 0 || saving}
                                className="h-8 px-6 text-base bg-green-600 hover:bg-green-700 text-white font-bold border border-green-700 shadow"
                                tabIndex={0}
                                aria-label="Save Invoice (Ctrl+S)"
                            >
                                {saving ? 'Saving...' : 'Save Invoice'}
                            </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 text-right">Tip: Use <span className="font-semibold">Tab</span> to move, <span className="font-semibold">Enter</span> to add, <span className="font-semibold">Ctrl+S</span> to save, <span className="font-semibold">Esc</span> to close dialogs.</div>
                    </form>
                </div>
            </div>
        </div>
    )
}