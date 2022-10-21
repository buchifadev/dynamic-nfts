import React, { useState } from "react";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useContractKit } from "@celo-tools/use-contractkit";
import "./Card.css";
import BigNumber from "bignumber.js";
import { ERC20_DECIMALS } from "../../../utils/constants";
import { truncateAddress } from "../../../utils";

// Display image attached to NFT
const ViewImage = (props) => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <img src={props.image} />
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

// Display source code attached to NFT
const ViewCode = (props) => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <textarea
        value={props.source}
        disabled
        rows={30}
        style={{ fontFamily: "monospace", padding: "20px" }}
      />
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

// NFT Cards Functionality
const Nft = ({ nft, buy, filter }) => {
  const [showImage, setShowImage] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const { kit } = useContractKit();
  const { defaultAccount } = kit;

  const { id, price, owner, seller, sold, name, image, description, source } =
    nft;

  return (
    <div className="token_card">
      <div className="lbl">Code name</div>
      <div className="content">{name}</div>
      <div className="lbl">Code description</div>
      <div className="content">{description}</div>
      {!filter && (
        <>
          <div className="lbl">Code price</div>
          <div className="content">
            {new BigNumber(price).shiftedBy(-ERC20_DECIMALS).toString()} CELO
          </div>
          <div className="lbl">Seller</div>
          <div className="seller-addr">{truncateAddress(seller)}</div>
        </>
      )}

      <div className="btns">
        <button onClick={() => setShowImage(true)}>View NFT </button>
        <ViewImage
          show={showImage}
          onHide={() => setShowImage(false)}
          image={image}
        />
        {!filter && (
          <>
            {seller !== defaultAccount && (
              <button onClick={() => buy(id, price)}>Buy</button>
            )}
          </>
        )}

        <button onClick={() => setShowCode(true)}>View Source code</button>
        <ViewCode
          show={showCode}
          onHide={() => setShowCode(false)}
          source={source}
        />
      </div>
    </div>
  );
};

Nft.propTypes = {
  image: PropTypes.instanceOf(Object).isRequired,
};

export default Nft;
