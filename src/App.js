import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { post } from 'jquery';
import Popper from 'popper.js'
import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="App">
       <Router>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a className="navbar-brand" href="#">Horti</a>
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon"></span>
  </button>

  <div className="collapse navbar-collapse" id="navbarSupportedContent">
    <ul className="navbar-nav mr-auto">
      <li className="nav-item active">
        <Link className="nav-link" to='/'>Home</Link>
      </li>
      <li className="nav-item">
      <Link className="nav-link" to='/sell'>Sell you produce</Link>
      </li>
    </ul>
    <form className="form-inline my-2 my-lg-0">
      <input className="form-control mr-sm-2" type="search" id="search" placeholder="Search" aria-label="Search"/>
      <Link className="btn btn-outline-success my-2 my-sm-0" to="/search" >Search</Link>
    </form>
  </div>
</nav>
<Switch>
    <Route exact path='/' component={Home}></Route>
    <Route exact path='/sell' component={Home}></Route>
    <Route exact path='/search' component={Search}></Route>

    {/* <Route exact path='/template/test' component={}></Route> */}
    {/* <Route exact path="/user/login" component={LogIn}></Route> */}
</Switch>
</Router>
    </div>
  );
}


class Search extends Component {
  constructor(){
    super();
    this.state={posts:[]}

  }
  componentDidMount=async()=>{

    let title=document.querySelector("#search").value
    let posts=await fetch("http://localhost:9000/search/"+title)
    posts=await posts.json()
    console.log(posts.posts)
    this.setState({posts:posts.posts},()=>{
      document.querySelector("#search").value=""
    })


  }
  render() { 
    let {posts}=this.state
    return ( 
      <div className="mt-4" style={{position:"absolute", left:"15%", width:"30%"}}>
      {posts.map((post,id)=>{
      return <div>
      <div className="d-flex flex-row align-items-center pt-2 mb-n1" style={{borderTop:"2px solid gray",borderRight:"2px solid gray",borderLeft:"2px solid gray", borderTopLeftRadius:"20px",borderTopRightRadius:"20px"}}>
          <div className="row ml-2" >
          <img src="https://img.icons8.com/windows/32/000000/user-male-circle.png" style={{width:"40px"}}/>              </div>
          <div className="row ml-4" style={{fontSize:"20px"}}>
            {`${post.user.user_name}`}
          </div>
        </div>
      <div className="card  mb-5 pt-3" key={`${id}`} style={{borderBottom:"2px solid gray",borderRight:"2px solid gray",borderLeft:"2px solid gray",borderTop:"none",borderBottomLeftRadius:"20px",borderBottomRightRadius:"20px"}} >
        <img className="card-img-top" src={`${post.item.item_id}.png`} alt="Card image cap" style={{width:"100%"}}/>
        <div className="card-body">
          <h5 className="card-title" style={{fontWeight:"bold"}}>{`${post.item.item_name}`}</h5>
          {post.item.category_id===1?<p className="card-text">{`${post.descp}`}</p>:<p className="card-text">{`${post.item.descp}`}</p>}
          
          <div className="d-flex flex-row justify-content-around">
            <p className="card-text col" style={{}}>Price: {`${post.item.price}`}</p>
            <p className="card-text col" style={{}}>In Stock: {`${post.item.stock}`}</p>
          </div>
          <div className="d-flex flex-row justify-content-between align-items-center">
            <p className="text col ml-n5" style={{}}><img src="https://img.icons8.com/dusk/64/000000/facebook-like.png"/> <span>{`${post.likes}`}</span></p>
            <button type="button" class="btn btn-dark" style={{width:"170px", fontSize:"30px"}}>Buy</button>
          </div>
        </div>
      </div>
      </div>
      })
      }
    </div>
     );
  }
}
 
class Home extends Component {
  constructor(){
    super();
    this.state={posts:[]}

  }

  componentDidMount=async ()=>{

    let res=await fetch("http://localhost:9000/user/login",{
      method:"post",
      credentials:"include",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        "username":"zidee",
        "password":"zide"

      })
    })
    res=await res.json()
    console.log(res)

    let posts=await fetch("http://localhost:9000/feed/posts/"+res.userid)
    posts=await posts.json()
    console.log(posts.posts)
    this.setState({posts:posts.posts})

  }
  render() { 
    let {posts}=this.state
    return ( 
      <React.Fragment>
        <div className="mt-4" style={{position:"absolute", left:"15%", width:"30%"}}>
          {posts.map((post,id)=>{
          return <div>
          <div className="d-flex flex-row align-items-center pt-2 mb-n1" style={{borderTop:"2px solid gray",borderRight:"2px solid gray",borderLeft:"2px solid gray", borderTopLeftRadius:"20px",borderTopRightRadius:"20px"}}>
              <div className="row ml-2" >
              <img src="https://img.icons8.com/windows/32/000000/user-male-circle.png" style={{width:"40px"}}/>              </div>
              <div className="row ml-4" style={{fontSize:"20px"}}>
                {`${post.user.user_name}`}
              </div>
            </div>
          <div className="card  mb-5 pt-3" key={`${id}`} style={{borderBottom:"2px solid gray",borderRight:"2px solid gray",borderLeft:"2px solid gray",borderTop:"none",borderBottomLeftRadius:"20px",borderBottomRightRadius:"20px"}} >
            <img className="card-img-top" src={`${post.item.item_id}.png`} alt="Card image cap" style={{width:"100%"}}/>
            <div className="card-body">
              <h5 className="card-title" style={{fontWeight:"bold"}}>{`${post.item.item_name}`}</h5>
              {post.item.category_id===1?<p className="card-text">{`${post.descp}`}</p>:<p className="card-text">{`${post.item.descp}`}</p>}
              
              <div className="d-flex flex-row justify-content-around">
                <p className="card-text col" style={{}}>Price: {`${post.item.price}`}</p>
                <p className="card-text col" style={{}}>In Stock: {`${post.item.stock}`}</p>
              </div>
              <div className="d-flex flex-row justify-content-between align-items-center">
                <p className="text col ml-n5" style={{}}><img src="https://img.icons8.com/dusk/64/000000/facebook-like.png"/> <span>{`${post.likes}`}</span></p>
                <button type="button" class="btn btn-dark" style={{width:"170px", fontSize:"30px"}}>Buy</button>
              </div>
            </div>
          </div>
          </div>
          })
          }
        </div>

      </React.Fragment>
     );
  }
}
 
export default App;
