const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShipTimeCharteringGeneric", () => {
  let shipTimeChartering;
  let shipOwner;
  let charterer;
  let arbiter_1;
  let arbiter_2;
  let arbiter_3;
  let chainteringService;

  function degreesToRadians(degrees) {
    var radians = degrees * Math.PI/180;
    return radians;
  }

  beforeEach(async () => {
    // Deploy the contract before each test
    [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService] = await ethers.getSigners();
    const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    shipTimeChartering = await ShipTimeChartering.deploy(
      shipOwner.address,
      charterer.address,
      arbiter_1.address,
      arbiter_2.address,
      arbiter_3.address,
      chainteringService.address   
    );
    await shipTimeChartering.deployed();

    //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
    await shipTimeChartering.setUpContract(
      5, // monthlyPayday
      1000, // charterPerHour
      75, // chainteringServicePayPerHour
      12, // minimumCruisingSpeed
      9751779, // vesselIMOnumber
      1, // earlyCancellationPenaltyPerHour
      5, // consuptionstandBy
      25, // consuptionAtOperation
      20, // consuptionUnderWay
    );

    //Start 3 month contract
    await shipTimeChartering.connect(charterer).startCharter(3);
  });

  describe("Deploy new Contract", async() => {
    it("Should deploy and set variables on constructor correctly", async () => {
      // Check that variables were set correctly during deployment
      const parties = await shipTimeChartering.parties();
      const shipOwnerFromGetter = parties[0];
      const chartererFromGetter = parties[1];
      const arbiter_1FromGetter = parties[2];
      const arbiter_2FromGetter = parties[3];
      const arbiter_3FromGetter = parties[4];
      const chainteringServiceFromGetter = parties[5];
  
      expect(shipOwnerFromGetter).to.equal(shipOwner.address);
      expect(chartererFromGetter).to.equal(charterer.address);
      expect(arbiter_1FromGetter).to.equal(arbiter_1.address);
      expect(arbiter_2FromGetter).to.equal(arbiter_2.address);
      expect(arbiter_3FromGetter).to.equal(arbiter_3.address);
      expect(chainteringServiceFromGetter).to.equal(chainteringService.address);
    });
  
    it("Should set contract variables on setUp function correctly", async () => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const monthlyPayday = parseInt(contractTimes[2]);
  
      const contractValues = await shipTimeChartering.contractValues();
      const charterPerHour = contractValues[0];
      const chainteringServicePayPerHour = contractValues[1];
      const earlyCancellationPenaltyPerHour = parseInt(contractValues[2]);
  
      const vesselData = await shipTimeChartering.vesselData();
      const vesselIMOnumber = vesselData[0];
      const minimumCruisingSpeed = vesselData[1];
  
      expect(monthlyPayday).to.equal(5);
      expect(charterPerHour).to.equal(1000);
      expect(chainteringServicePayPerHour).to.equal(75);
      expect(earlyCancellationPenaltyPerHour).to.equal(1);
      expect(vesselIMOnumber).to.equal(9751779);
      expect(minimumCruisingSpeed).to.equal(12);
    });

    it("Should oil consuption by ship operation set up", async () => {
      const oilConsuptionStandBy = await shipTimeChartering.contractConsuptionByOperationalType(0);
      const oilConsuptionAtOperation = await shipTimeChartering.contractConsuptionByOperationalType(1);
      const oilConsuptionUnderWay = await shipTimeChartering.contractConsuptionByOperationalType(2);
      const oilConsuptionWaitingOrders = await shipTimeChartering.contractConsuptionByOperationalType(3);
      const oilConsuptionOffHire = await shipTimeChartering.contractConsuptionByOperationalType(4);
      const oilConsuptionAtAnchor = await shipTimeChartering.contractConsuptionByOperationalType(5);
      const oilConsuptionSuppling = await shipTimeChartering.contractConsuptionByOperationalType(6);
      
      expect(oilConsuptionStandBy).to.equal(5);
      expect(oilConsuptionAtOperation).to.equal(25);
      expect(oilConsuptionUnderWay).to.equal(20);
      expect(oilConsuptionWaitingOrders).to.equal(5);
      expect(oilConsuptionOffHire).to.equal(0);
      expect(oilConsuptionAtAnchor).to.equal(5);
      expect(oilConsuptionSuppling).to.equal(5);
    })
  })

  describe("Start ship chartering", async() => {
    it("Should start the charter ship", async () => {  
      // Check the start date time and end date time
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const endDateTime = parseInt(contractTimes[1]);
      expect(endDateTime).to.equal(startDateTime + 3 * 30 * 24 * 60 * 60); // 3 months in seconds
      
      const vesselDataBeforeReport = await shipTimeChartering.vesselData()
      const totalOilConsuption = vesselDataBeforeReport[2]
      expect(totalOilConsuption).to.equal(0);
  
      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterStarted();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
      expect(events[0].args.price).to.equal(1000);
      expect(events[0].args.start).to.equal(startDateTime);
      expect(events[0].args.end).to.equal(endDateTime);
    });

    it("Shouldn't start if other than carterer party try to start contract", async() => {
      await expect(
        shipTimeChartering.connect(shipOwner).startCharter(3)
      ).to.be.revertedWith("Only charterer can start the charter ship");
    })
  })

  describe("Close contract", async() => {
    it("Should close contract by charter, in the end of charter time and without open dispute", async function () {
      const contractTimes = await shipTimeChartering.contractTimes();
      const endDateTime = parseInt(contractTimes[1]);
      await ethers.provider.send("evm_mine", [endDateTime]);
      
      await shipTimeChartering.connect(charterer).closeCharter()

      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterClosed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
    });

    it("Should not allow a non-charterer to close the charter", async () => {
      await expect(
        shipTimeChartering.connect(shipOwner).closeCharter()
      ).to.be.revertedWith("Only the charterer can close the charter");
    });

    it("Should calculate early cancellation penalty", async() => {
      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();
      const charterTime = 90 * 24 //3 month in hours
      const earlyCancellationPenaltyPerHour = 1 // setUpContract function parameter

      expect(parseInt(returnCalculation)).to.equal(charterTime * earlyCancellationPenaltyPerHour);
    })

    it("Should calculate early cancellation penalty return zero, if charter period finish", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const endDateTime = parseInt(contractTimes[1]);
      await ethers.provider.send("evm_mine", [endDateTime]);

      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();

      expect(parseInt(returnCalculation)).to.equal(0);
    })

    it("Should not allow to close if charterer not pay early cancellation penalty", async () => {
      await expect(
        shipTimeChartering.connect(charterer).closeCharter()
      ).to.be.revertedWith("Deposit early cancellation penalty");
    });

    it("Should close if charterer pay early cancellation penalty", async () => {
      const returnCalculation = await shipTimeChartering.earlyCancellationPenalty();
      const depositValue = parseInt(returnCalculation);

      await shipTimeChartering
              .connect(charterer)
              .closeCharter({ value: depositValue })
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.CharterClosed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.shipOwner).to.equal(shipOwner.address);
      expect(events[0].args.charterer).to.equal(charterer.address);
    });
  
    it("Should not allow to close the charter if it has not started yet", async function () {
      [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService] = await ethers.getSigners();
      const shipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const contractDeployWithoutStart = await shipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address   
      );
      await contractDeployWithoutStart.deployed();
      await expect(
        contractDeployWithoutStart.connect(charterer).closeCharter()
      ).to.be.revertedWith("Charter cannot be closed if it not started");
    });

    it("Should ship operation be off hire to close contract", async() => {

    })

    it("Should not close contract if ship is not off hire", async() => {
      
    })

    it("Should charter pay any amount due before close the contract", async() => {
      //PRIMEIRO DEFINIR COMO SERA ACUMULADO ESSE VALOR DEVIDO!
    })

    it("Should not allow to close the charter if there is an open dispute", async function () {
      // await shipTimeChartering.connect(charterer).startCharter(1);
      
      // CRIAR FUNÇÃO DE ABRIR UMA DISPUTA PRIMEIRO PARA PODER TESTAR

      // await expect(
      //   shipTimeCharteringGeneric.connect(charterer).closeCharter()
      // ).to.be.revertedWith("Charter cannot be closed if there's some dispute opened");
    });

    it("Should close if all oil consuption are equal to oil supply", async() => {

    })

    it("Should discount from amount due the diference between oil supply and oil consuption, if it's positive", async() => {

    })
  })

  describe("Disputes", async() => {
    it("Should inform if there is no open dispute", async() => {
      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })

    it("Should dispute be open by charterer or ship owner, informing period, reason and value", async() => {

    })

    it("Should dispute be judge by three arbiters, informed on contract deploy", async() => {

    })

    it("Should increase dispute value on amount due, if charterer wins", async() => {

    })

    it("Should decrease dispute value on amount due, if ship owner wins", async() => {
      
    })

    it("Should be closed after all three arbiters judge", async() => {

    })
  })

  describe("Report vessel operations by ship owner", async() => {
    it("Should save date departure, date arrival, position departure, position arrive, is bad weather conditions, oil consuption and operational status", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours voyage
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          120, //distance in nautical miles
          false, // is good Weather, 
          200, // oil consuption per operation, 
          2 // operation code for under way
        );
      
      const reportDataSaved = await shipTimeChartering.getOperationReport(dateDeparture);
        expect(reportDataSaved.startDate).to.equal(dateDeparture);
        expect(reportDataSaved.endDate).to.equal(dateArrival);
        expect(reportDataSaved.startPosition[0]).to.equal(ethers.utils.parseUnits(String(latitudeDeparture), 18));
        expect(reportDataSaved.startPosition[1]).to.equal(ethers.utils.parseUnits(String(longitudeDerparture), 18));
        expect(reportDataSaved.endPosition[0]).to.equal(ethers.utils.parseUnits(String(latitudeArrival), 18));
        expect(reportDataSaved.endPosition[1]).to.equal(ethers.utils.parseUnits(String(longitudeArrival), 18));
        expect(reportDataSaved.distance).to.equal(120);
        expect(reportDataSaved.isBadWeatherDuringOps).to.equal(false);
        expect(reportDataSaved.opsOilConsuption).to.equal(200);
        expect(reportDataSaved.operationStatus).to.equal(2);
    })

    it("Should sum oil consuption during operation to total oil consuption in contract storage", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours voyage
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles
      
      const vesselDataBeforeReport = await shipTimeChartering.vesselData()
      const totalOilConsuptionBeforeReport = vesselDataBeforeReport[2]

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          120, //distance in nautical miles
          false, // is good Weather, 
          200, // oil consuption per operation, 
          2 // operation code for under way
        );

      const vesselDataAfterReport = await shipTimeChartering.vesselData()
      const totalOilConsuptionAfterReport = vesselDataAfterReport[2]

      expect(totalOilConsuptionAfterReport - totalOilConsuptionBeforeReport).to.equal(200)
    })

    it("Should calculate avarage speed", async() => {
      const avarageSpeed = await shipTimeChartering.avarageSpeed(
        10, // operation time duration in hours
        120 //distance in nautical miles
      );

      expect(avarageSpeed).to.equal(12)
    })

    it("Should check if contract minimum speed was reached", async() => {
      const response = await shipTimeChartering.checkMinimumOperationalSpeed(
        10, // operation time duration in hours
        120 //distance in nautical miles
      )

      expect( response.isMinimumSpeedReached ).to.equal(true)
      expect( response.speed ).to.equal(12)
    })

    it("Should emit a BelowContractualSpeed event if contract minimum speed was NOT reached", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (12 * 3600); //12 hours voyage - AVARAGE SPEED 10
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          120, //distance in nautical miles
          false, // is good Weather, 
          200, // oil consuption per operation, 
          2 // operation code for under way
        );
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.BelowContractualSpeed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.avarageSpeed).to.equal(10);
      expect(events[0].args.minimumCruisingSpeed).to.equal(12);
    })

    it("Should check if contract minimum speed was reached, only if vessel was under way", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours - AVARAGE SPEED 0 "stand by"
      const latitude = -23.90320425631785;
      const longitude = -46.07624389163475; //same for start end end operation

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitude), 18),
          ethers.utils.parseUnits(String(longitude), 18),
          ethers.utils.parseUnits(String(latitude), 18),
          ethers.utils.parseUnits(String(longitude), 18),
          0, //vessel stoped
          false, // is good Weather, 
          50, // oil consuption per operation, 
          0 // operation code for stand by
        );

      // Check the emitted event
      const filter = shipTimeChartering.filters.BelowContractualSpeed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(0);
    })

    it("Should check broadcast data if ship owner report bad weather condition", async() => {

    })

    it("Should open a dispute if ship owner report bad weather and broadcast contest", async() => {

    })

    it("Should allow avarage speed less than contract minimum speed, if bad weather", async() => {

    })

    it("Should allow oil consuption superior, if bad weather", async() => {

    })

    it("Should check if reported oil consuption is less or equal contract oil consuption for operation", async() => {
      const response = await shipTimeChartering.checkOilConsuption(
        10, // operation time duration in hours 
        200, //oil consuption tons per hour, 
        2 //operationCode for vessel under way
      );

      expect(response.isConsuptionAccordingContract).to.equal(true);
      expect(response.oilConsuptionDuringOperation).to.equal(20);
    })

    // it("Should calculate penalty, if speed not reached", async() => {

    // })

    it("Should emit event consumption above agreed, if oil consume exceed the agreed", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours voyage
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          120, //distance in nautical miles
          false, // is good Weather, 
          300, // oil consuption per operation, 
          2 // operation code for under way
        );

      // Check the emitted event
      const filter = shipTimeChartering.filters.ConsumptionAboveAgreed();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.consuptionAgreed).to.equal(20);
      expect(events[0].args.consuptionReported).to.equal(30);
    })

    it("Should add amount due ship owner for operation time", async() => {
      //write new ship operation report
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      const dateDeparture = startDateTime; 
      const dateArrival = dateDeparture + (10 * 3600); //10 hours voyage
      const latitudeDeparture = -23.90320425631785;
      const longitudeDerparture = -46.07624389163475;
      const latitudeArrival = -25.248573511757215;
      const longitudeArrival = -44.76222770000078; //about 120 nautical miles
      
      const contractValuesBeforeOperation = await shipTimeChartering.contractValues()
      const amountDueBeforeOperation = contractValuesBeforeOperation[3]

      await shipTimeChartering
        .connect(shipOwner)
        .newOperationReport(
          dateDeparture,
          dateArrival,
          ethers.utils.parseUnits(String(latitudeDeparture), 18),
          ethers.utils.parseUnits(String(longitudeDerparture), 18),
          ethers.utils.parseUnits(String(latitudeArrival), 18),
          ethers.utils.parseUnits(String(longitudeArrival), 18),
          120, //distance in nautical miles
          false, // is good Weather, 
          200, // oil consuption per operation, 
          2 // operation code for under way
        );

        const contractValuesAfterOperation = await shipTimeChartering.contractValues()
        const amountDueAfterOperation = contractValuesAfterOperation[3]

      expect(amountDueAfterOperation - amountDueBeforeOperation).to.equal(10000)
    })

  })
  
  describe("Pay charter", async() => {
    it("Should pay ship owner all amount due in pay day", async() => {

    })
    
    it("Should pay Chaintering service when deposit amount", async() => {
  
    })

    it("Should calculate charterer penalty, for late payment", async() => {

    })

    it("Should convert dolar contract values to ether", async() => {
      
    })
  })

  describe("Fuel supply", async() => {
    it("Should ship owner inform oil's quantity and date of supply", async() => {

    })

    it("Should only ship owner can report fuel supply", async() => {

    })

    it("Should emit a fuel supply event", async() => {

    })
  })

  describe("Change service owner", async () => {
    it("Should Chaintering service can be changed", async() => { 

    })

    it("Should only actual owner change to new owner", async() => {

    })
  })

  describe("Oracle service", async() => {
    it("Should convert ether to dolar", async() => {

    })

    it("Should integrate with broadcast weather service", async() => {

    })

    it("Should be bad weather condition if waves heigth more than 2.5 meters", async() => {

    })

    it("Should be bad weather condition if wind speed more than 30 nautical knots", async() => {
      
    })

    it("Should be bad weather condition if sea current speed more than 1.5 nautical knots", async() => {
      
    })

    it("Should not be bad weather condition if any of above consitions happen", async() => {
      
    })
  })
});