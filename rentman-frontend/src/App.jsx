import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './pages/login.jsx';
import HomePage from './pages/home.jsx';
import DashboardLayout from './pages/dashboard.jsx';
import Unauthorized from './components/unauthorized.jsx';
import AdminProductPage from './pages/admin/inventory/productPage.jsx';
import AddProductPage from './pages/admin/inventory/addProduct.jsx';
import AddGroupPage from './pages/admin/inventory/addGroupPage.jsx';
import GroupMasterPage from './pages/admin/inventory/groupMasterPage.jsx';
import EditGroupPage from './pages/admin/inventory/editGroupPage.jsx';
import NewBookingInvoice from './pages/cashier/newBookingInvoice.jsx';
import { Toaster } from 'react-hot-toast';
import ViewCustomer from './pages/manager/customer/viewCustomer.jsx';
import PurchaseHistory from './pages/manager/customer/purchaseHistory.jsx';
import AddCustomer from './pages/manager/customer/addCustomer.jsx';
import ModifyBooking from './pages/cashier/modifyBooking.jsx';
import BookingList from './pages/cashier/bookingList.jsx';
import DailyTransaction from './pages/cashier/dailyTransaction.jsx';
import PostBooking from './pages/manager/sales/postBooking.jsx';
import AddDryClean from './pages/manager/inventory/addDryClean.jsx';
import DryCleanList from './pages/manager/inventory/dryCleanList.jsx';
import AddEmployee from './pages/admin/employee/addEmployee.jsx';
import EmployeesList from './pages/admin/employee/employeesList.jsx';
import AddUsers from './pages/admin/users/addUsers';
import UsersList from './pages/admin/users/usersList';

function App() {

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
                <Route path="/dashboard/addemployee" element={<AddEmployee />} />
                <Route path="/dashboard/employeeslist" element={<EmployeesList />} />
                <Route path="/dashboard/adduser" element={<AddUsers />} />
                <Route path="/dashboard/userslist" element={<UsersList />} />
                {/* <Route path="users" element={<UserManagement />} /> */}
                {/* <Route path="settings" element={<SystemSettings />} /> */}
              </Route>

              {/* Manager routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/dashboard/itemmaster" element={<AdminProductPage />} />
                <Route path="/dashboard/dryclean" element={<DryCleanList />} />
                <Route path="/dashboard/sales/postbooking" element={<PostBooking />} />
                <Route path="/dashboard/itemmaster/add" element={<AddProductPage />} />
                <Route path="/dashboard/dryclean/add" element={<AddDryClean />} />

                <Route path="/dashboard/groupmaster/add" element={<AddGroupPage />} />
                <Route path="/dashboard/groupmaster" element={<GroupMasterPage />} />
                <Route path="/dashboard/groupmaster/editgroup/:groupId" element={<EditGroupPage />} />
                {/* <Route path="reports" element={<Reports />} /> */}
                {/* <Route path="price-adjustment" element={<PriceAdjustment />} /> */}
              </Route>

              {/* Cashier routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']} />}>
                <Route path="/dashboard/sales/newbooking" element={<NewBookingInvoice />} />
                <Route path="/dashboard/sales/bookinglist" element={<BookingList />} />
                <Route path="/dashboard/sales/dalytransaction" element={<DailyTransaction />} />
                <Route path="/dashboard/sales/modifybooking/:invoiceNo" element={<ModifyBooking />} />
                <Route path="/dashboard/sales/customers/viewcustomers" element={<ViewCustomer />} />
                <Route path="/dashboard/sales/customers/addcustomer" element={<AddCustomer />} />
                <Route path="/dashboard/sales/customers/purchasehistory" element={<PurchaseHistory />} />
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