import sha256 from "crypto-js/sha256";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  type Address,
} from "viem";
import { baseContract, gateway, networkId } from "~config";
import { NoteLink, TransactionLink } from "./links";
import { noteContract, Galileo } from "./web3";

interface stopPropagationEvent {
  stopPropagation: () => void;
}

const stopPropagation = (e: stopPropagationEvent) => {
  e.stopPropagation();
};

const NotePanel = () => {
  const [txHash, setTxHash] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [address, setAddress] = useState<Address>();
  const [balance, setBalance] = useState<string>("");
  const [noteAddress, setNoteAddress] = useState<string>("");
  const [blockNumber, setBlockNumber] = useState<string>("0");
  const [msg, updateMsg] = useState("");
  const [loading, updateLoading] = useState(false);
  const [confirmWaiting, updateConfirmed] = useState(false);

  const client = createPublicClient({
    chain: Galileo,
    transport: custom(window.ethereum),
  });

  const walletClient = createWalletClient({
    chain: Galileo,
    transport: custom(window.ethereum),
  });

  useEffect(() => {
    if (noteAddress == "") {
      updateLoading(false);
      return;
    }

    const loadNote = async () => {
      const url = `https://${baseContract}.${networkId}.${gateway}/note/string!${noteAddress}`;
      console.log(` load note from ${url} `);
      const note = await window.Web3CommentGlobal.loadUrl(url);
      updateLoading(false);
      updateMsg(note);
    };

    loadNote();
    console.log("noteAddress", noteAddress);
  }, [noteAddress]);

  useEffect(() => {
    const loadInfo = async () => {
      console.log("ethreum ----------> ", window.ethereum);
      const address = await walletClient.requestAddresses();
      setAddress(address[0]);
      const blockNumber = await client.getBlockNumber();
      setBlockNumber(blockNumber.toString());
      const chain = walletClient.chain;
      setNetwork(chain.name);
      const balance = await client.getBalance({ address: address[0] });
      console.log("balance", balance);
      setBalance(formatEther(balance));
    };
    if (!address) {
      loadInfo();
    } else {
      const x = sha256(Buffer.from(location.href + address).toString("hex"));
      setNoteAddress(x.toString());
    }
  }, [address]);

  const saveToWeb3 = async () => {
    updateConfirmed(true);
    const { request } = await client.simulateContract({
      ...noteContract,
      functionName: "setNote",
      args: [noteAddress, msg],
      account: address,
    });

    const hash = await walletClient.writeContract(request);
    console.log(hash.toString());
    setTxHash(hash.toString());

    await client.waitForTransactionReceipt({
      hash,
      confirmations: 2,
    });

    alert("🦄 updated!");
    updateConfirmed(false);
  };

  return loading ? (
    <>Loading...</>
  ) : (
    <div>
      <div>
        <p>
          Address : <span className="plasmo-font-bold">{address}</span>{" "}
          <span className="plasmo-font-bold">
            {network}({blockNumber}){" "}
          </span>
        </p>
        <p>
          Balance : <span className="plasmo-font-bold">{balance}</span>{" "}
        </p>
        <p>
          Note Hash :{" "}
          <span className="plasmo-font-bold">
            <NoteLink noteAddress={noteAddress} />
          </span>{" "}
        </p>
      </div>
      <textarea
        value={msg}
        onKeyUp={stopPropagation}
        onKeyDown={stopPropagation}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          updateMsg(e.target.value);
          stopPropagation(e);
        }}
        autoFocus={true}
        className="plasmo-mt-4 plasmo-w-full plasmo-h-28 plasmo-p-2 plasmo-text-sm plasmo-text-gray-700 plasmo-border plasmo-border-gray-300 plasmo-rounded-md "
        placeholder="Bio"
      ></textarea>
      <div>
        <button className="plasmo-btn plasmo-btn-info" onClick={saveToWeb3}>
          Save Note To Web3{" "}
          {confirmWaiting ? (
            <span className="plasmo-ml-3 plasmo-loading plasmo-loading-infinity plasmo-loading-lg"></span>
          ) : null}
        </button>
      </div>
      <TransactionLink txHash={txHash} />
    </div>
  );
};

export default NotePanel;
