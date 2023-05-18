async function main() {
    const Contract = await ethers.getContractFactory("PriceMaticUSD");
    const contract = await Contract.attach("0x6613144d0f61884d6F20Fe6d94f1bE3e09277Eb5");
  
    const tx = await contract.conectToShipChartering("0xecA1FBcDcD910c90DB462b315E968D26F7cAC8E4");
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});