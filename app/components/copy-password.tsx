"use client";
import { useState } from "react";
export function CopyPassword({code}:{code:string}){const [copied,setCopied]=useState(false);async function copy(){await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1800)}return <button className="copybtn" type="button" onClick={copy}>{copied?"Copiado!":"Copiar"}</button>}
