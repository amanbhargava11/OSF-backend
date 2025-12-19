const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({
    success: status < 400,
    message,
    data
  });
};

export default sendResponse;
