"use server"

import { apiUrl, TOKEN_COOKIE_NAME } from "@/app/_lib/config";
import { PasswordChangeSchema, ProfileSchema } from "@/app/_lib/schemas/auth";
import { authFetch } from "@/app/_lib/utils/auth";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function updateProfile(data: Partial<ProfileSchema>&{image_url?:string}){
    const res = await authFetch(`${apiUrl}/users/update`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
        }  

        revalidateTag("current-user")
        
        
        const result = await res.json()
        return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function changePassword(data: PasswordChangeSchema){
    delete data['confirm_password']
    const res = await authFetch(`${apiUrl}/users/passwordChange`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
        }
        
        ((await cookies()).delete(TOKEN_COOKIE_NAME))
        
        const result = await res.json()
        return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}