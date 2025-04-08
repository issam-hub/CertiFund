"use server"

import { apiUrl } from "@/app/_lib/config"
import { authFetch } from "@/app/_lib/utils/auth"

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

export async function getUsersTable(page:number = 1, limit:string = "10"){
    const res = await authFetch(`${apiUrl}/tables/users?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects-table"]}})

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
    const res = await authFetch(`${apiUrl}/tables/backings?page=${page}&page_size=${limit}`, {cache:"no-store", next:{tags:["projects-table"]}})

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