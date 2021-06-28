import React, { Component, Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphql_query = {
      query: `
        {
          getStatus {
            status
          }
        }
      `
    };

    fetch('http://127.0.0.1:8180/graphql', {
        method: 'Post',
        headers: {
          'Authorization': `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphql_query)
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error(resData.errors[0].message);
        }

        if (resData.errors) {
          throw new Error("Fetching status failed!");
        }

        this.setState({ status: resData.data.getStatus.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    const graphql_query = {
      query: `
        query FetchPosts($page: Int) {
          posts(page: $page) {
            posts { 
              _id 
              title 
              content
              imageUrl
              creator {
                name
              }
              createdAt
            } 
            totalItems
          }
        }
      `,
      variables: {
        page
      }
    };

    fetch(`http://127.0.0.1:8180/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphql_query)
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error(resData.errors[0].message);
        }

        if (resData.errors) {
          throw new Error("Fetching posts failed!");
        }

        this.setState({
          posts: resData.data.posts.posts.map(item => {
            return {
              ...item,
              imagePath: item.imageUrl
            }
          }),
          totalPosts: resData.data.posts.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();

    const graphql_query = {
      query: `
        mutation StatusUpdate($status: String!) {
          updateStatus(status: $status) {
            status
          }
        }
      `,
      variables: {
        status: this.state.status
      }
    };

    fetch('http://127.0.0.1:8180/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.props.token}`
        },
        body: JSON.stringify(graphql_query)
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 401) {
          throw new Error(resData.errors[0].message);
        }

        if (resData.errors) {
          throw new Error("Updating status failed!");
        }

        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
    });
  }

  finishEditHandler = async (postData) => {
    this.setState({
      editLoading: true
    });

    // let imageUrl = await this.convertToBase64(postData.image);

    let graphql_query = {
      query: `
        mutation PostCreate($image: Upload!, $title: String!, $content: String!) {
          createPost(post_input: {title: $title, content: $content, image: $image}) {
            _id
            title
            content
            creator {
              name
            }
            createdAt
          }
        }
      `,
      variables: {
        image: null,
        title: postData.title,
        content: postData.content
      }
    };

    if (this.state.editPost) {
      graphql_query = {
        query: `
          mutation PostUpdate($image: Upload!, $title: String!, $content: String!, $id: ID!) {
            updatePost(_id: $id, post_input: {title: $title, content: $content, image: $image}) {
              _id
              title
              content
              creator {
                name
              }
              createdAt
            }
          }
        `,
        variables: {
          image: null,
          id: this.state.editPost._id,
          title: postData.title,
          content: postData.content
        }
      };
    }

    const formData = new FormData();
    formData.append('operations', JSON.stringify(graphql_query));
    formData.append(
      "map", 
      JSON.stringify({
        "0": ["variables.image"]
      })
    );

    if (postData.image.name !== undefined) {
      formData.append("0", postData.image, postData.image.name);
    }
    
    formData.append('title', postData.title);
    formData.append('content', postData.content);

    fetch('http://127.0.0.1:8180/graphql', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.props.token}`
        }
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure all fields are filled!"
          );
        }

        if (resData.errors) {
          throw new Error("Post creation failed!");
        }

        let resDataField = 'createPost';

        if (this.state.editPost) {
          resDataField = 'updatePost'
        }

        const post = {
          _id: resData.data[resDataField]._id,
          title: resData.data[resDataField].title,
          content: resData.data[resDataField].content,
          creator: resData.data[resDataField].creator,
          createdAt: resData.data[resDataField].createdAt
        };

        this.setState(prevState => {
          let updatedPosts = [...prevState.posts];
          let updatedTotalPosts = prevState.totalPosts;

          if (prevState.editPost) {
            const postIndex = prevState.posts.findIndex(
              p => p._id === prevState.editPost._id
            );
            updatedPosts[postIndex] = post;
          } else {
            updatedTotalPosts++;

            if (prevState.posts.length >= 2) {
              updatedPosts.pop();
            }
            updatedPosts.unshift(post);
          }

          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false,
            totalPosts: updatedTotalPosts
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });

    const graphql_query = {
      query: `
        query PostDelete($id: Int!) {
          deletePost(_id: $id) {
            _id 
            title 
            content
            imageUrl
            creator {
              name
            }
            createdAt
          }
        }
      `,
      variables: {
        id: postId
      }
    };

    fetch(`http://127.0.0.1:8180/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphql_query)
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        console.log(resData);

        if (resData.errors) {
          throw new Error("Post deletion failed!");
        }

        this.loadPosts();
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
