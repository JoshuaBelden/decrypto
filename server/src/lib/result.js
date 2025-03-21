export const success = () => result(true)

export const fail = (errorMessage) => result(false, errorMessage);

export const result = (success = true, errorMessage) => ({
  success,
  errorMessage,
})
