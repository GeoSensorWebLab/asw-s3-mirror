"use strict";

/**
 * Check that input values are not empty or invalid. Will terminate the
 * process if any errors are found!
 * @param  {Object} input Keys and values for input variables
 * @return {undefined}
 */
function validateInput(input) {
  let errors = Object.keys(input).reduce((acc, key) => {
    if (input[key] === undefined) {
      acc.push(`Missing ${key}`)
    }
    return acc
  }, [])

  // Force quit if any errors present
  if (errors.length > 0) {
    console.error("Error!")
    errors.forEach((err) => {
      console.error(err)
    })
    process.exit(1)
  }
}

module.exports = validateInput
