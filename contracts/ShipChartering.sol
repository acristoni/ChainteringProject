// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "prb-math/contracts/PRBMathSD59x18.sol"; 
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract ShipTimeCharteringGeneric is Initializable {
    using SafeMath for uint256;
    using PRBMathSD59x18 for int256;

    Parties public parties;
    ContractTimes public contractTimes;
    VesselData public vesselData;
    ContractValues public contractValues;
    
    //chater data
    Dispute[] public allDisputes;

    // //ShipOwnerReport
    mapping(uint256 day => uint16 oilTonsQuantity) public oilSupply;
    mapping(uint256 date => VesselReport vesselReport) public vesselOpsReport;
    
    //contract types
    struct ContractValues {
        uint32 charterPerHour;
        uint8 chainteringServicePayPerHour;
        uint256 earlyCancellationPenaltyPerHour;
    }
    struct VesselData {
        uint32 vesselIMOnumber; 
        uint8 minimumCruisingSpeed;        
        mapping(OperationStatus => uint8) oilConsumptionTonsHour;
        uint256 oilTotalConsuption;
    }
    struct Dispute {
        uint256 startTime;
        uint256 endTime;
        string reason;
        address[] arbitersVoted;
        mapping(address => bool) votes;
        bool isClose;
        uint32 value;
        DiputeParties partyOpenDispute;
    }
    struct Location {
        int256 latitude; // degrees * 10^7
        int256 longitude; // degrees * 10^7
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
    enum DiputeParties {
        ShipOwner,
        Charterer
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
        uint256 monthlyPayday;
    }
    struct VesselReport {
        uint256 startDate;
        uint256 endDate;
        Location startPosition;
        Location endPosition;
        uint256 distance;
        bool isBadWeatherDuringOps;
        uint256 opsOilConsuption;
        OperationStatus operationStatus;
    }
    struct ReturnCheckSpeed {
        bool isMinimumSpeedReached;
        uint256 speed;    
    }   
    struct ReturnCheckOil {
        bool isConsuptionAccordingContract;
        uint256 oilConsuptionDuringOperation;    
    }   
    
    event CharterStarted(address indexed shipOwner, address indexed charterer, uint256 price, uint256 start, uint256 end);
    event CharterClosed(address indexed shipOwner, address indexed charterer);
    event BelowContractualSpeed( uint256 avarageSpeed, uint8 minimumCruisingSpeed, uint256 dateArrival);
    event ConsumptionAboveAgreed( uint8 consuptionAgreed, uint256 consuptionReported, uint256 dateArrival );
    
    constructor(
        address payable _shipOwner,
        address payable _charterer,
        address payable _arbiter_1,
        address payable _arbiter_2,
        address payable _arbiter_3,
        address payable _chainteringService
    ) {
        parties.shipOwner = _shipOwner;
        parties.charterer = _charterer;
        parties.arbiter_1 = _arbiter_1;
        parties.arbiter_2 = _arbiter_2;
        parties.arbiter_3 = _arbiter_3;
        parties.chainteringService = _chainteringService;
    }

    function setUpContract(
        uint256 _monthlyPayday,
        uint32 _charterPerHour, 
        uint8 _chainteringServicePayPerHour,
        uint8 _minimumCruisingSpeed,
        uint32 _vesselIMOnumber,
        uint256 _earlyCancellationPenaltyPerHour,
        uint8 _consuptionstandBy,
        uint8 _consuptionAtOperation,
        uint8 _consuptionUnderWay
    ) external {
        contractTimes.monthlyPayday = _monthlyPayday;
        contractValues.charterPerHour = _charterPerHour;
        contractValues.chainteringServicePayPerHour = _chainteringServicePayPerHour;
        contractValues.earlyCancellationPenaltyPerHour = _earlyCancellationPenaltyPerHour;    
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
        contractTimes.startDateTime = block.timestamp;
        contractTimes.endDateTime = block.timestamp.add(chartersTimeMonths * 30 days);
        vesselData.oilTotalConsuption = 0;
        
        emit CharterStarted(
            parties.shipOwner, 
            parties.charterer, 
            contractValues.charterPerHour, 
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
        uint256 distance,
        bool isBadWeather, 
        uint256 oilConsuption, 
        OperationStatus operationCode ) external {

        VesselReport memory vesselReport;
        Location memory departurePosition;
        Location memory arrivalPosition;

        departurePosition.latitude = latitudeDeparture;
        departurePosition.longitude = longitudeDerparture;
        arrivalPosition.latitude = latitudeArrival;
        arrivalPosition.longitude = longitudeArrival;

        vesselReport.startPosition = departurePosition;
        vesselReport.endPosition = arrivalPosition;
        vesselReport.isBadWeatherDuringOps = isBadWeather;
        vesselReport.operationStatus = operationCode;
        vesselReport.opsOilConsuption = oilConsuption;
        vesselReport.endDate = dateArrival;
        vesselReport.startDate = dateDeparture;
        vesselReport.distance = distance;

        vesselOpsReport[dateDeparture] = vesselReport;

        vesselData.oilTotalConsuption += oilConsuption;

        if(operationCode == OperationStatus.underWay) {
            ReturnCheckSpeed memory returnCheckSpeed = checkMinimumOperationalSpeed( 
                                                            distance, 
                                                            dateDeparture, 
                                                            dateArrival 
                                                        );
            if (!returnCheckSpeed.isMinimumSpeedReached) {
                emit BelowContractualSpeed(
                    10, 
                    vesselData.minimumCruisingSpeed, 
                    dateArrival);
            }
        }

        ReturnCheckOil memory returnCheckOil = checkOilConsuption( 
                                                dateDeparture, 
                                                dateArrival,  
                                                oilConsuption, 
                                                operationCode
                                            );
        if (!returnCheckOil.isConsuptionAccordingContract) {
            emit ConsumptionAboveAgreed( 
                contractConsuptionByOperationalType(operationCode), 
                returnCheckOil.oilConsuptionDuringOperation,
                dateArrival 
            );
        }
    }

    function avarageSpeed( 
        uint256 distance, 
        uint256 dateDeparture, 
        uint256 dateArrival ) pure public returns (uint256 _avaraSpeed) {
        
        uint256 timeDiference = dateArrival - dateDeparture;
        uint256 timeDiferenceHours = timeDiference.div(3600);
        uint256 speed = distance.div(timeDiferenceHours);
        return speed;
    }

    function checkMinimumOperationalSpeed(     
        uint256 distance, 
        uint256 dateDeparture, 
        uint256 dateArrival ) view public returns (ReturnCheckSpeed memory) {
        
        uint256 _avarageSpeed = avarageSpeed( distance, dateDeparture, dateArrival );
        ReturnCheckSpeed memory returnFunction;
        returnFunction.speed = _avarageSpeed;

        if (_avarageSpeed < vesselData.minimumCruisingSpeed) {  
            returnFunction.isMinimumSpeedReached = false;
            return returnFunction;
        } else {
            returnFunction.isMinimumSpeedReached = true;
            return returnFunction;
        }
    }

    function checkOilConsuption( 
        uint256 dateDeparture,
        uint256 dateArrival, 
        uint256 oilConsuption, 
        OperationStatus operationCode ) view public returns (ReturnCheckOil memory) {
        
        ReturnCheckOil memory returnCheckOil;
        uint256 timeDiference = dateArrival - dateDeparture;
        uint256 timeDiferenceHours = timeDiference.div(3600);

        uint256 oilConsuptionDuringOperation = oilConsuption.div(timeDiferenceHours);
        returnCheckOil.oilConsuptionDuringOperation = oilConsuptionDuringOperation;

        uint32 oilConsuptionContract = contractConsuptionByOperationalType(operationCode);

        if (oilConsuptionDuringOperation > oilConsuptionContract) {
            returnCheckOil.isConsuptionAccordingContract = false;
            return returnCheckOil;
        } else {
            returnCheckOil.isConsuptionAccordingContract = true;
            return returnCheckOil;
        }
    }

    function getOperationReport(uint256 date) external view returns (VesselReport memory vesselReport) {
        return vesselOpsReport[date];
    }

    function earlyCancellationPenalty() public view returns ( uint _amountDueShipOwner ){
        if (block.timestamp < contractTimes.endDateTime) {
            uint256 diferenceBetweenDatesInHours = (contractTimes.endDateTime - block.timestamp) / 3600;
            uint256 amountDueShipOwner = 
                contractValues.earlyCancellationPenaltyPerHour * diferenceBetweenDatesInHours;

            return amountDueShipOwner;
        } else {
            return 0;
        }
    }

    function contractConsuptionByOperationalType(OperationStatus status) view public returns (uint8 oilConsuption) {
        return vesselData.oilConsumptionTonsHour[status];
    }

    function checkOpenDispute() public view returns (bool _isSomeOpenDispute){
         bool isSomeOpenDispute;

        if (allDisputes.length > 0) {
            for(uint i = 0; i < allDisputes.length; i++) {
                if (allDisputes[i].isClose == false) {
                    isSomeOpenDispute = true;
                }
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
}
