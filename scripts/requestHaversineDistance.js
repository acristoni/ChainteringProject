async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x3E57F2496e6063EF6b627512Dd9CB9873AC4255F");
  
    const tx = await contract.requestHaversineDistance(
      '10',
      '10',
      '20',
      '20'
    );
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});