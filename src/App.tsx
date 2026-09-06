import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/Navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import CartPage from "./pages/Cart";
import AddAddressPage from "./pages/address";
import CheckOut from "./pages/Checkout";
import PaymentSuccess from "./pages/paymentSuccess";

const App = () => {
  const { user, loading } = useAppData();

  // Wait until we know who the user is before deciding anything
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={user?.role === 'seller' ? <Restaurant /> : <Home />} />
          <Route path="/restaurant/:id" element={<RestaurantPage/>} />
          <Route path="/cart" element={<CartPage/>} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/account" element={<Account />} />
          <Route path="/address" element={<AddAddressPage/>} />
          <Route path="/checkout" element={<CheckOut/>} />
          <Route path="/paymentSuccess/:paymentId" element={<PaymentSuccess/>} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;