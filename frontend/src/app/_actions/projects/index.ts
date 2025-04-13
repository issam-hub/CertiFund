"use server"

import { apiUrl } from "@/app/_lib/config";
import { CreateProjectSchema, RewardsSchema, UpdateSchema } from "@/app/_lib/schemas/project";
import { BasicsFormData, FundingFormData, Reward, StoryFormData } from "@/app/_lib/types";
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


export async function getProjects(page:number = 1, search:string = "", categories: string[] = [], limit:string = "10", sort:string = ""){
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

export async function handleRewards(rewards: RewardsSchema | {rewards: Reward[]}, project_id: string, type: string){
    rewards.rewards = rewards.rewards.map(reward =>{
        return {
            ...reward,
            amount: reward.amount*100,
            estimated_delivery: formatDateTime(new Date(reward.estimated_delivery).toISOString())
        }
    })
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
          revalidateTag("rewards")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getRewards(projectId: number){
    const res = await fetch(`${apiUrl}/rewards/${projectId}`,{next:{tags:["rewards"]}})

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

export async function getRewardsByBacking(backingId: number){
    const res = await authFetch(`${apiUrl}/backing/rewards/${backingId}`,{next:{tags:["backing-rewards"]}})

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

export async function publishUpdate(data: UpdateSchema, project_id: string){
    const res = await authFetch(`${apiUrl}/updates/create/${project_id}`,{
        method:'POST',
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
          
          revalidateTag("updates")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getUpdates(project_id: string, page: number=1, limit: number=5){
    const res = await fetch(`${apiUrl}/updates/${project_id}?page=${page}&page_size=${limit}`, {next:{tags:["updates"]}})
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

export async function deleteUpdate(id: number){
    const res = await authFetch(`${apiUrl}/updates/${id}`,{
        method:'DELETE'
    })
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }   
          
          revalidateTag("updates")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getComments(projectId: string){
    const res = await fetch(`${apiUrl}/comments/${projectId}`, {next:{tags:["comments"]}})
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

export async function createComment(projectId: string, content: string, parentId: number|null){
    console.log(`${apiUrl}/comments/create/${projectId}`)
    const res = await authFetch(`${apiUrl}/comments/create/${projectId}`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            content,
            parent_comment_id: parentId
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
          
          revalidateTag("comments")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function deleteBacking(id: number){
    const res = await authFetch(`${apiUrl}/backing/${id}`,{
        method:'DELETE'
    })
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }   
          
          revalidateTag("updates")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function updateBacking(status: string, paymentId: number){
    const res = await authFetch(`${apiUrl}/backing/${paymentId}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            status
        })
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
        } 
        
        const result = await res.json()
        return {status:true, ...result}
    }catch(error: any){
        return {status:false, error: error.message}
    }
}

export async function createDispute(reportedResourceId: number, data: {type: string, context:string,description: string, evidences?: string[]}){
    const res = await authFetch(`${apiUrl}/disputes/create/${reportedResourceId}`,{
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
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\r\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }   
          
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function updateDispute(disputeId: number, status: string, note: string){
    const res = await authFetch(`${apiUrl}/disputes/${disputeId}`,{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            status,
            note
        })
    })
    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\r\n"+`*${curr}`) as string}
            }
            return {status: false, ...result}
          }   
          
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function deleteDispute(id: number){
    const res = await authFetch(`${apiUrl}/disputes/${id}`,{
        method:'DELETE'
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


export async function getProjectByUser(userId: number) {
    const res = await authFetch(`${apiUrl}/projects/creator/${userId}`, {cache:"no-store", next:{tags:["projects-user"]}})

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

export async function getProjectByBacker(userId: number) {
    const res = await authFetch(`${apiUrl}/projects/backer/${userId}`, {cache:"no-store", next:{tags:["projects-backer"]}})

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

export async function getSavedProjects() {
    const res = await authFetch(`${apiUrl}/projects/saved`, {cache:"no-store", next:{tags:["projects-saved"]}})

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

export async function likeProject(projectId: number){
    const res = await authFetch(`${apiUrl}/projects/like/${projectId}`, {
        method:"POST"
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

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function saveProject(projectId: number){
    const res = await authFetch(`${apiUrl}/projects/save/${projectId}`, {
        method:"POST"
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

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function unlikeProject(projectId: number){
    const res = await authFetch(`${apiUrl}/projects/unlike/${projectId}`, {
        method:"POST"
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

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function unsaveProject(projectId: number){
    const res = await authFetch(`${apiUrl}/projects/unsave/${projectId}`, {
        method:"POST"
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

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getLikes(projectId: number) {
    const res = await fetch(`${apiUrl}/projects/like/${projectId}`, {cache:"no-store", next:{tags:["projects-likes"]}})

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

export async function didILikeThis(projectId: number) {
    const res = await authFetch(`${apiUrl}/projects/didILikeThis/${projectId}`, {cache:"no-store", next:{tags:["projects-did-i-like-this"]}})

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

export async function didISaveThis(projectId: number) {
    const res = await authFetch(`${apiUrl}/projects/didISaveThis/${projectId}`, {cache:"no-store", next:{tags:["projects-did-i-save-this"]}})

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