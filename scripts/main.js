var React = require('react');
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation; //mixin

var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');
/*
	App
*/
var App = React.createClass({

	render : function() {
		return (
			<div className="catch-of-the-day">
				<div className="menu">
				<Header tagline="Fresh Sea Food Market"/>
				</div>
				<Order />
				<Inventory />
			</div>
		)
	}
});

/*

AddFishForm
*/

var AddFishForm = React.createClass({
	render : function () {
		return (
			<h2>Testing add fish form</h2>
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
	render : function () {
		return (
			<p> Order </p>
		)
	}
});

/*
<Inventory />
Inventory
*/
var Inventory = React.createClass({
	render : function () {
		return (
			<div>
				<h3> Inventory </h3>
				<AddFishForm />
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
