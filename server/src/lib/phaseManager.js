import { arraysAreEqual } from "./utils.js"
import { GAME_PHASE } from "./constants.js"
import { keywords } from "../data/keywords.js"
const MIN_PLAYERS = 4

const PhaseManager = roundManager => {
  let _currentPhase = GAME_PHASE.LOBBY

  const setKeywords = teams => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.keywords = []
    blackTeam.keywords = []

    for (let i = 0; i < 4; i++) {
      whiteTeam.keywords.push(
        keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0]
      )
      blackTeam.keywords.push(
        keywords.splice(Math.floor(Math.random() * keywords.length), 1)[0]
      )
    }
  }

  const setNextEncryptors = teams => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    whiteTeam.currentEncryptorId = whiteTeam.playerIds[0]
    blackTeam.currentEncryptorId = blackTeam.playerIds[0]
  }

  const transition = (players, teams) => {
    const currentRound = roundManager.currentRound()
    switch (_currentPhase) {
      case GAME_PHASE.LOBBY:
        if (
          players.length >= MIN_PLAYERS &&
          players.every(player => player.ready)
        ) {
          setKeywords(teams)
          setNextEncryptors(teams)
          _currentPhase = GAME_PHASE.MAIN_ENCRYPT
        }
        break
      case GAME_PHASE.MAIN_ENCRYPT:
        if (
          currentRound.teamClues.White.length === 3 &&
          currentRound.teamClues.Black.length === 3
        ) {
          _currentPhase = GAME_PHASE.MAIN_INTERCEPT
        }
        break
      case GAME_PHASE.MAIN_INTERCEPT:
        if (
          currentRound.teamInterceptGuesses.White.length === 3 &&
          currentRound.teamInterceptGuesses.Black.length === 3
        ) {
          _currentPhase = GAME_PHASE.MAIN_DECODE
        }
        break
      case GAME_PHASE.MAIN_DECODE:
        if (
          currentRound.teamDecodeGuesses.White.length === 3 &&
          currentRound.teamDecodeGuesses.Black.length === 3
        ) {
          const gameOver = determineScore(currentRound, teams)
          if (gameOver) {
            _currentPhase = GAME_PHASE.OVER
          } else {
            setNextEncryptors(teams)
            roundManager.newRound()
            _currentPhase = GAME_PHASE.MAIN_REVEAL
          }
        }
        break
      case GAME_PHASE.MAIN_REVEAL:
        if (
          currentRound.teamPlayersReadyForNextRound.White.every(Boolean) &&
          currentRound.teamPlayersReadyForNextRound.Black.every(Boolean)
        ) {
          _currentPhase = GAME_PHASE.MAIN_ENCRYPT
        }
        break
    }
  }

  const determineScore = (currentRound, teams) => {
    const whiteTeam = teams.find(team => team.name === "White")
    const blackTeam = teams.find(team => team.name === "Black")

    const whiteIntercepted = arraysAreEqual(
      currentRound.teamInterceptGuesses.White,
      currentRound.teamCodes.Black
    )

    const whiteMiscommunicated = !arraysAreEqual(
      currentRound.teamDecodeGuesses.White,
      currentRound.teamCodes.White
    )

    const blackIntercepted = arraysAreEqual(
      currentRound.teamInterceptGuesses.Black,
      currentRound.teamCodes.White
    )

    const balckMiscommunicated = !arraysAreEqual(
      currentRound.teamDecodeGuesses.Black,
      currentRound.teamCodes.Black
    )

    if (whiteIntercepted) {
      whiteTeam.intercepts++
    }

    if (whiteMiscommunicated) {
      whiteTeam.miscommunications++
    }

    if (blackIntercepted) {
      blackTeam.intercepts++
    }

    if (balckMiscommunicated) {
      blackTeam.miscommunications++
    }

    return (
      whiteTeam.intercepts >= 2 ||
      whiteTeam.miscommunications >= 2 ||
      blackTeam.intercepts >= 2 ||
      blackTeam.miscommunications >= 2
    )
  }

  return {
    currentPhase: () => _currentPhase,
    transition,
  }
}

export default PhaseManager
