'use strict';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


// Creating Classes
class Workout {
  date = new Date();

  // generally we create the id by using some third party library but in the code below
  // we are creating the id by using the current date and time
  // we are converting the current date and time to string and then we are slicing the last 10 characters from the string
  // date.now() will give us the timestamp of the current date and time
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    // we are calling the constructor function of the parent class by using the super keyword with the arguments that we want to pass in
    // the super keyword generates the this keyword
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  // we will create a method to calculate the pace of the workout
  calcPace() {
    // when we calculate the pace we will get the pace in min/km
    // so we will store the pace in the pace property of the object
    // we will call this method in the constructor function
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    // we are calling the constructor function of the parent class by using the super keyword with the arguments that we want to pass in
    // the super keyword generates the this keyword
    super(coords, distance, duration);
    this.elevationGainee = elevationGain;
    this.calcSpeed();
  }

  // we will create a method to calculate the speed of the workout
  calcSpeed() {
    // when we calculate the speed we will get the speed in km/h
    // so we will store the speed in the speed property of the object
    // we will call this method in the constructor function
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

// Application Architecture

// Using the Geolocation API
// navigator.geolocation is a global object that is available in the browser and it allows us to get the current position of the user and ask for the current position of the user
// getCurrentPosition() is a method that takes two callback functions as input and the first function is the success callback function and that will be called as soon as the position is successfully received
// The callback function will then receive a position object as an input and that object will contain all the information about the user's position
// and the second function is the error handler function and that will be called if something goes wrong when trying to get the position

// we are defining the global variable map and mapEvent because we will be using them in the other functions as well

// now since the map and mapEvent will be used in App class we will define them as properties of the class
// because when we create a new object from the App class, this properties will be instance to those objects
// lets create private properties for the class
// let map, mapEvent;
class App {
  #map;
  #mapEvent;
  // it will store the workouts that we create
  #workouts = [];
  constructor() {
    // this here refers to the object that is created by the App class
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    // we are not calling the this._loadMap function directly because we want to call it as a callback function and we dont want to call it immediately
    // we want to call it only when we have the position and getCurrentPosition will call it for us
    // if we only use this._loadMap then it will act as a regular function call which is called by the getCurrentPosition function when it get the position
    // and the this keyword on a regular function call will be undefined
    // so we need to find a way to point that the this._loadMap function is a method of the App class and we can do that by using the bind method
    // the bind method will return a new function where the this keyword will be bound to whatever value we pass into the bind method
    // the this value that we passed in the bind method will be represent the App
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
      alert('Could not get your position');
    });
  };
  _loadMap(position) {

    // console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    // in the code below we are using the leaflet library to display the map
    // the first argument which is in the map method is the id of the element where we want to render the map
    // L is the namespace for all the leaflet library which is available in the global scope and gives us some methods to work with the map
    // the another argument is the object which contains the center of the map and the zoom level
    // the setView method is used to set the center of the map and the zoom level
    // we are storing the map object in the map variable because we will be using different methods on that object later on
    // we will use this.#map to define the property to the created object
    console.log(this);
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);



    // Handling clicks on the map
    // the on method is used to add an event listener to the map object instead of addEventListener method because the leaflet library is using the on method
    // the first argument is the event name and the second argument is the callback function
    // the e object contains the information about the event
    this.#map.on('click', this._showForm.bind(this));

  };
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  };

  _toggleElevationField() {
    // we will basically change the placeholder and the label of the input fields based on the type of workout
    // we will use the closest method to get the parent element of the inputType field which is the form element
    // the closest method will return the closest element that matches the selector that we pass in
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  };

  _newWorkout(e) {

    // we are creating a variable called workout and we will store the new object in that variable and  later we will push that object into the workouts array
    let workout;
    // we are preventing the default behaviour of the form which is to reload the page
    e.preventDefault();

    // we will create a helper function to check if the data is valid
    // here the rest parameter(...inputs) will return and array and we can use the array method called every to check if all the elements in the array are finite numbers
    // the every method will loop over the array in each element and it will return true if all the elements in the array are finite numbers
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    // another helper function to check if the data is positive
    // the below code will return true if all the elements in the array are positive numbers
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    // console.log(validInputs(10, 20, 30, 'j'));

    // get the data from the form
    const type = inputType.value;
    // we need to change the type of the data to Number that we get from the input fields because the data that we get from the input fields is a string
    // we can do that by + sign or by using the Number function
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    // if workout type is running then create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      // we will use guard clause to check if the data is valid
      // guard clause is a conditional statement that will return the function if the condition is not met
      // if the condition is met then the code below the guard clause will be executed
      // if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) {
      //   return alert('input has to be a positive number');
      // }
      // we can also use the helper function that we created above to check if the data is valid
      if (!validInputs(distance, duration, cadence) || !allPositive(duration, distance, cadence)) return alert('input has to be a positive number');

      // now we will create a new object from the Running class and
      workout = new Running([lat, lng], distance, duration, cadence);
      // now we will push the object into the workouts array
      this.#workouts.push(workout);
      // console.log(workout);
    }


    // if workout type is cycling then create cycling object
    if (type === 'cycling') {

      const elevation = +inputElevation.value;
      // check if data is valid
      if (!validInputs(distance, duration, elevation) || !allPositive(duration, distance)) return alert('input has to be a positive number');

      // now we will create a new object from the Cycling class and store it in the workout variable
      workout = new Cycling([lat, lng], distance, duration, elevation);
      // now we will push the object into the workouts array
      this.#workouts.push(workout);
    }

    // add new object to workout array


    // clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    // the thing is we dont have access anymore to the variable called mapE and map because they are not in the scope of this function
    // they are in the scope of the callback function of the getCurrentPosition method
    // console.log(mapEvent);

    // displaying the marker on the map

    L.marker([lat, lng]).addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup'
      }))
      .setPopupContent('Workout')
      .openPopup();
  }
};

// we need to create an object so that the app class is instantiated and the constructor function is called

const app = new App();
// we know that as soon as we create an object the constructor function is called so instead of doing as code below
// we can simply call the _getPostion method on the constructor function
// because we need to load the map as soon as the object is created
// app._getPosition();

// now we will use the event listener for form subission
// we dont have any submit button in the form but we can do that by using the enter key
// the submit event will be fired as soon as we press the enter key

// whenever use hit the enter key the form will be submitted and the marker will be added to the map where we want to add the workout
// form.addEventListener('submit', app._newWorkout.bind(app));

// now we will add the functionality to the form to change the input fields based on the type of workout
// we will listen to the change that happens in the inputType field
// the change event will be fired whenever we change the value of the inputType field

// inputType.addEventListener('change', app._toggleElevationField.bind(app));
