import { success, fail } from "./lib/result.js"

const GAME_PHASE = {
  LOBBY: "LOBBY",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
}

const Player = (playerId, playerName, socket) => {
  const ready = false
  return { playerId, playerName, ready, socket }
}

const Game = gameId => {
  const phase = GAME_PHASE.LOBBY
  const players = []
  const teams = [
    {
      name: "White",
      playerIds: [],
    },
    {
      name: "Black",
      playerIds: [],
    },
  ]

  const joinGame = (playerId, playerName, socket) => {
    if (players.some(player => player.playerId === playerId)) {
      return fail("Player is already in the game.")
    }

    players.push(Player(playerId, playerName, socket))
    return success()
  }

  const joinTeam = (playerId, teamName) => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("You must join a game before joining a team.")
    }

    const team = teams.find(team => team.name === teamName)
    if (!team) {
      return fail(`Team ${teamName} does not exist.`)
    }

    if (team.playerIds.some(playerId => playerId === playerId)) {
      return fail("Player is already on the team.")
    }

    team.playerIds.push(player.playerId)
    return success()
  }

  return {
    gameId,
    phase,
    players,
    teams,
    joinGame,
    joinTeam,
  }
}

export default Game
