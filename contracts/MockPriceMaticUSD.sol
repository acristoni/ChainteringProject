// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceMaticUSD.sol";

contract MockPriceMaticUSD is PriceMaticUSD {
     function getLatestPrice() public override {
        contractShipChartering.saveLastMaticPrice(87992557);
     }
}