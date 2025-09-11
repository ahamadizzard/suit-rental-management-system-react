import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Combobox,
    ComboboxAnchor,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxTrigger,
} from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import "@/theme.css";

export default function ModifyBooking() {

    const { invoiceNo } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [alteration, setAlteration] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [searchQuery, setSearchQuery] = useState("");
    const [searchedItems, setSearchedItems] = useState([]);
    const [error, setError] = useState(null);
    const amountInputRef = useRef(null);
    const saveButtonRef = useRef(null);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [showRemoveDialog, setShowRemoveDialog] = useState({ open: false, itemCode: null });
    const [bookingStatus, setBookingStatus] = useState('Pending');
    const [itemBookingInfo, setItemBookingInfo] = useState(null);
    const [showBookingConflict, setShowBookingConflict] = useState(false);
    const [pendingItemToAdd, setPendingItemToAdd] = useState(null);
    const [date, setDate] = useState(new Date());
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);
    const [lastAdvancePaid, setLastAdvancePaid] = useState(0);

    // Load invoice data and customers
    const { register, handleSubmit, watch, setValue, reset } = useForm();
    useEffect(() => {
        setLoading(true);
        async function loadData() {
            try {
                // Load invoice master and details
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
                setValue('totalDiscount', master.discount || 0);
                setValue('advancePaid', master.advancePaid || 0);
                setValue('balanceAmount', master.balanceAmount || 0);
                setValue('depositAmount', master.depositAmount || 0);
                setBookingStatus(master.bookingStatus || 'Pending');
                setDate(master.invoiceDate ? new Date(master.invoiceDate) : new Date());
                setLastAdvancePaid(master.advancePaid || 0);
                // Items
                setSelectedItems(resItems.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [invoiceNo, setValue]);

    // Search items (combobox)
    useEffect(() => {
        const searchItems = async () => {
            try {
                if (searchQuery && searchQuery.length > 0) {
                    const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/itemmaster/search/' + encodeURIComponent(searchQuery));
                    setSearchedItems(res.data || []);
                } else {
                    setSearchedItems([]);
                }
            } catch (err) {
                setSearchedItems([]);
            }
        };
        const t = setTimeout(() => searchItems(), 350);
        return () => clearTimeout(t);
    }, [searchQuery]);

    // Calculate totals automatically
    useEffect(() => {
        const subtotal = selectedItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const discount = watch('totalDiscount') || 0;
        const netTotal = subtotal - discount;
        setValue('totalAmount', subtotal);
        setValue('netTotal', netTotal);
        setValue('balanceAmount', netTotal - (watch('advancePaid') || 0));
    }, [selectedItems, watch('totalDiscount'), watch('advancePaid')]);

    // Add selected item to invoice
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
        setSelectedItemDetails(null);
        setItemPrice('');
        setAlteration('');
        setSelectedItem('');
        setSearchQuery('');
        setTimeout(() => {
            if (amountInputRef.current) amountInputRef.current.focus();
        }, 100);
    };

    // Combobox item select handler
    const handleComboBoxItemSelect = async (query) => {
        if (!query) return;
        const found = (searchedItems || []).find(i => String(i.itemCode) === String(query)) || (searchedItems || []).find(i => (i.itemName || i.itemShortDesc || '').toLowerCase().includes(String(query).toLowerCase()));
        if (found) {
            setSelectedItem(String(found.itemCode));
            setSelectedItemDetails(found);
            setItemPrice(found.itemPrice || '');
            setTimeout(() => { if (amountInputRef.current) amountInputRef.current.focus(); }, 50);
        } else {
            try {
                const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/itemmaster/' + encodeURIComponent(query));
                if (res.data) {
                    setSelectedItemDetails(res.data);
                    setItemPrice(res.data.itemPrice || '');
                }
            } catch (err) { }
        }
    };

    // Remove item from invoice
    const handleRemoveItem = (itemCode) => {
        setShowRemoveDialog({ open: true, itemCode });
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
            // Update salesInvoiceMaster
            const invoiceData = {
                ...data,
                invoiceNo,
                invoiceDate: date ? new Date(date) : (data.invoiceDate ? new Date(data.invoiceDate) : new Date()),
                bookingStatus,
                modifiedOn: new Date()
            };
            // Update salesInvoiceDetails
            const salesInvoiceDetails = selectedItems.map(item => ({
                invoiceNo,
                invoiceDate: date ? new Date(date) : (data.invoiceDate ? new Date(data.invoiceDate) : new Date()),
                itemCode: item.itemCode,
                group: item.group,
                alteration: item.alteration,
                amount: item.amount,
                deliveryDate: item.deliveryDate,
                returnDate: item.returnDate,
                bookingStatus,
                customerId: data.customerId,
                modifiedOn: new Date()
            }));
            // If advancePaid changed, save to dailyTransaction
            if (parseFloat(data.advancePaid) !== parseFloat(lastAdvancePaid)) {
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
                    transactionDate: date ? new Date(date) : new Date(),
                    transactionType: 'RENT_BOOKING_UPDATE',
                    invoiceNo,
                    creditAmount: data.advancePaid || 0,
                    customerId: data.customerId,
                    transactionDesc: data.remarks || '',
                    createdOn: new Date()
                };
                await axios.post(import.meta.env.VITE_API_BASE_URL + '/api/dailytransaction', dailyTransaction);
            }
            // Update master and details
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoice/${encodeURIComponent(invoiceNo)}`, invoiceData);
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/salesinvoicedetails/${encodeURIComponent(invoiceNo)}/items`, salesInvoiceDetails);
            toast.success('Invoice and details updated successfully!');
            navigate('/dashboard/sales');
        } catch (error) {
            setError(error.response?.data?.message || error.message);
        } finally {
            setSaving(false);
            setShowConfirmDialog(false);
            setPendingFormData(null);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    // --- UI similar to newBookingInvoice.jsx ---
    return (
        <div className="max-w-7xl mx-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Modify Booking Invoice — {invoiceNo}</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            ref={saveButtonRef}
                            onClick={handleSubmit(onSubmit)}
                            disabled={selectedItems.length === 0 || saving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer & Dates */}
                        <Card className="mb-2 border-2 border-[#0a174e] bg-white/90 shadow-lg">
                            <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2">
                                <CardTitle className="text-base font-bold tracking-wide">Customer & Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                                <div className="grid grid-cols-2 gap-1">
                                    <div className="w-[150px] h-[45px]">
                                        <Label className="text-xs">Customer List</Label>
                                        <Combobox value={selectedCustomer} onValueChange={val => {
                                            setSelectedCustomer(val);
                                            const c = customers.find(c => String(c.customerId) === String(val));
                                            if (c) {
                                                setValue('customerId', c.customerId || "");
                                                setValue('customerName', c.customerName || "");
                                                setValue('customerAddress', c.customerAddress || "");
                                                setValue('customerTel1', c.customerTel1 || "");
                                                setValue('customerTel2', c.customerTel2 || "");
                                            }
                                        }}>
                                            <ComboboxAnchor>
                                                <ComboboxInput placeholder="Customer..." className="h-7 text-xs" />
                                                <ComboboxTrigger />
                                            </ComboboxAnchor>
                                            <ComboboxContent>
                                                <ComboboxEmpty>No customers</ComboboxEmpty>
                                                {customers.map(customer => (
                                                    <ComboboxItem key={customer.customerId} value={customer.customerId}>
                                                        {customer.customerId} - {customer.customerName}
                                                    </ComboboxItem>
                                                ))}
                                            </ComboboxContent>
                                        </Combobox>
                                    </div>
                                    <div>
                                        <Label htmlFor="customerName" className="text-xs">Name</Label>
                                        <Input id="customerName" {...register('customerName')} className="h-10 text-xs" />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="customerAddress" className="text-xs">Address</Label>
                                        <Textarea id="customerAddress" {...register('customerAddress')} className="text-xs min-h-[32px]" />
                                    </div>
                                    <div>
                                        <Label htmlFor="customerTel1" className="text-xs">Tel 1</Label>
                                        <Input id="customerTel1" {...register('customerTel1')} className="h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label htmlFor="customerTel2" className="text-xs">Tel 2</Label>
                                        <Input id="customerTel2" {...register('customerTel2')} className="h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label htmlFor="nic1" className="text-xs">NIC 1</Label>
                                        <Input id="nic1" {...register('nic1')} className="h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label htmlFor="nic2" className="text-xs">NIC 2</Label>
                                        <Input id="nic2" {...register('nic2')} className="h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label htmlFor="deliveryDate" className="text-xs">Delivery</Label>
                                        <Input type="date" id="deliveryDate" {...register('deliveryDate')} className="h-7 text-xs" onChange={e => setValue('deliveryDate', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="returnDate" className="text-xs">Return</Label>
                                        <Input type="date" id="returnDate" {...register('returnDate')} className="h-7 text-xs" onChange={e => setValue('returnDate', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Items Section */}
                        <Card className="mb-2 border-2 border-[#0a174e] shadow-lg bg-white/90">
                            <CardHeader className="py-2 px-4 border-b-2 flex flex-row items-center gap-2">
                                <CardTitle className="text-base font-bold tracking-wide">Items</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                                <div className="flex flex-wrap items-end gap-2 mb-4">
                                    <div className="w-[100px]">
                                        <Label className="text-xs">Group</Label>
                                        <select className="h-7 text-xs border rounded" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
                                            <option value="">Group</option>
                                            {groups.map(group => (
                                                <option key={group.groupId} value={group.groupShortName}>{group.groupShortName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-[160px]">
                                        <Label className="text-xs">Item</Label>
                                        <input
                                            type="text"
                                            id="itemCode"
                                            placeholder="Search"
                                            className="border border-gray-300 rounded-lg py-1 px-1 focus:outline-none focus:border-accent transition duration-200 w-full max-w-xs"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleComboBoxItemSelect(searchQuery); }}
                                        />
                                    </div>
                                    <div className="w-[100px]">
                                        <Label className="text-xs">Name</Label>
                                        <div className="h-7 flex items-center px-2 text-xs border rounded bg-muted/50">
                                            <span className="truncate">{selectedItemDetails?.itemShortDesc || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="w-[60px]">
                                        <Label className="text-xs">Size</Label>
                                        <div className="h-7 flex items-center px-2 text-xs border rounded bg-muted/50">
                                            {selectedItemDetails?.itemSize || '-'}
                                        </div>
                                    </div>
                                    <div className="w-[80px]">
                                        <Label className="text-xs">Alteration</Label>
                                        <Input className="h-7 text-xs" name="alteration" value={alteration || ''} onChange={e => setAlteration(e.target.value)} />
                                    </div>
                                    <div className="w-[80px]">
                                        <Label className="text-xs">Price</Label>
                                        <Input className="h-7 text-xs" name="itemPrice" value={itemPrice} onChange={e => setItemPrice(e.target.value)} ref={amountInputRef} />
                                    </div>
                                    <div>
                                        <Button className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700 shadow" onClick={handleAddToTable} tabIndex={0}>Add</Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Alter</th>
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Group</th>
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Code</th>
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                                                <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Size</th>
                                                <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Amount</th>
                                                <th className="px-3 py-2 text-center text-sm font-medium text-gray-700">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedItems.map((item, idx) => (
                                                <tr key={item.itemCode}>
                                                    <td className="px-3 py-2">{item.alteration || '-'}</td>
                                                    <td className="px-3 py-2">{item.group || selectedGroup}</td>
                                                    <td className="px-3 py-2">{item.itemCode}</td>
                                                    <td className="px-3 py-2">{item.itemShortDesc}</td>
                                                    <td className="px-3 py-2">{item.itemSize}</td>
                                                    <td className="px-3 py-2 w-28 text-right">
                                                        <Input type="number" value={item.amount} min={1} onChange={e => handlePriceChange(item.itemCode, parseFloat(e.target.value))} className="w-20 h-7 text-xs border-2 border-[#0a174e] rounded" />
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <Button variant="destructive" size="sm" className="h-7 px-2 text-xs bg-[#d7263d] hover:bg-[#b71c2b] text-white border-2 border-[#0a174e] shadow" onClick={() => handleRemoveItem(item.itemCode)} tabIndex={0}>Remove</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Remove confirmation dialog */}
                                {showRemoveDialog.open && (
                                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(10,23,78,0.50)' }}>
                                        <div className="bg-gradient-to-br from-[#fff] via-[#fbeaec] to-[#e5e9f7] p-8 rounded-2xl shadow-2xl border-2 border-[#d7263d] min-w-[320px]">
                                            <div className="mb-4 text-lg font-semibold text-[#d7263d] flex items-center gap-2">Are you sure you want to remove this item?</div>
                                            <div className="flex gap-4 justify-end">
                                                <Button variant="destructive" className="bg-[#d7263d] hover:bg-[#b71c2b] text-white border-2 border-[#0a174e]" onClick={confirmRemoveItem} tabIndex={0}>Yes, Remove</Button>
                                                <Button variant="outline" className="border-2 border-[#0a174e] text-[#0a174e]" onClick={cancelRemoveItem} tabIndex={0}>Cancel</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    {/* Summary Section */}
                    <aside className="space-y-6">
                        <Card className="bg-gray-50 shadow rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{selectedItems.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0).toFixed(2)}</span>
                                </div>
                                <div>
                                    <Label htmlFor="totalDiscount" className="block text-sm text-gray-700">Discount</Label>
                                    <Input type="number" id="totalDiscount" {...register('totalDiscount', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 p-2 text-right" />
                                </div>
                                <div>
                                    <Label htmlFor="advancePaid" className="block text-sm text-gray-700">Advance Paid</Label>
                                    <Input type="number" id="advancePaid" {...register('advancePaid', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 p-2 text-right" />
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                    <span>Balance</span>
                                    <span>{(selectedItems.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0) - (parseFloat(watch('totalDiscount')) || 0) - (parseFloat(watch('advancePaid')) || 0)).toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
                {/* Confirmation Dialog */}
                {showConfirmDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(10,23,78,0.50)' }}>
                        <div className="relative bg-gradient-to-br from-[#f5f7fa]/95 via-[#fff]/98 to-[#e5e9f7]/95 p-0 rounded-2xl shadow-2xl border-2 border-[#0a174e] min-w-[340px] max-w-[95vw]">
                            <div className="h-2 w-full rounded-t-2xl bg-gradient-to-r from-[#0a174e] via-[#d7263d] to-[#0a174e] mb-2" />
                            <div className="px-8 pt-4 pb-2 flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="text-xl font-bold text-[#0a174e] drop-shadow">Confirm Save Invoice</div>
                                </div>
                                <div className="mb-2 text-[#0a174e] text-base text-center">Are you sure you want to <span className="font-semibold text-[#d7263d]">save this invoice</span> and all related bookings/transactions?</div>
                            </div>
                            <div className="flex gap-4 justify-end mt-4 px-8 pb-6">
                                <Button variant="outline" className="border-2 border-[#0a174e] text-[#0a174e] px-6 py-2 rounded-lg text-base font-semibold hover:bg-[#e5e9f7]" onClick={() => { setShowConfirmDialog(false); setPendingFormData(null); }} tabIndex={0} autoFocus>Cancel</Button>
                                <Button className="bg-gradient-to-r from-[#0a174e] to-[#d7263d] hover:from-[#d7263d] hover:to-[#0a174e] text-white px-6 py-2 rounded-lg text-base font-semibold shadow-md border-2 border-[#0a174e]" onClick={handleConfirmedSave} tabIndex={0} disabled={saving}>{saving ? 'Saving...' : 'Yes, Save'}</Button>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );

}