const Round = () => {
  const teamCodes = {
    White: [
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
    ],
    Black: [
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
      Math.floor(Math.random() * 4) + 1,
    ],
  }

  const teamClues = {
    White: [],
    Black: [],
  }

  const teamInterceptGuesses = {
    White: [],
    Black: [],
  }

  const teamDecodeGuesses = {
    White: [],
    Black: [],
  }

  const teamPlayersReadyForNextRound = {
    White: [],
    Black: [],
  }

  return {
    teamCodes,
    teamClues,
    teamInterceptGuesses,
    teamDecodeGuesses,
    teamPlayersReadyForNextRound,
  }
}

const RoundManager = () => {
  let currentRoundIdx = 0
  const rounds = [Round()]

  return {
    currentRound: () => rounds[currentRoundIdx],
    newRound: () => {
      const newRound = Round()
      currentRoundIdx++
      rounds.push(newRound)

      return newRound
    },
  }
}

export default RoundManager
