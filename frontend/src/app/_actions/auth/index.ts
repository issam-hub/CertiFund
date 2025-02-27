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

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            throw new Error(Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string)
        }
        throw new Error(result.error)
    }

    return await res.json()
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

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            throw new Error(Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string)
        }
        throw new Error(result.error)
    }

    return await res.json()
}

export async function activateUser(token: string){
    const res = await fetch(`${apiUrl}/users/activate?token=${token}`)
    
    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            throw new Error(Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string)
        }else{
            throw new Error(result.error)
        }
    }

    
    return await res.json()
}

export async function reactivateUser(id: string){
    const res = await fetch(`${apiUrl}/users/reactivate/${id}`)
    
    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            throw new Error(Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string)
        }else{
            throw new Error(result.error)
        }
    }

    
    return await res.json()
}