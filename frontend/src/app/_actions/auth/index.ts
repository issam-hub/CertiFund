"use server"

import { apiUrl, TOKEN_COOKIE_NAME } from "@/app/_lib/config"
import { FormSchema, LoginFormSchema } from "@/app/_lib/schemas/auth"
import { authFetch } from "@/app/_lib/utils/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUp(data: FormSchema){

    let toBesent = {
        username: data.username,
        email: data.email,
        password: data.password
    }
    
    const res = await fetch(`${apiUrl}/users/signup`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(toBesent)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
          }    
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {statuserror: error.message}
    }
}

export async function login(data: LoginFormSchema){
    let toBesent = {
        email: data.email,
        password: data.password
    }

    const cookieStore = await cookies()
    
    const res = await fetch(`${apiUrl}/users/login`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(toBesent)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
          }    
      
          const data = await res.json();
          cookieStore.set(TOKEN_COOKIE_NAME, data[TOKEN_COOKIE_NAME]["token"], {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, 
            path: '/'
          })
          return {status:true, ...data}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function activateUser(token: string){
    const cookieStore = await cookies()
    const res = await fetch(`${apiUrl}/users/activate?token=${token}`)
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
        }    
      
          const data = await res.json();
          cookieStore.set(TOKEN_COOKIE_NAME, data[TOKEN_COOKIE_NAME]["token"], {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
          })
          return {status:true, ...data}
    }catch(error: any){
        return {error: error.message}
    }
}

export async function reactivateUser(id: string){
    const res = await fetch(`${apiUrl}/users/reactivate/${id}`)
    const cookieStore = await cookies()
    
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
          }    
      
          const data = await res.json();
          return {status:true, ...data}
    }catch(error: any){
        return {error: error.message}
    }
}

export async function logout(id: string){
    const res = await authFetch(`${apiUrl}/users/logout/${id}`,{method:"POST"})
    const cookieStore = await cookies()
    
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
          }  

          const result = await res.json()
          cookieStore.delete(TOKEN_COOKIE_NAME);
          return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function getCurrentUser(){
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  
    if (!token) {
      return null;
    }

    const res = await authFetch(`${apiUrl}/users/me`)
    
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            cookieStore.delete(TOKEN_COOKIE_NAME);
            return {status:false, ...result}
          }    
      
          const result = await res.json()
          return {status:true, ...result}

    }catch(error: any){
        cookieStore.delete(TOKEN_COOKIE_NAME);
        return {status:false, error: error.message}
    }
}