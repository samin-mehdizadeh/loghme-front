import React from 'react';
import ReactDOM from 'react-dom';
import logo from '../images/LOGO.png';
import '../css/home.css';
import {Restaurant} from './Restaurant';
import {FoodModal} from './FoodModal'
import {Header} from './Header'

export function foodPartySet (id){
    fetch('http://localhost:8080/IE/getDiscountFoods')
        .then(resp => resp.json())
        .then(data => {
                ReactDOM.render(<FoodParty discounts={data} />,document.getElementById(id))
            }
        )
}


export class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            restaurants : [],
        };
    }
    render(){
        return (

            <div>
                <Header page="home" />
                <HomeDescription />
                <div id="party-box">
                    {foodPartySet ("party-box")}
                </div>
                <div id="restaurants-container">
                    <div class="titre">رستوران ها</div>
                    <div id="restaurants">
                        {this.state.restaurants.map(function (restaurants,index) {
                                return <RestaurantIcon restaurantid={restaurants.id} restaurantname={restaurants.name} restaurantlogo={restaurants.logo} />
                            }

                        )}
                    </div>
                </div>
                <div id="footer">
                    &copy; تمامی حقوق متعلق به لقمه است
                </div>

            </div>
        );
    }

    componentDidMount() {
        fetch('http://localhost:8080/IE/restaurants')
            .then(resp => resp.json())
            .then(data => this.setState(prevState => ({
                    restaurants: data,
                }
            )));

    }




}

export class RestaurantIcon extends React.Component{
    constructor (props){
        super(props);
        this.showMenu = this.showMenu.bind(this);
        this.state = {
            restaurantname : this.props.restaurantname,
            restaurantlogo : this.props.restaurantlogo,
            restaurantid: this.props.restaurantid,
        };
    }

    showMenu(event, id){
        ReactDOM.render(
            <Restaurant id={id} />,
            document.getElementById('root')
        );
    }
    render(){
        return(
            <div class="restaurant rounded">
                <img src={this.state.restaurantlogo} alt="Logo" id="logo" class="rounded mx-auto d-block" />
                <div class="restaurantname">{this.state.restaurantname}</div>
                <button class="form-button rounded" type="submit" onClick={(e) => this.showMenu(e, this.props.restaurantid)}>نمایش منو</button>
            </div>

        );

    }
}


export class HomeDescription extends React.Component{

    render(){
        return(
            <div class="home-logo-environment">
                <div id="content">
                    <div id="description">
                        <img src={logo} alt="Logo" id="logo" class="rounded mx-auto d-block" />
                        اولین و بزرگ ترین وب سایت سفارش آنلاین غذا در دانشگاه تهران
                    </div>
                    <div id="serach-box">
                        <div>
                            <input class="rounded" type="text" placeholder="نام غذا" />
                            <input class="rounded" type="text" placeholder="نام رستوران" />
                            <button class="form-button rounded" type="submit">جست و جو</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export class FoodParty extends React.Component{
    myInterval = 0;
    constructor(props) {
        super(props);
        this.state = {
            discountFoods : [],
            time : 0,
        };
    }
    render(){
        var discountfoods = this.props.discounts;
        return(
            <div id="food-party">
                <div class="titre">جشن غذا!</div>
                <div class="rounded timer">زمان باقی مانده: &nbsp;<span >{Math.floor((this.state.time) / 60)}</span>:<span>{(this.state.time) % 60}</span>&nbsp;</div>
                <div class="scrollmenu">
                    {discountfoods.map(function (discountfoods,index) {
                            return <DiscountFood discountfood={discountfoods} />
                        }
                    )}
                </div>
            </div>
        );
    }

    getTime() {
        fetch('http://localhost:8080/IE/getFoodPartyTime')
            .then(resp => resp.json())
            .then(data => this.setState(prevState => ({
                    time: data.remainingTime,
                }
            )));
    }

    componentDidMount() {
        foodPartySet("party-box")
        this.getTime()
        this.myInterval = setInterval(() => {
            if(document.getElementById("party-box")) {
                this.getTime()
                if (this.state.time === 85 || this.state.time === 1) {
                    foodPartySet("party-box")
                }
            }
            else{
                clearInterval(this.myInterval)
            }

        }, 1000);
    }
}


export class DiscountFood extends React.Component {

    constructor(props) {
        super(props);
        this.addToCart = this.addToCart.bind(this);
        this.showModal = this.showModal.bind(this);
        this.state = {
            count: this.props.discountfood.discountFood.count,
            addToCartMsg: '',
            modalShow: false,
        };
    }

    addToCart(event, restaurantid, foodname) {
        event.preventDefault();
        var params = {
            "id": restaurantid,
            "food": foodname,
            "count": 1,
        };
        var queryString = Object.keys(params).map(function (key) {
            return key + '=' + params[key]
        }).join('&');
        const requestOptions = {
            method: 'POST',
            headers: {
                'content-length': queryString.length,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: queryString
        };

        fetch('http://localhost:8080/IE/addDiscountFoodToBasket', requestOptions)
            .then(response => response.json())
            .then(data => {
                this.setState(prevState => ({addToCartMsg: data.message,}));
                window.alert(this.state.addToCartMsg);
            });

    }


    showModal() {
        this.setState(prevState => ({modalShow: true}))
    }

    render() {
        let backgroundColor = '#4ECCC3';
        let disabled = false;
        let text = 'موجودی: ' + this.props.discountfood.discountFood.count;
        let modalClose = () => this.setState({modalShow: false})
        if (this.props.discountfood.discountFood.count === 0) {
            backgroundColor = '#B8B8B8';
            disabled = true;
            text = 'ناموجود';
        }
        return (
            <div class="discountFood rounded">
                <div class="restaurant-photo-name">
                    <img src={this.props.discountfood.discountFood.image} onClick={this.showModal}
                         alt="discountFoodImage" id="discountFoodImage" class="rounded mx-auto d-block square"/>
                    <div
                        class="discountFoodName">{this.props.discountfood.discountFood.name}<br/> {this.props.discountfood.discountFood.popularity} ⭐
                    </div>
                </div>
                <div class="prices">
                    <span class="old-Price">{this.props.discountfood.discountFood.oldPrice}</span> &nbsp; &nbsp;
                    <span>{this.props.discountfood.discountFood.price}</span>
                </div>
                <div class="buttons">
                    <span class="remained rounded">{text}</span> &nbsp;
                    <button style={{backgroundColor: backgroundColor}} disabled={disabled} class="form-button rounded"
                            type="submit"
                            onClick={(e) => this.addToCart(e, this.props.discountfood.ownerRestaurant.id, this.props.discountfood.discountFood.name)}>خرید
                    </button>

                </div>
                <div dir="rtl" class="restaurantName">
                    {this.props.discountfood.ownerRestaurant.name}
                </div>
                <FoodModal show={this.state.modalShow} onHide={modalClose}
                           rname={this.props.discountfood.ownerRestaurant.name}
                           rid={this.props.discountfood.ownerRestaurant.id}
                           price={this.props.discountfood.discountFood.price}
                           oldPrice={this.props.discountfood.discountFood.oldPrice}
                           type="party" count={this.props.discountfood.discountFood.count}
                           image={this.props.discountfood.discountFood.image}
                           description={this.props.discountfood.discountFood.description}
                           name={this.props.discountfood.discountFood.name}
                           popularity={this.props.discountfood.discountFood.popularity}
                />

            </div>

        );

    }
}