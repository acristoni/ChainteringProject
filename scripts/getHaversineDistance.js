async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xa9fa9EFeF845577bA2dC7E36aA3F47D68207237c");
  
    const lastDistanceCalculation = await contract.lastDistanceCalculation();
    console.log("🚀 ~ file: getHaversineDistance.js:6 ~ main ~ lastDistanceCalculation:", parseInt(lastDistanceCalculation))

  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});