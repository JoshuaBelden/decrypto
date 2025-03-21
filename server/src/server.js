import { WebSocketServer } from "ws"
import handleRequest from "./request.js"

const handleMessage = (message, socket, gameInstances) => {
  try {
    const request = JSON.parse(message.toString())
    handleRequest(request, socket, gameInstances)
  } catch (error) {
    console.error(`Handle message error: ${error}`)
  }
}

const handleClose = (socket, players) => {
  try {
    if (!players.size) return

    const player = Array.from(players).find(([key, value]) => value === socket)
    players.delete(player[0])
  } catch (error) {
    console.error(`Socket close error: ${error}`)
  }
}

const handleError = error => {
  console.error(`WebSocket error: ${error}`)
}

const gameInstances = new Map()

const server = new WebSocketServer({ port: 8081 })
server.on("connection", socket => {
  console.log("Client connected")

  socket.on("message", message =>
    handleMessage(message, socket, gameInstances)
  )
  socket.on("close", () => handleClose(socket, players))
  socket.on("error", handleError)
})

console.log("WebSocket server is runing on ws://localhost:8081")
