import { getDataAPI, postDataAPI } from "../utils/api";
import Cookies from 'js-cookie';

export const signup = async (userDet) => {
    try {
        const res = await postDataAPI('Account/register', userDet);
        return res;
    } catch (error) {
        throw error;
    }
}

export const signin = async (userDet) => {
    try {
        console.log('Got here in signin');
        const res = await postDataAPI('Account/login', userDet);
        console.log('Login Response: ', res);
        
        // Check if we have a token (success) despite any errors
        if (res?.token) {
            Cookies.set('token', `${res.token}`);
            return res;
        }
        
        throw res; // If no token, treat as error
    } catch (error) {
        throw error;
    }
}

export const getUserbyId = async (id) => {
    try {
        if (!id) {
          throw new Error("User ID is required");
        }

        const res = await getDataAPI(`Account/user/${id}`);
        console.log('Res from profile: ', res);
        return res;
    } catch (error) {
        throw error;
    }
}

export const fetchUser = async() => {
    try {
        const res = await getDataAPI('Account/user');
        return res;
    } catch (error) {
        throw error;
    }
}

export const sendMailLink = async(email) => {
    try {
        const res = await getDataAPI('Account/send-mail');
        return res;
    } catch (error) {
        throw error;
    }
}

export const logout = async () => {
    try {
        const res = await getDataAPI("Account/logout");
        Cookies.remove('token');
        return res;
    } catch (error) {
        throw error;
    }
}