var React = require('react');
var ReactDOM = require('react-dom');
var CSSTransitionGroup = require('react-addons-css-transition-group');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation; //mixin

var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var Catalyst = require('react-catalyst');

var h = require('./helpers');

//Firbase

/*var Rebase = require('re-base');
var base = Rebase.createClass('https://catch-of-the-day-6752f.firebaseio.com/');*/
/*
  App
*/
var App = React.createClass({
  mixins : [Catalyst.LinkedStateMixin],
  getInitialState : function () {
    return {
      fishes : {},
      order : {}
    }
  },
  /*
    log component at first
  */
  componentDidMount : function () {
    //console.log('log  component');
    base.syncState(this.props.params.storeId + '/fishes', {
      context : this,
      state : 'fishes'
    });

    var localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);
    if (localStorageRef) {
      //update our local component state to what is in localstorage
      this.setState({
        order : JSON.parse(localStorageRef)
      })
    }
  },
  /*
    opportunity to perform preparation before update 
  */
  componentWillUpdate : function (nextProps, nextstate) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextstate.order));

  },
  addFish : function(fish) {
    var timestamp = (new Date()).getTime();
    // update the state object
    this.state.fishes['fish-' + timestamp] = fish;
    //set the state
    this.setState({fishes : this.state.fishes});
  },
  removeFish : function (key) {
    if (confirm('Are you sure you want to remove this fish?')) {
        this.props.fishes[key] = null;
        this.setState({
        fishes : this.state.fishes
      });
    } 
  },
  addToOrder : function (key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({order : this.state.order});
  },
  removeFromOrder : function (key) {
    delete this.state.order[key];
    this.setState({
      order : this.state.order
    });
  },
  loadSamples : function () {
    this.setState({
      fishes : require('./sample-fishes')
    });
  },
  renderFish : function (key) {
    return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
  },
  render : function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
        <Header tagline="Fresh Sea Food Market"/>
        <ul className='list-of-fishes'>
          {Object.keys(this.state.fishes).map(this.renderFish)}
        </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order} removeFromOrder={this.removeFromOrder} />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState={this.linkState} removeFish={this.removeFish} />
      </div>
    )
  }
});

/*
  Fish component
  <Fish />
*/

var Fish = React.createClass({
  onButtonClick : function () {
    var key = this.props.index;
    this.props.addToOrder(key);
  },
  render : function () {
    var details = this.props.details;
    var isAvailable = (details.status === 'available' ? true : false);
    var buttonText = (isAvailable ? 'Add To Order' : 'Sold Out');
    return (
      <li className='menu-fish'>
        <img src={details.image} alt={details.name} />
        <h3 className='fish-name'>
          {details.name}
          <span className='price'>{h.formatPrice(details.price)} </span>
        </h3>
        <p>{details.desc}</p>
        <button disabled={!isAvailable} onClick={this.onButtonClick} >{buttonText}</button> 
      </li>
    )
  }
});

/*

AddFishForm
*/

var AddFishForm = React.createClass({
  createFish : function(event) {
    //1. stop the form from submitting
    event.preventDefault();
    //2. Take the data from the form and create object
    var fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value
    }
    console.log(fish);
    //Add the fish to the App state
    this.props.addFish(fish);
  },
  render : function () {
    return (
      <form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
            <input type="text" ref="name" placeholder="Fish Name"/>
            <input type="text" ref="price" placeholder="Fish Price" />
            <select ref="status">
              <option value="available">Fresh!</option>
              <option value="unavailable">Sold Out!</option>
            </select>
            <textarea type="text" ref="desc" placeholder="Desc"></textarea>
            <input type="text" ref="image" placeholder="URL to Image" />
            <button type="submit">+ Add Item </button>
          </form>
      )
  }
});

/*
<Header />
Header
*/
var Header = React.createClass({
  render : function () {
    console.log(this.props)
    return (
      <header className="top">
        <h2>Catch
        <span className="ofThe">
          <span className="of"> Of </span>
          <span className="the">The </span>
        </span> 
        Day</h2>
        <h3 className="tagline"> <span>{this.props.tagline} </span></h3>
      </header>
    )
  }
});

/*
<Order />
Order
*/
var Order = React.createClass({
  renderOrder : function (key) {
    var fish = this.props.fishes[key];
    var count = this.props.order[key];
    var removeButton = <button onClick={this.props.removeFromOrder.bind(null, key)}>&times;</button>

    if (!fish) {
      return <li key={key}>Sorry, fish no longer available {removeButton}</li>
    }
    return (
      <li key={key}>
        {count} lbs
        {fish.name}
        <span className='price'> {h.formatPrice(count * fish.price)} </span>
        {removeButton}
      </li>
      )
  },

  render : function () {
    var orderIds = Object.keys(this.props.order);

    var total = orderIds.reduce((prevTotal, key) => {
      var fish = this.props.fishes[key];
      var count = this.props.order[key];
      var isAvailable = fish && fish.status === 'available';

      if (fish && isAvailable) {
        return prevTotal + (count * parseInt(fish.price) || 0);
      }

      return prevTotal
    },0);

    return (
      <div className='order-wrap'>
        <h2 className='order-title'>Your Order</h2>
        <CSSTransitionGroup 
          className='order' 
          component='ul'
          transitionName='order'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          >
          {orderIds.map(this.renderOrder)}
          <li className='total'>
            <strong>Total:</strong>
            {h.formatPrice(total)}
          </li>
        </CSSTransitionGroup>
      </div>
    )
  }
});

/*
<Inventory />
Inventory
*/
var Inventory = React.createClass({
  renderInventory : function (key) {
    var linkState = this.props.linkState;
    return (
      <div className='fish-edit' key={key}>
        <input type="text" valueLink={linkState('fishes.'+ key + '.name')} />
        <input type="text" valueLink={linkState('fishes.'+ key + '.price')} />
        <select valueLink={linkState('fishes.'+ key + '.status')}>
          <option value="unavailable">Sold Out</option>
          <option value="available">In Stock</option>
        </select>
        <textarea valueLink={linkState('fishes.'+ key + '.desc')}></textarea>
        <input type="text" valueLink={linkState('fishes.'+ key + '.image')}/>
        <button onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
      </div>
      )
  },
  render : function () {
    return (
      <div>
        <h3> Inventory </h3>
        {Object.keys(this.props.fishes).map(this.renderInventory)}

        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}> Load Fish Samples</button>
      </div>
    )   
  }
});



/*
  StorePicker
  this will let us create <StorePicker/>
*/

var StorePicker = React.createClass({
  mixins : [History],
  goToStore : function (event) {
    event.preventDefault();
    //get data from input
    var storeId = this.refs.storeId.value;
    this.history.pushState('null', '/store/' + storeId);
  },
  render : function () {
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please Enter A Store</h2>
        <input type="text" ref="storeId" defaultValue={h.getFunName()} required/>
        <input type="submit" />
      </form>
      )
  }
});

/*
  Not Found
*/

var NotFound = React.createClass({
  render : function() {
    return <h2> Not Found ! </h2>
  }
});


/*
  Routes
*/

var routes = (
  <Router>
    <Route path="/" component={StorePicker}/>
    <Route path="store/:storeId" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>

)



ReactDOM.render(routes, document.querySelector('#main'));
