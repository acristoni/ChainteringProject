async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0x714C84531bAfC024d502C3450720a9fB6B21564D");
  
    const tx = await contract.connectToShipChartering("0x4843DF76AE7559560c20dE0650A5102545418Bc8");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});