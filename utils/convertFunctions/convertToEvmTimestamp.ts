function convertToEvmTimestamp(dateString: string): number {
    const dt: Date = new Date(dateString)
    const evmTimestamp: number = Math.floor(dt.getTime() / 1000)  
    return evmTimestamp
}

export default convertToEvmTimestamp;