import sha256 from "crypto-js/sha256";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  defineChain,
  formatEther,
  getContract,
  type Account,
  type Address,
} from "viem";

export const Galileo = defineChain({
  id: 3334,
  name: "Galileo",
  nativeCurrency: {
    decimals: 18,
    name: "Web3Q",
    symbol: "W3Q",
  },
  rpcUrls: {
    default: {
      http: ["https://galileo.web3q.io:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.galileo.web3q.io" },
  },
});

const baseContract = "0xaed04cc264017d912a62a86f1e0d717c4f851784";
const networkId = 3334;
const gateway = "w3link.io";
const noteContract = {
  address: baseContract,
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "_key",
          type: "string",
        },
      ],
      name: "getNote",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_key",
          type: "string",
        },
        {
          internalType: "string",
          name: "_note",
          type: "string",
        },
      ],
      name: "setNote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
} as const;

const NotePanel = () => {
  const [network, setNetwork] = useState<string>("");
  const [address, setAddress] = useState<Address>();
  const [balance, setBalance] = useState<string>("");
  const [noteAddress, setNoteAddress] = useState<string>("");
  const [blockNumber, setBlockNumber] = useState<string>("0");
  const [msg, updateMsg] = useState("");
  const [loading, updateLoading] = useState(false);

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
    const url = `https://${baseContract}.${networkId}.${gateway}/getNote/${noteAddress}`;
    console.log(` load note from ${url} `);
    document.dispatchEvent(
      new CustomEvent("Web3NoteLoadEvent", {
        detail: {
          url,
        },
      })
    );
    console.log("noteAddress", noteAddress);
  }, [noteAddress]);

  useEffect(() => {
    if (!address) return;
    const x = sha256(Buffer.from(location.href + address).toString("hex"));
    setNoteAddress(x.toString());
  }, [address]);

  useEffect(() => {
    if (address) return;
    const loadInfo = async () => {
      document.addEventListener("Web3NoteLoadedEvent", (e: any) => {
        console.log("loaded done -> ", e.detail);
        updateLoading(false);
        const { status, msg } = e.detail;
        if (status == 200) {
          updateMsg(msg);
        } else {
          updateMsg("No note found");
        }
      });

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
    loadInfo();
  }, [address]);

  const saveToWeb3 = async () => {
    const { request } = await client.simulateContract({
      ...noteContract,
      functionName: "setNote",
      args: [noteAddress, msg],
      account: address,
    });
    const hash = await walletClient.writeContract(request);
    console.log(hash);
  };

  return loading ? (
    <>Loading...</>
  ) : (
    <div>
      <div>
        <p>
          Address : <span className="plasmo-font-bold">{address}</span>{" "}
        </p>
        <p>
          Balance : <span className="plasmo-font-bold">{balance}</span>{" "}
        </p>
        <p>
          Network :{" "}
          <span className="plasmo-font-bold">
            {network} {blockNumber}{" "}
          </span>{" "}
        </p>
        <p>
          NoteAddress : <span className="plasmo-font-bold">{noteAddress}</span>{" "}
        </p>
      </div>
      <textarea
        value={msg}
        onChange={(e) => {
          updateMsg(e.target.value);
          e.preventDefault();
        }}
        autoFocus={true}
        className="plasmo-mt-4 plasmo-w-full plasmo-h-96 plasmo-p-2 plasmo-text-sm plasmo-text-gray-700 plasmo-border plasmo-border-gray-300 plasmo-rounded-md "
        placeholder="Bio"
      ></textarea>
      <div>
        <button className="plasmo-btn plasmo-btn-info" onClick={saveToWeb3}>
          Save Note To Web3
        </button>
      </div>
    </div>
  );
};

export default NotePanel;
