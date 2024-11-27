const {
  isLoggedIn,
  isInstructor,
  isStudent,
} = require("../middlewares/middleware");

describe("Middleware Tests", () => {
  test("isLoggedIn middleware should call next() if user is authenticated", () => {
    const req = { isAuthenticated: () => true };
    const res = {};
    const next = jest.fn();

    isLoggedIn(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("isInstructor middleware should call next() if user is an instructor", () => {
    const req = {
      isAuthenticated: () => true, // Mocking user authentication
      user: { user_type: "instructor" }, // Mocking user type as instructor
    };
    const res = {};
    const next = jest.fn();

    isInstructor(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("isStudent middleware should call next() if user is a student", () => {
    const req = {
      isAuthenticated: () => true, // Mocking user authentication
      user: { user_type: "student" }, // Mocking user type as instructor
    };
    const res = {};
    const next = jest.fn();

    isStudent(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  // TODO: Add access denied tests.
});
