import { apiUrl } from "@/app/lib/config";

export async function healthCheck(){
    console.log(apiUrl);
    
    const res = await fetch(`${apiUrl}/healthCheck`)
    const data = await res.text()

    return data as string
}