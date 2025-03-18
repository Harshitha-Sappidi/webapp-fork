// const request = require('supertest'); // Use 'supertest' for API testing
// const app = require('../app');
// const db = require('../models/healthCheck');

// describe("Health Check API Tests", () => {
  
//   beforeAll(async () => {
//     // Ensure database connection
//     await db.sequelize.sync();
//   });

//   afterAll(async () => {
//     // Cleanup: Remove all records from the health check table
//     await db.destroy({ where: {}, truncate: true, restartIdentity: true });
//     // Closing database connection to prevent open handles
//     await db.sequelize.close();
//   });

//   // Test for inserting a record and returning 200 OK
//   test("GET /healthz should insert a record and return 200 OK", async () => {
//     const response = await request(app).get('/healthz');
//     expect(response.statusCode).toBe(200);
//     expect(response.text).toBe('');

//     // Verify the record exists in the health check table
//     const healthRecord = await db.findOne();
//     expect(healthRecord).not.toBeNull();
//   });

//   // Test to ensure API response is not cached
//   test("GET /healthz should include Cache-Control: no-cache", async () => {
//     const response = await request(app).get('/healthz');
//     expect(response.headers['cache-control']).toContain('no-cache');
//   });

//   // Test to ensure requests with payloads return 400 Bad Request
//   test("GET /healthz should return 400 if request contains payload", async () => {
//     const response = await request(app)
//       .get('/healthz')
//       .send({ key: "value" });

//     expect(response.statusCode).toBe(400);
//   });

//   // Test to ensure requests with query parameters return 400 Bad Request
//   test("GET /healthz with query parameters should return 400 Bad Request", async () => {
//       const response = await request(app).get('/healthz?param=value');
//       expect(response.statusCode).toBe(400);
//   });

//   // Test to ensure API response does not include any payload
//   test("GET /healthz should return an empty response body", async () => {
//     const response = await request(app).get('/healthz');
//     expect(response.text).toBe('');
//   });
  
//   // Test to ensure requests to invalid URLs return 404 Not Found
//   test("GET request to an invalid URL should return 404 Not Found", async () => {
//     const response = await request(app).get('/invalid-url');
//     expect(response.statusCode).toBe(404);
//   });

//   // Consolidated test for rejecting non-GET requests with 405 Method Not Allowed
//   test("Non-GET requests to /healthz should return 405 Method Not Allowed", async () => {
//     const methods = ["post", "put", "patch", "delete", "head", "options"];

//     for (const method of methods) {
//       const response = await request(app)[method]('/healthz');
//       expect(response.statusCode).toBe(405);
//     }
//   });

// });
