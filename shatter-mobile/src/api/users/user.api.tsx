import UserLoginRequest from '@/src/interfaces/requests/UserLoginRequest';
import UserSignupRequest from '@/src/interfaces/requests/UserSignupRequest';
import UserLoginResponse from '@/src/interfaces/responses/UserLoginResponse';
import UserSignupResponse from '@/src/interfaces/responses/UserSignupResponse';
import axios, { type AxiosResponse } from 'axios';

const API_BASE_URL: string = '/api/auth'

export async function UserLoginApi(email: string, password: string): Promise<UserLoginResponse | undefined> {
    try{
        const body: UserLoginRequest = {email, password,};
        const response: AxiosResponse<UserLoginResponse> = await axios.post(`${API_BASE_URL}/login`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}

export async function UserSignupApi(name: string, email: string, password: string): Promise<UserSignupResponse | undefined> {
    try{
        const body: UserSignupRequest = {name, email, password,};
        const response: AxiosResponse<UserLoginResponse> = await axios.post(`${API_BASE_URL}/signup`, body);
        return response.data;
    }catch(error){
        console.log('Error', error);
    }
}