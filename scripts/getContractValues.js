async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x81BB05A286b77007Aa5350c6FC1A5F0366ddd086");
  
    const tx = await contract.contractValues();
    console.log("🚀 ~ file: startCharter.js:6 ~ main ~ tx:", parseInt(tx.charterPerHour.price))
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});