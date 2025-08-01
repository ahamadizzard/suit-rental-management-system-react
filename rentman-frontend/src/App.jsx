import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './pages/login.jsx';
import HomePage from './pages/home.jsx';
import DashboardLayout from './pages/dashboard.jsx';
import Unauthorized from './components/unauthorized.jsx';
import AdminProductPage from './pages/admin/productPage';
import AddProductPage from './pages/admin/addProduct';
import AddGroupPage from './pages/admin/addGroupPage';
import GroupMasterPage from './pages/admin/groupMasterPage';
import EditGroupPage from './pages/admin/editGroupPage.jsx';
import NewBookingInvoice from './pages/cashier/newBookingInvoice.jsx';
import { Toaster } from 'react-hot-toast';
// import Login from './pages/login.jsx';

function App() {
  // useEffect(() => {
  //   // Clear authentication data on app start
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('userFirstName');
  //   localStorage.removeItem('userRole');
  // }, []);

  return (
    <BrowserRouter>
      <div>
        <Toaster position='top-right' />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<HomePage />} />

              {/* Admin only routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                {/* <Route path="users" element={<UserManagement />} /> */}
                {/* <Route path="settings" element={<SystemSettings />} /> */}
              </Route>

              {/* Manager routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/dashboard/itemmaster" element={<AdminProductPage />} />
                <Route path="/dashboard/itemmaster/add" element={<AddProductPage />} />
                <Route path="/dashboard/groupmaster/add" element={<AddGroupPage />} />
                <Route path="/dashboard/groupmaster" element={<GroupMasterPage />} />
                <Route path="/dashboard/groupmaster/editgroup/:groupId" element={<EditGroupPage />} />
                {/* <Route path="reports" element={<Reports />} /> */}
                {/* <Route path="price-adjustment" element={<PriceAdjustment />} /> */}
              </Route>

              {/* Cashier routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
                <Route path="/dashboard/sales/newbooking" element={<NewBookingInvoice />} />
                {/* <Route path="dry-cleaning" element={<DryCleaning />} /> */}
                {/* <Route path="tailoring" element={<Tailoring />} /> */}
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;