import React from "react";
import CreatePost from "./CreatePost.jsx";

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      salePrice: ''
    }

    this.handleEdit = this.handleEdit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSell = this.handleSell.bind(this);
    this.handleUnlist = this.handleUnlist.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.handleBuy = this.handleBuy.bind(this);
  };

  handleEdit() {
    this.setState({editing: true});
  }

  handleUpdate(text, font, color) {
    this.props.onPostUpdated(this.props.index, text, font, color);
    this.setState({editing: false});
  }

  handleCancel() {
    this.setState({editing: false});
  }

  handleSell() {
    this.props.onSell(this.props.index, this.state.salePrice);
  }

  handleUnlist() {
    this.props.onUnlist(this.props.index);
  }

  handlePriceChange(event) {
    this.setState({salePrice: event.target.value});
  }

  handleBuy() {
    this.props.onBuy(this.props.index, this.props.price);
  }


  render() {
    return (
      <div>
        {!this.state.editing &&
          <div className="wall-post clearfix">
            <div style={{color: `rgb(${this.props.color.r},${this.props.color.g},${this.props.color.b})`, fontFamily: this.props.fonts[this.props.font]}}>
              <div className="index" style={{borderColor: `rgb(${this.props.color.r},${this.props.color.g},${this.props.color.b})`}}>
                {this.props.index}
              </div>
              <div className="text">
                {this.props.text}
              </div>
            </div>
            <div className="post-buttons">
              {this.props.price > 0 && !this.props.hideActions && this.props.poster != this.props.account &&
                <div>
                  <button type="button" className="btn btn-success" onClick={this.handleBuy}>Buy: {this.props.price} Ether</button>
                </div>
              }
              {!this.props.hideActions && this.props.poster == this.props.account &&
                <div className="form-group">
                    <button type="button" className="btn btn-info" onClick={this.handleEdit}>Edit</button>
                    {this.props.price == 0 && <input type="textbox" placeholder="Ether" className="form-control" value={this.state.salePrice} onChange={this.handlePriceChange} />}
                    {this.props.price == 0 && <button type="button" className="btn btn-primary" onClick={this.handleSell}>Sell</button>}
                    {this.props.price != 0 && <button type="button" className="btn btn-warning" onClick={this.handleUnlist}>Cancel: {this.props.price} Ether </button>}
                </div>
              }
            </div>
          </div>
        }
        {this.state.editing &&
          <CreatePost
            onPostCreated={this.handleUpdate}
            fonts={this.props.fonts}
            title="Change your post"
            index={this.props.index}
            confirmLabel="Update"
            showCancel={true}
            handleCancel={this.handleCancel}
            text={this.props.text}
            font={this.props.font}
            color={this.props.color}
          />
        }
      </div>
    );
  }
}

export default Component;