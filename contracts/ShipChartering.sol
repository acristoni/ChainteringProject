// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Truflation.sol";
import "./PriceMaticUSD.sol";
import "hardhat/console.sol";

contract ShipTimeCharteringGeneric is Initializable {
    using SafeMath for uint256;
    PriceMaticUSD public contractPriceMaticUSD;
    Truflation public contractTruflation;

    Parties public parties;
    ContractTimes public contractTimes;
    VesselData public vesselData;
    ContractValues public contractValues;
    ChainLinkData public oracleData;
    
    //chater data
    mapping(uint256 => uint256) public monthlyAmontDue;
    mapping(uint16 => Dispute) public allDisputes;
    uint16 public totalDisputes = 0;

    // //ShipOwnerReport
    mapping(uint256 => uint16) public oilSupply;
    mapping(uint256 => VesselReport) public vesselOpsReport;
    
    //contract types
    struct ContractValues {
        CharterPerHour charterPerHour;
        uint8 chainteringServicePayPerHour;
        uint256 penaltyPerHour;
    }
    struct CharterPerHour {
        uint32 price;
        uint256 lastUpdate; //timestamp
    }
    struct VesselData {
        uint32 vesselIMOnumber; 
        uint8 minimumCruisingSpeed;        
        mapping(OperationStatus => uint8) oilConsumptionTonsHour;
        uint256 oilTotalConsuption;
        bool isInBadWeatherConditionsOracleInfo;
        bool isInBadWeatherConditionsShipOwnerInfo;
    }
    struct Dispute {
        uint256 startTime;
        uint256 endTime;
        string reason;
        address[] arbitersVoted;
        mapping(address => bool) votes;
        bool isClose;
        uint256 value;
        DisputeParties partOpenDispute;
        DisputeParties winningPart;
    }
    struct Location {
        int256 latitude; // degrees
        int256 longitude; // degrees
    }
    enum OperationStatus {
        standBy,
        atOperation,
        underWay,
        waintingOrders,
        offHire,
        atAnchor,
        suppling    
    }
    enum DisputeParties {
        shipOwner,
        charterer
    }
    struct Parties {
        address payable shipOwner;
        address payable charterer;
        address payable arbiter_1;
        address payable arbiter_2;
        address payable arbiter_3;
        address payable chainteringService;
    }
    struct ContractTimes {
        uint256 startDateTime;
        uint256 endDateTime;
    }
    struct VesselReport {
        uint256 startDate;
        uint256 endDate;
        int256 latitudeDeparture;
        int256 longitudeDerparture;
        int256 latitudeArrival;
        int256 longitudeArrival;
        bool isBadWeatherDuringOps;
        uint256 opsOilConsuption;
        OperationStatus operationStatus;
    }    
    struct ChainLinkData {
        PriceMatic priceMatic;
        LastDistanceCalculation lastDistanceCalculation;
        uint lastWindSpeed;
        uint lastCrudeOilPrice;
        uint firstCrudeOilPrice;
    }
    struct LastDistanceCalculation {
        uint value;
        uint lastUpdate;
    }
    struct PriceMatic {
        uint value;
        uint lastUpdate;
    }
    
    event CharterStarted(address indexed shipOwner, address indexed charterer, uint256 price, uint256 start, uint256 end);
    event CharterClosed(address indexed shipOwner, address indexed charterer);
    event BelowContractualSpeed( uint256 avarageSpeed, uint8 minimumCruisingSpeed);
    event ConsumptionAboveAgreed( uint8 consuptionAgreed, uint256 consuptionReported);
    event ReportOperation(uint256 dateDeparture, OperationStatus operationCode);
    event SupplyReport(uint256 day, uint16 oilTonsQuantity);
    event ArbiterVote(uint16 disputeId, bool isReasonable, address arbiter);
    event ResJudicata(uint16 disputeId, DisputeParties winningPart);
    event AddDueAmount(uint256 amount, uint256 currentContractMonth);
    event SubtractDueAmount(uint256 amount, uint256 currentContractMonth);
    event NotEnoughFounds(uint256 value, uint256 currentContractMonth);
    event MaticPrice(uint priceMatic);
    event HaversineDistance(uint haversineDistance);
    event FirstCrudeOilPrice(uint price);
    event BadWeather(string latitude, string longitude);
    event Payment(uint valueToShipOwner, uint valueToChaintering, uint timestamp);

    constructor(
        address payable _shipOwner,
        address payable _charterer,
        address payable _arbiter_1,
        address payable _arbiter_2,
        address payable _arbiter_3,
        address payable _chainteringService,
        address contractTruflationAddress,
        address contractPriceMaticUSDAddress
    ) {
        parties.shipOwner = _shipOwner;
        parties.charterer = _charterer;
        parties.arbiter_1 = _arbiter_1;
        parties.arbiter_2 = _arbiter_2;
        parties.arbiter_3 = _arbiter_3;
        parties.chainteringService = _chainteringService;
        contractTruflation = Truflation(contractTruflationAddress);
        contractPriceMaticUSD = PriceMaticUSD(contractPriceMaticUSDAddress);
    }

    function setUpContract(
        uint32 _charterPerHour, 
        uint8 _chainteringServicePayPerHour,
        uint8 _minimumCruisingSpeed,
        uint32 _vesselIMOnumber,
        uint256 _penaltyPerHour,
        uint8 _consuptionstandBy,
        uint8 _consuptionAtOperation,
        uint8 _consuptionUnderWay
    ) external {
        contractValues.charterPerHour.price = _charterPerHour;
        contractValues.charterPerHour.lastUpdate = block.timestamp;
        contractValues.chainteringServicePayPerHour = _chainteringServicePayPerHour;
        contractValues.penaltyPerHour = _penaltyPerHour;    
        vesselData.minimumCruisingSpeed = _minimumCruisingSpeed;
        vesselData.vesselIMOnumber = _vesselIMOnumber;
        vesselData.oilConsumptionTonsHour[OperationStatus.standBy] = _consuptionstandBy;
        vesselData.oilConsumptionTonsHour[OperationStatus.atOperation] = _consuptionAtOperation;
        vesselData.oilConsumptionTonsHour[OperationStatus.underWay] = _consuptionUnderWay;
        vesselData.oilConsumptionTonsHour[OperationStatus.atAnchor] = _consuptionstandBy;
        vesselData.oilConsumptionTonsHour[OperationStatus.offHire] = 0;
        vesselData.oilConsumptionTonsHour[OperationStatus.suppling] = _consuptionstandBy;
        vesselData.oilConsumptionTonsHour[OperationStatus.waintingOrders] = _consuptionstandBy;
    }
    
    function startCharter(uint8 chartersTimeMonths) external {
        require(msg.sender == parties.charterer, "Only charterer can start the charter ship");
        require(contractValues.charterPerHour.lastUpdate > 0, "Contract must be set up, before start");
        contractTimes.startDateTime = block.timestamp;
        contractTimes.endDateTime = block.timestamp.add(chartersTimeMonths * 30 days);
        vesselData.oilTotalConsuption = 0;
        requestCrudeOilPrice();
        
        emit CharterStarted(
            parties.shipOwner, 
            parties.charterer, 
            contractValues.charterPerHour.price, 
            contractTimes.startDateTime, 
            contractTimes.endDateTime);
    }

    function newOperationReport(
        uint256 dateDeparture,
        uint256 dateArrival,
        int256 latitudeDeparture,
        int256 longitudeDerparture,
        int256 latitudeArrival,
        int256 longitudeArrival,
        uint256 oilConsuption, 
        OperationStatus operationCode ) external {
        require(msg.sender == parties.shipOwner, "Only ship owner can report vessel operation");
        
        uint timesDiference = block.timestamp - oracleData.lastDistanceCalculation.lastUpdate;
        uint fifteenMinutes = 900; // 15 * 60
        require(timesDiference < fifteenMinutes, "Distance must be calculated, maximum 15 minutes before report, call requestHaversineDistance()");

        VesselReport memory vesselReport;  

        vesselReport.latitudeDeparture = latitudeDeparture;
        vesselReport.longitudeDerparture = longitudeDerparture;
        vesselReport.latitudeArrival = latitudeArrival;
        vesselReport.longitudeArrival = longitudeArrival;
        vesselReport.operationStatus = operationCode;
        vesselReport.opsOilConsuption = oilConsuption;
        vesselReport.endDate = dateArrival;
        vesselReport.startDate = dateDeparture;
        vesselData.oilTotalConsuption += oilConsuption;

        (bool isBadWeather, ) =  checkWeatherConditions();
        vesselReport.isBadWeatherDuringOps = isBadWeather;
        vesselOpsReport[dateDeparture] = vesselReport;

        allReportsChecks(
            oilConsuption,
            operationCode,
            dateArrival,
            dateDeparture
        );

        emit ReportOperation(dateDeparture, operationCode);
    }

    function allReportsChecks(
        uint256 oilConsuption,
        OperationStatus operationCode,
        uint256 dateArrival,
        uint256 dateDeparture ) public {
        uint256 penalty;
        uint256 timeDiference = dateArrival - dateDeparture;
        uint256 operationHoursDuration =  timeDiference.div(3600);  

        (bool isBadWeather, bool shouldOpenDispute) =  checkWeatherConditions();      

        if(operationCode == OperationStatus.underWay) {
            bool isMinimumSpeedReached = checkMinimumOperationalSpeed( operationHoursDuration );
            if (!isMinimumSpeedReached) {
                penalty += operationHoursDuration * contractValues.penaltyPerHour;
            }
        }

        bool isConsuptionAccordingContract = checkOilConsuption( operationHoursDuration, oilConsuption, operationCode );
        if (!isConsuptionAccordingContract) {
            penalty += operationHoursDuration * contractValues.penaltyPerHour;
        }

        if (isBadWeather) {
            addAmountDueOperation(operationHoursDuration);
        } else {
            addDueAmount(penalty);
            addAmountDueOperation(operationHoursDuration);
        }

        if (shouldOpenDispute) {
            createDispute(
                dateDeparture,
                dateArrival,
                "Ship owner inform bad weather, but oracle contest",
                penalty,
                DisputeParties.shipOwner
            );
        }

        vesselData.isInBadWeatherConditionsShipOwnerInfo = false;
        vesselData.isInBadWeatherConditionsOracleInfo = false;
    }

    function checkWeatherConditions() view public returns (bool isBadWeather, bool shouldOpenDispute) {        
        if (!vesselData.isInBadWeatherConditionsShipOwnerInfo) {
            return (false, false);
        }

        if (vesselData.isInBadWeatherConditionsOracleInfo) {
            return (true, false);
        } 

        if (!vesselData.isInBadWeatherConditionsOracleInfo && vesselData.isInBadWeatherConditionsShipOwnerInfo) {
            return (false, true);
        }
    }

    function addAmountDueOperation (uint operationHoursDuration) public returns (uint256) {
         //check last crude oil price update
        uint timesDiference = block.timestamp - contractValues.charterPerHour.lastUpdate;
        uint dayInSeconds = 86400; // 24 * 60 * 60
        require(timesDiference < dayInSeconds, "Crude oil price must be updated, maximum 24 hours before payment, call requestCrudeOilPrice()");
        uint256 amountDueOperation = contractValues.charterPerHour.price * operationHoursDuration;
        addDueAmount(amountDueOperation);
        return amountDueOperation;
    }

    function addDueAmount(uint256 amount) public {
        uint256 currentContractMonth = checkCurrentContractMonth();
        monthlyAmontDue[currentContractMonth] += amount;

        emit AddDueAmount(amount, currentContractMonth);
    }

    function subtractDueAmount(uint256 amount) public {
        uint256 currentContractMonth = checkCurrentContractMonth();
        uint256 currentMonthlyAmountDue = checkMonthlyAmountDue(currentContractMonth);

        if (amount > currentMonthlyAmountDue) {
            emit NotEnoughFounds(amount, currentContractMonth);
        } else {
            monthlyAmontDue[currentContractMonth] -= amount;
            emit SubtractDueAmount(amount, currentContractMonth);
        }
    }

    function checkCurrentContractMonth() view public returns (uint256 currentContractMonth) {
        uint256 diferenceBetweenNowAndStartContractDate = block.timestamp - contractTimes.startDateTime;
        uint256 contractMonth = diferenceBetweenNowAndStartContractDate.div(30 * 24 * 60 * 60); 
        return contractMonth;
    }

    function checkMonthlyAmountDue(uint256 month) view public returns(uint256 _monthlyAmontDue) {
        return monthlyAmontDue[month];
    }

    function totalAmountDueToPay() public view returns (uint256) {
        uint256 currentContractMonth = checkCurrentContractMonth();
        uint256 totalMonthlyDelayAmountDue = 0;

        for (uint256 i = 0; i < currentContractMonth; i++) {
            totalMonthlyDelayAmountDue += checkMonthlyAmountDue(i);
        }

        uint256 penaltyMult = contractValues.penaltyPerHour * 1000000;
        uint256 totalPenalty = totalMonthlyDelayAmountDue.mul(penaltyMult);
        uint256 penalty = totalPenalty.div(1000000000);

        uint256 totalAmountDue = 
            checkMonthlyAmountDue(currentContractMonth) + 
            totalMonthlyDelayAmountDue +
            penalty;

        return totalAmountDue;
    }

    function convertAmountDueToMatic() public view returns (uint convertedAmountValue) {
        uint totalAmount = totalAmountDueToPay();
        return convertDolarToMatic(totalAmount);
    }

    function calculateValueToChainteringService(uint value) public view returns (uint valueToChaintering) {
        uint valueMul = value * contractValues.chainteringServicePayPerHour;
        uint valueDiv = valueMul.div(contractValues.charterPerHour.price);
        return  valueDiv;
    }

    function payAmountDue() external payable {
        uint convertedAmountValue = convertAmountDueToMatic();
        require(msg.value >= convertedAmountValue, "Deposit amount due value");
        
        uint valueToChaintering = calculateValueToChainteringService(convertedAmountValue);
        (bool sentChaintering, ) = parties.chainteringService.call{value: valueToChaintering}("");
        require(sentChaintering, "Failed to send amount due ChainteringService");
        
        uint valueToShipOwner = msg.value - valueToChaintering;
        (bool sentShipOwner, ) = parties.shipOwner.call{value: valueToShipOwner}("");
        require(sentShipOwner, "Failed to send amount due ship owner");

        emit Payment(valueToShipOwner, valueToChaintering, block.timestamp);
    }

    function avarageSpeed( uint256 operationHoursDuration ) view public returns (uint256 _avaraSpeed) {
        require(oracleData.lastDistanceCalculation.value > 0, "Should calculate a distance first, call requestHaversineDistance()");
        uint256 distanceKM = oracleData.lastDistanceCalculation.value;        
        uint256 distanceNM = distanceKM.mul(509);         
        uint256 speedBigNumber = distanceNM.div(operationHoursDuration);        
        uint256 speed = speedBigNumber.div(10000000000000000);
        return speed;
    }

    function checkMinimumOperationalSpeed( uint256 operationHoursDuration ) public returns (bool isMinimumSpeedReached) {
        uint256 _avarageSpeed = avarageSpeed( operationHoursDuration );

        if (_avarageSpeed < vesselData.minimumCruisingSpeed) {  
            emit BelowContractualSpeed(
                _avarageSpeed, 
                vesselData.minimumCruisingSpeed );
            return false;
        } else {
            return true;
        }
    }

    function checkOilConsuption( uint256 operationHoursDuration, uint256 oilConsuption, OperationStatus operationCode ) public returns (bool isConsuptionAccordingContract) {
        uint256 oilConsuptionDuringOperation = oilConsuption.div(operationHoursDuration);
        uint32 oilConsuptionContract = contractConsuptionByOperationalType(operationCode);

        if (oilConsuptionDuringOperation > oilConsuptionContract) {
            emit ConsumptionAboveAgreed( 
                contractConsuptionByOperationalType(operationCode), 
                oilConsuptionDuringOperation
            );
            return false;
        } else {
            return true;
        }
    }

    function oilSupplyReport(uint256 day, uint16 oilTonsQuantity) external {
        require(msg.sender == parties.shipOwner, "Only ship owner can report oil supply");
        oilSupply[day] = oilTonsQuantity;

        emit SupplyReport(day, oilTonsQuantity);
    }

    function consultOilSupplyReport(uint256 day) view external returns (uint16 oilTonsQuantity) {
        return oilSupply[day];
    }

    function getOperationReport(uint256 date) external view returns (VesselReport memory vesselReport) {
        return vesselOpsReport[date];
    }

    function earlyCancellationPenalty() public view returns ( uint _amountDueShipOwner ){
        if (block.timestamp < contractTimes.endDateTime) {
            uint256 diferenceBetweenDatesInHours = (contractTimes.endDateTime - block.timestamp) / 3600;
            uint256 amountDueShipOwner = 
                contractValues.penaltyPerHour * diferenceBetweenDatesInHours;

            return amountDueShipOwner;
        } else {
            return 0;
        }
    }

    function contractConsuptionByOperationalType(OperationStatus status) view public returns (uint8 oilConsuption) {
        return vesselData.oilConsumptionTonsHour[status];
    }

    function createDispute(
        uint256 startTime,
        uint256 endTime,
        string memory reason,
        uint256 value,
        DisputeParties partOpenDispute ) public {
        
        ++totalDisputes;

        allDisputes[totalDisputes].startTime = startTime;
        allDisputes[totalDisputes].endTime = endTime;
        allDisputes[totalDisputes].reason = reason;
        allDisputes[totalDisputes].value = value;
        allDisputes[totalDisputes].partOpenDispute = partOpenDispute;
    }

    function judgeDispute(uint16 disputeId, bool isReasonable) external {
        require(msg.sender == parties.arbiter_1 ||
                msg.sender == parties.arbiter_2 ||
                msg.sender == parties.arbiter_3, "Only contract arbiters can judge");
        bool thisArbiterAlreadyVoted;

        allDisputes[disputeId].votes[msg.sender] = isReasonable;

        for (uint8 i = 0; i < allDisputes[disputeId].arbitersVoted.length; i++) {
            if (allDisputes[disputeId].arbitersVoted[i] == msg.sender) {
                thisArbiterAlreadyVoted = true;
            }
        }

        if (!thisArbiterAlreadyVoted) {
            allDisputes[disputeId].arbitersVoted.push(msg.sender);
        } else {
            revert("Arbiter already voted");
        }

        emit ArbiterVote(disputeId, isReasonable, msg.sender);
        closeDispute(disputeId);
    }

    function closeDispute(uint16 disputeId) public {
        if (allDisputes[disputeId].arbitersVoted.length == 3 && !allDisputes[disputeId].isClose) {
            allDisputes[disputeId].isClose = true;

            uint8 isReasonableVote;
            uint8 isNotReasonableVote;

            for (uint8 i = 0; i < allDisputes[disputeId].arbitersVoted.length; i++) {
                address arbiter = allDisputes[disputeId].arbitersVoted[i];
                if (allDisputes[disputeId].votes[arbiter] == true) {
                    isReasonableVote++;
                } else {
                    isNotReasonableVote++;
                }
            }
            
            if (isReasonableVote > isNotReasonableVote) {
                allDisputes[disputeId].winningPart = allDisputes[disputeId].partOpenDispute;
            } else
            if (allDisputes[disputeId].partOpenDispute == DisputeParties.shipOwner) {
                allDisputes[disputeId].winningPart = DisputeParties.charterer;
            } else
            if (allDisputes[disputeId].partOpenDispute == DisputeParties.charterer) {
                allDisputes[disputeId].winningPart = DisputeParties.shipOwner;
            }

            allDisputes[disputeId].isClose = true;

            emit ResJudicata(disputeId, allDisputes[disputeId].winningPart);
            
            if ( allDisputes[disputeId].winningPart == DisputeParties.shipOwner ) {
                addDueAmount(allDisputes[disputeId].value);
            }
            if ( allDisputes[disputeId].winningPart == DisputeParties.charterer ) {
                subtractDueAmount(allDisputes[disputeId].value);   
            }
        } 
    }

    function checkOpenDispute() public view returns (bool _isSomeOpenDispute){
        bool isSomeOpenDispute;

        for(uint16 i = 1; i <= totalDisputes; i++) {
            if (allDisputes[i].isClose == false) {
                isSomeOpenDispute = true;
            }
        }        

        return isSomeOpenDispute;
    }
    
    function closeCharter() payable public {
        require(msg.sender == parties.charterer, "Only the charterer can close the charter");
        require(contractTimes.startDateTime > 0 && contractTimes.startDateTime < block.timestamp, 
            "Charter cannot be closed if it not started");

        bool isSomeOpenDispute = checkOpenDispute();
        require(isSomeOpenDispute == false, "Charter cannot be closed if there's some dispute opened");

        uint256 amountDue = earlyCancellationPenalty();
        if (amountDue > 0) {
            require(msg.value >= amountDue, "Deposit early cancellation penalty");
            (bool sentShipOwner, ) = parties.shipOwner.call{value: msg.value}("");
            require(sentShipOwner, "Failed to send amount due ship owner");
        }
        
        emit CharterClosed(parties.shipOwner, parties.charterer);
    }

    function transferChainteringService(address payable newOwner) public {
        require(msg.sender == parties.chainteringService, "Only the current Chaintering owner can do this action");
        parties.chainteringService = newOwner;
    }


    function requestLatestMaticPrice() public {
        contractPriceMaticUSD.getLatestPrice();
    }

    function saveLastMaticPrice(int price) public {
        oracleData.priceMatic.value = uint(price);
        oracleData.priceMatic.lastUpdate = block.timestamp;
        emit MaticPrice(oracleData.priceMatic.value);
    }

    function convertDolarToMatic(uint value) public view returns (uint valueConverted) {
        uint timesDiference = block.timestamp - oracleData.priceMatic.lastUpdate;
        uint fifteenMinutes = 900; // 15 * 60
        require(timesDiference < fifteenMinutes, "Matic price must be requested, maximum 15 minutes before convert, call requestLatestMaticPrice()");
        uint total = value * oracleData.priceMatic.value;
        return total / 100000000;
    }

    function requestHaversineDistance( 
        string calldata lat1, 
        string calldata lon1, 
        string calldata lat2, 
        string calldata lon2 ) public {
        contractTruflation.requestHaversineDistance( lat1, lon1, lat2, lon2 );
    }

    function saveHaversineDistance(int _distance) public {
        oracleData.lastDistanceCalculation.value = uint(_distance);
        oracleData.lastDistanceCalculation.lastUpdate = block.timestamp;
    }

    function requestWindSpeed( 
        string calldata lat, 
        string calldata lon) public {
        contractTruflation.requestWindSpeed( lat, lon );
    }

    function saveWindSpeed(int _windSpeed) public {
        oracleData.lastWindSpeed = uint(_windSpeed);
        if (_windSpeed > 200) {
            vesselData.isInBadWeatherConditionsOracleInfo = true;
        } else {
            vesselData.isInBadWeatherConditionsOracleInfo = false;
        }
    }

    function informBadWeather(
        string calldata lat, 
        string calldata lon ) public {
        require(msg.sender == parties.shipOwner, "Only ship owner can inform vessel under bad weather conditions");
        vesselData.isInBadWeatherConditionsShipOwnerInfo = true;
        emit BadWeather(lat, lon);
        requestWindSpeed(lat, lon);
    }

    function requestCrudeOilPrice() public {
        contractTruflation.requestCrudeOilPrice();
    }

    function calculateCharterPerHourInflation(int lastCrudeOilPrice) public returns (uint newCharterPerHour) {
        oracleData.lastCrudeOilPrice = uint(lastCrudeOilPrice);
        int priceDiference = lastCrudeOilPrice - int(oracleData.firstCrudeOilPrice);
        int multi = 1000000000000000000; //value from Truflation contract
        int pricePercentDiference = priceDiference * multi / lastCrudeOilPrice;
        int charterPerHour = int256(int32(contractValues.charterPerHour.price));
        int newCharterPerHourMulti = 
            (multi * charterPerHour) +
            (pricePercentDiference * charterPerHour);
        return uint(newCharterPerHourMulti/multi);
    } 
    
    function saveCrudeOilPrice(int _price) public {
        uint price = uint(_price);
        if (oracleData.firstCrudeOilPrice == 0) {
            oracleData.firstCrudeOilPrice = price;
            emit FirstCrudeOilPrice(price);
        } else {
            contractValues.charterPerHour.price = uint32(calculateCharterPerHourInflation(_price));
            contractValues.charterPerHour.lastUpdate = block.timestamp;
        }
    }
}
