async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xa9fa9EFeF845577bA2dC7E36aA3F47D68207237c");
  
    const tx = await contract.requestHaversineDistance(
      '10',
      '10',
      '20',
      '20'
    );
    tx.wait()
    console.log("🚀 ~ file: startCharter.js:6 ~ main ~ tx:", tx)
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});