
import axios from "axios";
import type { IOrder } from "../types";
import { riderServer } from "../main";
import toast from "react-hot-toast";

interface Props {
    order: IOrder;
    onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
    const updateStatus = async () => {
        try {
            await axios.put(
                `${riderServer}/api/rider/order/update/${order._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            toast.success("Order status updated");
            onStatusUpdate();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                "Failed to update order status"
            );
        }
    };

//     console.log("Current order:", order);
// console.log("Delivery address:", order.deliveryAddress);
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
            <h1 className="font-semibold text-gray-800">
                Current Order
            </h1>

            <div className="space-y-1 text-sm text-gray-600">
                <p><b>Pickup:</b> {order.restaurantName}</p>
                <p><b>Drop:</b>  {order.deliveryAddress?.formattedAddress || "Address unavailable"}</p>
                <p><b>Total:</b> ₹{order.totalAmount}</p>
                <p>Your Earning: <b>₹{order.riderAmount}</b></p>

                <p>
                    <b>Status:</b>{" "}
                    <span className="capitalize text-blue-600">
                        {order.status.replace(/_/g, " ")}
                    </span>
                </p>

                {order.deliveryAddress.mobile && (
                    <div className="rounded-lg border p-3">
                        <p className="text-gray-500">Customer Phone</p>
                        <p className="font-semibold text-gray-800">
                            {order.deliveryAddress.mobile}
                        </p>
                        <a
                            href={`tel:${order.deliveryAddress.mobile}`}
                            className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Call
                        </a>
                    </div>
                )}

                {order.status === "rider_assigned" && (
                    <button
                        onClick={updateStatus}
                        className="w-full rounded-lg bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
                    >
                        Reached Restaurant
                    </button>
                )}

                {order.status === "picked_up" && (
                    <button
                        onClick={updateStatus}
                        className="w-full rounded-lg bg-green-500 py-2 font-semibold text-white hover:bg-green-600"
                    >
                        Mark as Delivered
                    </button>
                )}
            </div>
        </div>
    );
};

export default RiderCurrentOrder;
