async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0xD735909699eb2c2118B201C31ef43Ccf85413dEC");
  
    const tx = await contract.oracleData();
    console.log("🚀 ~ file: startCharter.js:6 ~ main ~ tx:", tx)
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});