async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xd4728cc01BEfdc10fff3A8079a3E1c7AB18bE1c7");
  
    const tx = await contract.requestWindSpeed(
      '10',
      '10',
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