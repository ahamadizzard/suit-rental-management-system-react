// "use client"
import { useState, useEffect, useMemo } from 'react'
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

export default function SalesInvoicePage() {
    const [loading, setLoading] = useState(false)

    const [items, setItems] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [selectedItem, setSelectedItem] = useState('')
    const [selectedItemCode, setSelectedItemCode] = useState('');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [alteration, setAlteration] = useState('');
    const [itemPrice, setItemPrice] = useState('');

    const [customer, setCustomer] = useState("01")

    const userName = localStorage.getItem('userFirstName')

    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('')






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

    // const filteredItems = useMemo(() => {
    //     if (!searchTerm) return items;
    //     return items.filter(item =>
    //         item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         item.itemShortDesc.toLowerCase().includes(searchTerm.toLowerCase())
    //     );
    // }, [items, searchTerm]);

    // const handleComboBoxItemSelect = (itemCode) => {
    //     const selectedItem = items.find(item => item.itemCode === itemCode);
    //     setSelectedItem(itemCode);
    //     setSelectedItemDetails(selectedItem);
    //     setSearchTerm(''); // Clear search term after selection
    // };

    // const handleKeyDown = (e) => {
    //     if (e.key === 'Enter' && filteredItems.length === 1) {
    //         // If only one item matches after typing, select it on Enter
    //         handleComboBoxItemSelect(filteredItems[0].itemCode);
    //     }
    // };

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = selectedItems.reduce((sum, item) => sum + (item.amount || item.itemPrice), 0)
        const discount = watch('totalDiscount') || 0
        const netTotal = subtotal - discount

        setValue('totalAmount', subtotal)
        setValue('netTotal', netTotal)
        setValue('balanceAmount', netTotal - (watch('advancePaid') || 0))
    }

    // Generate invoice number on component mount
    // useEffect(() => {
    //     const now = new Date()
    //     const day = String(now.getDate()).padStart(2, '0')
    //     const month = String(now.getMonth() + 1).padStart(2, '0')
    //     const year = now.getFullYear()
    //     const hours = String(now.getHours()).padStart(2, '0')
    //     const minutes = String(now.getMinutes()).padStart(2, '0')
    //     setInvoiceNumber(`${day}${month}${year}${hours}${minutes}`)
    // }, [])

    // const [invoiceNumber, setInvoiceNumber] = useState('');


    function generateInvoiceNumber() {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${day}${month}${year}${hours}${minutes}`;
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

    // Load customer details when ID changes
    useEffect(() => {
        const customerId = watch('customerId')
        if (customerId && customerId.length > 0) {
            const fetchCustomer = async () => {
                try {
                    const response = await axios.get(`/api/customers/${customerId}`)
                    setCustomer(response.data)
                    setValue('customerName', response.data.name)
                    setValue('customerAddress', response.data.address)
                    setValue('customerTel1', response.data.phone1)
                    setValue('customerTel2', response.data.phone2)
                } catch (error) {
                    console.error('Error fetching customer:', error)
                }
            }
            fetchCustomer()
        }
    }, [watch('customerId')])

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

    // Handle Item Selection in the combobox
    const handleComboBoxItemSelect = (itemCode) => {
        const selectedItem = items.find(item => item.itemCode === itemCode);
        setSelectedItemDetails(selectedItem);
        setItemPrice(selectedItem?.itemPrice || ''); // Initialize price when item selected
    };

    // add to table button
    const handleAddToTable = () => {
        if (selectedItemDetails) {
            handleItemSelect(selectedItemDetails);
            setSelectedItemDetails(null); // Reset selected item details after adding to table
        }
    }

    // Handle item removal
    const handleRemoveItem = (itemCode) => {
        setSelectedItems(selectedItems.filter(item => item.itemCode !== itemCode))
        calculateTotals()
    }

    // Handle price change
    const handlePriceChange = (itemCode, newPrice) => {
        setSelectedItems(selectedItems.map(item =>
            item.itemCode === itemCode ? { ...item, amount: newPrice } : item
        ))
        calculateTotals()
    }

    // Handle date changes for all items
    const handleDateChange = (field, value) => {
        setSelectedItems(selectedItems.map(item => ({
            ...item,
            [field]: value
        })))
    }

    // Form submission
    const onSubmit = async (data) => {
        try {
            const invoiceData = {
                ...data,
                invoiceNo: invoiceNumber,
                invoiceDate: new Date(),
                items: selectedItems,
                createdOn: new Date(),
                modifiedOn: new Date()
            }

            const response = await axios.post('/api/invoices', invoiceData)
            alert('Invoice saved successfully!')
            // Reset form or redirect as needed
        } catch (error) {
            console.error('Error saving invoice:', error)
            alert('Failed to save invoice')
        }
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">New Sales Invoice</CardTitle>
                    <div className='flex flex-row gap-4'>
                        <div className="text-lg">
                            Invoice #: <Badge variant="default">{invoiceNumber}</Badge>
                        </div>
                        <div className="text-lg">
                            User Name: <Badge variant="destructive">{userName}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Item Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Item Selection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-end gap-4">
                                {/* Group Select */}
                                <div className="w-[200px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Select Group</Label>
                                    <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Select a group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group.groupId} value={group.groupShortName}>
                                                    {group.groupShortName} - {group.groupName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Item Combobox */}
                                <div className="w-[250px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Item Code</Label>
                                    <Combobox value={selectedItem} onValueChange={handleComboBoxItemSelect}>
                                        <ComboboxAnchor>
                                            <ComboboxInput placeholder="Select an Item..." className="h-8" />
                                            <ComboboxTrigger>
                                                <ChevronDown className="h-4 w-4" />
                                            </ComboboxTrigger>
                                        </ComboboxAnchor>
                                        <ComboboxContent>
                                            <ComboboxEmpty>No items found</ComboboxEmpty>
                                            {items.map((item) => (
                                                <ComboboxItem key={item.itemCode} value={item.itemCode}>
                                                    {item.itemCode} - {item.itemShortDesc} - {item.itemSize} - {item.itemPrice}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxContent>
                                    </Combobox>
                                </div>

                                {/* Item Name */}
                                <div className="w-[180px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
                                    <div className="h-8 flex items-center px-3 py-1 text-sm border rounded bg-muted/50">
                                        <span className="truncate">{selectedItemDetails?.itemShortDesc || '-'}</span>
                                    </div>
                                </div>

                                {/* Item Size */}
                                <div className="w-[80px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Item Size</Label>
                                    <div className="h-8 flex items-center px-3 py-1 text-sm border rounded bg-muted/50">
                                        {selectedItemDetails?.itemSize || '-'}
                                    </div>
                                </div>

                                {/* Alteration */}
                                <div className="w-[100px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Alteration</Label>
                                    <Input
                                        className="h-8 text-right"
                                        name="alteration"
                                        value={alteration || ''}
                                        onChange={(e) => setAlteration(e.target.value)}
                                    />
                                </div>

                                {/* Item Price */}
                                <div className="w-[100px] space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Item Price</Label>
                                    <Input
                                        className="h-8"
                                        name="itemPrice"
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(e.target.value)}
                                    />
                                </div>
                                {/* add to table button comes here */}
                                <div>
                                    <Button className="h-8" onClick={handleAddToTable}>Add to Table</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* table section */}
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alterations</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Item Code</TableHead>
                                    <TableHead>Item Description</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* {selectedItemDetails?.map(item => ( */}
                                <TableRow >
                                    <TableCell>{alteration}</TableCell>
                                    <TableCell>{selectedGroup}</TableCell>
                                    <TableCell>{selectedItemDetails?.itemCode}</TableCell>
                                    <TableCell>{selectedItemDetails?.itemShortDesc}</TableCell>
                                    <TableCell>{selectedItemDetails?.itemSize}</TableCell>
                                    <TableCell>{selectedItemDetails?.itemPrice}</TableCell>
                                    <TableCell>
                                        {/* <Button
                                            size="sm"
                                            onClick={() => handleItemSelect(item)}
                                        >
                                            Add
                                        </Button> */}
                                    </TableCell>
                                </TableRow>
                                {/* ))} */}
                            </TableBody>
                        </Table>
                    </div>

                    {/* {loading ? (
                                <div>Loading items...</div>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map(item => (
                                                <TableRow key={item.itemCode}>
                                                    <TableCell>{item.itemCode}</TableCell>
                                                    <TableCell>{item.itemShortDesc}</TableCell>
                                                    <TableCell>{item.itemSize}</TableCell>
                                                    <TableCell>{item.itemPrice.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleItemSelect(item)}
                                                        >
                                                            Add
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )} */}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Customer Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerId">Customer ID</Label>
                                        <Input id="customerId" {...register('customerId')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerName">Name</Label>
                                        <Input id="customerName" {...register('customerName')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerAddress">Address</Label>
                                        <Textarea id="customerAddress" {...register('customerAddress')} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="customerTel1">Telephone 1</Label>
                                            <Input id="customerTel1" {...register('customerTel1')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customerTel2">Telephone 2</Label>
                                            <Input id="customerTel2" {...register('customerTel2')} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nic1">NIC 1</Label>
                                            <Input id="nic1" {...register('nic1')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="nic2">NIC 2</Label>
                                            <Input id="nic2" {...register('nic2')} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Dates</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deliveryDate">Delivery Date</Label>
                                        <Input
                                            type="date"
                                            id="deliveryDate"
                                            {...register('deliveryDate')}
                                            onChange={(e) => {
                                                setValue('deliveryDate', e.target.value)
                                                handleDateChange('deliveryDate', e.target.value)
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="returnDate">Return Date</Label>
                                        <Input
                                            type="date"
                                            id="returnDate"
                                            {...register('returnDate')}
                                            onChange={(e) => {
                                                setValue('returnDate', e.target.value)
                                                handleDateChange('returnDate', e.target.value)
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Item Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Item Selection</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Group</Label>
                                    <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group.groupId} value={group.groupShortName}>
                                                    {group.groupShortName} - {group.groupName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {loading ? (
                                    <div>Loading items...</div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map(item => (
                                                    <TableRow key={item.itemCode}>
                                                        <TableCell>{item.itemCode}</TableCell>
                                                        <TableCell>{item.itemShortDesc}</TableCell>
                                                        <TableCell>{item.itemSize}</TableCell>
                                                        <TableCell>{item.itemPrice.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleItemSelect(item)}
                                                            >
                                                                Add
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Selected Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Selected Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedItems.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Code</TableHead>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            {/* <TableBody>
                                                {selectedItems.map(item => (
                                                    <TableRow key={item.itemCode}>
                                                        <TableCell>{item.itemCode}</TableCell>
                                                        <TableCell>{item.itemShortDesc}</TableCell>
                                                        <TableCell>{item.itemSize}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={item.amount}
                                                                onChange={(e) => handlePriceChange(item.itemCode, parseFloat(e.target.value))}
                                                                className="w-24"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(item.itemCode)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody> */}
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">No items selected</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="totalAmount">Total Amount</Label>
                                        <Input
                                            id="totalAmount"
                                            type="number"
                                            readOnly
                                            {...register('totalAmount', { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="totalDiscount">Discount</Label>
                                        <Input
                                            id="totalDiscount"
                                            type="number"
                                            {...register('totalDiscount', {
                                                valueAsNumber: true,
                                                onChange: calculateTotals
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="netTotal">Net Total</Label>
                                        <Input
                                            id="netTotal"
                                            type="number"
                                            readOnly
                                            {...register('netTotal', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="advancePaid">Advance Paid</Label>
                                        <Input
                                            id="advancePaid"
                                            type="number"
                                            {...register('advancePaid', {
                                                valueAsNumber: true,
                                                onChange: calculateTotals
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="balanceAmount">Balance Amount</Label>
                                        <Input
                                            id="balanceAmount"
                                            type="number"
                                            readOnly
                                            {...register('balanceAmount', { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="depositAmount">Deposit Amount</Label>
                                        <Input
                                            id="depositAmount"
                                            type="number"
                                            {...register('depositAmount', { valueAsNumber: true })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea id="remarks" {...register('remarks')} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={selectedItems.length === 0}
                            >
                                Save Invoice
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card >
        </div >
    )
}