const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    scalar Upload

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type StatusData {
        status: String!
    }

    type PostData {
        posts: [Post!]!
        totalItems: Int!
    }

    input UserInput {
        email: String!
        name: String!
        password: String!
    }

    input PostInput {
        title: String!
        content: String!
        image: Upload!
    }

    type Query {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostData!
        post(_id: ID!): Post!
        deletePost(_id: ID!): Post!
        getStatus: StatusData!
    }

    type Mutation {
        createUser(user_input: UserInput): User!
        createPost(post_input: PostInput): Post!
        updatePost(_id: ID!, post_input: PostInput): Post!
        updateStatus(status: String!): StatusData!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`);