async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x539c1E419E797dfb28ae587836f460C4AADe8De6");
  
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