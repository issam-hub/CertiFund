"use server"

import { apiUrl } from "@/app/lib/config";
import { CreateProjectSchema } from "@/lib/schemas/project";
import { formatDateTime } from "@/lib/utils";

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
        throw new Error(result.error)
    }

    return await res.json()
}

export async function getProject(id: string) {
    const res = await fetch(`${apiUrl}/projects/${id}`)
    
    return await res.json()
}