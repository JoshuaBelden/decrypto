export const success = () => result(true)

export const fail = (errorMessage) => result(false, errorMessage);

export const result = (success, errorMessage) => ({
  success,
  errorMessage,
})
