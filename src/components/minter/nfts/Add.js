import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form } from "react-bootstrap";
import { uploadToIpfs } from "../../../utils/minter";

const AddNfts = ({ save }) => {
  const [name, setName] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(null);
  const [source, setSource] = useState(null);
  const [price, setPrice] = useState(0);
  const [show, setShow] = useState(false);

  // confirm if all fields are filled
  const isFormFilled = () => name && image && description && source;

  // close modal
  const handleClose = () => {
    setShow(false);
  };

  // open modal
  const handleShow = () => setShow(true);

  return (
    <>
      <button type="button" onClick={handleShow} className="add-btn mb-4">
        Mint Code <i class="bi bi-plus"></i>
      </button>

      {/* Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header>
          <Modal.Title
            style={{ color: "#531c1c", width: "100%", textAlign: "center" }}
          >
            Mint your source code on the blockchain
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control
              type="text"
              placeholder="Source code name"
              className={"mb-3"}
              style={{ height: "45px", fontSize: "0.9rem" }}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <Form.Control
              as="textarea"
              placeholder="What does the code do?"
              className={"mb-3"}
              style={{ height: "80px", fontSize: "0.9rem" }}
              onChange={(e) => {
                setDescription(e.target.value.trim());
              }}
            />
            <Form.Control
              as="textarea"
              placeholder="Enter source code here"
              className={"mb-3"}
              style={{
                height: "80px",
                fontSize: "0.9rem",
                fontFamily: "monospace",
              }}
              onChange={(e) => {
                setSource(e.target.value.trim());
              }}
            />
            <Form.Control
              type="file"
              placeholder="NFT Image"
              className={"mb-3"}
              onChange={async (e) => {
                const image_file = e.target.files;
                const imageUrl = await uploadToIpfs(image_file);
                if (!imageUrl) {
                  alert("An error occured while uploading image");
                  return;
                }
                setImage(imageUrl);
              }}
            />
            <Form.Control
              type="number"
              placeholder="How much you want to sell source code"
              className={"mb-3"}
              style={{ height: "45px", fontSize: "0.9rem" }}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer className="modal_footer">
          <button className="close_btn" onClick={handleClose}>
            Close
          </button>
          <button
            className="create_btn"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                description,
                ipfsImage: image,
                source,
                price,
              });
              handleClose();
            }}
          >
            Mint
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddNfts.propTypes = {
  // props passed into this component
  save: PropTypes.func.isRequired,
  // address: PropTypes.string.isRequired,
};

export default AddNfts;
