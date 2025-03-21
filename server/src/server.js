import { WebSocketServer } from "ws"

const REQUEST_TYPE = {
  Register: "register",
}

const handleMessage = message => {
  const request = JSON.parse(message.toString())
  if (request?.type === REQUEST_TYPE.Register) {
    const clientId = request.clientId
    if (clients.has(clientId)) return

    clients.set(clientId, socket)
    console.log(`Client ${clientId} registered`)
  }
}

const handleClose = () => {
  if (!clients.size) return

  const client = Array.from(clients).find(([key, value]) => value === socket)
  clients.delete(client[0])
}

const handleError = error => {
  console.error(`WebSocket error: ${error}`)
}

const clients = new Map()
const server = new WebSocketServer({ port: 8081 })
server.on("connection", socket => {
  socket.on("message", handleMessage)
  socket.on("close", handleClose)
  socket.on("error", handleError)
})

console.log("WebSocket server is runing on ws://localhost:8081")
