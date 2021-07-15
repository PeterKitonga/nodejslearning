const chai = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");

const { expect } = chai;
const app = require("../../../app");
const User = require("../../../models/user");
const authController = require("../../../controllers/auth");

chai.use(sinonChai);
chai.use(chaiAsPromised);

const sandbox = sinon.createSandbox();

describe("controllers/auth.js", () => {
  afterEach(() => {
    sandbox.restore();
  });

  context("login()", () => {
    let userFindOneStub;

    beforeEach(() => {
      userFindOneStub = sandbox.stub(User, "findOne");
    });

    it("should throw an error if password doesn't match", (done) => {
      userFindOneStub.callsFake(() => {
        return new Promise((resolve, reject) => {
          resolve({
            _id: {
              $oid: "abc",
            },
            email: "pkitonga.pk@gmail.com",
            password: "defghijklmnopqrstuvwxyz",
          });
        });
      });

      request(app)
        .post("/auth/login")
        .send({
          email: "pkitonga.pk@gmail.com",
          password: "password",
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(userFindOneStub).to.have.been.calledTwice; // twice because of validation
          expect(userFindOneStub).to.have.been.calledWith({
            email: "pkitonga.pk@gmail.com",
          });
          done();
        });
    });
  });

  context("getStatus()", () => {
    let jwtVerifyStub;
    let userFindByIdStub;

    beforeEach(() => {
      jwtVerifyStub = sandbox.stub(jwt, "verify");
      userFindByIdStub = sandbox.stub(User, "findById");
    });

    it("should return status for a valid existing user", (done) => {
      jwtVerifyStub.returns({ userId: "abc" });
      userFindByIdStub.returns({
        _id: {
          $oid: "abc",
        },
        email: "pkitonga.pk@gmail.com",
        status: "NEW!",
      });

      request(app)
        .get("/auth/user/status")
        .set("Authorization", "Bearer xyz")
        .set("Accept", "application/json")
        .end((err, res) => {
          /**
           * status & body are properties provided by supertest
           * for testing the response
           */
          expect(res.status).to.have.equal(200);
          expect(res.body)
            .to.have.nested.property("data.status")
            .to.equal("NEW!");
          expect(userFindByIdStub).to.have.been.calledOnce;
          expect(userFindByIdStub).to.have.been.calledWith("abc");
          done();
        });
    });
  });
});
