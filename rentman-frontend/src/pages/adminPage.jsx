import { Button } from "@/components/ui/button.jsx";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
// import AdminProductPage from "./admin/productPage";
// import AddProductPage from "./admin/addProductPage";
// import EditProductPage from "./admin/editProductPage";

export default function AdminPage() {
    const userFirstName = localStorage.getItem('user');
    return (
        <div className="w-full h-screen  flex">
            {/* // divide into 2 sections */}
            <div className="w-[200px] h-full bg-gray-300  flex flex-col gap-4 p-4 ">
                <h4 className="bg-blue-300 rounded-md p-2 text-center font-bold w-full">{userFirstName}</h4>
                <h1 className="text-2xl font-bold ">Admin Panel</h1>
                <Link to="/admin/products">Products</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/orders">Orders</Link>
                <Link to="/admin/reviews">Reviews</Link>
                <Button>This is ShadCN Button</Button>
            </div>
            <div className="w-[calc(100%-200px)] h-full ">
                <Routes path="/*">
                    {/* <Route path="/products" element={<AdminProductPage />} /> */}
                    {/* <Route path="/products" element={<AdminProductPage />} /> */}
                    <Route path="/users" element={<h1 className="text-2xl  m-5">Users</h1>} />
                    <Route path="/orders" element={<h1 className="text-2xl  m-5">Orders</h1>} />
                    <Route path="/reviews" element={<h1 className="text-2xl  m-5">Reviews</h1>} />
                    {/* <Route path="/add-product" element={<AddProductPage />} /> */}
                    {/* <Route path="/edit-product" element={<EditProductPage />} /> */}
                </Routes>
            </div>
        </div>
    );
}