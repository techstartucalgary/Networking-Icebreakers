import UserLoginRequest from '@/src/interfaces/requests/UserLoginRequest';
import UserSignupRequest from '@/src/interfaces/requests/UserSignupRequest';
import UserDataResponse from '@/src/interfaces/responses/GetUserDataResponse';
import GetUserEventsResponse from '@/src/interfaces/responses/GetUserEventsResponse';
import UserInfoUpdateResponse from '@/src/interfaces/responses/UpdateUserInfoResponse';
import UserLoginResponse from '@/src/interfaces/responses/UserLoginResponse';
import UserSignupResponse from '@/src/interfaces/responses/UserSignupResponse';
import { User } from '@/src/interfaces/User';
import axios, { type AxiosResponse } from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE
const API_BASE_URL_AUTH = `${API_BASE}/api/auth`;
const API_BASE_URL_USER = `${API_BASE}/api/users`;

export async function UserLoginApi(email: string, password: string): Promise<UserLoginResponse | undefined> {
    try{
        const body: UserLoginRequest = {email, password,};
        const response: AxiosResponse<UserLoginResponse> = await axios.post(`${API_BASE_URL_AUTH}/login`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function UserSignupApi(name: string, email: string, password: string): Promise<UserSignupResponse | undefined> {
    try{
        const body: UserSignupRequest = {name, email, password,};
        const response: AxiosResponse<UserLoginResponse> = await axios.post(`${API_BASE_URL_AUTH}/signup`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function UserFetchApi(userId: string, token: string): Promise<UserDataResponse | undefined> {
    try{
        const response: AxiosResponse<UserDataResponse> = await axios.get(`${API_BASE_URL_USER}/${userId}`,
            {headers: {Authorization: `Bearer ${token}`,},});
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function GetUserEventsApi(userId: string, token: string): Promise<GetUserEventsResponse | undefined> {
    try{
        const response: AxiosResponse<GetUserEventsResponse> = await axios.get(`${API_BASE_URL_USER}/${userId}/events`, 
            {headers: {Authorization: `Bearer ${token}`, },});;
        return response.data;
    } catch (error){
        console.log('Error', error);
    }
}

export async function UserUpdateApi(userId: string, updates: Partial<User>, token: string): Promise<UserInfoUpdateResponse | undefined> {
    try{
        const body = {
            name: updates.name,
            email: updates.email,
            bio: updates.bio,
            profilePhoto: updates.profilePhoto,
            socialLinks: updates.socialLinks?.reduce((acc, link) => {
                if (link.label && link.url) acc[link.label.toLowerCase()] = link.url;
                return acc;
            }, {} as Record<string, string>),
        };

        const response: AxiosResponse<UserInfoUpdateResponse> = await axios.put(`${API_BASE_URL_USER}/${userId}`, body,
            {headers: {Authorization: `Bearer ${token}`, },});;
        return response.data;
    } catch (error){
        console.log('Error', error);
    }
}
