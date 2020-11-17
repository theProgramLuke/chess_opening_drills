const getPath = jest.fn(() => "tmp");
const getVersion = jest.fn();

module.exports = { app: { getPath }, remote: { app: { getVersion } } };
