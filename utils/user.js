const calculateTokenExpiration = (createdAt, expirationMinutes) => {
    const currentTime = new Date();
    const tokenCreationTime = new Date(createdAt);
    const expirationTime = new Date(tokenCreationTime);
    expirationTime.setMinutes(expirationTime.getMinutes() + expirationMinutes);
    return { currentTime, expirationTime };
  };

  module.exports = {
    calculateTokenExpiration,
  };