pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./Interfaces/ERC223.sol";
import "./Interfaces/ERC223RecieverInterface.sol";


/// @title Contract of ownable ERC20 token with possibility to mint
contract Token is Ownable, ERC223, SafeMath {
  string public name;
  string public symbol;
  uint8 public decimals;
  uint public totalSupply;
  uint public transferLockPeriod;
  address public tokenGenerator;

  event Transfer(address indexed _from, address indexed _to, uint _value);
  event Transfer(address indexed _from, address indexed _to, uint _value, bytes  _data);
  event Approval(address indexed _owner, address indexed _spender, uint _value);

  mapping(address => uint) public balances;
  mapping(address => mapping(address => uint)) public allowed;
  mapping(address => uint) public transferLockedAt;

  constructor(string _name, string _symbol, uint8 _decimals, uint _transferLockPeriod) public {
    owner = msg.sender;
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    totalSupply = 0;
    transferLockPeriod = _transferLockPeriod;
  }

  /// @notice Withdraw `_amount` of tokens to owner balance
  /// @param _amount Number of wei to withdraw
  function withdrawEth(uint _amount) external onlyOwner {
    require(address(this).balance >= _amount);
    msg.sender.transfer(_amount);
  }

  /// @notice Set address which can generate tokens
  /// @param _tokenGenerator Address of token generator
  function setTokenGenerator(address _tokenGenerator) public onlyOwner {
    require(_tokenGenerator != address(0));
    tokenGenerator = _tokenGenerator;
  }

  /// @notice Generete tokens on initial investors balances, sets lock date
  /// @param _investor Address of initial investor
  /// @param _tokenAmount Balance of initial investor
  function generateTokens(address _investor, uint _tokenAmount) public {
    require(msg.sender == tokenGenerator || msg.sender == owner);
    if (isContract(_investor)) {
      bytes memory empty;
      ERC223RecieverInterface untrustedReceiver = ERC223RecieverInterface(_investor);
      untrustedReceiver.tokenFallback(msg.sender, _tokenAmount, empty);
    }
    totalSupply += _tokenAmount;
    balances[_investor] = _tokenAmount;
  }

  /// @notice Show token balance of `_wallet` address
  /// @param _wallet The address from which the balance will be retrieved
  /// @return The balance
  function balanceOf(address _wallet) public constant returns (uint balance) {
    return balances[_wallet];
  }

  /// @notice send `_value` token to `_to` from msg.sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transfer(address _to, uint _value) public returns (bool success) {
    bytes memory empty;
    return transfer(_to, _value, empty);
  }

  /// @notice send `_value` token to `_to` from msg.sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @param _data Additional data for sending tokens
  /// @return Whether the transfer was successful or not
  function transfer(address _to, uint _value, bytes _data) public returns (bool success) {
    isTransferLocked();
    changeBalanceAfterTransfer(msg.sender, _to, _value);
    if (isContract(_to)) {
      ERC223RecieverInterface untrustedReceiver = ERC223RecieverInterface(_to);
      untrustedReceiver.tokenFallback(msg.sender, _value, _data);
    }
    emit Transfer(msg.sender, _to, _value); // solhint-disable-line
    emit Transfer(msg.sender, _to, _value, _data); // solhint-disable-line
    return true;
  }

  /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
  /// @param _from The address of the sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  /// @return Whether the transfer was successful or not
  function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
    require(allowed[_from][msg.sender] >= _value && balances[_from] >= _value);
    isTransferLocked();
    changeBalanceAfterTransfer(_from, _to, _value);
    allowed[_from][msg.sender] = safeSub(allowed[_from][msg.sender], _value);

    bytes memory empty;
    if (isContract(_to)) {
      ERC223RecieverInterface untrustedReceiver = ERC223RecieverInterface(_to);
      untrustedReceiver.tokenFallback(msg.sender, _value, empty);
    }

    emit Transfer(msg.sender, _to, _value); // solhint-disable-line
    emit Transfer(msg.sender, _to, _value, empty); // solhint-disable-line
    return true;
  }

  /// @notice `msg.sender` approves `_addr` to spend `_value` tokens
  /// @param _spender The address of the account able to transfer the tokens
  /// @param _value The amount of tokens to be approved for transfer
  /// @return Whether the approval was successful or not
  function approve(address _spender, uint _value) public returns (bool success) {
    require(balances[msg.sender] >= _value);
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);// solhint-disable-line
    return true;
  }

  /// @notice Lock transfer operation for `transferLockPeriod` seconds
  /// @param _owner The address of the account owning tokens
  function lockTransfer(address _owner) public {
    require(msg.sender == tokenGenerator || msg.sender == owner);
    transferLockedAt[_owner] = now + transferLockPeriod;
  }

  /// @notice Show how much allowed to transfer from `_from` to `_to`
  /// @param _owner The address of the account owning tokens
  /// @param _spender The address of the account able to transfer the tokens
  /// @return Amount of remaining tokens allowed to spent
  function allowance(address _owner, address _spender) public constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }

  /// @notice Destruct tokens on passed address
  /// @param _target The address of the account owning tokens
  /// @param _amount Amount of burned tokens
  /// @return Whether the burning was successful or not
  function burnTokens(address _target, uint _amount) public returns (bool success) {
    require(_amount > 0);
    require(_amount <= totalSupply);
    require(balances[_target] >= _amount);
    require(msg.sender == tokenGenerator);
    balances[_target] -= _amount;
    totalSupply -= _amount;
    return true;
  }

  /// @notice check if account is contract
  /// @param _addr address for check
  /// @return is address contract or not
  function isContract(address _addr) private view returns (bool result) {
    uint length;
    assembly {
      length := extcodesize(_addr)
    }
    return (length > 0);
  }

  /// @notice check if `transferLockedAt` collection has message sender
  function isTransferLocked() private view {
    if (transferLockedAt[msg.sender] != 0) {
      require(transferLockedAt[msg.sender] <= now);
    }
  }

  /// @notice change balance of addresses if it is possible
  /// @param _from The address of the sender
  /// @param _to The address of the recipient
  /// @param _value The amount of token to be transferred
  function changeBalanceAfterTransfer(address _from, address _to, uint _value) private {
    require(balances[_from] >= _value);
    require(balances[_to] + _value > balances[_to]);
    balances[_from] -= _value;
    balances[_to] += _value;
  }
}
