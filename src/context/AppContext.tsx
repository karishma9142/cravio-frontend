import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, restaurantService } from "../main";
import { type locationData, type AppContextType, type User,type ICart } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProp { 
    children: ReactNode
};

export const AppProvider = ({ children }: AppProviderProp) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    const [location, setLocation] = useState<locationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching Location...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");

            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const [cart , setCart] = useState<ICart[]>([]);
    const [subtotal , setSubTotal] = useState(0);
    const [quantity , setQuantity] = useState(0);

    async function fetchCart() {
        if(!user || user.role !== 'customer') return;

        try {
            const {data} = await axios.get(`${restaurantService}/api/cart/all` , {
                headers : {
                    Authorization : `Bearer ${localStorage.getItem('token')}`,
                }
            })

            setCart(data.cart || []);
            setSubTotal(data.subtotal || 0);
            setQuantity(data.cartLength);
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        fetchUser();
    }, []);

     useEffect(() => {
        if(user && user.role === 'customer'){
            fetchCart();
        }
    }, [user]);

    useEffect(() => {
        if (!navigator.geolocation) {
            alert("Please allow location to continue");
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );

                    const data = await res.json();

                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress:
                            data.display_name || "Current location",
                    });

                    setCity(
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        "Your Location"
                    );
                } catch (error) {
                    console.log("Location fetch error:", error);

                    setLocation({
                        latitude,
                        longitude,
                        formattedAddress: "Current location",
                    });

                    setCity("Failed to load");
                } finally {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                console.log("Geolocation error:", error);
                setLoadingLocation(false);
                setCity("Unable to get location");
            }
        );
    }, []);

    return <AppContext.Provider value={{ isAuth, loading, setIsAuth, setLoading, setUser, user, location, loadingLocation, city ,cart,fetchCart , subtotal , quantity}}>{children}</AppContext.Provider>
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be use within AppProvider");
    }
    return context;
}