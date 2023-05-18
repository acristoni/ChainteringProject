async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xecA1FBcDcD910c90DB462b315E968D26F7cAC8E4");
  
    const tx = await contract.oracleData();
    console.log("🚀 ~ file: startCharter.js:6 ~ main ~ tx:", parseInt(tx.lastWindSpeed))
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});