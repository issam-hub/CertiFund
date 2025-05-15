"use server"

import { apiUrl } from "@/app/_lib/config"
import { authFetch } from "@/app/_lib/utils/auth"
import { revalidateTag } from "next/cache"
import { notFound } from "next/navigation"

export async function getGeneralStats(){
    const res = await authFetch(`${apiUrl}/stats/general`, {cache:"no-store", next:{tags:["stats-general"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getProjectsOverview(){
    const res = await authFetch(`${apiUrl}/stats/overview`, {cache:"no-store", next:{tags:["stats-overview"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getTopFiveProjects(){
    const res = await authFetch(`${apiUrl}/stats/topProjects`, {cache:"no-store", next:{tags:["stats-top-projects"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getTopFiveUsers(type:string){
    const res = await authFetch(`${apiUrl}/stats/${type}`, {cache:"no-store", next:{tags:["stats-top-users"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getCategoriesDistribution(){
    const res = await authFetch(`${apiUrl}/stats/categoriesDist`, {cache:"no-store", next:{tags:["stats-categories"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getCreatorsAndBackers(){
    const res = await authFetch(`${apiUrl}/stats/creatorsNbackers`, {cache:"no-store", next:{tags:["stats-creators-backers"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getBackingsAndRefunds(){
    const res = await authFetch(`${apiUrl}/stats/backingsNrefunds`, {cache:"no-store", next:{tags:["stats-backings-refunds"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getProjectsTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/projects?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects-table"]}})

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

export async function getPendingProjectsTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/pendingProjects?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects-table"]}})

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

export async function getUsersTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/users?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["users-table"]}})

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

export async function getBackingsTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/backings?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["backings-table"]}})

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

export async function getDisputesTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/disputes?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["disputes-table"]}})

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

export async function reviewProject(data : any, projectId: number){
    const res = await authFetch(`${apiUrl}/projects/review/${projectId}`,{
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
            }else if(result.error === "Project not found"){
                notFound()
            }else{
                return {status: false, ...result}
            }
          }    

          revalidateTag("projects-reviewer")
          revalidateTag("projects-review")
          revalidateTag("projects-flagged")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {status: false, error: error.message}
    }
}

export async function getPendingAssessements(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/pendingAssessements?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["assessments-table"]}})

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

export async function getAssessedProjects(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/assessed?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["assessed-table"]}})

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

export async function getReviewerPerformance(){
    const res = await authFetch(`${apiUrl}/stats/reviewerPerformance`, {cache:"no-store", next:{tags:["stats-performance"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    const result = await res.json()
    return {status:true, ...result}
}

export async function getExpertAccuracy(){
    const res = await authFetch(`${apiUrl}/stats/accuracy`, {cache:"no-store", next:{tags:["stats-accuracy"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    const result = await res.json()
    return {status:true, ...result}
}

export async function getReviewerStats(){
    const res = await authFetch(`${apiUrl}/stats/reviewerStats`, {cache:"no-store", next:{tags:["stats-reviewer"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getUserStats(){
    const res = await authFetch(`${apiUrl}/stats/userStats`, {cache:"no-store", next:{tags:["stats-user"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}
export async function getLiveProjectsStatistics(){
    const res = await authFetch(`${apiUrl}/stats/liveProjects`, {cache:"no-store", next:{tags:["stats-live-projects"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}
export async function getBackedProjectsStatistics(){
    const res = await authFetch(`${apiUrl}/stats/backedProjects`, {cache:"no-store", next:{tags:["stats-backed-projects"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}
export async function getFundingProgress(){
    const res = await authFetch(`${apiUrl}/stats/fundingProgress`, {cache:"no-store", next:{tags:["stats-funding-progress"]}})

    if(!res.ok){
        const result = await res.json()
        if(typeof result.error === "object"){
            return {status:false, error:Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
        }else{
            return {status:false, ...result}
        }
    }

    
    const result = await res.json()
    return {status:true, ...result}
}

export async function getCreatedProjectsTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/createdProjects?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects-table"]}})

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

export async function getUserBackingsTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/userBackings?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["backings-table"]}})

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