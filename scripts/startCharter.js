async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x1821BF8050667bB0C8c6AAfabEaBD9DA4C81237B");
  
    const tx = await contract.startCharter(3);
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