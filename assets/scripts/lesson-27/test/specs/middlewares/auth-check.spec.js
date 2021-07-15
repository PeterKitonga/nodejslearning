const chai = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const sinonChai = require("sinon-chai");

const { expect } = chai;
const authMiddleware = require("../../../middlewares/auth-check");

chai.use(sinonChai); // imports chai plugin

const sandbox = sinon.createSandbox();

describe("middlewares/auth-check.js", () => {
  afterEach(() => {
    sandbox.restore();
  });

  context("check authorization header", () => {
    it("should throw an error if not present", () => {
      const req = {
        get() {
          return null;
        },
      };

      expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
        "Unauthenticated request. Please login."
      );
    });

    it("should throw an error if token is missing", () => {
      const req = {
        get(headerName) {
          return "xyz";
        },
      };

      expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    it("should throw an error if token is invalid", () => {
      const req = {
        get(headerName) {
          return "Bearer xyz";
        },
      };

      expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });
  });

  context("decode token", () => {
    let jwtVerifyStub;

    beforeEach(() => {
      jwtVerifyStub = sandbox.stub(jwt, "verify");
    });

    it("should yield a userId after decoding", () => {
      const req = {
        get(headerName) {
          return "Bearer xyz";
        },
      };

      jwtVerifyStub.returns({ userId: "abc" });

      authMiddleware(req, {}, () => {});

      expect(req).to.have.a.property("userId");

      expect(jwtVerifyStub).to.have.been.calledOnce;
      expect(jwtVerifyStub).to.have.been.calledOnceWith("xyz", process.env.JWT_SECRET);
    });
  });
});
