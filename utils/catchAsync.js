// eslint-disable-next-line arrow-body-style
module.exports = fn => {
  return (req, res, next) => {
    return fn(req, res, next).catch(next)
  };
};
