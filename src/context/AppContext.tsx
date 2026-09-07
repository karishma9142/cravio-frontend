import axios from "axios";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { authService, restaurantService } from "../main";

import {
    type locationData,
    type AppContextType,
    type User,
    type ICart,
} from "../types";


const AppContext = createContext<AppContextType | undefined>(undefined);


interface AppProviderProp {
    children: ReactNode;
}


export const AppProvider = ({ children }: AppProviderProp) => {

    // ================= USER STATES =================

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);


    // ================= LOCATION STATES =================

    const [location, setLocation] = useState<locationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching Location...");


    // ================= CART STATES =================

    const [cart, setCart] = useState<ICart[]>([]);
    const [subtotal, setSubTotal] = useState(0);
    const [quantity, setQuantity] = useState(0);

    // Important: prevents showing empty cart before API finishes
    const [loadingCart, setLoadingCart] = useState(true);


    // ================= FETCH USER =================

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                setIsAuth(false);
                return;
            }

            const { data } = await axios.get(
                `${authService}/api/auth/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUser(data);
            setIsAuth(true);

        } catch (error) {
            console.log("Fetch user error:", error);

            setUser(null);
            setIsAuth(false);

        } finally {
            setLoading(false);
        }
    }


    // ================= FETCH CART =================

    async function fetchCart() {
    console.log("========== FETCH CART ==========");

    try {
        setLoadingCart(true);

        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token found");
            return;
        }

        console.log("Calling cart API...");

        const { data } = await axios.get(
            `${restaurantService}/api/cart/all`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("CART API RESPONSE:", data);

        setCart(data.cart ?? []);
        setSubTotal(data.subtotal ?? 0);
        setQuantity(data.cartLength ?? 0);

    } catch (error: any) {
        console.error(
            "CART FETCH ERROR:",
            error.response?.data || error.message
        );

        setCart([]);
        setSubTotal(0);
        setQuantity(0);

    } finally {
        setLoadingCart(false);
        console.log("========== FETCH CART END ==========");
    }
}
    // ================= FETCH USER ON APP LOAD =================

    useEffect(() => {
        fetchUser();
    }, []);


    // ================= FETCH CART AFTER USER LOADS =================

    useEffect(() => {
    if (user?.role === "customer") {
        fetchCart();
    } else if (!loading) {
        setLoadingCart(false);
    }
}, [user, loading]);


    // ================= LOCATION =================

    useEffect(() => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setLoadingLocation(false);
            setCity("Location unavailable");
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

                    setCity("Failed to load location");

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


    // ================= CONTEXT PROVIDER =================

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,

                loading,
                setLoading,

                isAuth,
                setIsAuth,

                location,
                loadingLocation,
                city,

                cart,
                fetchCart,
                subtotal,
                quantity,
                loadingCart,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};


// ================= CUSTOM HOOK =================

export const useAppData = (): AppContextType => {

    const context = useContext(AppContext);

    if (!context) {
        throw new Error(
            "useAppData must be used within AppProvider"
        );
    }

    return context;
};