import React from "react";
import Cover from "./components/minter/Cover";
import { Notification } from "./components/ui/Notifications";
import { useBalance, useDynamicContract } from "./hooks";
import Nfts from "./components/minter/nfts";
import { useContractKit } from "@celo-tools/use-contractkit";
import "./App.css";
import { Container } from "react-bootstrap";
import NavBar from "./components/navbar/NavBar"

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();

  // get Celo balance
  const { balance, getBalance } = useBalance();

  // initialize "Dynamic" contract
  const dynamicContract = useDynamicContract();

  return (
    <>
      <Notification />
      {address && (
        <NavBar
          address={address}
          balance={balance}
          destroy={destroy}
          connect={connect}
        />
      )}

      {address ? (
        <Container fluid="md">
          <main>
            <Nfts
              updateBalance={getBalance}
              dynamicContract={dynamicContract}
            />
          </main>
        </Container>
      ) : (
        <Cover connect={connect} />
      )}
    </>
  );
};

export default App;
