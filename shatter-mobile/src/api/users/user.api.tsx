import UserDataRequest from '@/src/interfaces/requests/GetUserDataRequest';
import UserLoginRequest from '@/src/interfaces/requests/UserLoginRequest';
import UserSignupRequest from '@/src/interfaces/requests/UserSignupRequest';
import UserDataResponse from '@/src/interfaces/responses/GetUserDataResponse';
import GetUserEventsResponse from '@/src/interfaces/responses/GetUserEventsResponse';
import UserLoginResponse from '@/src/interfaces/responses/UserLoginResponse';
import UserSignupResponse from '@/src/interfaces/responses/UserSignupResponse';
import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL_AUTH: string = '/api/auth'
const API_BASE_URL_USER: string = '/api/user'

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
        const body: UserDataRequest = {userId};
        const response: AxiosResponse<UserDataResponse> = await axios.post(`${API_BASE_URL_USER}/users/${userId}`, body, 
            {headers: {Authorization: `Bearer ${token}`, },});;
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