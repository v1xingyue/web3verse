console.log("Web3Note extension loaded")

document.addEventListener("Web3NoteLoadEvent", async (event: any) => {
  console.log("Web3NoteLoadEvent", event)
  const { url } = event.detail
  const { status, text } = await chrome.runtime.sendMessage({
    type: "load",
    content: {
      url: url as string
    }
  })
  document.dispatchEvent(
    new CustomEvent("Web3NoteLoadedEvent", { detail: { status, text } })
  )
})
