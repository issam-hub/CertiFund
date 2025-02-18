"use server"

import { apiKey, apiUrl } from "@/app/lib/config";
import { BasicsFormData, FundingFormData, StoryFormData } from "@/components/projectForm";
import { CreateProjectSchema } from "@/app/lib/schemas/project";
import { formatDateTime } from "@/app/lib/utils";

export async function createProject(data: CreateProjectSchema){
    let toBeSent = Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'category'));
    toBeSent['deadline'] = formatDateTime(toBeSent['deadline'] as string)
    
    const res = await fetch(`${apiUrl}/projects/create`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(toBeSent)
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

export async function getProject(id: string) {
    const res = await fetch(`${apiUrl}/projects/${id}`)
    
    return await res.json()
}

export async function updateProject(data: BasicsFormData|FundingFormData|StoryFormData, id: string){
    let toBeSent = Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'category'));

    const res = await fetch(`${apiUrl}/projects/${id}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(toBeSent)
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

export async function uploadImage(image: File){
    const formData = new FormData()
    formData.set("file", image)
    const res = await fetch(`${apiUrl}/projects/image/upload`,{
        method:"POST",
        body: formData
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