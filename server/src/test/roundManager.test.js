import RoundManager from "../lib/roundManager"

describe("RoundManager", () => {
  it("should have a current round", () => {
    const roundManager = RoundManager()
    const currentRound = roundManager.currentRound()

    expect(roundManager.currentRound()).toBeDefined()
    expect(currentRound.teamCodes.White.length).toBe(3)
    expect(currentRound.teamCodes.Black.length).toBe(3)
    expect(currentRound.teamClues.White.length).toBe(0)
    expect(currentRound.teamClues.Black.length).toBe(0)
    expect(currentRound.teamInterceptGuesses.White.length).toBe(0)
    expect(currentRound.teamInterceptGuesses.Black.length).toBe(0)
    expect(currentRound.teamDecodeGuesses.White.length).toBe(0)
    expect(currentRound.teamDecodeGuesses.Black.length).toBe(0)
    expect(currentRound.teamPlayersReadyForNextRound.White.length).toBe(0)
    expect(currentRound.teamPlayersReadyForNextRound.Black.length).toBe(0)
  })

  it("should create a new round", () => {
    const roundManager = RoundManager()
    const currentRound = roundManager.currentRound()
    const newRound = roundManager.newRound()

    expect(newRound).toBeDefined()
    expect(currentRound).not.toEqual(newRound)
  })
})
