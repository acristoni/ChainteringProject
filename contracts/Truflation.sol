// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ShipChartering.sol";

contract Truflation is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    ShipTimeCharteringGeneric public contractShipChartering;

    bytes public result;
    mapping(bytes32 => bytes) public results;
    bytes32 private jobId;
    uint256 private fee;

    int256 public distance;
    int256 public windSpeed;
    int256 public crudeOilPrice;

    event HaversineRequest(bytes32 indexed requestId, int256 distance);
    event ShipCharteringConnected(address contractShipChartering);
    event WindSpeedRequest(bytes32 indexed requestId, int256 windSpeed);
    event CrudeOilPriceRequest(bytes32 indexed requestId, int256 crudeOilPrice);

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x17dED59fCd940F0a40462D52AAcD11493C6D8073);
        jobId = "8b459447262a4ccf8863962e073576d9";
        fee = 10000000000000000; // 0,1 * 10**18 (Varies by network and job)
    }

    function connectToShipChartering(address _contractShipChartering) public {
        contractShipChartering = ShipTimeCharteringGeneric(_contractShipChartering);
        emit ShipCharteringConnected(_contractShipChartering);
    }

    function requestCrudeOilPrice() public virtual returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillCrudeOilPrice.selector
        );

        req.add("service", "truflation/series");
        req.add("data", "{\"ids\":\"604\",\"types\":\"114\"}");
        req.add("keypath", "");
        req.add("abi", "uint256");
        req.add("multiplier", "1000000000000000000");
        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfillCrudeOilPrice(
        bytes32 _requestId, 
        bytes memory bytesData  
    ) public recordChainlinkFulfillment(_requestId) {
        result = bytesData;
        results[_requestId] = bytesData;
        crudeOilPrice = getInt256(_requestId);
        contractShipChartering.saveCrudeOilPrice(crudeOilPrice);
        emit CrudeOilPriceRequest(_requestId, crudeOilPrice);
    }

    function requestWindSpeed(string calldata lat, string calldata long) public virtual returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillWind.selector
        );

        string memory apiUrl = string(abi.encodePacked(
            '{"url":"http://api.weatherapi.com/v1/current.json?key=e3262d6df75c4176a41143723231405&q=',lat,',',long,'&aqi=no","method":"get"}'
        ));

        req.add("service", "util/http");
        req.add("data", apiUrl);
        req.add("keypath", "current.wind_mph");
        req.add("abi", "int256");
        req.add("multiplier", "10");
        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfillWind(
        bytes32 _requestId, 
        bytes memory bytesData  
    ) public recordChainlinkFulfillment(_requestId) {
        result = bytesData;
        results[_requestId] = bytesData;
        windSpeed = getInt256(_requestId);
        contractShipChartering.saveWindSpeed(windSpeed);
        emit WindSpeedRequest(_requestId, windSpeed);
    }

    function requestHaversineDistance(
        string calldata lat1, 
        string calldata lon1, 
        string calldata lat2, 
        string calldata lon2 ) public virtual returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillDistance.selector
        );

        string memory apiUrl = string(abi.encodePacked(
            '{"expr":"(6371 * 2 * tan( sqrt( sin((lat2 - lat1) * pi / 360)^2 + cos(lat1 * pi / 180) * cos(lat2 * pi / 180) * sin((lon2 - lon1) * pi / 360)^2 / (1 - sin((lat2 - lat1) * pi / 360)^2 - cos(lat1 * pi / 180) * cos(lat2 * pi / 180) * sin((lon2 - lon1) * pi / 360)^2 ))))","eval":{"lat1":', lat1, ', "lon1":', lon1, ', "lat2":', lat2, ', "lon2":', lon2, '}}'
        ));

        req.add("service", "util/math/nerdamer");
        req.add("data", apiUrl);
        req.add("keypath", "");
        req.add("abi", "uint256");
        req.add("multiplier", "10000000000000");
        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfillDistance(
        bytes32 _requestId, 
        bytes memory bytesData  
    ) public recordChainlinkFulfillment(_requestId) {
        result = bytesData;
        results[_requestId] = bytesData;
        distance = getInt256(_requestId);
        contractShipChartering.saveHaversineDistance(distance);
        emit HaversineRequest(_requestId, distance);
    }

    function getInt256(bytes32 _requestId) public view returns (int256) {
       return toInt256(results[_requestId]);
    }

    function toInt256(bytes memory _bytes) internal pure
      returns (int256 value) {
          assembly {
            value := mload(add(_bytes, 0x20))
      }
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
