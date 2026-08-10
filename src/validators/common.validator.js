/**
 * Generic validation middleware
 * Expected to be used with a schema validation library like Joi or Yup in the future.
 */
const { sendError } = require('../utils/response.formatter');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return sendError(res, errorMessage, 400);
    }

    req.body = value; // Replace req.body with validated and sanitized data
    next();
  };
};

module.exports = {
  validate
};
