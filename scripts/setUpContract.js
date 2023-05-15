async function main() {
    const Contract = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    const contract = await Contract.attach("0x1821BF8050667bB0C8c6AAfabEaBD9DA4C81237B");
  
    const tx = await contract.setUpContract(
        1000, // charterPerHour
        75, // chainteringServicePayPerHour
        12, // minimumCruisingSpeed
        9751779, // vesselIMOnumber
        1, // earlyCancellationPenaltyPerHour
        5, // consuptionstandBy
        25, // consuptionAtOperation
        20, // consuptionUnderWay
    );
    tx.wait()
    console.log("Done")
  }
  
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});