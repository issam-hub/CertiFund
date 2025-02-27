"use server"

import { apiUrl } from "@/app/_lib/config"
import { FormSchema } from "@/app/_lib/schemas/auth"

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
                return {error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return result
          }    
      
          return await res.json();
    }catch(error: any){
        return {error: error.message}
    }
}

export async function login(data: FormSchema){
    let toBesent = {
        email: data.email,
        password: data.password
    }
    
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
                return {error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return result
          }    
      
          return await res.json();
    }catch(error: any){
        return {error: error.message}
    }
}

export async function activateUser(token: string){
    const res = await fetch(`${apiUrl}/users/activate?token=${token}`)
    
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return result
          }    
      
          return await res.json();
    }catch(error: any){
        return {error: error.message}
    }
}

export async function reactivateUser(id: string){
    const res = await fetch(`${apiUrl}/users/reactivate/${id}`)
    
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return result
          }    
      
          return await res.json();
    }catch(error: any){
        return {error: error.message}
    }
}