import React from "react";
import "./Cover.css";
import logo from "../../assets/logo.png";

const Cover = ({ connect }) => {
  return (
    <div className="cover-page d-flex align-items-center">
      <img className="cover-left" src={logo} alt={logo} />
      <div className="cover-right">
        <div className="head-div">
          <h1>Dynamic NFT</h1>
        </div>
        <p>
          The only platform where you can claim ownership of your source codes
        </p>
        <div className="connect-msg">
          Please connect to continue in the dapp
        </div>
        <button onClick={() => connect().catch((e) => console.log(e))}>
          Connect
        </button>
      </div>
    </div>
  );
};

export default Cover;
