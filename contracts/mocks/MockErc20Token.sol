// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";

/**
 * @title MockErc20Token
 */
contract MockErc20Token is ERC20Capped {
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenCap,
        uint8 tokenDecimals
    ) ERC20(tokenName, tokenSymbol) ERC20Capped(tokenCap) {
        _setupDecimals(tokenDecimals);
        _mint(msg.sender, tokenCap);
    }
}
