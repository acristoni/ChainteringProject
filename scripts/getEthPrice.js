async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x349647e6B162883617Ff42bb4AE1f17B0E87bD24");
  
    const tx = await contract.saveLastEthPrice();
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