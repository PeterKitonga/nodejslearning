const fs = require("fs");
const path = require("path");
const chai = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const sinonChai = require("sinon-chai");
const chaiAsPromised = require("chai-as-promised");
const { Document, Model } = require("mongoose");

const { expect } = chai;
const app = require("../../../app");
const User = require("../../../models/user");
const Post = require("../../../models/post");

chai.use(sinonChai);
chai.use(chaiAsPromised);

const sandbox = sinon.createSandbox();

describe("controllers/feed.js", () => {
  afterEach(() => {
    sandbox.restore();
  });

  context("addPost()", () => {
    let jwtVerifyStub;
    let userFindByIdStub;
    let userSaveStub;
    let postSaveStub;

    beforeEach(() => {
      jwtVerifyStub = sandbox.stub(jwt, "verify");
      userFindByIdStub = sandbox.stub(User, "findById");
      /**
       * Some mongoose methods are not model specific. They
       * require some chained access.
       *
       * @link https://stackoverflow.com/questions/11318972/stubbing-a-mongoose-model-with-sinon#answer-11567859
       */
      userSaveStub = sandbox.stub(User.prototype, "save");
      postSaveStub = sandbox.stub(Post.prototype, "save");
    });

    it("should add new post to the creator 'posts' array", (done) => {
      const dummyPost = {
        title: "Test Post",
        content: "A test post!!!",
      };
      const dummyFilePath = path.join(
        __dirname,
        "../../../public/test-file.jpg"
      );
      const dummyFileUploadPath = path.join(
        __dirname,
        "../../../public/storage/files/"
      );

      jwtVerifyStub.returns({ userId: "abc" });
      userFindByIdStub.resolves({
        _id: {
          $oid: "abc",
        },
        email: "pkitonga.pk@gmail.com",
        posts: [],
        save() {},
      });

      postSaveStub.resolves({
        _id: {
          $oid: "efg",
        },
        creator: {
          $oid: "abc",
        },
      });
      userSaveStub.resolves({
        _id: {
          $oid: "abc",
        },
        email: "pkitonga.pk@gmail.com",
        posts: [
          {
            $oid: "efg",
          },
        ],
      });

      /**
       * multipart/form-data uploads with supertest
       *
       * @link https://www.tabnine.com/code/javascript/functions/supertest/Test/field
       */
      request(app)
        .post("/feed/posts/add")
        .set("Authorization", "Bearer xyz")
        .field("title", dummyPost.title)
        .field("content", dummyPost.content)
        .attach("image", dummyFilePath)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body)
            .to.have.nested.property("creator.posts")
            .to.not.have.length(0);
          expect(postSaveStub).to.have.been.calledOnce;
          expect(userFindByIdStub).to.have.been.calledOnce;
          expect(userFindByIdStub).to.have.been.calledWith("abc");
          const files = fs
            .readdirSync(dummyFileUploadPath)
            .filter((fn) => fn.endsWith("test-file.jpg"));
          files.forEach((fileName) =>
            fs.unlinkSync(`${dummyFileUploadPath}${fileName}`)
          );
          done();
        });
    });
  });
});
