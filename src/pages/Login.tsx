import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import {useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const responseGoogle = async (authResult: any) => {
        try {
            setLoading(true);
            const result = await axios.post(`${authService}/api/auth/login`, {
                code: authResult["code"],
            });
            localStorage.setItem("token", result.data.token);
            toast.success(result.data.message);
            setLoading(false);
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("problem while login")
            setLoading(false);
        }
    };
    const GoogleLogin = useGoogleLogin({
        onSuccess : responseGoogle,
        onError : responseGoogle,
        flow : "auth-code"
    });
    return (
        <div>

        </div>
    )
}

export default Login;