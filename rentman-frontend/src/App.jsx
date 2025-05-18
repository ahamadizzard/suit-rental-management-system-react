import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './pages/login.jsx';
import HomePage from './pages/home.jsx';
import DashboardLayout from './pages/dashboard.jsx';
import Unauthorized from './components/unauthorized.jsx';
import AdminProductPage from './pages/admin/productPage';
import AddProductPage from './pages/admin/addProduct';
import AddGroupPage from './pages/admin/addGroupPage';
import GroupMasterPage from './pages/admin/groupMasterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
              {/* <Route path="reports" element={<Reports />} /> */}
              {/* <Route path="price-adjustment" element={<PriceAdjustment />} /> */}
            </Route>

            {/* Cashier routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
              {/* <Route path="sales" element={<Sales />} /> */}
              {/* <Route path="dry-cleaning" element={<DryCleaning />} /> */}
              {/* <Route path="tailoring" element={<Tailoring />} /> */}
            </Route>
          </Route>
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;