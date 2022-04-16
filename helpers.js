const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const isPidorAvailable = (dbDate) => {
  const date1 = new Date();
  const date2 = new Date(dbDate);
  if (date1 - date2 > 1 * 60 * 1000) {
    return true;
  }
};

module.exports = { isPidorAvailable, getRandomInt };
