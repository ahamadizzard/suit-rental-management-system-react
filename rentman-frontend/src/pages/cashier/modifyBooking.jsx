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
import {
    Combobox,
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronDown, ChevronDownIcon } from "lucide-react";
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import "../../theme.css";
import Swal from 'sweetalert2'
import { Calendar } from '@/components/ui/calendar'
import { DayPicker } from 'react-day-picker'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useParams, useLocation, useNavigate } from 'react-router-dom'

export default function ModifyBooking() {
    const { invoiceNo } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const [items, setItems] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedItem, setSelectedItem] = useState('')
    // const [selectedItemCode, setSelectedItemCode] = useState('');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    // const [searchTerm, setSearchTerm] = useState('');
    const [alteration, setAlteration] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [lastAddedItemCode, setLastAddedItemCode] = useState(null);
    const [searchQuery, setSearchQuery] = useState("")
    const [searchedItems, setSearchedItems] = useState([]);
    const [error, setError] = useState(null);

    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [invoiceDate, setInvoiceDate] = useState('')

    const amountInputRef = useRef(null);
    const saveButtonRef = useRef(null);

    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const userName = localStorage.getItem('userFirstName')

    const [groups, setGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState('')

    const [showRemoveDialog, setShowRemoveDialog] = useState({ open: false, itemCode: null });
    const [invoiceStatus, setInvoiceStatus] = useState('Booked');

    const [itemBookingInfo, setItemBookingInfo] = useState(null);
    const [showBookingConflict, setShowBookingConflict] = useState(false);
    const [pendingItemToAdd, setPendingItemToAdd] = useState(null);

    const [open, setOpen] = useState(false)
    const [date, setDate] = useState(new Date());

    const [lastAdvancePaid, setLastAdvancePaid] = useState(0);

    // const [comboInputValue, setComboInputValue] = useState('');

    // Load invoice data and customers
    const { register, handleSubmit, watch, setValue, getValues, reset } = useForm();
    useEffect(() => {
        setLoading(true);
        async function loadData() {
            try {
                // Load invoice master and details
                console.log("Loading invoiceNo: ", invoiceNo);
                const resMaster = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoice/${encodeURIComponent(invoiceNo)}`);
                const resItems = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/${encodeURIComponent(invoiceNo)}/items`);
                // Load customers and groups
                const cRes = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/customers');
                const gRes = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/groupmaster');
                setCustomers(cRes.data || []);
                setGroups(gRes.data || []);
                // Set form values
                const master = resMaster.data;
                setSelectedCustomer(master.customerId || "");
                setValue('invoiceNo', master.invoiceNo || "");
                setValue('invoiceDate', master.invoiceDate ? master.invoiceDate.split('T')[0] : "");
                setInvoiceNumber(master.invoiceNo || "");
                setInvoiceDate(master.invoiceDate ? master.invoiceDate.split('T')[0] : "");
                setValue('customerId', master.customerId || "");
                setValue('customerName', master.customerName || "");
                setValue('customerAddress', master.customerAddress || "");
                setValue('customerTel1', master.customerTel1 || "");
                setValue('customerTel2', master.customerTel2 || "");
                setValue('nic1', master.nic1 || "");
                setValue('nic2', master.nic2 || "");
                setValue('remarks', master.remarks || "");
                setValue('deliveryDate', master.deliveryDate ? master.deliveryDate.split('T')[0] : "");
                setValue('returnDate', master.returnDate ? master.returnDate.split('T')[0] : "");
                setValue('totalDiscount', master.totalDiscount || 0);
                setValue('payment1', master.payment1 || 0);
                setValue('payment2', master.payment3 || 0);
                setValue('payment3', master.payment2 || 0);
                setValue('advancePaid', master.advancePaid || 0);
                setValue('balanceAmount', master.balanceAmount || 0);
                setValue('depositAmount', master.depositAmount || 0);
                setInvoiceStatus(master.invoiceStatus || 'Booked');
                setDate(master.invoiceDate ? new Date(master.invoiceDate) : new Date());
                setLastAdvancePaid(master.advancePaid || 0);
                // Items
                setSelectedItems(resItems.data || []);
                console.log("Master Data: ", master)
                console.log("Details Data: ", resItems.data)
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [invoiceNo, setValue]);

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

    // const { register, handleSubmit, watch, setValue } = useForm({
    //     defaultValues: {
    //         customerId: '',
    //         invoiceDate: new Date().toISOString().split('T')[0],
    //         customerName: '',
    //         customerAddress: '',
    //         // invoiceDate: "",
    //         customerTel1: '',
    //         customerTel2: '',
    //         deliveryDate: new Date().toISOString().split('T')[0],
    //         returnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    //         totalAmount: 0,
    //         totalDiscount: 0,
    //         netTotal: 0,
    //         payment1: 0,
    //         payment2: 0,
    //         payment3: 0,
    //         advancePaid: 0,
    //         balanceAmount: 0,
    //         depositTaken: '',
    //         depositAmount: 0,
    //         nic1: '',
    //         nic2: '',
    //         remarks: ''
    //     }
    // })

    // Calculate totals automatically
    useEffect(() => {
        const subtotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const discount = watch('totalDiscount') || 0;
        const netTotal = subtotal - discount;
        setValue('totalAmount', subtotal);
        setValue('netTotal', netTotal);
        setValue('balanceAmount', netTotal - (watch('advancePaid') || 0));
    }, [selectedItems, watch('totalDiscount'), watch('advancePaid')]);

    // Update advancePaid automatically when any payment input changes
    useEffect(() => {
        const p1 = Number(watch('payment1')) || 0;
        const p2 = Number(watch('payment2')) || 0;
        const p3 = Number(watch('payment3')) || 0;
        const sum = p1 + p2 + p3;
        setValue('advancePaid', sum);
    }, [watch('payment1'), watch('payment2'), watch('payment3')]);

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

    // search item
    useEffect(() => {
        setLoading(true);
        const searchItems = async () => {
            if (searchQuery.length > 0) {
                try {
                    const response = await axios.get(
                        import.meta.env.VITE_API_BASE_URL + '/api/itemmaster/search/' + searchQuery
                    )
                    setSearchedItems(response.data);

                } catch (error) {
                    setError(error.response?.data?.message || "Failed to search items");
                    setSearchedItems([]); // Clear products on error
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            } else {
                axios.get(import.meta.env.VITE_API_BASE_URL + '/api/itemmaster/')
                    .then((response) => {
                        setSearchedItems(response.data)
                        setLoading(false)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            }
        };

        // Add debouncing (500ms delay)
        const debounceTimer = setTimeout(() => {
            setLoading(true);
            searchItems();
        }, 500);

        return () => clearTimeout(debounceTimer); // Cleanup on unmount or query change
    }, [searchQuery]);

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
    // const handleItemSelect = (item) => {
    //     const existingItem = selectedItems.find(i => i.itemCode === item.itemCode)

    //     if (!existingItem) {
    //         setSelectedItems([...selectedItems, {
    //             ...item,
    //             amount: item.itemPrice,
    //             deliveryDate: watch('deliveryDate'),
    //             returnDate: watch('returnDate'),
    //             alterations: '',
    //             isCompleted: false
    //         }])
    //     }
    //     calculateTotals()
    // }

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
            setValue('customerId', selectedCustomerObj?.customerId || '');
            setValue('customerName', selectedCustomerObj?.customerName || '');
            setValue('customerAddress', selectedCustomerObj?.customerAddress || '');
            setValue('customerTel1', selectedCustomerObj?.customerTel1 || '');
            setValue('customerTel2', selectedCustomerObj?.customerTel2 || '');
            // setTimeout(() => {
            //     if (itemInputRef.current) itemInputRef.current.focus();
            // }, 300);
        }
    };

    // handle item selection in the combobox and load only the items of the selected group and the item is not blocked
    const handleComboBoxItemSelect = async (itemCode) => {
        setSelectedItem(itemCode);
        // const selectedItemObj = await items.find(item => item.itemCode === itemCode);
        const selectedItemObj = items.find(item => String(item.itemCode) === String(itemCode));
        // console.log('Selected item:', selectedItemObj);
        if (selectedItemObj?.isBlocked) {
            toast.error('This item is blocked. Please select another item.');
            setSelectedItem('');
            setTimeout(() => {
                const combo = document.querySelector('input[placeholder="Item..."]');
                if (combo) combo.value = '';
                if (combo) combo.focus();
            }, 100);
            return;
        }
        // Check for existing bookings
        const bookings = await fetchItemBookings(itemCode);
        if (bookings && bookings.length > 0) {
            setItemBookingInfo(bookings); // Show bookings in card at bottom
        } else {
            setItemBookingInfo(null);
        }
        setShowBookingConflict(false);
        setPendingItemToAdd(null);
        setSelectedItemDetails(selectedItemObj);
        // console.log('selectedItemDetails:', selectedItemObj);
        setItemPrice(selectedItemObj?.itemPrice || '');
        setAlteration('');
        setTimeout(() => {
            if (amountInputRef.current) amountInputRef.current.focus();
        });
    };

    // // Handle Item Selection in the combobox
    // const handleComboBoxItemSelect = (itemCode) => {
    //     setSelectedItem(itemCode); // set combobox value
    //     const selectedItemObj = items.find(item => item.itemCode === itemCode);
    //     setSelectedItemDetails(selectedItemObj);
    //     setItemPrice(selectedItemObj?.itemPrice || '');
    //     setAlteration('');
    //     setTimeout(() => {
    //         if (amountInputRef.current) amountInputRef.current.focus();
    //     }, 300);
    // };

    // Add selected item to table with alteration and price
    const handleAddToTable = () => {
        if (!selectedItemDetails) return;
        if (!itemPrice || parseFloat(itemPrice) < 0) {
            alert('Please enter a valid price.');
            return;
        }
        if (selectedItems.find(i => i.itemCode === selectedItemDetails.itemCode)) {
            alert('This item is already added.');
            return;
        }
        // If there are bookings, show confirmation modal
        if (itemBookingInfo && Array.isArray(itemBookingInfo) && itemBookingInfo.length > 0) {
            setShowBookingConflict(true);
            setPendingItemToAdd(selectedItemDetails);
            return;
        }
        setSelectedItems([
            ...selectedItems,
            {
                ...selectedItemDetails,
                invoiceDate: watch('invoiceDate'),
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
        setSearchQuery(''); // Clear search query
        // Focus back to item combobox for fast entry
        setTimeout(() => {
            const combo = document.querySelector('input[placeholder="Item..."]');
            if (combo) combo.value = '';
            if (combo) combo.focus();
        }, 100);
    };

    // Confirm add after booking conflict
    const confirmAddItemWithBooking = () => {
        if (!pendingItemToAdd) return;
        setSelectedItems([
            ...selectedItems,
            {
                ...pendingItemToAdd,
                amount: parseFloat(itemPrice),
                alteration: alteration || '',
                group: selectedGroup,
                deliveryDate: watch('deliveryDate'),
                returnDate: watch('returnDate'),
                isCompleted: false
            }
        ]);
        setLastAddedItemCode(pendingItemToAdd.itemCode);
        setSelectedItemDetails(null);
        setItemPrice('');
        setAlteration('');
        setSelectedItem('');
        setShowBookingConflict(false);
        setPendingItemToAdd(null);
        setItemBookingInfo(null);
        setTimeout(() => {
            const combo = document.querySelector('input[placeholder="Item..."]');
            if (combo) combo.value = '';
            if (combo) combo.focus();
        }, 100);
    };
    const cancelAddItemWithBooking = () => {
        setShowBookingConflict(false);
        setPendingItemToAdd(null);
        // Do NOT clear itemBookingInfo, so confirmation will show again if Add is pressed
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

    // Confirmation dialog state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);

    // Form submission handler (shows confirmation)
    const onSubmit = (data) => {
        if (!data.customerId || selectedItems.length === 0) {
            alert('Please select a customer and add at least one item.');
            return;
        }
        setPendingFormData(data);
        setShowConfirmDialog(true);
    };

    // Actual save logic (called after confirmation)
    const handleConfirmedSave = async () => {
        setSaving(true);
        try {
            const data = pendingFormData;
            const invoiceData = {
                ...data,
                invoiceNo: invoiceNumber,
                // Prefer the selected `date` (from the Popover calendar) when available.
                invoiceDate: date ? new Date(date) : (data.invoiceDate ? new Date(data.invoiceDate) : new Date()),
                bookingStatus,
                createdOn: new Date(),
                modifiedOn: new Date()
            };
            const salesInvoiceDetails = selectedItems.map(item => ({
                invoiceNo: invoiceNumber,
                // Use the selected `date` for each invoice detail when available.
                invoiceDate: date ? new Date(date) : (data.invoiceDate ? new Date(data.invoiceDate) : new Date()),
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
            function generateTransactionId() {
                const now = new Date();
                const day = String(now.getDate()).padStart(2, '0');
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const year = now.getFullYear();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                return `TXN${year}${month}${day}${hours}${minutes}${seconds}`;
            }
            const dailyTransaction = {
                transactionId: generateTransactionId(),
                // Use selected date for the transaction date as well.
                transactionDate: date ? new Date(date) : new Date(),
                transactionType: 'RENT_BOOKING',
                invoiceNo: invoiceNumber,
                creditAmount: data.advancePaid || 0,
                customerId: data.customerId,
                transactionDesc: data.remarks || '',
                createdOn: new Date()
            };
            await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/batchbooking/batch', {
                invoice: invoiceData,
                invoiceDetails: salesInvoiceDetails,
                dailyTransaction
            });
            toast.success('Invoice, bookings, and daily transaction saved successfully!');
            // Reset form and items
            handleClearInvoice();
        } catch (error) {
            console.error('Error saving invoice or bookings:', error);
            alert('Failed to save invoice or bookings');
        } finally {
            setSaving(false);
            setShowConfirmDialog(false);
            setPendingFormData(null);
        }
    };

    // Clear/cancel everything and start fresh
    const handleClearInvoice = () => {
        Swal.fire({
            title: 'Clear Invoice',
            text: 'Are you sure you want to clear the invoice? This will remove all items and customer details.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, clear it!'
        }).then(
            (result) => {
                if (result.isConfirmed) {
                    // Clear all state and form values
                    setSelectedItems([]);
                    setSelectedItem('');
                    setSelectedItemDetails(null);
                    setItemPrice('');
                    setAlteration('');
                    setSelectedGroup('');
                    setSelectedCustomer('');
                    setValue('invoiceNo', '')
                    setValue('invoiceDate', date.now())
                    setValue('customerId', '');
                    setValue('customerName', '');
                    setValue('customerAddress', '');
                    setValue('customerTel1', '');
                    setValue('customerTel2', '');
                    setValue('nic1', '');
                    setValue('nic2', '');
                    setValue('remarks', '');
                    setValue('deliveryDate', new Date().toISOString().split('T')[0]);
                    setValue('returnDate', new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                    setValue('totalDiscount', 0);
                    setValue('payment1', 0);
                    setValue('payment2', 0);
                    setValue('payment3', 0);
                    setValue('advancePaid', 0);
                    setValue('depositAmount', 0);
                    setBookingStatus('Pending');
                    // Reset invoice number
                    setInvoiceNumber(generateInvoiceNumber());
                    // Also clear any visible item input fields (combobox or search input)
                    setTimeout(() => {
                        const itemCombo = document.querySelector('input[placeholder="Item..."]');
                        if (itemCombo) itemCombo.value = '';
                        const searchInput = document.querySelector('input[placeholder="Search"]');
                        if (searchInput) searchInput.value = '';
                    }, 100);
                } else {
                    return;
                }
            }
        );

        // const confirmClear = window.confirm('Are you sure you want to clear the invoice? This will remove all items and customer details.');
        // if (!confirmClear) return;

        // setSelectedItems([]);
        // setInvoiceNumber(generateInvoiceNumber());
        // setValue('customerId', '');
        // setValue('customerName', '');
        // setValue('customerAddress', '');
        // setValue('customerTel1', '');
        // setValue('customerTel2', '');
        // setValue('nic1', '');
        // setValue('nic2', '');
        // setValue('remarks', '');
        // setValue('totalDiscount', 0);
        // setValue('advancePaid', 0);
        // setValue('depositAmount', 0);
        // setBookingStatus('Pending');
    };

    // Helper: fetch bookings for an item
    async function fetchItemBookings(itemCode) {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/item/${itemCode}`);
            // Expecting an array of bookings
            console.log('Bookings for item:', itemCode, res.data);
            return res.data && Array.isArray(res.data) && res.data.length > 0 ? res.data : null;

        } catch (err) {
            return null;
        }
    }

    // Add item on Enter in amount box
    function handleAmountKeyDown(e) {
        if (e.key === 'Enter') {
            handleAddToTable();
            e.preventDefault();
        }
    }

    function formatDate(date) {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    return (
        <div className="min-h-screen" style={{ background: "var(--color-bg-gradient)", minHeight: '100vh' }}>
            {/* Modern Header with Navy/Red Branding */}
            <div className='flex items-center justify-center py-2 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 shadow-md mb-4'>
                <h2 className='text-3xl font-extrabold tracking-wide drop-shadow text-white'>Modify Bookings</h2>
            </div>
            <div className="mb-4">
                <Card className="h-auto flex flex-col justify-center shadow-xl border-2" style={{ borderColor: "var(--color-navy)", background: "var(--color-bg-gradient)" }}>
                    {/* Decorative navy/red bar */}
                    <div className="absolute top-0 left-0 w-full h-2 rounded-t-xl" style={{ background: "linear-gradient(90deg, var(--color-navy), var(--color-red-light), var(--color-navy))" }} />
                    <div className="flex flex-row items-center justify-between px-6 py-1 w-full z-10">
                        <div className="flex flex-row items-center gap-4">
                            {/* Logo circle */}
                            <div className='rounded-xl'>
                                <img src="/logoW.png" width="80px" height="80px" alt="logo" />
                            </div>

                            <div className="flex flex-col">
                                <span className="text-3xl font-extrabold tracking-wide drop-shadow" style={{ color: "var(--color-navy)" }}>Blazer Hub <span style={{ color: "var(--color-red)" }}>Rental</span></span>
                                <span className="text-xs font-semibold" style={{ color: "var(--color-navy)" }}>Fast, Reliable, and Easy Suit Rental</span>

                            </div>
                        </div>
                        <div className="flex flex-row justify-center items-center gap-2 ">
                            <span className="text-xl font-semibold" style={{ color: "var(--color-navy)" }}>Invoice #: <span className='text-red-900'><b>{invoiceNumber}</b></span></span>
                            <span className="text-xl font-semibold" style={{ color: "var(--color-navy)" }}>Invoice Date: <span className='text-red-900'> <b>{invoiceDate}</b></span></span>
                            <span className="text-base font-semibold flex items-center gap-1" style={{ color: "var(--color-navy)" }}>
                                <svg className="inline-block mr-1" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="3" fill="var(--color-navy)" /><rect x="6" y="10" width="12" height="4" rx="2" fill="var(--color-red-light)" /></svg>User
                            </span>
                            <Badge variant="destructive" className="text-lg px-3 py-1 border-2 shadow-inner" style={{ background: "var(--color-red)", color: "var(--color-white)", borderColor: "var(--color-navy)" }}>{userName}</Badge>
                            <span className="text-base font-semibold flex items-center gap-1" style={{ color: "var(--color-navy)" }}>
                                <svg className="inline-block mr-1" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="var(--color-navy)" /><text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--color-white)">{selectedItems.length}</text></svg>Items
                            </span>
                            <Badge className="text-lg px-3 py-1 border-2 shadow-inner" style={{ background: "var(--color-navy-light)", color: "var(--color-white)", borderColor: "var(--color-red-light)" }}>{selectedItems.length}</Badge>
                            <span className="text-base font-semibold flex items-center gap-1" style={{ color: "var(--color-navy)" }}>
                                <svg className="inline-block mr-1" width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 12h16" stroke="var(--color-red)" strokeWidth="2" /><circle cx="12" cy="12" r="10" stroke="var(--color-navy)" strokeWidth="2" fill="none" /></svg>Total
                            </span>
                            <Badge className="text-lg px-3 py-1 border-2 shadow-inner" style={{ background: "linear-gradient(90deg, var(--color-red-light), var(--color-navy-light))", color: "var(--color-white)", borderColor: "var(--color-navy)" }}>{selectedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)}</Badge>
                        </div>
                    </div>
                </Card>
            </div>
            {/* Main Content: Responsive 2 columns */}
            <div className="flex flex-col md:flex-row gap-6 w-full">
                {/* Left: Item selection and table */}
                <div className="flex-1 min-w-[320px] max-w-[750px]">
                    <Card className="mb-2 border-2 border-[#0a174e] shadow-lg bg-white/90">
                        <CardHeader className="py-1 px-2 border-b-2 flex flex-row items-center gap-2" style={{ background: "linear-gradient(90deg, var(--color-navy-light) 60%, var(--color-red-light) 100%)", borderColor: "var(--color-navy)" }}>
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[var(--color-navy)]"><rect x="3" y="6" width="18" height="12" rx="3" fill="var(--color-navy)" /><rect x="7" y="10" width="10" height="4" rx="2" fill="var(--color-red-light)" /></svg>
                            <CardTitle className="text-base font-bold tracking-wide" style={{ color: "var(--color-navy)" }}>Item Selection</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                            <div className="flex flex-wrap items-end gap-2 mb-4">
                                {/* Group Select */}
                                <div className="w-[100px]">
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
                                {/* Item input box */}
                                <div className="w-[160px]">
                                    <Label className="text-xs">Item</Label>
                                    <input
                                        type="text"
                                        id="itemCode"
                                        placeholder="Search"
                                        className="border border-gray-300 rounded-lg py-1 px-1 focus:outline-none focus:border-accent transition duration-200 w-full max-w-xs"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            setLoading(true)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                // handleSearch()
                                                handleComboBoxItemSelect(searchQuery);
                                            }
                                        }
                                        }
                                    />
                                    {/* <Combobox value={selectedItem} onValueChange={handleComboBoxItemSelect} onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComboBoxItemSelect(selectedItem);
                                        }
                                    }}
                                    >
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
                                                    {item.itemCode}
                                                    {/* - {item.itemShortDesc} - {item.itemSize} */}
                                    {/* </ComboboxItem> */}
                                    {/* ))} */}
                                    {/* </ComboboxContent> */}
                                    {/* </Combobox> */}
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
                                    <Button className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700 shadow animated-btn" onClick={handleAddToTable} tabIndex={0}>
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Items Table */}
                    <div className="border-2 border-[#0a174e] rounded-xl bg-white/95 overflow-x-auto max-h-[340px] shadow-md mb-3">
                        <Table className="text-xs">
                            <TableHeader className="bg-gradient-to-r from-[#0a174e]/80 via-[#f5f7fa]/80 to-[#d7263d]/80">
                                <TableRow>
                                    <TableHead className="text-[#0a174e] font-bold">Alter</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Group</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Code</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Name</TableHead>
                                    <TableHead className="text-[#0a174e] font-bold">Size</TableHead>
                                    <TableHead className="text-[#d7263d] font-bold">Amt</TableHead>
                                    <TableHead className="text-[#d7263d] font-bold">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedItems.length > 0 ? (
                                    selectedItems.map((item, idx) => (
                                        <TableRow
                                            key={item.itemCode}
                                            className={
                                                (item.itemCode === lastAddedItemCode ? 'bg-gradient-to-r from-green-100 to-green-50 ' : '') +
                                                'hover:bg-gradient-to-r hover:from-[#e5e9f7] hover:to-[#f5f7fa] focus-within:bg-blue-100 transition-colors duration-100'
                                            }
                                            tabIndex={0}
                                        >
                                            <TableCell>{item.alteration || '-'}</TableCell>
                                            <TableCell>{item.group || selectedGroup}</TableCell>
                                            <TableCell>{item.itemCode}</TableCell>
                                            <TableCell>{item.itemShortName}</TableCell>
                                            <TableCell>{item.itemSize}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.amount}
                                                    min={1}
                                                    onChange={e => handlePriceChange(item.itemCode, parseFloat(e.target.value))}
                                                    className="w-20 h-7 text-xs border-2 border-[#0a174e] rounded focus:ring-2 focus:ring-[#d7263d]"
                                                    tabIndex={0}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="destructive" size="sm" className="h-7 px-2 text-xs bg-[#d7263d] hover:bg-[#b71c2b] text-white border-2 border-[#0a174e] shadow" onClick={() => handleRemoveItem(item.itemCode)} tabIndex={0}>
                                                    Remove
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
                        {/* Remove confirmation dialog */}
                        {showRemoveDialog.open && (
                            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(10,23,78,0.50)' }}>
                                <div className="bg-gradient-to-br from-[#fff] via-[#fbeaec] to-[#e5e9f7] p-8 rounded-2xl shadow-2xl border-2 border-[#d7263d] animate-fade-in min-w-[320px]">
                                    <div className="mb-4 text-lg font-semibold text-[#d7263d] flex items-center gap-2"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#d7263d" /><path d="M12 8v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="#fff" /></svg>Are you sure you want to remove this item?</div>
                                    <div className="flex gap-4 justify-end">
                                        <Button id="remove-dialog-yes" variant="destructive" className="bg-[#d7263d] hover:bg-[#b71c2b] text-white border-2 border-[#0a174e]" onClick={confirmRemoveItem} tabIndex={0}>Yes, Remove</Button>
                                        <Button variant="outline" className="border-2 border-[#0a174e] text-[#0a174e]" onClick={cancelRemoveItem} tabIndex={0}>Cancel</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Booking conflict dialog */}
                        {showBookingConflict && Array.isArray(itemBookingInfo) && itemBookingInfo.length > 0 && (
                            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(25, 118, 210, 0.10)' }}>
                                <div className="bg-white rounded-xl shadow-2xl border-2 border-[var(--color-red)] p-6 min-w-[340px] max-w-[95vw] animate-fade-in">
                                    <div className="mb-2 text-lg font-bold text-[var(--color-red)] flex items-center gap-2">
                                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="var(--color-red-light)" /><path d="M12 8v4" stroke="var(--color-red-dark)" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="var(--color-red-dark)" /></svg>
                                        This item is already booked!
                                    </div>
                                    <div className="mb-3 text-sm text-[var(--color-navy)] max-h-[200px] overflow-y-auto">
                                        {itemBookingInfo.map((booking, idx) => (
                                            <div key={booking._id || idx} className="mb-2 p-2 border-b border-[var(--color-navy-light)] last:border-b-0">
                                                <div><b>Item Code:</b> {booking.itemCode}</div>
                                                <div><b>Invoice #:</b> {booking.invoiceNo}</div>
                                                <div><b>Name:</b> {booking.itemShortDesc || '-'}</div>
                                                <div><b>Size:</b> {booking.itemSize || '-'}</div>
                                                <div><b>Delivery:</b> {booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString() : '-'}</div>
                                                <div><b>Return:</b> {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 justify-end mt-4">
                                        <Button className="animated-btn border-2 border-[var(--color-navy)] text-[var(--color-navy)] bg-white font-bold px-6 py-2" onClick={cancelAddItemWithBooking} tabIndex={0}>Cancel</Button>
                                        <Button className="animated-btn border-2 border-[var(--color-red)] text-white bg-[var(--color-red)] font-bold px-6 py-2" onClick={confirmAddItemWithBooking} tabIndex={0}>Add Anyway</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bookings card at bottom of screen, always visible if bookings exist for selected item and not in modal */}
                        {Array.isArray(itemBookingInfo) && itemBookingInfo.length > 0 && !showBookingConflict && (
                            <Card className="mb-2 border-2 border-[#0a174e] shadow-lg bg-white/90 animate-fade-in">
                                <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2" style={{ background: "linear-gradient(90deg, var(--color-navy-light) 60%, var(--color-red-light) 100%)", borderColor: "var(--color-navy)" }}>
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[var(--color-navy)]"><circle cx="12" cy="12" r="10" fill="var(--color-navy-light)" /><path d="M12 8v4" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="var(--color-red)" /></svg>
                                    <CardTitle className="text-base font-bold tracking-wide" style={{ color: "var(--color-navy)" }}>Bookings for this item</CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                    <div className="text-xs text-[var(--color-navy)] max-h-[160px] overflow-y-auto">
                                        {itemBookingInfo.map((booking, idx) => (
                                            <div key={booking._id || idx} className="mb-2 p-2 border-b border-[var(--color-navy-light)] last:border-b-0">
                                                <div><b>Item Code:</b> {booking.itemCode}</div>
                                                <div><b>Invoice #:</b> {booking.invoiceNo}</div>
                                                <div><b>Name:</b> {booking.itemShortDesc || '-'}</div>
                                                <div><b>Size:</b> {booking.itemSize || '-'}</div>
                                                <div><b>Delivery:</b> {booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString() : '-'}</div>
                                                <div><b>Return:</b> {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : '-'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {/* Customer & Dates Card */}
                        <Card className="mb-2 border-2 border-[#0a174e] bg-white/90 shadow-lg">
                            <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2" style={{ background: "linear-gradient(90deg, var(--color-navy-light) 60%, var(--color-red-light) 100%)", borderColor: "var(--color-navy)" }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[var(--color-navy)]"><rect x="3" y="6" width="18" height="12" rx="3" fill="var(--color-navy)" /><rect x="7" y="10" width="10" height="4" rx="2" fill="var(--color-red-light)" /></svg>
                                <CardTitle className="text-base font-bold tracking-wide" style={{ color: "var(--color-navy)" }}>Customer & Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                                <div className="grid grid-cols-2 gap-1">
                                    {/* <div className="col-span-2 mb-2">
                                        <div className="flex flex-row gap-6 items-center">
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">Customer ID:</span>
                                                <span className="ml-2 text-xs">{getValues('customerId') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">Name:</span>
                                                <span className="ml-2 text-xs">{getValues('customerName') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">Address:</span>
                                                <span className="ml-2 text-xs">{getValues('customerAddress') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">Tel 1:</span>
                                                <span className="ml-2 text-xs">{getValues('customerTel1') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">Tel 2:</span>
                                                <span className="ml-2 text-xs">{getValues('customerTel2') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">NIC 1:</span>
                                                <span className="ml-2 text-xs">{getValues('nic1') || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="font-bold text-xs text-[var(--color-navy)]">NIC 2:</span>
                                                <span className="ml-2 text-xs">{getValues('nic2') || '-'}</span>
                                            </div>
                                        </div>
                                    </div> */}
                                    {/* ...existing form fields... */}
                                    {/* <div className="w-[150px] h-[45px]">
                                        <Label className="text-xs">Customer List</Label>
                                        <Combobox value={selectedCustomer} onValueChange={handleCustomerSelect}>
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

                                    </div> */}

                                    <div>
                                        <Label htmlFor="customerId" className="text-xs">Customer ID</Label>
                                        <Input id="customerId" {...register('customerId')} className="h-7 text-xs" readOnly />
                                    </div>

                                    {/* Customer Name */}
                                    <div>
                                        <Label htmlFor="customerName" className="text-xs">Name</Label>
                                        <Input id="customerName" {...register('customerName')} className="h-07 text-xs" />
                                    </div>

                                    {/* Address */}
                                    <div className="col-span-2">
                                        <Label htmlFor="customerAddress" className="text-xs">Address</Label>
                                        <Textarea id="customerAddress" {...register('customerAddress')} className="text-xs min-h-[32px]" />
                                    </div>

                                    {/* Tel 1 */}
                                    <div>
                                        <Label htmlFor="customerTel1" className="text-xs">Tel 1</Label>
                                        <Input id="customerTel1" {...register('customerTel1')} className="h-7 text-xs" />
                                    </div>

                                    {/* Tel 2 */}
                                    <div>
                                        <Label htmlFor="customerTel2" className="text-xs">Tel 2</Label>
                                        <Input id="customerTel2" {...register('customerTel2')} className="h-7 text-xs" />
                                    </div>

                                    {/* NIC 1 */}
                                    <div>
                                        <Label htmlFor="nic1" className="text-xs">NIC 1</Label>
                                        <Input id="nic1" {...register('nic1')} className="h-7 text-xs" />
                                    </div>

                                    {/* NIC 2 */}
                                    <div>
                                        <Label htmlFor="nic2" className="text-xs">NIC 2</Label>
                                        <Input id="nic2" {...register('nic2')} className="h-7 text-xs" />
                                    </div>

                                    {/* <div>
                                        <Label htmlFor="customerName" className="text-xs">Name</Label>
                                        <Input id="customerName" {...register('customerName')} className="h-10 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('customerAddress')?.focus(); } }} />
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
                                    </div> */}
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
                        <Card className="mb-2 border-2 border-[#0a174e] bg-white/90 shadow-lg">
                            <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2" style={{ background: "linear-gradient(90deg, var(--color-red-light) 60%, var(--color-navy-light) 100%)", borderColor: "var(--color-navy)" }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[var(--color-red)]"><rect x="3" y="6" width="18" height="12" rx="3" fill="var(--color-red-light)" /><rect x="7" y="10" width="10" height="4" rx="2" fill="var(--color-navy-light)" /></svg>
                                <CardTitle className="text-base font-bold tracking-wide" style={{ color: "var(--color-red)" }}>Payment</CardTitle>
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
                                        <Label htmlFor="payment1" className="text-xs">Payment 1</Label>
                                        <Input id="payment1" type="number" {...register('payment1', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('payment2')?.focus(); } }} />
                                    </div>
                                    <div>
                                        <Label htmlFor="payment2" className="text-xs">Payment 2</Label>
                                        <Input id="payment2" type="number" {...register('payment2', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('payment3')?.focus(); } }} />
                                    </div>
                                    <div>
                                        <Label htmlFor="payment3" className="text-xs">Payment 3</Label>
                                        <Input id="payment3" type="number" {...register('payment3', { valueAsNumber: true })} className="h-7 text-xs" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('advancePaid')?.focus(); } }} />
                                    </div>
                                    <div>
                                        <Label htmlFor="advancePaid" className="text-xs">Total Paid</Label>
                                        <Input id="advancePaid" type="number" readOnly {...register('advancePaid', { valueAsNumber: true })} className="h-7 text-xs bg-gray-100" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('depositAmount')?.focus(); } }} />
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
                                    <Label htmlFor="invoiceStatus" className="text-xs">Invoice Status</Label>
                                    <Select id="invoiceStatus" value={invoiceStatus} onValueChange={setInvoiceStatus}>
                                        <SelectTrigger className="h-7 text-xs" tabIndex={0}>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="booked">Booked</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="returned">Returned</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                            <SelectItem value="return_partial">Returned Partial</SelectItem>
                                            <SelectItem value="return_overdue">Returned Overdue</SelectItem>
                                            <SelectItem value="return_issue">Returned w/Issues</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Sticky action bar for Save/Cancel */}
                    <div className="sticky bottom-0 z-20 flex justify-end gap-3 bg-gradient-to-r from-[#f5f7fa]/80 to-[#e5e9f7]/80 py-3 px-2 rounded-b-xl border-t-2 border-[#0a174e] shadow-inner">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-8 px-6 text-base border-2 border-[#0a174e] bg-white text-[#0a174e] hover:bg-gray-300 cursor-pointer font-bold shadow focus:ring-2 focus:ring-[#d7263d] focus:outline-none"
                            onClick={handleClearInvoice}
                            disabled={saving}
                            tabIndex={0}
                        >
                            <svg className="inline-block mr-1" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#d7263d" /><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" /></svg>
                            Clear/Cancel
                        </Button>
                        <Button
                            type="button"
                            ref={saveButtonRef}
                            onClick={handleSubmit(onSubmit)}
                            disabled={selectedItems.length === 0 || saving}
                            className="h-8 px-6 text-base bg-gradient-to-r from-[#0a174e] to-[#d7263d] hover:from-[#d7263d] hover:to-[#0a174e] text-white font-bold border-2 border-[#0a174e] shadow focus:ring-2 focus:ring-[#d7263d] focus:outline-none animated-btn"
                            tabIndex={0}
                            aria-label="Save Invoice (Ctrl+S)"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><svg className="inline-block mr-1" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#0a174e" /><path d="M8 12h8" stroke="#fff" strokeWidth="2" /></svg>Save Invoice</span>
                            )}
                        </Button>
                    </div>
                    <div className="text-xs text-[#0a174e] mt-2 text-right font-semibold">Tip: Use <span className="font-bold text-[#d7263d]">Tab</span> to move, <span className="font-bold text-[#d7263d]">Enter</span> to add, <span className="font-bold text-[#d7263d]">Ctrl+S</span> to save, <span className="font-bold text-[#d7263d]">Esc</span> to close dialogs.</div>

                    {/* Confirmation Dialog */}
                    {showConfirmDialog && (
                        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(10,23,78,0.50)' }}>
                            <div
                                className="relative bg-gradient-to-br from-[#f5f7fa]/95 via-[#fff]/98 to-[#e5e9f7]/95 p-0 rounded-2xl shadow-2xl border-2 border-[#0a174e] animate-fade-in min-w-[340px] max-w-[95vw]"
                                style={{ boxShadow: '0 12px 40px 0 rgba(10,23,78,0.18)' }}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="confirm-dialog-title"
                            >
                                {/* Decorative top bar */}
                                <div className="h-2 w-full rounded-t-2xl bg-gradient-to-r from-[#0a174e] via-[#d7263d] to-[#0a174e] mb-2" />
                                <div className="px-8 pt-4 pb-2 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#0a174e]"><circle cx="12" cy="12" r="10" fill="#e5e9f7" /><path d="M12 8v4" stroke="#0a174e" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="#d7263d" /></svg>
                                        <div id="confirm-dialog-title" className="text-xl font-bold text-[#0a174e] drop-shadow">Confirm Save Invoice</div>
                                    </div>
                                    <div className="mb-2 text-[#0a174e] text-base text-center">Are you sure you want to <span className="font-semibold text-[#d7263d]">save this invoice</span> and all related bookings/transactions?</div>
                                </div>
                                <div className="flex gap-4 justify-end mt-4 px-8 pb-6">
                                    <Button
                                        variant="outline"
                                        className="border-2 border-[#0a174e] text-[#0a174e] focus:ring-2 focus:ring-[#d7263d] focus:outline-none px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#e5e9f7] transition"
                                        onClick={() => { setShowConfirmDialog(false); setPendingFormData(null); }}
                                        tabIndex={0}
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setShowConfirmDialog(false); setPendingFormData(null);
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="bg-gradient-to-r from-[#0a174e] to-[#d7263d] hover:from-[#d7263d] hover:to-[#0a174e] text-white focus:ring-2 focus:ring-[#d7263d] focus:outline-none px-6 py-2 rounded-lg text-base font-semibold shadow-md transition border-2 border-[#0a174e]"
                                        onClick={handleConfirmedSave}
                                        tabIndex={0}
                                        disabled={saving}
                                        onKeyDown={e => {
                                            if ((e.key === 'Enter' || e.key === ' ') && !saving) {
                                                handleConfirmedSave();
                                            }
                                        }}
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>Saving...</span>
                                        ) : 'Yes, Save'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Right: Customer, Dates, Payment */}
                <div className="flex-1 min-w-[320px] max-w-[800px]">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-2">
                            {/* Item list card */}
                            <Card className="mb-2 border-2 border-[#0a174e] p-2 bg-white/90 shadow-lg flex flex-col items-start animate-fade-in">
                                {/* <h2>Items List here</h2> */}
                                <div className="w-[780px] max-w-full"
                                    style={{
                                        maxHeight: "350px", // or any height you want
                                        overflowY: "auto", // to allow vertical scrolling
                                        overflowX: "auto", // to allow horizontal scrolling if needed
                                        border: "1px solid #d1d5db", // Tailwind gray-200
                                        borderRadius: "0.5rem", // Tailwind rounded-lg
                                    }}
                                >
                                    <table className="min-w-full divide-y divide-gray-200 rounded-2xl">
                                        <thead className="bg-gray-50 shadow-lg border-2 bg-grey-600 shadow-gray-200 sticky top-0 z-50">
                                            <tr>
                                                {/* <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Code</th> */}
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Code</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Short Desc</th>
                                                {/* <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Group</th> */}
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Size</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Price</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Rent Count</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Date Added</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Last Rented</th>
                                                <th className="px-2 py-2 w-20 text-left text-xs font-medium border-3 bg-gray-200 text-gray-900 uppercase tracking-wider">Last Dry Clean</th>
                                                {/* <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Status</th> */}
                                                {/* <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Blocked</th> */}
                                                {/* <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Contributor</th> */}
                                                {/* <th className="px-6 py-3 text-center text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">Actions</th> */}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-400 border-2 shadow-lg shadow-gray-200">
                                            {
                                                // map the searchedItems array and display each item
                                                searchedItems.map((item, idx) => (
                                                    <tr key={item.itemCode} className="hover:bg-gray-50 " >
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                                                        <td className="px-2 py-2 w-24 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            <div className="font-medium">{item.itemName}</div>
                                                            <div className="text-gray-400">{item.itemShortDesc}</div>
                                                        </td>
                                                        {/* <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">
                                                            {item.itemGroupShortDesc}
                                                        </td> */}
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">{item.itemSize}</td>
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">
                                                            {item.itemPrice ? `Rs. ${item.itemPrice.toLocaleString()}` : "N/A"}
                                                        </td>
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">{item.rentCount ? item.rentCount : "N/A"}</td>
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">
                                                            {item.itemDateAdded
                                                                ? new Date(item.itemDateAdded).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                }).replace(/ /g, "-") // Converts "15 Jan 2023" → "15-Jan-2023"
                                                                : "N/A"}
                                                        </td>
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">{item.lastRented ? item.lastRented : "N/A"}</td>
                                                        <td className="px-2 py-2 w-20 whitespace-nowrap text-sm font-medium text-gray-500">{item.lastDryClean ? item.lastDryClean : "N/A"}</td>

                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                            {/* customer purchase history card */}
                            <Card className="mb-2 border-2 border-[#0a174e] bg-white/90 shadow-lg flex flex-col items-center">
                                <h2>Customer purchase history will be here</h2>
                            </Card>


                            {/* Bookings card at bottom of screen, always visible if bookings exist for selected item and not in modal */}
                            {Array.isArray(itemBookingInfo) && itemBookingInfo.length > 0 && !showBookingConflict && (
                                <Card className="mb-2 border-2 border-[#0a174e] shadow-lg bg-white/90 animate-fade-in">
                                    <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2" style={{ background: "linear-gradient(90deg, var(--color-navy-light) 60%, var(--color-red-light) 100%)", borderColor: "var(--color-navy)" }}>
                                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="text-[var(--color-navy)]"><circle cx="12" cy="12" r="10" fill="var(--color-navy-light)" /><path d="M12 8v4" stroke="var(--color-red)" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="var(--color-red)" /></svg>
                                        <CardTitle className="text-base font-bold tracking-wide" style={{ color: "var(--color-navy)" }}>Bookings for this item</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 px-4">
                                        <div className="text-xs text-[var(--color-navy)] max-h-[160px] overflow-y-auto">
                                            {itemBookingInfo.map((booking, idx) => (
                                                <div key={booking._id || idx} className="mb-2 p-2 border-b border-[var(--color-navy-light)] last:border-b-0">
                                                    <div><b>Item Code:</b> {booking.itemCode}</div>
                                                    <div><b>Invoice #:</b> {booking.invoiceNo}</div>
                                                    <div><b>Name:</b> {booking.itemShortDesc || '-'}</div>
                                                    <div><b>Size:</b> {booking.itemSize || '-'}</div>
                                                    <div><b>Delivery:</b> {booking.deliveryDate ? new Date(booking.deliveryDate).toLocaleDateString() : '-'}</div>
                                                    <div><b>Return:</b> {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}


                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}