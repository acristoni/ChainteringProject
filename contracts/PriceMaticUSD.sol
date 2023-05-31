// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./ShipChartering.sol";

contract PriceMaticUSD {
    AggregatorV3Interface internal priceFeed;
    ShipTimeCharteringGeneric public contractShipChartering;

    event ShipCharteringConnected(address contractShipChartering);
    event MaticPrice(int price);

    /**
     * Network: Mumbai
     * Aggregator: Matic / USD
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor() {
        priceFeed = AggregatorV3Interface(
            0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
        );
    }

    function connectToShipChartering(address _contractShipChartering) public {
        contractShipChartering = ShipTimeCharteringGeneric(_contractShipChartering);
        emit ShipCharteringConnected(_contractShipChartering);
    }

        /**
         * Returns the latest price.
         */
        function getLatestPrice() public virtual {
            // prettier-ignore
            (
                /* uint80 roundID */,
                int price,
                /*uint startedAt*/,
                /*uint timeStamp*/,
                /*uint80 answeredInRound*/
            ) = priceFeed.latestRoundData();
            contractShipChartering.saveLastMaticPrice(price);
            emit MaticPrice(price);
        }
}