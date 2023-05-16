async function main() {
    const Contract = await ethers.getContractFactory("Haversine");
    const contract = await Contract.attach("0x3a4BC8002aB7108FeC63aedD87abDfab4bcc2AEd");
  
    const tx = await contract.conectToShipChartering("0xa9fa9EFeF845577bA2dC7E36aA3F47D68207237c");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});