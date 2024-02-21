import { useEffect, useState } from "react";
import { createPublicClient, custom } from "viem";
import { baseContract, gateway, networkId } from "~config";
import { Galileo } from "./web3";

export const NoteLink = ({ noteAddress }: { noteAddress: string }) => {
  const url = `https://${baseContract}.${networkId}.${gateway}/note/string!${noteAddress}`;
  return (
    <a target="_blank" className="plasmo-link plasmo-link-primary" href={url}>
      {noteAddress}
    </a>
  );
};

export const TransactionLink = ({ txHash }) => {
  return (
    <p className="plasmo-mt-2">
      {txHash == "" ? null : (
        <a
          className="plasmo-font-bold plasmo-link plasmo-link-primary plasmo-text-sm plasmo-underline "
          href={`https://explorer.galileo.web3q.io/tx/${txHash}`}
          target="_blank"
        >
          Transaction : {txHash}
        </a>
      )}
    </p>
  );
};
