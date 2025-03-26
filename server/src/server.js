import { WebSocketServer } from "ws"
import handleRequest from "./lib/handleRequest.js"

const handleMessage = (message, socket, gameInstances) => {
  try {
    const request = JSON.parse(message.toString())
    handleRequest(request, socket, gameInstances)
  } catch (error) {
    console.error(`Handle message error: ${error}`)
  }
}

const handleClose = (socket) => {
  // Remove player from game
  console.log("Client disconnected")
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
  socket.on("close", () => handleClose(socket))
  socket.on("error", handleError)
})

console.log("WebSocket server is runing on ws://localhost:8081")
