pragma solidity 0.4.24;

import "../Ownable.sol";
import "./ERC223.sol";

contract PlayChipTokenInterface is ERC223, Ownable {
  function generateTokens(address _initialInvestor, uint _initialBalance) public;
}
