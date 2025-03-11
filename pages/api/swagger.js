/* eslint-disable quotes */

import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Next.js Swagger API",
      version: "1.0.0",
      description: "API documentation for your Next.js app",
    },
  },
  apis: ["pages/api/*.js"], // Path to the API docs
};

const spec = swaggerJsdoc(options);

export default function handler(req, res) {
  res.status(200).json(spec);
}
