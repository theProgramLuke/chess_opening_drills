import fs from "graceful-fs";

const mockedFs = jest.genMockFromModule("graceful-fs");

const mkdir = async (
  _path: fs.PathLike,
  _options: string | number | fs.MakeDirectoryOptions | null | undefined,
  callback: fs.NoParamCallback
) => {
  callback(null);
};

module.exports = mockedFs;
module.exports.mkdir = jest.fn(mkdir);
