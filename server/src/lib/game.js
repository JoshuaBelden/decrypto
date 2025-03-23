import { success, fail } from "./result.js"
import { keywords } from '../data/keywords.js'

const MIN_PLAYERS = 4
export const GAME_PHASE = {
  LOBBY: "LOBBY",
  MAIN_ENCRYPT: "MAIN_ENCRYPT",

  MAIN_WHITE: "MAIN_WHITE",
  MAIN_WHITE_INTERCEPT: "MAIN_WHITE_INTERCEPT",
  MAIN_WHITE_DECODE: "MAIN_WHITE_DECODE",
  MAIN_WHITE_REVEAL: "MAIN_WHITE_REVEAL",

  MAIN_BLACK: "MAIN_BLACK",
  MAIN_BLACK_INTERCEPT: "MAIN_BLACK_INTERCEPT",
  MAIN_BLACK_DECODE: "MAIN_BLACK_DECODE",
  MAIN_BLACK_REVEAL: "MAIN_BLACK_REVEAL",

  OVER: "OVER",
}

const Player = (playerId, playerName, socket) => {
  const ready = false
  return { playerId, playerName, ready, socket }
}

const Team = (name) => {
  const playerIds = []
  const currentEncryptorId = null;
  return { name, playerIds, currentEncryptorId }
}

const Game = gameId => {
  const state = {
    phase: GAME_PHASE.LOBBY,
  }
  const players = []
  const teams = [Team("White"), Team("Black")]

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

    const onTeam = teams.find(team =>
      team.playerIds.some(id => id === playerId)
    )
    if (!onTeam) {
      return fail("Player must be on a team to be ready.")
    }

    player.ready = ready

    transitionPhase()

    return success()
  }

  const setKeywords = () => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.keywords = []
    blackTeam.keywords = []

    for (let i = 0; i < 4; i++) {
      whiteTeam.keywords.push(keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0])
      blackTeam.keywords.push(keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0])
    }
  }

  const setNextEncryptors = () => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.currentEncryptorId = whiteTeam.playerIds[0]
    blackTeam.currentEncryptorId = blackTeam.playerIds[0]
  }

  const transitionPhase = () => {
    switch (state.phase) {
      case GAME_PHASE.LOBBY:
        if (
          players.length >= MIN_PLAYERS &&
          players.every(player => player.ready)
        ) {
          setKeywords()
          setNextEncryptors()
          state.phase = GAME_PHASE.MAIN_ENCRYPT
        }
        break
      case GAME_PHASE.MAIN_ENCRYPT:
        state.phase = GAME_PHASE.MAIN_WHITE
        break
      case GAME_PHASE.MAIN_WHITE:
        state.phase = GAME_PHASE.MAIN_WHITE_INTERCEPT
        break
      case GAME_PHASE.MAIN_WHITE_INTERCEPT:
        state.phase = GAME_PHASE.MAIN_WHITE_DECODE
        break
      case GAME_PHASE.MAIN_WHITE_DECODE:
        state.phase = GAME_PHASE.MAIN_WHITE_REVEAL
        break
      case GAME_PHASE.MAIN_WHITE_REVEAL:
        state.phase = GAME_PHASE.MAIN_BLACK
        break
      case GAME_PHASE.MAIN_BLACK:
        state.phase = GAME_PHASE.MAIN_BLACK_INTERCEPT
        break
      case GAME_PHASE.MAIN_BLACK_INTERCEPT:
        state.phase = GAME_PHASE.MAIN_BLACK_DECODE
        break
      case GAME_PHASE.MAIN_BLACK_DECODE:
        state.phase = GAME_PHASE.MAIN_BLACK_REVEAL
        break
      case GAME_PHASE.MAIN_BLACK_REVEAL:
        state.phase = GAME_PHASE.OVER
        break
      case GAME_PHASE.OVER:
        state.phase = GAME_PHASE.LOBBY
        break
    }
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
