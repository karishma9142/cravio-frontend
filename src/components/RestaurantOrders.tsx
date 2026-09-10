import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";

const ACTIVE_STATUSES = ['placed' , 'accepted' , 'preaparing' , 'ready_for_rider' , 'rider_assigned' , 'picked_up' , 'delivered' , 'cancelled']

const RestaurantOrders = ({restaurantId} : {restaurantId : string}) => {
    const [orders , setOrders] = useState<IOrder[]>([]);
    const [loading , setLoading] = useState(true);

    const {socket} = useSocket();
    
    const fetchOrders = async () => {
        try {
            const {data} = await axios.get(`${restaurantService}/api/order/${restaurantId}` , {
                headers : {
                    Authorization : `Bearer ${localStorage.getItem('token')}`
                }
            });

            setOrders(data.orders || []);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    },[restaurantId]);

    useEffect(() => {
        if(!socket){
            return;
        }

        const onNewOrder = () => {
            console.log('New Order recives socket');
            fetchOrders();
        }    
          socket.on('order:new' , onNewOrder);
          
          return () => {
            socket.off('order:new' , onNewOrder);
          }
    } , [socket]);
    if(loading){
        return <p className="text-gray-500">Loading Orders</p>
    }

    const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const completeOrdeers = orders.filter((o)=>!ACTIVE_STATUSES.includes(o.status));
    return <div className="space-y-5">
        {/* active orders */}
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Active Orders</h3>
            {
                activeOrders.length === 0 ? (<p className="text-sm text-gray-500">orders</p>) : ( 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {
                        activeOrders.map((order) => (
                            <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders}/>
                        ))
                    }
                </div>)
            }
        </div>
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Completed Orders</h3>
            {
                completeOrdeers.length === 0 ? (<p className="text-sm text-gray-500">no completed orders</p>) : ( 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {
                        completeOrdeers.map((order) => (
                            <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders}/>
                        ))
                    }
                </div>)
            }
        </div>
    </div>
}

export default RestaurantOrders;