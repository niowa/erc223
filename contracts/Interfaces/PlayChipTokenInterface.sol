pragma solidity 0.4.24;

import "../Ownable.sol";
import "./ERC223.sol";


contract PlayChipTokenInterface is ERC223, Ownable {
  function lockTransfer(address _owner) public;
  function generateTokens(address _initialInvestor, uint _initialBalance) public;
  function burnTokens(address _target, uint _amount) public returns (bool success);
}
