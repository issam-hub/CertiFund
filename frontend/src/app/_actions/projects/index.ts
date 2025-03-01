"use server"

import { apiUrl } from "@/app/_lib/config";
import { CreateProjectSchema } from "@/app/_lib/schemas/project";
import { BasicsFormData, FundingFormData, StoryFormData } from "@/app/_lib/types";
import { formatDateTime } from "@/app/_lib/utils";
import { authFetch } from "@/app/_lib/utils/auth";
import { revalidateTag } from "next/cache";
import { notFound } from "next/navigation";

export async function createProject(data: CreateProjectSchema){
    data['deadline'] = formatDateTime(data['deadline'] as string)
    
    const res = await authFetch(`${apiUrl}/projects/create`,{
        method:"POST",
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
            return {status: false, ...result}
          }    
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getProject(id: string) {
    const res = await authFetch(`${apiUrl}/projects/${id}`, {cache:"no-store", next:{tags:["project"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else if(result.error === "Project not found"){
            notFound()
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function updateProject(data: BasicsFormData|FundingFormData|StoryFormData|{status:string}, id: string){
    const res = await authFetch(`${apiUrl}/projects/${id}`,{
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

        revalidateTag("project")
      
        const result = await res.json()
        return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function uploadImage(image: File){
    const formData = new FormData()
    formData.set("file", image)
    const res = await authFetch(`${apiUrl}/projects/image/upload`,{
        method:"POST",
        body: formData
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }    
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function deleteProject(id: string){
    const res = await authFetch(`${apiUrl}/projects/${id}`,{method:"DELETE"})

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
        return {status:false, error: error.message}
    }
}