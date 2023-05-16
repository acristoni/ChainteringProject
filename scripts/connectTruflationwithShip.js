async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0xc00C51FFB7B8C68e50Fac14eF6E94c34Ac6ca14B");
  
    const tx = await contract.conectToShipChartering("0xd4728cc01BEfdc10fff3A8079a3E1c7AB18bE1c7");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});