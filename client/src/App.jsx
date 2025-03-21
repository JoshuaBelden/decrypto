import { useCallback, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./App.scss"

const REQUEST_TYPE = {
  Register: "register",
}

const Request = (requestType, data) => {
  return JSON.stringify({ type: requestType, ...data })
}

const App = () => {
  const [clientId] = useState(uuidv4())
  const [connection, setConnection] = useState(null)

  const connect = useCallback(() => {
    if (connection) return;

    const ws = new WebSocket("ws://localhost:8081")
    ws.onopen = () => {
      setConnection(ws);
      ws.send(Request(REQUEST_TYPE.Register, { clientId }))
    }

    ws.onmessage = event => {
    }

    ws.onclose = () => {
      setConnection(null)
      setTimeout(connect, 3000)
    }
  }, [connection, clientId])

  useEffect(() => {
    connect()
  }, [connect])

  return <div></div>
}

export default App
