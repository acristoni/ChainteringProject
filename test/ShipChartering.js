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
  let newChainteringOwner;
  let truflationContract;

  beforeEach(async () => {
    //Deploy mock Truflation contract, (a contract where it's using ChainLink and Truflation to get real world data)
    const Truflation = await ethers.getContractFactory("MockTruflation");
    truflationContract = await Truflation.deploy();
    const deployedTruflation = await truflationContract.deployed();
    const truflationAddress = deployedTruflation.address;
    // Deploy the contract before each test
    [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService, newChainteringOwner] = await ethers.getSigners();  
    const ShipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
    shipTimeChartering = await ShipTimeChartering.deploy(
      shipOwner.address,
      charterer.address,
      arbiter_1.address,
      arbiter_2.address,
      arbiter_3.address,
      chainteringService.address,
      truflationAddress  
    );
    await shipTimeChartering.deployed();
    const shipTimeCharteringAddress = shipTimeChartering.address;

    //function call after deploy to finish the contract variable set up, due the 'Stack too deep' it can't be done in constructor.
    await shipTimeChartering.setUpContract(
      1000, // charterPerHour
      75, // chainteringServicePayPerHour
      12, // minimumCruisingSpeed
      9751779, // vesselIMOnumber
      20, // penaltyPerHour
      5, // consuptionstandBy
      25, // consuptionAtOperation
      20, // consuptionUnderWay
    );
    
    await truflationContract.conectToShipChartering(shipTimeCharteringAddress);

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
      const contractValues = await shipTimeChartering.contractValues();
      const charterPerHour = contractValues[0];
      const chainteringServicePayPerHour = contractValues[1];
      const earlyCancellationPenaltyPerHour = parseInt(contractValues[2]);
  
      const vesselData = await shipTimeChartering.vesselData();
      const vesselIMOnumber = vesselData[0];
      const minimumCruisingSpeed = vesselData[1];
  
      expect(charterPerHour.price).to.equal(1000);
      expect(chainteringServicePayPerHour).to.equal(75);
      expect(earlyCancellationPenaltyPerHour).to.equal(20);
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

    it("Shouldn't start if other than carterer part try to start contract", async() => {
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
      const earlyCancellationPenaltyPerHour = 20 // setUpContract function parameter

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
      const Truflation = await ethers.getContractFactory("Truflation");
      const truflationContract = await Truflation.deploy();
      const deployedTruflation = await truflationContract.deployed();
      const truflationAddress = deployedTruflation.address;
      [shipOwner, charterer, arbiter_1, arbiter_2, arbiter_3, chainteringService] = await ethers.getSigners();
      const shipTimeChartering = await ethers.getContractFactory("ShipTimeCharteringGeneric");
      const contractDeployWithoutStart = await shipTimeChartering.deploy(
        shipOwner.address,
        charterer.address,
        arbiter_1.address,
        arbiter_2.address,
        arbiter_3.address,
        chainteringService.address,   
        truflationAddress
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
      //passr valor do oleo como parametro
    })
  })

  describe("Disputes", async() => {
    it("Should dispute be open by charterer or ship owner, informing period, reason and value", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);
      const endTime = startTime + (10 * 3600); //10 hours voyage

      await shipTimeChartering.createDispute(
        startTime,
        endTime,
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute()

      expect(isSomeOpenDispute).to.equal(true);
    })

    it("Should inform if there is no open dispute", async() => {
      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })

    it("Should be able to create as disputes as need", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //second open dispute
      await shipTimeChartering.createDispute(
        startTime + (2 * 3600), //2 hours after contract start
        startTime + (4 * 3600), //2 hours voyage
        "Is bad weather, despiting oracle data", //reason
        2000, //value
        0 // ship owner open this dispute
      );

      //third open dispute
      await shipTimeChartering.createDispute(
        startTime + (4 * 3600), //2 hours after contract start
        startTime + (12 * 3600), //8 hours voyage
        "Not off hire, crew member sick", //reason
        8000, //value
        0 // ship owner open this dispute
      );

      const totalDisputes = await shipTimeChartering.totalDisputes();

      expect(totalDisputes).to.equal(3);
    })

    it("Should only contract arbiter can judge", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      await expect(
        shipTimeChartering
          .connect(charterer)
          .judgeDispute(
            1, //dispute id
            true //is reasonable
          )
      ).to.be.revertedWith("Only contract arbiters can judge");
    })

    it("Should emit ArbiterVote event", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //judge dispute
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      // Check the emitted event
      const filter = shipTimeChartering.filters.ArbiterVote();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.disputeId).to.equal(1);
      expect(events[0].args.isReasonable).to.equal(true);
      expect(events[0].args.arbiter).to.equal(arbiter_1.address);
    })
    
    it("Should be closed after all three arbiters judge", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

       //third vote
       await shipTimeChartering
              .connect(arbiter_3)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      const isSomeOpenDispute = await shipTimeChartering.checkOpenDispute();
      expect(isSomeOpenDispute).to.equal(false);
    })
    
    it("Should emit ResJudicata event, for close dispute", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        10000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      // Check the emitted event
      const filter = shipTimeChartering.filters.ResJudicata();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.disputeId).to.equal(1);
      expect(events[0].args.winningPart).to.equal(1);
    })

    it("Should increase dispute value on amount due, if ship owner wins", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not off hire, crew member sick", //reason
        10000, //value
        0 // ship owner open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      expect(amountDueAfter - amountDueBefore).to.equal(10000)
    })

    it("Should decrease dispute value on amount due, if charterer wins", async() => {
      await shipTimeChartering.addDueAmount(10000);
      const contractTimes = await shipTimeChartering.contractTimes();
      const startTime = parseInt(contractTimes[0]);

      
      //first open dispute
      await shipTimeChartering.createDispute(
        startTime,
        startTime + (10 * 3600), //10 hours voyage
        "Not bad weather, as reported", //reason
        2000, //value
        1 // charterer open this dispute
      );

      //first vote
      await shipTimeChartering
              .connect(arbiter_1)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //second vote
      await shipTimeChartering
              .connect(arbiter_2)
              .judgeDispute(
                1, //dispute id
                true //is reasonable
              )

      //third vote
      await shipTimeChartering
            .connect(arbiter_3)
            .judgeDispute(
              1, //dispute id
              true //is reasonable
            )
      
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      expect(amountDueAfter).to.equal(8000)
    })

    ("It should close a dispute open by ship owner and it's not reasonable", async() => {

    })

    ("It should close a dispute open by charterer and it's not reasonable", async() => {

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

    it("Should emit Operation Report event", async() => {
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

      // Check the emitted event
      const filter = shipTimeChartering.filters.ReportOperation();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.isBadWeather).to.equal(false);
      expect(events[0].args.operationCode).to.equal(2);
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

    it("Should be able to report bad weather conditions, by ShipOwner", async() => {

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

    it("Should calculate penalty, if speed not reached", async() => {

    })

    it("Should emit event consumption above agreed", async() => {
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
      
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);

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

      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);

      expect(amountDueAfter - amountDueBefore).to.equal(10000)
    })

  })
  
  describe("Payment charter", async() => {
    it("Should be able to check current contract month", async() => {
      const currentMonth = await shipTimeChartering.checkCurrentContractMonth()
      expect(currentMonth).to.equal(0)
    })

    it("Should be able to check current contract month, mocking anothers months", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const firstMonthTime = parseInt(contractTimes[0]) + 45 * 24 * 60 * 60 * 1000 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      const firstMonth = await shipTimeChartering.checkCurrentContractMonth()

      expect(firstMonth).to.equal(1)

      const secondMonthTime = parseInt(contractTimes[0]) + 60 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [secondMonthTime]);
      const secondMonth = await shipTimeChartering.checkCurrentContractMonth()

      expect(secondMonth).to.equal(2)
    })

    it("Should be able to add some amount due", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.addDueAmount(10000);
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      const amountDiference = amountDueAfter - amountDueBefore;
      expect(amountDiference).to.equal(10000);
    })

    it("Should be emit AddDueAmount event", async() => {
      await shipTimeChartering.addDueAmount(10000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.AddDueAmount();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(10000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })

    it("Should be able to subtract some amount due", async() => {
      const amountDueBefore = await shipTimeChartering.checkMonthlyAmountDue(0);
      await shipTimeChartering.addDueAmount(10000);
      await shipTimeChartering.subtractDueAmount(1000);
      const amountDueAfter = await shipTimeChartering.checkMonthlyAmountDue(0);
      const amountDiference = amountDueAfter - amountDueBefore;
      expect(amountDiference).to.equal(9000);
    })

    it("Should be emit SubtractDueAmount event", async() => {
      await shipTimeChartering.addDueAmount(10000);
      await shipTimeChartering.subtractDueAmount(2000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.SubtractDueAmount();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(2000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })

    it("Should emit NotEnoughFounds event if amount due this month is less then value subtraction", async() => {
      await shipTimeChartering.subtractDueAmount(1000);

      // Check the emitted event
      const filter = shipTimeChartering.filters.NotEnoughFounds();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.value).to.equal(1000);
      expect(events[0].args.currentContractMonth).to.equal(0);
    })

    it("Should revert totalAmountDueToPay function, if crude oil price wasn't check maximum 24 hours before", async() => {
      //Add 10000 amount due first month, in time, so without penalty
      await shipTimeChartering.addDueAmount(10000);

      const contractTimes = await shipTimeChartering.contractTimes();
      //Add 10000 amount due second month, delayed, so he'll pay US$ 200,00 penalty
      const firstMonthTime = parseInt(contractTimes[0]) + 30 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      //Add 10000 amount due third month, delayed, so he'll pay US$ 200,00 penalty
      const secondMonthTime = parseInt(contractTimes[0]) + 60 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [secondMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      await expect(
        shipTimeChartering
          .totalAmountDueToPay()
      ).to.be.revertedWith("Crude oil price must be updated, maximum 24 hours before payment, call requestCrudeOilPrice()");
    })

    it("Should totalAmountDueToPay function check current total amount due, with penalties and crude oil inflation", async() => {
      //Add 10000 amount due first month, in time, so without penalty
      await shipTimeChartering.addDueAmount(10000);
      
      const contractTimes = await shipTimeChartering.contractTimes();
      //Add 10000 amount due second month, delayed, so he'll pay US$ 200,00 penalty
      const firstMonthTime = parseInt(contractTimes[0]) + 30 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [firstMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      //Add 10000 amount due third month, delayed, so he'll pay US$ 200,00 penalty
      const secondMonthTime = parseInt(contractTimes[0]) + 60 * 24 * 60 * 61 * 1000 ;
      await ethers.provider.send("evm_mine", [secondMonthTime]);
      await shipTimeChartering.addDueAmount(10000);

      await shipTimeChartering.requestCrudeOilPrice()

      //Charterer didn't pay nothing until now, so he'll pay for delay penalties
      const totalAmount = await shipTimeChartering.totalAmountDueToPay()
      
      expect(totalAmount).to.equal(30400)
    })

    it("Should convert Dolar contract values to Matic", async() => {
      
    })
    
    it("Should pay Ship Owner service when deposit amount", async() => {
  
    })

    it("Should pay Chaintering service when deposit amount", async() => {
  
    })
  })

  describe("Fuel supply", async() => {
    it("Should ship owner inform oil's quantity and date of supply", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      await shipTimeChartering.connect(shipOwner).oilSupplyReport(
        startDateTime, //date  of supply
        250 //quantity of oil supplied, in tons
      )

      const oilQuantityReported = await shipTimeChartering.consultOilSupplyReport(startDateTime)

      expect(oilQuantityReported).to.equal(250);
    })

    it("Should only ship owner can report fuel supply", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);

      await expect(
        shipTimeChartering
          .connect(charterer)
          .oilSupplyReport(
            startDateTime, //date  of supply
            250 //quantity of oil supplied, in tons
          )
      ).to.be.revertedWith("Only ship owner can report oil supply");
    })

    it("Should emit a fuel supply event", async() => {
      const contractTimes = await shipTimeChartering.contractTimes();
      const startDateTime = parseInt(contractTimes[0]);
      await shipTimeChartering.connect(shipOwner).oilSupplyReport(
        startDateTime, //date  of supply
        250 //quantity of oil supplied, in tons
      )

      const filter = shipTimeChartering.filters.SupplyReport();
      const events = await shipTimeChartering.queryFilter(filter);
      expect(events.length).to.equal(1);
      expect(events[0].args.day).to.equal(startDateTime);
      expect(events[0].args.oilTonsQuantity).to.equal(250);
    })
  })

  describe("Change service owner", async () => {
    it("Should Chaintering service can be changed", async() => { 
      await shipTimeChartering
        .connect(chainteringService)
        .transferChainteringService(newChainteringOwner.address);

        const parties = await shipTimeChartering.parties();
        const chainteringServiceFromGetter = parties[5];

        expect(chainteringServiceFromGetter).to.equal(newChainteringOwner.address);
    })

    it("Should only actual owner change to new owner", async() => {
      await expect(
        shipTimeChartering
          .connect(newChainteringOwner)
          .transferChainteringService(newChainteringOwner.address)
      ).to.be.revertedWith("Only the current Chaintering owner can do this action");
    })
  })

  describe("Oracle service", async() => {
    it("Should get crude oil price", async() => {
      await shipTimeChartering.requestCrudeOilPrice()

      const oracleData = await shipTimeChartering.oracleData();

      const firstCrudeOilPrice = oracleData.firstCrudeOilPrice;
      const lastCrudeOilPrice = oracleData.lastCrudeOilPrice;

      expect(firstCrudeOilPrice).to.equal(75410000000000000000n);
      expect(lastCrudeOilPrice).to.equal(75410000000000000000n);
    })

    it("Should calculate crude oil inflaction between payments", async() => {
      
    })

    it("Should get Matic / Dolar cotation", async() => {

    })

    it("Should get wind speed by latitude and longitute", async() => {

    })

    it("Should be bad weather condition if wind speed more than 20 nautical knots", async() => {
      
    })

    it("Should calculate distance, using Haversine formula, given two positions (latitude, longitude)", async() => {

    })
  })
});

//MELHORIAS:
  // PEGAR TAMANHO DAS ONDAS
  // PEGAR VELOCIDADE DA CORRENTE MARÍTIMA