pragma solidity 0.4.24;


/// @title Contract of ownable ERC20 token with possibility to mint
contract ERC223 {

  uint8 public decimals;

  /// @notice Show token balance of `_wallet` address
  /// @param _wallet The address from which the balance will be retrieved
  /// @return The balance
  function balanceOf(address _wallet) public  constant returns (uint balance);


  /// @notice send `_value` token to `_to` from msg.sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transfer(address _to, uint _value) public returns (bool success);

  /// @notice send `_value` token to `_to` from msg.sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @param _data Additional data for sending tokens
  /// @return Whether the transfer was successful or not
  function transfer(address _to, uint _value, bytes _data) public returns (bool success);

  /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
  /// @param _from The address of the sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transferFrom(address _from, address _to, uint _value) public returns (bool success);

  /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
  /// @param _spender The address of the account able to transfer the tokens
  /// @param _value The amount of tokens to be approved for transfer
  /// @return Whether the approval was successful or not
  function approve(address _spender, uint _value) public returns (bool success);

  /// @notice Show how much allowed to transfer from `_from` to `_to`
  /// @param _owner The address of the account owning tokens
  /// @param _spender The address of the account able to transfer the tokens
  /// @return Amount of remaining tokens allowed to spent
  function allowance(address _owner, address _spender) public constant returns (uint remaining);
}
