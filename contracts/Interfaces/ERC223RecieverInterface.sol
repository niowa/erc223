pragma solidity 0.4.24;


/// @title Crowdsale with could sell tokens for eth
contract ERC223RecieverInterface {

  /// @notice Calls after erc223 tokens sending
  /// @param _from The address of token sender
  /// @param _value Value of recieved tokens
  /// @param _data Additional data
  function tokenFallback(address _from, uint _value, bytes _data) public;
}
