export interface User{
    _id: string,
    name: string,
    email: string,
    image: string,
    role: string
}

export interface locationData {
    latitude : number,
    longitude : number,
    formattedAddress : string
}

export interface AppContextType {
    user : User | null,
    loading : boolean,
    isAuth : boolean,
    location : locationData | null,
    loadingLocation : boolean,
    city : string 
    setUser : React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth : React.Dispatch<React.SetStateAction<boolean>>;
    setLoading : React.Dispatch<React.SetStateAction<boolean>>;
    cart : ICart[] | null;
    fetchCart : ()=> Promise<void>;
    subtotal : number;
    quantity : number;
    loadingCart: boolean;
}

export interface IRestaurant  {
    _id : string,
    name: string,
    description?: string,
    image: string,
    ownerId: string,
    phone: number,
    isVerified: boolean,

    autoLocation: {
        type: "Point",
        coordinates: [number, number]; // [longitude , latitdue]
        formattedAddress: string
    },
    isOpen: boolean,
    createdAt: Date
};

export interface IMenuItem {
    _id : string;
    restaurantId: string;
    description: string;
    name: string;
    image: string;
    price: number;
    isAvailables: boolean;
    createdAt: Date;
    UpdatedAt: Date;
}

export interface ICart {
    _id : string
    userid : string;
    restaurantId: string | IRestaurant;
    itemId : string | IMenuItem;
    quantity : number;
    createdAt : Date;
    updatedAt : Date;
}
