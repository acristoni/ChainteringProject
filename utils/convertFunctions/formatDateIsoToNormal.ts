export default function formatDateIsoToNormal(date: string): string {
    const day = date.substring(8,10)
    const month = date.substring(5,7)
    const year = date.substring(0,4)
    const hour = date.substring(11,16)

    return `${day}/${month}/${year} - ${hour}`
}