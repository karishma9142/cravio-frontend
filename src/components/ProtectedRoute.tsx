import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext"

const ProtectedRoute = () => {
    const {isAuth , user , loading} = useAppData();
    const location = useLocation();
    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                Loading...
            </div>
        );
    }
    if(!isAuth){
        return <Navigate to={'/login'} replace/>;
    }

    if(user?.role === null && location.pathname !== "/select-role"){
        return <Navigate to={'/select-role'} replace/>;
    }

    if(user?.role !==null && location.pathname === "/select-role"){
        return <Navigate to={'/'} replace/>;
    }

    return <Outlet/>
};

export default ProtectedRoute;