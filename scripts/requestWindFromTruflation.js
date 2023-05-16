async function main() {
    const Contract = await ethers.getContractFactory("Truflation");
    const contract = await Contract.attach("0xF29B620526AbdEbb6613e66717cD36ce4AEf5d65");
  
    const tx = await contract.requestWindSpeed(
      '10',
      '10'
    );
    tx.wait()
    console.log("🚀 ~ file: requestDistanceFromTruflation.js:12 ~ main ~ tx:", tx)
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});