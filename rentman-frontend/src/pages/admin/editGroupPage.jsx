import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';



export default function EditGroupPage() {
    const params = useParams();
    const groupId = params.groupId;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    // const [isFetchingLastId, setIsFetchingLastId] = useState(true);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        groupId: '',
        groupName: '',
        groupShortName: '',
        groupDescription: ''
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token === null) {
            toast.error('You are not logged in, please login first');
            navigate('/login');
            return;
        }

        axios.get(import.meta.env.VITE_API_BASE_URL + '/api/groupmaster/' + groupId, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then((response) => {
                setFormData({
                    groupId: response.data.groupId,
                    groupName: response.data.groupName,
                    groupShortName: response.data.groupShortName,
                    groupDescription: response.data.groupDescription
                });
            })
            .catch((error) => {
                toast.error('Failed to fetch group data');
                navigate('/dashboard/groupmaster');
            });

    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.groupName.trim()) newErrors.groupName = 'Group Name is required';
        if (!formData.groupShortName.trim()) newErrors.groupShortName = 'Short Name is required';
        if (formData.groupShortName.length > 20) newErrors.groupShortName = 'Short Name must be 20 characters or less';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.put(
                import.meta.env.VITE_API_BASE_URL + '/api/groupmaster/' + groupId,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            toast.success('Group Updated successfully');
            navigate('/dashboard/groupmaster');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating group');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 py-4 px-6">
                    <h1 className="text-2xl font-bold text-white">Add New Group</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
                                Group ID
                            </label>
                            <input
                                type="text"
                                id="groupId"
                                name="groupId"
                                value={formData.groupId}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {/* {isFetchingLastId && (
                                <p className="mt-1 text-sm text-gray-500">Generating group ID...</p>
                            )} */}
                        </div>

                        <div>
                            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                                Group Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="groupName"
                                name="groupName"
                                value={formData.groupName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                                placeholder="Enter group name"
                            />
                            {/* {errors.groupName && <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>} */}
                        </div>

                        <div>
                            <label htmlFor="groupShortName" className="block text-sm font-medium text-gray-700 mb-1">
                                Short Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="groupShortName"
                                name="groupShortName"
                                value={formData.groupShortName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"

                                placeholder="Enter short name (max 10 chars)"
                                maxLength="20"
                            />
                            {/* {errors.groupShortName && <p className="mt-1 text-sm text-red-600">{errors.groupShortName}</p>} */}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="groupDescription"
                            name="groupDescription"
                            value={formData.groupDescription}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter group description"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/groupmaster')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <FaTimes className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            // disabled={isLoading || isFetchingLastId}
                            className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-200 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                        >
                            {isLoading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <FaSave className="mr-2" /> Save Group
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}