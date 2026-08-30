import { useEffect, useState } from "react";
import { type IMenuItem, type IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestauran";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItem";
import AddMenuItems from "../components/AddMenuItem";

type SellerTab = 'menu' | 'add-item' | 'sales'

const Restaurant = () => {
    const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<SellerTab>('menu');

    const fetchMyRestaurant = async () => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/restaurant/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRestaurant(data.restaurant || null);
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRestaurant();
    }, []);

    const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

    const fetchMenuItem = async (restaurantId: string) => {
        try {
            const { data } = await axios.get(`${restaurantService}/api/item/all/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // console.log("Menu API response:", data);
            // console.log("Is array?", Array.isArray(data));
            setMenuItems(data);
        } catch (error) {
            console.log(error);

        }
    }

    useEffect(() => {
        if (restaurant?._id) {
            fetchMenuItem(restaurant._id)
        }
    }, [restaurant])
    if (loading) return <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your restaurant...</p>
    </div>
    if (!restaurant) {
        return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />
    }
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
            <RestaurantProfile restaurant={restaurant} onUpdate={setRestaurant} isSeller={true} />
            <div className="rounded-xl bg-white shadow-sm">
                <div className="flex">
                    {[
                        { key: 'menu', label: 'Menu Items' },
                        { key: 'add-item', label: 'Add Item' },
                        { key: 'sales', label: 'Sales' }
                    ].map((t) => (
                        <button key={t.key} onClick={() => setTab(t.key as SellerTab)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition ${tab === t.key ? "border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-gray-700 "}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {tab === 'menu' && (
                        <MenuItems
                            items={menuItems}
                            onItemDeleted={() => fetchMenuItem(restaurant._id)}
                            isSeller={true}
                        />
                    )}
                    {tab === 'add-item' && (
                        <AddMenuItems onItemAdded={() => fetchMenuItem(restaurant._id)} />
                    )}
                    {tab === 'sales' && (
                        <p>Sales</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Restaurant;