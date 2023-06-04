function convertHexTimestampToISO(hexTimestamp: string): string {
    const decimalTimestamp = parseInt(hexTimestamp, 16) * 1000;
    const date = new Date(decimalTimestamp);
    return date.toISOString();
}

export default convertHexTimestampToISO;