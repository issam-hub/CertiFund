"use server"

import { apiUrl } from "@/app/_lib/config";
import { CreateProjectSchema, RewardsSchema } from "@/app/_lib/schemas/project";
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

          revalidateTag("projects-creator")
      
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

export async function getProjectPublic(id: string) {
    const res = await authFetch(`${apiUrl}/projects/discover/${id}`, {cache:"no-store", next:{tags:["project"]}})

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

export async function updateProject(data: BasicsFormData|FundingFormData|StoryFormData|{status:string,launched_at?:string}, id: string){
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
        revalidateTag("projects-creator")
        
      
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
          
          revalidateTag("projects-creator")
      
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
          
          revalidateTag("projects-creator")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function getProjectByCurrUser() {
    const res = await authFetch(`${apiUrl}/projects/me`, {cache:"no-store", next:{tags:["projects-creator"]}})

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


export async function getProjects(page?:number, search?:string, categories?: string[], limit?:string, sort?:string){
    sort = sort === "most_funded" ? "-(current_funding*100)/funding_goal" : sort
    let formatCategories = categories?.length === 0 ? "" : categories?.length === 1 ? (categories[0]) : categories?.reduce((acc,curr)=> acc+`,`+curr)
    formatCategories = formatCategories?.replaceAll(" ", "+").replaceAll("&", "%26")
    const res = await authFetch(`${apiUrl}/projects?title=${search}&categories=${formatCategories}&sort=${sort}&page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }
        return {status:false, ...result}
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function createPaymentIntent(user_id: number, project_id: number, amount:number){
    const res = await authFetch(`${apiUrl}/backing/backIntent/${project_id}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            amount,
            user_id,
            project_id,
        })
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

export async function backProject(data:{project_id: number, payment_intent_id: string, payment_method: string, rewards?: number[]}){
    const res = await authFetch(`${apiUrl}/backing/backProject/${data.project_id}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            payment_intent_id: data.payment_intent_id,
            payment_method: data.payment_method,
            rewards: data.rewards
        })
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }    

          revalidateTag("project")
          revalidateTag("projects")
          revalidateTag("did-i-back")
          revalidateTag("projects-creator")
          revalidateTag("project-backers")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getBackersCount(project_id: number){
    const res = await authFetch(`${apiUrl}/backing/projectBackers/${project_id}`, {cache:"no-store", next:{tags:["project-backers"]}})

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

export async function didIbackThisProject(project_id: number){
    const res = await authFetch(`${apiUrl}/backing/didIbackIt/${project_id}`, {cache:"no-store", next:{tags:["did-i-back"]}})

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

export async function refundBacking(project_id: number, reason?:string){
    const res = await authFetch(`${apiUrl}/backing/refund/${project_id}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            reason
        })
    })

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

    revalidateTag("project")
    revalidateTag("projects")
    revalidateTag("did-i-back")
    revalidateTag("projects-creator")
    revalidateTag("project-backers")
    
    const result = await res.json()
    return {status:true, ...result}
}

export async function handleRewards(rewards: RewardsSchema, project_id: string, type: string){
    rewards.rewards = rewards.rewards.map(reward =>{
        return {
            ...reward,
            amount: reward.amount*100,
            estimated_delivery: formatDateTime(new Date(reward.estimated_delivery).toISOString())
        }
    })
    console.log("rewards", JSON.stringify(rewards))
    const res = await authFetch(`${apiUrl}/rewards/${type}/${project_id}`,{
        method:type === "create" ? "POST" : "PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(rewards)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }    

          revalidateTag("project")
          revalidateTag("projects")
          revalidateTag("projects-creator")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}