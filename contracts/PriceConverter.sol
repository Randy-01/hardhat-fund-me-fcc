// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  function getPrice(
        AggregatorV3Interface priceFeed
    ) public view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

  // 1000000000
  // call it get fiatConversionRate, since it assumes something about decimals
  // It wouldn't work for every aggregator
  function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}
