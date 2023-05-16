async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0xba698cB07C54fA754eEAaf461e7B04C058b5Af2c");
  
    const tx = await contract.conectToShipChartering("0xD735909699eb2c2118B201C31ef43Ccf85413dEC");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});