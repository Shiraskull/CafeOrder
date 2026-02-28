export default function getLocal(){
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('userData'))
    }
    return null
}

export function setLocal(data){
    if (typeof window !== 'undefined') {
        localStorage.setItem('userData',JSON.stringify(data))
    }
}
