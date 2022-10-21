import { useContractKit } from "@celo-tools/use-contractkit";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getMarketTokens,
  myTokens,
  mint,
  buyToken,
} from "../../../utils/minter";

const NftList = ({ dynamicContract }) => {
  const { performActions, address, kit } = useContractKit();
  const { defaultAccount } = kit;
  const [marketTokens, setMarketTokens] = useState([]);
  const [allMyTokens, setAllMyTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch all tokens available for sale in market
  const fetchMarketTokens = useCallback(async () => {
    try {
      setLoading(true);
      const _tokens = await getMarketTokens(dynamicContract);
      if (!_tokens) return;
      setMarketTokens(_tokens);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [dynamicContract]);

  // fetch all my tokens from the smart contract
  const fetchAllMyTokens = useCallback(async () => {
    try {
      setLoading(true);
      const _myTokens = await myTokens(dynamicContract, defaultAccount);
      if (!_myTokens) return;
      setAllMyTokens(_myTokens);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [dynamicContract]);

  // Add new token
  const mintToken = async (data) => {
    try {
      setLoading(true);
      // mint token with this function
      await mint(dynamicContract, performActions, data);
      toast(<NotificationSuccess text="Loading NFTs ...." />);
      fetchMarketTokens();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to mint token" />);
    } finally {
      setLoading(false);
    }
  };

  // Buy a token with CELO
  const buy = async (tokenId, purchasePrice) => {
    try {
      setLoading(true);
      // create an nft functionality
      await buyToken(dynamicContract, performActions, tokenId, purchasePrice);
      toast(<NotificationSuccess text="Loading NFTs ...." />);
      fetchMarketTokens();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to buy token" />);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      if (address && dynamicContract) {
        fetchMarketTokens();
        fetchAllMyTokens();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [dynamicContract, address, fetchMarketTokens, fetchAllMyTokens]);

  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="marketplace">
              <h1
                className="fs-10 fw-bold text-center mb-5"
                style={{ color: "#531c1c" }}
              >
                Tokens available for sale
              </h1>
              <AddNfts save={mintToken} address={address} />
            </div>
            <div className="all_nft">
              {marketTokens.map((_nft) => (
                <Nft
                  key={_nft.index}
                  nft={{
                    ..._nft,
                  }}
                  buy={buy}
                  filter={false}
                />
              ))}
            </div>
            <h1
              className="fs-10 fw-bold text-center mb-5"
              style={{ color: "#531c1c" }}
            >
              My tokens
            </h1>
            <div className="all_nft">
              {allMyTokens.map((_nft) => (
                <Nft
                  key={_nft.index}
                  nft={{
                    ..._nft,
                  }}
                  filter={true}
                />
              ))}
            </div>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  dynamicContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  vContract: null,
};

export default NftList;
