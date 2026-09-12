import { useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTION } from "../utils/orderFlow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface props {
    order: IOrder,
    onStatusUpdate?: () => void;
}
const statusColor = (status: string) => {
    switch (status) {
        case 'placed':
            return 'bg-yello-100 text-yellow-700';
        case 'accepted':
            return 'bg-orange-100 text-yellow-700';
        case 'preparing':
            return 'bg-blue-100 text-yellow-700';
        case 'ready_for_rider':
            return 'bg-indigo-100 text-yellow-700'; 
        case 'picked_up':
            return 'bg-purple-100 text-yellow-700'; 
        case 'delivered':
            return 'bg-green-100 text-yellow-700';  
        default:
            return 'bg-gray-100 text-yellow-700';            
    }
}
const OrderCard = ({ order, onStatusUpdate }: props) => {
    const [loading , setLoading] = useState(false);

    const actions = ORDER_ACTION[order.status] ?? [];

    const updateStatus = async (status : string) => {
        try {
            setLoading(true);
            await axios.put(
                `${restaurantService}/api/order/${order._id}`,
                {status},
                {
                    headers : {
                        Authorization : `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            toast.success('Order update');
        } catch (error : any) {
            toast.error(error.response.data.msg);
        } finally{
            setLoading(false);
        }
    }
    return (
        <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
            <div className = 'flex justify-between items-center'>
                <p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(order.status)}`}>
                    {order.status.replaceAll("_" , " ")}
                </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
                {order.items.map((item , i) => (
                    <p key={i}>{item.name} x {item.quantity} </p>
                ))}
            </div>
            <div className="flex justify-between text-sm font-medium">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
            </div>
            <p className="text-xs text-g">Payment : {order.paymentStatus}</p>
            {
                order.paymentStatus === 'paid' && actions.length>0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {
                            actions.map((status) => (
                              <button
                              key={status}
                              disabled={loading}
                              onClick={() => updateStatus(status)}
                              className="rounded-xl bg-[#E23744] px-3 py-1 text-xs text-white hover:[#d32f3a] disabled:opacity-50"
                              >
                                Mark as {status.replaceAll('_' , ' ')}
                              </button>  
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default OrderCard;