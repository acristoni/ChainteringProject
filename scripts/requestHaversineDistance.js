async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x791AAB0d179E38c85e9E67c9226fCcBE894B951F");
  
    const tx = await contract.requestHaversineDistance(
      '0',
      '0',
      '-20',
      '-20'
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