pragma solidity 0.4.24;

import "./Ownable.sol";


/// @title Storage for ether
contract EtherStorage is Ownable {
  address public crowdsale;

  constructor(address _crowdsale) {
    crowdsale = _crowdsale;
  }

  function withdrawEtherToUser(address _to, uint _amount) public {
    require(msg.sender != address(0));
    require(msg.sender == crowdsale);
    _to.transfer(_amount);
  }

  function withdrawEther(address _to, uint _amount) public onlyOwner {
    require(msg.sender != address(0));
    msg.sender.transfer(_amount);
  }
}
