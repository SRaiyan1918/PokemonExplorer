import React, { Component } from 'react';
import '../theme.css';

export class NewsItems extends Component {
  render() {
    const { name, imgUrl, type} = this.props;
    return (
      <div
        className="card my-2"
        style={{
          width: "18rem",
        }}
      >
        <img src={imgUrl} className="card-img-top" alt={name} />
        <div className="card-body">
          <h5 className="card-title">
            <b>Name: </b>{name}
          </h5>
	  <hr />
          <p className="card-text">
            <b>Type: </b>{type}
          </p>
	  <hr />
          <p className="card-text">
            
          </p>
        </div>
      </div>
    );
  }
}

export default NewsItems;
