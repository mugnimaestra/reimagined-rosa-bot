const pickAnOption = (input: string): string => {
  // Split the input string by the "atau" keyword
  const options = input.substring(7).split('atau');

  // Trim whitespace from both options
  const optionA = options[0].trim();
  const optionB = options[1].trim();

  // Randomly pick an option with a 50% chance for each option
  const randomNum = Math.random();
  if (randomNum < 0.5) {
    return optionA;
  } else {
    return optionB;
  }
};

export default pickAnOption;
