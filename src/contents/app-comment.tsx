import cssText from "data-text:~style.css";
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo";
import { useEffect, useState } from "react";
import sha256 from "crypto-js/sha256";
import { baseContract, gateway, networkId } from "~config";
import { Galileo, noteContract } from "~components/web3";
import { getSystemTheme } from "~theme";
import { TransactionLink } from "~components/links";
import {
  createPublicClient,
  createWalletClient,
  custom,
  type Address,
} from "viem";

export const config: PlasmoCSConfig = {
  matches: [
    "https://github.com/CreatorsDAO/web3-protocol-co-learn/*",
    "https://github.com/v1xingyue/web3verse/*",
    "https://creatorsdao.github.io/*",
  ],
  world: "MAIN",
  run_at: "document_end",
};

const Web3Comment = ({ app, idx, creator }) => {
  const [txt, setTxt] = useState("loading");
  const [url, setUrl] = useState("loading");
  useEffect(() => {
    if (app != "" && idx > 0) {
      const loadComment = async () => {
        const url = `https://${baseContract}.${networkId}.${gateway}/appNote/string!${app}/${idx}/${creator}`;
        setUrl(url);

        const comment = await window.Web3CommentGlobal.loadUrl(url);
        setTxt(comment);
      };
      loadComment();
    }
  }, [app, idx]);

  return (
    <p>
      <span className="plasmo-font-bold">{txt}</span>
      <span className="plasmo-ml-3">
        <a href={url} target="_blank" className="plasmo-link plasmo-link-info">
          Web3Link
        </a>
      </span>
    </p>
  );
};

const anchorList = [
  "div.Box-sc-g0xbh4-0.ytOJl",
  "div.Box-sc-g0xbh4-0.iJmJly",
  "div#super-web3-comment",
];

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  for (let anchor of anchorList) {
    const e = document.querySelector(anchor);
    if (e) {
      return e;
    }
  }
  return null;
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

const PlasmoOverlay = () => {
  const client = createPublicClient({
    chain: Galileo,
    transport: custom(window.ethereum),
  });

  const walletClient = createWalletClient({
    chain: Galileo,
    transport: custom(window.ethereum),
  });
  const [comments, setComments] = useState<Array<string>>(["hello"]);
  const [address, setAddress] = useState<Address>();
  const [app, setApp] = useState("");
  const [info, setInfo] = useState([]);
  const [lastIdx, setLastIdx] = useState("");
  const [creator, setCreator] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  useEffect(() => {
    if (address) return;
    const loadInfo = async () => {
      const address = await walletClient.requestAddresses();
      setAddress(address[0]);
    };
    loadInfo();
  }, [address]);

  useEffect(() => {
    const x = sha256(Buffer.from(location.href).toString("hex")).toString();
    setApp(x);
  });

  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (app != "") {
      const loadAppInfo = async () => {
        console.log("load app info --------");
        const url = `https://${baseContract}.${networkId}.${gateway}/appMappings/string!${app}?returns=(string,uint256,address)`;
        console.log(url);
        const text = await window.Web3CommentGlobal.loadUrl(url);
        const info = JSON.parse(text);
        if (info[0] == "") {
          setCreateVisible(true);
        } else {
          setLastIdx(info[1]);
          setCreator(info[2]);
        }
        setInfo(info);
      };

      loadAppInfo();
    }
  }, [app]);

  const initNoteApp = async () => {
    if (app != "") {
      const { request } = await client.simulateContract({
        ...noteContract,
        functionName: "createApp",
        args: [app],
        account: address,
      });

      console.log("request is ", request);

      const hash = await walletClient.writeContract(request);
      setTxHash(hash.toString());

      await client.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });
    }
  };

  useEffect(() => {
    const comments = [];
    const num = parseInt(lastIdx, 16);
    for (let a = 1; a < num; a++) {
      comments.push(a);
    }
    setComments(comments);
  }, [lastIdx]);

  const [newComment, setNewComment] = useState("");

  const addComment = async () => {
    if (app != "") {
      const { request } = await client.simulateContract({
        ...noteContract,
        functionName: "addAppComment",
        args: [app, newComment],
        account: address,
      });

      console.log("request is ", request);

      const hash = await walletClient.writeContract(request);

      console.log(hash.toString());

      setTxHash(hash.toString());

      await client.waitForTransactionReceipt({
        hash,
        confirmations: 2,
      });

      alert("🦄 updated!");
    }
  };

  return (
    <div data-theme={getSystemTheme()}>
      <h2 className="plasmo-m-2 plasmo-p-2">Web3 Note Content</h2>
      <div className="plasmo-p-2">
        {createVisible ? (
          <>
            App :{" "}
            <a
              className="plasmo-link plasmo-link-info"
              target="_blank"
              href={`https://${baseContract}.${networkId}.${gateway}/appMappings/string!${app}?returns=(string,uint256,address)`}
            >
              {app}
            </a>{" "}
            <button
              className="plasmo-btn plasmo-btn-success"
              onClick={initNoteApp}
            >
              Init Note App
            </button>
          </>
        ) : (
          <p>{JSON.stringify(info)}</p>
        )}
        <div className="plasmo-mt-2 plasmo-p-2">
          {comments.map((c) => {
            return <Web3Comment key={c} app={app} idx={c} creator={creator} />;
          })}

          {createVisible ? null : (
            <div>
              <input
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  e.stopPropagation();
                }}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                type="text"
                placeholder="Add comment here"
                className="plasmo-input plasmo-input-bordered plasmo-input-primary plasmo-w-full"
              />
              <button
                className="plasmo-btn plasmo-btn-primary plasmo-mt-3"
                onClick={addComment}
              >
                Add Comment!!
              </button>
            </div>
          )}
        </div>
      </div>

      <TransactionLink txHash={txHash} />
    </div>
  );
};

export default PlasmoOverlay;
