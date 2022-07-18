// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "./interfaces/IErc20Token.sol";

/**
 * @title Erc20Token
 */
contract Erc20Token is ERC20Capped, IErc20Token {
    using SafeMath for uint256;

    address public governanceAccount;
    address public minterAccount;

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenCap
    ) ERC20(tokenName, tokenSymbol) ERC20Capped(tokenCap) {
        governanceAccount = msg.sender;
        minterAccount = msg.sender;
    }

    modifier onlyBy(address account) {
        require(msg.sender == account, "Erc20Token: sender unauthorized");
        _;
    }

    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     */
    function burn(uint256 amount) external override {
        require(amount > 0, "Erc20Token: zero amount");
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) external override {
        require(amount > 0, "Erc20Token: zero amount");

        uint256 decreasedAllowance = allowance(account, _msgSender()).sub(
            amount,
            "Erc20Token: burn amount exceeds allowance"
        );

        _approve(account, _msgSender(), decreasedAllowance);
        _burn(account, amount);
    }

    function mint(address account, uint256 amount)
        external
        override
        onlyBy(minterAccount)
    {
        require(amount > 0, "Erc20Token: zero amount");
        _mint(account, amount);
    }

    function setGovernanceAccount(address account)
        external
        override
        onlyBy(governanceAccount)
    {
        require(account != address(0), "Erc20Token: zero governance account");

        governanceAccount = account;
    }

    function setMinterAccount(address account)
        external
        override
        onlyBy(governanceAccount)
    {
        require(account != address(0), "Erc20Token: zero minter account");
        minterAccount = account;
    }
}
