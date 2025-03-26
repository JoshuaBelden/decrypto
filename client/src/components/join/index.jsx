import "./styles.scss"

const Join = ({ onJoin }) => {
  const onSubmit = e => {
    e.preventDefault()
    const gameId = e.target.gameId.value
    const playerName = e.target.playerName.value
    onJoin(gameId, playerName)
  }

  return (
    <div className="join">
      <h1>Join</h1>
      <form className="join__form" onSubmit={onSubmit}>
        <div className="join__form__game_id">
          <label>Game Code:</label>
          <input
            name="gameId"
            type="text"
            placeholder="Enter a Game Code"
            required
            value="AXR47Y"
          />
        </div>
        <div className="join__form__player-name">
          <label>Player Name:</label>
          <input
            name="playerName"
            type="text"
            placeholder="Enter Your Name"
            required
            value="Josh"
          />
        </div>
        <div className="join__form__submit">
          <button>Join Game</button>
        </div>
      </form>
    </div>
  )
}

export default Join
