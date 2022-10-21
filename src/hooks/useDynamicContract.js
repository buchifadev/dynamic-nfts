import { useContract } from "./useContract";
import Dynamic from "../contracts/Dynamic.json";
import contractAddress from "../contracts/dynamic-address.json";

// export interface for NFT contract
export const useDynamicContract = () =>
  useContract(Dynamic.abi, contractAddress.Dynamic);
