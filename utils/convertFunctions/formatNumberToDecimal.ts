function formatNumber(number: number): string {
    const formattedNumber = new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
  
    return formattedNumber;
}

export default formatNumber