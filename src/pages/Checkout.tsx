import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../main";

interface Address {
    _id : string;
    formattedAddress : string;
    mobile : number;
}
const CheckOut = () => {
    const {cart , subtotal , quantity} = useAppData();
    const [address , setAddress] = useState<Address[]>([]);
    const [selectedAddress , setSelectedAddress] = useState<string | null>(null);
    const [loadingAddress , setLoadingAddress] = useState(true);
    const [loadingRazorpay , setLoadingRazorpay] = useState(false);
    const [loadingStripe , setLoadingStrip] = useState(false);
    const [createOrder , setCreateOrder] = useState(false);

    useEffect(() => {
        const fetchAddresses = async () => {
            if(!cart || cart.length === 0){
                setLoadingAddress(false);
                return;
            }

            try {
                const {data} = await axios.get(
                    `${restaurantService}/api/address/all` , 
                    {
                        headers : {
                            Authorization : `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                setAddress(data || []);
            } catch (error) {
                console.log(error);
            }finally{
              setLoadingAddress(false);  
            }
        };

        fetchAddresses();
    } , [])
    return (
        <div>
            Checkout page
        </div>
    )
}

export default CheckOut;