// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import "./IERC20Mintable.sol";

/**
 * @title IErc20Token
 */
interface IErc20Token is IERC20Mintable {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;

    function setGovernanceAccount(address account) external;

    function setMinterAccount(address account) external;
}
