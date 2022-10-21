import BigNumber from "bignumber.js";
import { ERC20_DECIMALS } from "./constants";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

const getAccessToken = () => {
  const token = process.env.REACT_APP_API_TOKEN;
  return token;
};
const makeStorageClient = () => {
  return new Web3Storage({ token: getAccessToken() });
};
const formattedName = (name) => {
  let file_name;
  const trim_name = name.trim();
  if (trim_name.includes(" ")) {
    file_name = trim_name.replaceAll(" ", "%20");
    return file_name;
  } else return trim_name;
};
const makeFileObjects = (file) => {
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
  const files = [new File([blob], `${file.name}.json`)];
  return files;
};
const client = makeStorageClient();
const storeFiles = async (files) => {
  const cid = await client.put(files);
  return cid;
};

// function to upload an image to Web3.storage
export const uploadToIpfs = async (file) => {
  if (!file) return;
  try {
    const file_name = file[0].name;
    const image_name = formattedName(file_name);
    const image_cid = await storeFiles(file);
    const image_url = `https://${image_cid}.ipfs.w3s.link/${image_name}`;
    return image_url;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

// Mint a token
export const mint = async (
  contract,
  performActions,
  { name, description, ipfsImage, source, price }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage || !source || !price) return;
    const { defaultAccount } = kit;

    // trim any extra whitespaces from the name and
    // replace the whitespace between the name with %20
    const file_name = formattedName(name);

    // convert NFT metadata to JSON format
    const data = {
      name,
      image: ipfsImage,
      description,
      source,
      owner: defaultAccount,
    };

    try {
      // save NFT metadata to IPFS
      const files = makeFileObjects(data);
      const file_cid = await storeFiles(files);
      const tokenURI = `https://${file_cid}.ipfs.w3s.link/${file_name}.json`;

      const _price = new BigNumber(price).shiftedBy(ERC20_DECIMALS).toString();

      // upload the NFT, mint the NFT and save the IPFS url to the blockchain
      let tx = await contract.methods
        .mintToken(tokenURI, _price)
        .send({ from: defaultAccount });
      return tx;
    } catch (error) {
      console.log("Error occured while minting NFT: ", error);
    }
  });
};

// Get NFT metadata from IPFS
export const fetchMetadata = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const fetch_meta = await fetch(ipfsUrl);
    const meta = await fetch_meta.json();

    return meta;
  } catch (e) {
    console.log({ e });
  }
};

// Get all tokens in market for sale
export const getMarketTokens = async (contract) => {
  try {
    const allTokens = await contract.methods.getAllMarketTokens().call();
    const tokens = await Promise.all(
      allTokens.map(async (_token) => {
        const tokenURI = await contract.methods.tokenURI(_token.tokenId).call();
        const tokenData = await fetchMetadata(tokenURI);
        return {
          id: _token.tokenId,
          price: _token.price,
          owner: _token.owner,
          seller: _token.seller,
          sold: _token.sold,
          name: tokenData.name,
          image: tokenData.image,
          description: tokenData.description,
          source: tokenData.source,
        };
      })
    );
    return tokens;
  } catch (e) {
    console.log({ e });
  }
};

// Fetch all board members
export const myTokens = async (contract, defaultAccount) => {
  try {
    const myTokens = await contract.methods.getMyTokens().call();
    const tokens = await Promise.all(
      myTokens.map(async (_token) => {
        const tokenURI = await contract.methods.tokenURI(_token).call();
        const tokenData = await fetchMetadata(tokenURI);        
        return {
          id: _token,
          owner: tokenData.owner,
          name: tokenData.name,
          image: tokenData.image,
          description: tokenData.description,
          source: tokenData.source,
        };
      })
    );
    return tokens;
  } catch (e) {
    console.log({ e });
  }
};

// Buy a token from the market
export const buyToken = async (contract, performActions, tokenId, price) => {
  await performActions(async (kit) => {
    const { defaultAccount } = kit;
    try {
      await contract.methods
        .buyToken(tokenId)
        .send({ from: defaultAccount, value: price });
    } catch (error) {
      console.log("Error occured while buying token ", error);
    }
  });
};
