import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "../main";
import {type AppContextType, type User} from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProp {
    children : ReactNode
};

export const AppProvider = ({children} : AppProviderProp) => {
    const [user , setUser] = useState<User| null>(null);
    const [loading , setLoading] = useState(true);
    const [isAuth , setIsAuth] = useState(false);

    const [location , setLocation] = useState(null);
    const [loadingLocation , setLoadingLocation] = useState(false);
    const [city , setCity] = useState("Fetching Location...");

    async function fetchUser() {
       try {
        const token = localStorage.getItem("token");

        const {data} = await axios.get(`${authService}/api/auth/me` , {
            headers:{
                Authorization : `Bearer ${token}`,
            }
        });

        setUser(data.user);
        setIsAuth(true);
       } catch (error) {
        console.log(error);
       }finally{
        setLoading(false);
       }
    }

    useEffect(() => {
        fetchUser();
    },[]);

    return <AppContext.Provider value={{isAuth,loading,setIsAuth,setLoading,setUser,user}}>{children}</AppContext.Provider>
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if(!context){
        throw new Error("useAppData must be use within AppProvider");
    }
    return context;
}