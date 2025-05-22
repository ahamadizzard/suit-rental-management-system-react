import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

export default function GroupMasterPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [groupMasterData, setGroupMasterData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) {
            axios.get(import.meta.env.VITE_API_BASE_URL + "/api/groupMaster")
                .then((response) => {
                    // Convert to numbers for proper numeric sorting
                    const sortedData = response.data.sort((a, b) =>
                        parseInt(a.groupId) - parseInt(b.groupId)
                    );
                    setGroupMasterData(sortedData);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching group master data:", error);
                    toast.error("Error fetching group master data");
                    setIsLoading(false);
                });
        }
    }, [isLoading]);

    const handleDelete = (groupId) => {
        if (window.confirm("Are you sure you want to delete this group?")) {
            axios.delete(import.meta.env.VITE_API_BASE_URL + `/api/groupMaster/${groupId}`)
                .then(() => {
                    toast.success("Group deleted successfully");
                    setIsLoading(true); // Trigger refresh
                })
                .catch((error) => {
                    console.error("Error deleting group:", error);
                    toast.error("Error deleting group");
                });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Group Master</h1>
                <button
                    onClick={() => navigate("/dashboard/groupmaster/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <FiPlus className="mr-2" />
                    Add New Group
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                        Group ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                        Group Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                        Short Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs border-3 bg-gray-200 font-medium text-gray-900 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groupMasterData.map((group) => (
                                    <tr key={group._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {group.groupId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {group.groupName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {group.groupShortName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {group.groupDescription || '-'}
                                        </td>
                                        <td className="px-6 py-4 ">
                                            <div className="flex justify-center space-x-4">
                                                {/* <button
                                                    onClick={() => navigate(`/groupMaster/view/${group.groupId}`)}
                                                    className="text-white bg-blue-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-blue-100 text-md shadow-lg shadow-blue-500/50 hover:scale-110 transition-all duration-200"
                                                    title="View"
                                                >
                                                    <FiEye size={22} /> View
                                                </button> */}
                                                <button
                                                    onClick={() => navigate(`/dashboard/groupMaster/editGroup/${group.groupId}`)}
                                                    className="text-white bg-green-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-green-100 text-md shadow-lg shadow-green-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={22} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(group.groupId)}
                                                    className="text-white bg-red-600 rounded-md flex flex-row cursor-pointer items-center justify-center gap-1 pl-2 pr-2 hover:text-red-100 text-md shadow-lg shadow-red-500/50 hover:scale-110 transition-all duration-200"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={22} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isLoading && groupMasterData.length === 0 && (
                <div className="bg-white shadow-md rounded-lg p-8 text-center">
                    <p className="text-gray-500">No groups found. Click "Add New Group" to create one.</p>
                </div>
            )}
        </div>
    );
}