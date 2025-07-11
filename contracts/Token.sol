// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value, "Not enough tokens to transfer");

        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        // Require that sender has enough tokens to spend
        require(_to != address(0), "Cannot transfer to the zero address");

        // deducts tokens from spender
        balanceOf[_from] = balanceOf[_from] - _value;
        // credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        require(_spender != address(0), "Cannot approve the zero address");
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        returns (bool success)
    {
        require(_value <= balanceOf[_from], "Not enough tokens to transfer");
        // check approval
        require(_value <= allowance[_from][msg.sender], "Not enough allowance");

        // reset allowance
        // prevent the "double spend
        allowance[_from][msg.sender] -= _value;

        _transfer(_from, _to, _value);
        return true;
    }

}
