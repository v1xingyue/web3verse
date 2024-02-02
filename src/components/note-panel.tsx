import sha256 from "crypto-js/sha256";
import { useEffect, useState } from "react";

const baseContract = "0xe15406f9092cb0cb77191fa3cbee92df07c9cc8b";
const networkId = 80001;
const gateway = "w3link.io";

const NotePanel = () => {
  const [msg, updateMsg] = useState("");
  const [loading, updateLoading] = useState(true);
  const hashDigest = sha256(Buffer.from(location.href).toString("hex"));
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("Web3NoteLoadEvent", {
        detail: {
          url: `http://${baseContract}.${networkId}.${gateway}/getMessage/${hashDigest.toString()}`,
        },
      })
    );
    console.log("hashDigest", hashDigest.toString());
  }, []);

  document.addEventListener("Web3NoteLoadedEvent", (e: any) => {
    console.log("Web3NoteLoadEvent", e.detail);
    updateLoading(false);
    const { status, msg } = e.detail;
    if (status == 200) {
      updateMsg(msg);
    } else {
      updateMsg("No note found");
    }
  });

  return loading ? (
    <>Loading...</>
  ) : (
    <div>
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

      <button className="plasmo-btn plasmo-btn-info">Save Note To Web3</button>
    </div>
  );
};

export default NotePanel;
