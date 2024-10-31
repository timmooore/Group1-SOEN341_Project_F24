const request = require('supertest');
const { app, mongooseConnection } = require('../index'); // Path to Express app

beforeAll(async () => {
  await mongooseConnection.once('open', () => {
    console.log('Connected to MongoDB');
  });
});

afterAll(async () => {
  await mongooseConnection.close(); // Close the Mongoose connection
});

describe('Route Tests', () => {
  test('GET /register should render the register page', async () => {
    const response = await request(app).get('/register');
    expect(response.statusCode).toBe(200);

    // Expect response to contain header string
    expect(response.text).toContain('Register for the Peer Evaluation Web App!');
  });

  // test('POST /register with valid user data should redirect', async () => {
  //   const response = await request(app)
  //     .post('/register')
  //     .send({ username: 'testUser', password: 'testPass', user_type: 'student' });

  //   expect(response.statusCode).toBe(302); // Assuming successful redirect
  // });

  // test('GET /login should render login page', async () => {
  //   const response = await request(app).get('/login');
  //   expect(response.statusCode).toBe(200);
  //   expect(response.text).toContain('Login'); // assuming you have 'Login' in the HTML
  // });
});