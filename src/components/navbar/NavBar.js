import React from "react";
import Wallet from "../wallet";
import dynamicImg from "../../assets/dynamic_image.jfif";
import { Nav } from "react-bootstrap";
import "./NavBar.css";

const NavBar = ({ address, balance, destroy, connect }) => {
  return (
    <Nav className="nav justify-content-between px-5 py-3">
      <Nav.Item>
        <img className="logo_img" src={dynamicImg} alt="Logo" />        
      </Nav.Item>
      {address ? (
        <Nav.Item>          
          <Wallet
            address={address}
            amount={balance.CELO}
            symbol="CELO"
            destroy={destroy}
          />
        </Nav.Item>
      ) : (
        <Nav.Item>
          <button onClick={() => connect().catch((e) => console.log(e))}>
            Connect
          </button>
        </Nav.Item>
      )}
    </Nav>
  );
};

export default NavBar;
