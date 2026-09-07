import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import {loadStripe} from '@stripe/stripe-js'

interface Address {
    _id: string;
    formattedAddress: string;
    mobile: string;
}

const CheckOut = () => {
    const { cart, subtotal, quantity } = useAppData();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [loadingRazorpay, setLoadingRazorpay] = useState(false);
    const [loadingStripe, setLoadingStrip] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!cart || cart.length === 0) {
                setLoadingAddress(false);
                return;
            }

            try {
                const { data } = await axios.get(
                    `${restaurantService}/api/address/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                // Adjust this depending on your backend response
                setAddresses(data.addresses || data || []);
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch addresses");
            } finally {
                setLoadingAddress(false);
            }
        };

        fetchAddresses();
    }, [cart]);

    if (!cart || cart.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-lg text-gray-500">
                    Your cart is empty
                </p>
            </div>
        );
    }

    const restaurant = cart[0].restaurantId as IRestaurant;

    const deliveryFee = subtotal < 250 ? 49 : 0;
    const platformFee = 7;
    const grandTotal = subtotal + deliveryFee + platformFee;

    const createOrder = async (
        paymentMethod: "razorpay" | "stripe"
    ) => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return null;
        }

        setCreatingOrder(true);

        try {
            const { data } = await axios.post(
                `${restaurantService}/api/order/new`,
                {
                    paymentMethod,
                    addressId: selectedAddressId,

                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            return data;
        } catch (error) {
            console.log(error);
            toast.error("Failed to create order");
            return null;
        } finally {
            setCreatingOrder(false);
        }
    };

    const payWithRazorpay = async () => {
        try {
            setLoadingRazorpay(true);

            const order = await createOrder("razorpay");

            if (!order) return;

            const { orderId, amount } = order;

            const { data } = await axios.post(
                `${utilsService}/api/payment/create`,
                { orderId }
            );

            const { razorpayOrderId, key } = data;

            const options = {
                key,
                amount: amount * 100,
                currency: "INR",
                name: "Cravio",
                description: "Food order payment",
                order_id: razorpayOrderId,

                handler: async (response: any) => {
                    try {
                        await axios.post(
                            `${utilsService}/api/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId
                            }
                        );

                        toast.success("Payment successful");

                        navigate(
                            "/paymentsuccess/" +
                            response.razorpay_payment_id
                        );
                    } catch (error) {
                        console.log(error);
                        toast.error("Payment verification failed");
                    }
                },

                theme: {
                    color: "#E23744",
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.log(error);
            toast.error("Payment failed. Please refresh the page.");
        } finally {
            setLoadingRazorpay(false);
        }
    };

    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    const payWithStripe = async () => {
        try {
            setLoadingStrip(true);

            const order = await createOrder("stripe");

            if (!order) return;
            const {orderId , amount} = order;
            try {
                const stripe = await stripePromise;
                const {data} = await axios.post(`${utilsService}/api/payment/stripe/create` , {
                    orderId
                })

                if(data.url){
                    window.location.href = data.url
                }else{
                    toast.error('failed to create payment session')
                }
            } catch (error) {
                toast.error('payment failed')
            }

            // Add Stripe checkout logic here
        } catch (error) {
            console.log(error);
            toast.error("Payment failed");
        } finally {
            setLoadingStrip(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
            <h1 className="text-2xl font-bold">Checkout</h1>

            {/* Restaurant */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold">
                    {restaurant.name}
                </h2>

                <p className="text-sm text-gray-500">
                    {restaurant.autoLocation?.formattedAddress}
                </p>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
                <h3 className="font-semibold">Delivery Address</h3>

                {loadingAddress ? (
                    <p className="text-sm text-gray-500">
                        Loading addresses...
                    </p>
                ) : addresses.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No address found. Please add one.
                    </p>
                ) : (
                    addresses.map((add) => (
                        <label
                            key={add._id}
                            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${selectedAddressId === add._id
                                    ? "border-[#E23744] bg-red-50"
                                    : "hover:bg-gray-50"
                                }`}
                        >
                            <input
                                type="radio"
                                name="address"
                                checked={selectedAddressId === add._id}
                                onChange={() =>
                                    setSelectedAddressId(add._id)
                                }
                            />

                            <div>
                                <p className="font-medium">
                                    {add.formattedAddress}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {add.mobile}
                                </p>
                            </div>
                        </label>
                    ))
                )}
            </div>

            {/* Order Summary */}
            <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
                <h3 className="font-semibold">Order Summary</h3>

                {cart.map((cartItem: ICart) => {
                    const item = cartItem.itemId as IMenuItem;

                    return (
                        <div
                            className="flex justify-between text-sm"
                            key={cartItem._id}
                        >
                            <span>
                                {item.name} x {cartItem.quantity}
                            </span>

                            <span>
                                ₹{item.price * cartItem.quantity}
                            </span>
                        </div>
                    );
                })}

                <hr />

                <div className="flex justify-between">
                    <span>Items ({quantity})</span>
                    <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                    <span>Subtotal</span>
                    {
                        subtotal < 250 && (
                            <p className="text-xs text-gray-500">
                                Add Item worth ₹{250 - subtotal} more to get Free delivery
                            </p>
                        )
                    }
                </div>

                <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                </div>

                <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                </div>
            </div>

            {/* Payment Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={payWithRazorpay}
                    disabled={
                        loadingRazorpay ||
                        creatingOrder ||
                        !selectedAddressId
                    }
                    className="rounded-lg bg-[#E23744] px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingRazorpay || creatingOrder
                        ? "Processing..."
                        : "Pay with Razorpay"}
                </button>

                <button
                    onClick={payWithStripe}
                    disabled={
                        loadingStripe ||
                        creatingOrder ||
                        !selectedAddressId
                    }
                    className="rounded-lg bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingStripe || creatingOrder
                        ? "Processing..."
                        : "Pay with Stripe"}
                </button>
            </div>
        </div>
    );
};

export default CheckOut;

