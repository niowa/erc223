pragma solidity 0.4.24;


/// @title Ownable token with possibility to transfer ownership
contract Ownable {
  address public owner;

  /// @notice Modifier to with allow to execute function only to owner
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /// @notice Transfer ownership  to `_to` address
  function transferOwnership(address _to) public onlyOwner {
    owner = _to;
  }
}
