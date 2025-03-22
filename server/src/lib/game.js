import { success, fail } from "./result.js"

const MIN_PLAYERS = 4
export const GAME_PHASE = {
  LOBBY: "LOBBY",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
}

const Player = (playerId, playerName, socket) => {
  const ready = false
  return { playerId, playerName, ready, socket }
}

const Game = gameId => {
  const state = {
    phase: GAME_PHASE.LOBBY
  }
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

    if (team.playerIds.some(id => id === playerId)) {
      return fail("Player is already on the team.")
    }

    // Remove the player from all teams and then re-add them to the correct team 
    teams.forEach(team => {
      team.playerIds = team.playerIds.filter(id => id !== playerId)
    })
    team.playerIds.push(player.playerId)

    return success()
  }

  const playerReady = (playerId, ready) => {
    const player = players.find(player => player.playerId === playerId)
    if (!player) {
      return fail("Player is not in the game.")
    }

    const onTeam = teams.find(team => team.playerIds.some(id => id === playerId))
    if (!onTeam) {
      return fail("Player must be on a team to be ready.")
    }

    player.ready = ready

    if (players.length >= MIN_PLAYERS && players.every(player => player.ready)) {
      state.phase = GAME_PHASE.STARTED
    }

    return success()
  }

  return {
    gameId,
    state,
    players,
    teams,
    joinGame,
    joinTeam,
    playerReady,
  }
}

export default Game
