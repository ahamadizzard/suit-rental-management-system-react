import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaEye, FaUpload, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ProductUpsertPage() {
    const { itemCode } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!!itemCode);
    // Set the state for the upload progress
    const [uploadProgress, setUploadProgress] = useState(0);
    // Set the state for the groups
    const [groups, setGroups] = useState([]);
    // Set the state for the form data
    const [formData, setFormData] = useState({
        itemCode: '',
        itemShortName: '',
        itemSize: '',
        itemGroupShortDesc: '',
        itemGroupDesc: '',
        itemShortDesc: '',
        itemPrice: '',
        itemName: '',
        itemMaterialType: '',
        itemMaterialVendor: '',
        itemRemarks: '',
        isSchoolItem: false,
        itemStatus: 'Available',
        itemImages: [],
        // Read-only fields for existing items
        quantity: 0,
        lastSaleDate: '',
        lastInvoiceNumber: '',
        lastDryCleanDate: ''
    });

    // Set the state for any errors in the form
    const [errors, setErrors] = useState({});
    // Set the state for the selected files
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Fetch the groups and product data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch groups
                const groupsResponse = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/groupmaster`
                );
                setGroups(groupsResponse.data);

                // If itemCode exists in URL params, fetch the product data
                if (itemCode) {
                    console.log('Fetching item with code:', itemCode); // Debug log
                    const productResponse = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${itemCode}`
                    );
                    console.log('API Response:', productResponse.data); // Debug log
                    setFormData({
                        ...productResponse.data,
                        itemImages: productResponse.data.itemImages || []
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error(`Failed to load data: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [itemCode]);

    const handleItemCodeKeyDown = async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission

            // Only fetch if we have a value and we're not already editing
            if (formData.itemCode && !itemCode) {
                try {
                    setIsLoading(true);
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_BASE_URL}/api/itemmaster/${formData.itemCode}`
                    );

                    if (response.data) {
                        // If item exists, populate the form
                        setFormData({
                            ...response.data,
                            itemImages: response.data.itemImages || []
                        });
                        toast.success('Product loaded successfully');
                    } else {
                        toast('No product found with this code', { icon: 'ℹ️' });
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    toast.error('Failed to load product');
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };


    // Validate the form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData.itemCode) newErrors.itemCode = 'Item Code is required';
        else if (formData.itemCode.length > 10) newErrors.itemCode = 'Max 10 characters';
        else if (!/^\d+$/.test(formData.itemCode)) newErrors.itemCode = 'Must be numeric';

        if (!formData.itemName) newErrors.itemName = 'Item Name is required';
        if (!formData.itemShortName) newErrors.itemShortName = 'Short Name is required';
        if (!formData.itemGroupShortDesc) newErrors.itemGroupShortDesc = 'Group is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle changes to the form data
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // When group is selected, find and set its description
        if (name === 'itemGroupShortDesc') {
            const selectedGroup = groups.find(g => g.groupShortName === value);
            if (selectedGroup) {
                setFormData(prev => ({
                    ...prev,
                    itemGroupDesc: selectedGroup.groupDescription || ''
                }));
            }
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setSelectedFiles(files);

        // Preview images
        const filePreviews = files.map(file => ({
            name: file.name,
            preview: URL.createObjectURL(file)
        }));

        // For immediate preview before upload
        setFormData(prev => ({
            ...prev,
            itemImages: [...prev.itemImages, ...filePreviews.map(f => f.preview)]
        }));
    };

    // Handle image upload
    const handleImageUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const uploadPromises = selectedFiles.map(file => {
                const formData = new FormData();
                formData.append('image', file);

                return axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(percentCompleted);
                        }
                    }
                );
            });

            const responses = await Promise.all(uploadPromises);
            const imageUrls = responses.map(res => res.data.url);

            setFormData(prev => ({
                ...prev,
                itemImages: [...prev.itemImages.filter(img => !img.startsWith('blob:')), ...imageUrls]
            }));

            toast.success('Images uploaded successfully!');
            setSelectedFiles([]);
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
            // Remove the blob previews if upload fails
            setFormData(prev => ({
                ...prev,
                itemImages: prev.itemImages.filter(img => !img.startsWith('blob:'))
            }));
        } finally {
            setUploadProgress(0);
        }
    };

    // Remove an image from the list
    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            itemImages: prev.itemImages.filter((_, i) => i !== index)
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in as admin to manage products');
                return;
            }

            // Upload any selected files first
            if (selectedFiles.length > 0) {
                await handleImageUpload();
            }

            // Prepare payload
            const payload = {
                ...formData,
                itemCode: Number(formData.itemCode),
                itemSize: formData.itemSize ? Number(formData.itemSize) : undefined,
                itemPrice: formData.itemPrice ? Number(formData.itemPrice) : undefined,
                // Filter out the read-only fields if it's a new item
                ...(!itemCode && {
                    quantity: undefined,
                    lastSaleDate: undefined,
                    lastInvoiceNumber: undefined,
                    lastDryCleanDate: undefined
                })
            };

            // Determine if we're updating or creating
            const url = `${import.meta.env.VITE_API_BASE_URL}/api/itemmaster`;
            const method = itemCode ? 'put' : 'post';
            const response = await axios[method](
                itemCode ? `${url}/${itemCode}` : url,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(response.data);
            toast.success(`Product ${itemCode ? 'updated' : 'added'} successfully!`);
            navigate('/admin/products');
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(`Failed to save product: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If the page is loading, display a loading spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading product data...</p>
                </div>
            </div>
        );
    }

    // Render the form
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {itemCode ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        {itemCode && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                Existing Item
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Form Column (Left) */}
                        <div className="w-full md:w-1/2 p-6 border-r border-gray-200">
                            <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.name !== 'itemCode') {
                                    handleSubmit(e);
                                }
                            }}>
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Item Code Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Item Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="itemCode"
                                            value={formData.itemCode}
                                            onChange={handleChange}
                                            onKeyDown={handleItemCodeKeyDown}
                                            maxLength="10"
                                            className={`mt-1 block w-32 border ${errors.itemCode ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                            placeholder="Type code & press Enter"
                                        />
                                        {errors.itemCode && (
                                            <p className="mt-1 text-sm text-red-600">{errors.itemCode}</p>
                                        )}
                                        {isLoading && formData.itemCode && (
                                            <p className="mt-1 text-sm text-gray-500">Loading product...</p>
                                        )}
                                    </div>

                                    {/* Read-only fields for existing items */}
                                    {itemCode && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.quantity}
                                                    readOnly
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Last Sale Date
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lastSaleDate || 'N/A'}
                                                    readOnly
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Last Invoice Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lastInvoiceNumber || 'N/A'}
                                                    readOnly
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Last Dry Clean Date
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lastDryCleanDate || 'N/A'}
                                                    readOnly
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Editable fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Item Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="itemName"
                                            value={formData.itemName}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full border ${errors.itemName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        />
                                        {errors.itemName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Short Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="itemShortName"
                                            value={formData.itemShortName}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full border ${errors.itemShortName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        />
                                        {errors.itemShortName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.itemShortName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Group <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="itemGroupShortDesc"
                                            value={formData.itemGroupShortDesc}
                                            onChange={handleChange}
                                            className={`mt-1 block w-full border ${errors.itemGroupShortDesc ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        >
                                            <option value="">Select a group</option>
                                            {groups.map(group => (
                                                <option key={group._id} value={group.groupShortName}>
                                                    {group.groupShortName} - {group.groupName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.itemGroupShortDesc && (
                                            <p className="mt-1 text-sm text-red-600">{errors.itemGroupShortDesc}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Group Description
                                        </label>
                                        <input
                                            type="text"
                                            name="itemGroupDesc"
                                            value={formData.itemGroupDesc}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            readOnly
                                        />
                                    </div>

                                    {/* Other editable fields (size, price, etc.) */}
                                    {/* ... (keep your existing fields for size, price, status, etc.) ... */}

                                    {/* Image Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Images
                                        </label>
                                        <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            {uploadProgress > 0 && uploadProgress < 100 ? (
                                                <div className="w-full">
                                                    <div className="mb-2 text-sm text-gray-600">
                                                        Uploading {selectedFiles.length} file(s)...
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-blue-600 h-2.5 rounded-full"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="space-y-1 text-center">
                                                        <FaUpload className="mx-auto h-8 w-8 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="file-upload"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                                            >
                                                                <span>Upload images</span>
                                                                <input
                                                                    id="file-upload"
                                                                    name="file-upload"
                                                                    type="file"
                                                                    multiple
                                                                    ref={fileInputRef}
                                                                    onChange={handleFileSelect}
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF up to 5MB
                                                        </p>
                                                    </div>
                                                    {selectedFiles.length > 0 && (
                                                        <div className="mt-4 w-full">
                                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                                Selected Files:
                                                            </h4>
                                                            <ul className="text-sm text-gray-600">
                                                                {selectedFiles.map((file, index) => (
                                                                    <li key={index} className="truncate">
                                                                        {file.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {formData.itemImages.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                    {itemCode ? 'Current Images' : 'Uploaded Images'}
                                                </h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {formData.itemImages.map((img, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={img}
                                                                alt={`Product ${index + 1}`}
                                                                className="h-24 w-full object-cover rounded border border-gray-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/products')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FaTimes className="mr-2" /> Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {itemCode ? (
                                            <>
                                                <FaEdit className="mr-2" />
                                                {isSubmitting ? 'Updating...' : 'Update Product'}
                                            </>
                                        ) : (
                                            <>
                                                <FaSave className="mr-2" />
                                                {isSubmitting ? 'Saving...' : 'Add Product'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Preview Column (Right) */}
                        <div className="w-full md:w-1/2 p-6 bg-gray-50">
                            <div className="sticky top-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Live Preview</h3>

                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                                            <div className="mt-2 space-y-2">
                                                <p><span className="font-medium">Code:</span> {formData.itemCode || '-'}</p>
                                                <p><span className="font-medium">Name:</span> {formData.itemName || '-'}</p>
                                                <p><span className="font-medium">Short Name:</span> {formData.itemShortName || '-'}</p>
                                                <p><span className="font-medium">Group Sh. Desc:</span> {formData.itemGroupShortDesc || '-'}</p>
                                                <p><span className="font-medium">Group Desc:</span> {formData.itemGroupDesc || '-'}</p>
                                                <p><span className="font-medium">Size:</span> {formData.itemSize || '-'}</p>
                                                <p><span className="font-medium">Price:</span> {formData.itemPrice ? `$${formData.itemPrice}` : '-'}</p>
                                                <p><span className="font-medium">Status:</span> {formData.itemStatus}</p>
                                                <p><span className="font-medium">School Item:</span> {formData.isSchoolItem ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 border-b pb-2">Additional Information</h4>
                                            <div className="mt-2 space-y-2">
                                                <p><span className="font-medium">Short Desc:</span> {formData.itemShortDesc || '-'}</p>
                                                <p><span className="font-medium">Material Type:</span> {formData.itemMaterialType || '-'}</p>
                                                <p><span className="font-medium">Material Vendor:</span> {formData.itemMaterialVendor || '-'}</p>
                                                <p><span className="font-medium">Remarks:</span> {formData.itemRemarks || '-'}</p>
                                            </div>
                                        </div>

                                        {formData.itemImages.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 border-b pb-2">Images</h4>
                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                    {formData.itemImages.map((img, index) => (
                                                        <img
                                                            key={index}
                                                            src={img}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-20 w-full object-cover rounded border border-gray-200"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {Object.keys(errors).length > 0 && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <h4 className="font-medium text-red-800">Validation Issues</h4>
                                                <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                                                    {Object.values(errors).map((error, index) => (
                                                        error && <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}