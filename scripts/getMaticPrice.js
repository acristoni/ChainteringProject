async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xc7CF9E6906684906AA424A1F4D59b88113a05c33");
  
    const tx = await contract.saveLastMaticPrice();
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