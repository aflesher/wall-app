import React from "react";
import Link from "gatsby-link";
import Script from "react-load-script";
import Paginate from "react-paginate";
import Post from "../components/Post.jsx";
import CreatePost from "../components/CreatePost.jsx";
import _ from "lodash";
import WallLib from "../library/wall";
import Helmet from "react-helmet"

import MetaMaskImage from "../images/download-metamask.png";

let fonts = ['Arial', 'Geneva', 'Georgia', 'Impact', 'Tahoma', 'Verdana'];
let postsPerPage = 10;

class Wall extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      postsCount: 0,
      currentPage: 0,
      account: '',
      showDescription: false,
      showMetaMask: false,
      errorMsg: ''
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.toggleDescription = this.toggleDescription.bind(this);
    this.sellPost = this.sellPost.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.unlistPost = this.unlistPost.bind(this);
    this.buyPost = this.buyPost.bind(this);
  }

  getAccount() {
    WallLib.getAccount().then((account) => {
      this.setState({
        account
      })
    });
  }

  updatePosts(page) {
    WallLib.getPosts(page * postsPerPage, postsPerPage).then((posts) => {
      this.setState({posts});
    });
    WallLib.getPostsCount().then((count) => {
      this.setState({postsCount: count});
    });
  }

  createPost(text, font, color) {
    WallLib.createPost(text, font, color.r, color.g, color.b);
    if (this.state.posts.length < 10) {
      let posts = this.state.posts;
      posts.push({
        text,
        font,
        color,
        poster: this.state.account,
        price: 0,
        priceEther: 0,
        index: this.state.postsCount
      });
      this.setState({posts});
    }
  }

  changePost(data) {
    let index = _.findIndex(this.state.posts, {index: data.index});
    if (index != -1) {
      let posts = this.state.posts;
      posts[index] = _.assign(posts[index], data);
      this.setState({posts});
    }
  }

  updatePost(index, text, font, color) {
    WallLib.updatePost(index, text, font, color.r, color.g, color.b);
    this.changePost({index, text, font, color});
  }

  sellPost(index, price) {
    WallLib.listForSale(index, price);
    this.changePost({index, price});
  }

  unlistPost(index) {
    WallLib.unlistForSale(index);
    this.changePost({index, price: 0});
  }

  buyPost(index, price) {
    WallLib.buyPost(index, price);
    this.changePost({index, price: 0, poster: this.state.account});
  }

  handlePageChange(resp) {
    this.setState({
      currentPage: resp.selected
    });
    this.updatePosts(resp.selected);
  }

  handleScriptLoad() {
    let error = WallLib.init().then(() => {
      this.updatePosts(this.state.currentPage);
      this.getAccount();
    }).catch((err) => {
      switch (err) {
        case 1:
          this.setState({showMetaMask: true});
          this.setState({errorMsg: 'You need the Meta Mask extension to interact with this page'});
          break;
        case 2:
          this.setState({errorMsg: 'Set your Meta Mask network to Rospten Test Net'});
          break;
      }
    });
    
    
  }

  toggleDescription() {
    this.setState({showDescription: !this.state.showDescription});
  }

  render() {
    const posts = this.state.posts.map((post, i) => {
      return <Post
        key={i}
        color={post.color}
        text={post.text}
        index={post.index}
        font={post.font}
        account={this.state.account}
        poster={post.poster}
        fonts={fonts}
        onPostUpdated={this.updatePost}
        price={post.price}
        onSell={this.sellPost}
        onUnlist={this.unlistPost}
        onBuy={this.buyPost}
      />
    });

    return (
      <div>
        <Helmet>
        <title>Wall Smart Contract</title>
        </Helmet>
        <Script
          url="https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.34/dist/web3.min.js"
          onLoad={this.handleScriptLoad.bind(this)}
        />
        <div className="home-link">
          <a href="http://adamflesher.com">{"< back home"}</a>
        </div>
        <div className="wall">
          {this.state.errorMsg &&
            <div className="alert alert-danger" role="alert">
              {this.state.errorMsg}
            </div>
          }
          {this.state.showMetaMask &&
            <div>
              <a href="https://metamask.io/" target="_blank">
                <img src={MetaMaskImage} />
              </a>
            </div>
          } 
          <div className="description-wrapper">
            <button className="btn btn-secondary" type="button" onClick={this.toggleDescription} >
              Description
            </button>
            {this.state.showDescription &&
              <div className="card card-body">
                <p>
                  This is a sample application that allows users to post text to a wall using an Ethereum smart contract (on the Ropsten test network).
                  Users can write a line of text, with a desired color and font and append it to the bottom of the wall. Any user can also list a post slot
                  for sale. Once a slot is for sale any user can pay the asking price and take ownership of the slot.
                </p>
                <p>
                  This was only written as a demonstration of a smart contract based web application ...
                  it has no real world application :p
                </p>
              </div>
            }
          </div>
          <div className="paginate d-flex justify-content-center">
            <Paginate
              pageCount={Math.ceil(this.state.postsCount / 10)}
              onPageChange={this.handlePageChange}
              nextLabel=">"
              previousLabel="<"
            />
          </div>
          {posts}
          <CreatePost
            onPostCreated={this.createPost.bind(this)}
            fonts={fonts}
            title="Create new post"
            index={this.state.postsCount}
            confirmLabel="Create"
          />
        </div>
      </div>
    );
  }
}

export default Wall; 