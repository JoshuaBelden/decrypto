import { REQUEST_TYPE } from "./constants"

const Socket = () => {
  let connection

  const connect = (
    gameId,
    playerId,
    playerName,
    onConnected,
    onResponse,
    onDisconnected,
    onError
  ) => {
    if (!gameId || !playerId || !playerName) {
      throw new Error("gameId, playerId, and playerName are required")
    }

    if (!onConnected || !onResponse || !onDisconnected || !onError) {
      throw new Error(
        "onConnected, onResponse, onDisconnected and onError are required"
      )
    }

    try {
      connection = new WebSocket("ws://localhost:8081")

      connection.onopen = () => {
        onConnected()
      }

      connection.onmessage = event => {
        const res = response(event.data)
        onResponse(res)
      }

      connection.onclose = () => {
        onDisconnected()
      }

      connection.onerror = error => {
        onError("WebSocket error: ", error)
      }
    } catch (error) {
      onError("WebSocket error: ", error)
    }
  }

  const send = (requestType, data) => {
    connection.send(request(requestType, data))
  }

  const request = (requestType, data) => {
    return JSON.stringify({ type: requestType, ...data })
  }

  const response = message => {
    return JSON.parse(message)
  }

  return {
    connect,
    send,
  }
}

export default Socket
