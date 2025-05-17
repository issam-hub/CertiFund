"use server"

import { apiUrl } from "@/app/_lib/config"
import { CreateUserSchema } from "@/app/_lib/schemas/auth"
import { authFetch } from "@/app/_lib/utils/auth"
import { revalidateTag } from "next/cache"

export async function createExpert(values: CreateUserSchema){
    let toBeSent = {
        ...values,
        expertise_level: (values.expertise_level ?? 0)/100,
    }
    const res = await authFetch(`${apiUrl}/experts/create`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(toBeSent)
    })

    try {
        if(!res.ok) {
            const result = await res.json()
            if(typeof result.error === "object"){
                return {status:false, error: Object.values(result.error).reduce((prev, curr)=>`*${prev}`+"\n"+`*${curr}`) as string}
            }
            return {status:false, ...result}
          }    

          revalidateTag("users-table")
      
          const result = await res.json();
          return {status:true, ...result}
    }catch(error: any){
        return {statuserror: error.message}
    }
}