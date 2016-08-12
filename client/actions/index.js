import axios from 'axios';
import { browserHistory } from 'react-router';

export const MAP_CENTER = 'MAP_CENTER';
export const SELECT_EVENT = 'SELECT_EVENT';
export const CREATE_EVENT = 'CREATE_EVENT';
export const GET_ALL_EVENTS = 'GET_ALL_EVENTS';
export const AUTH_USER = 'AUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const UNAUTH_USER = 'UNAUTH_USER';
export const GET_EVENTS_BY_USER_ID = 'GET_EVENTS_BY_USER_ID';
export const ALL_GENRES = 'ALL_GENRES';
export const ALL_RESTRICTIONS = 'ALL_RESTRICTIONS';


export const getEventsByUserId = (userId) => {
  console.log('before axios in events user id: ', userId);
  return axios.get(`/api/event/users/${userId}`)
    .then((response) => {
      return {
        type: GET_EVENTS_BY_USER_ID,
        payload: response,
      };
    })
    .catch((err) => {
      if (err) { console.log('err getting user events', err); }
    });
};


/** *************** AUTHENTICATIONS *********************/

export const SignInFunc = (props) => {
  const email = props.email;
  const password = props.password;
  return (dispatch) => {
    console.log('PROOOOOOOPS ');
    return axios({
      method: 'POST',
      url: '/api/auth/login',
      data: {
        email,
        password,
      },
    })
      .then((response) => {
      // console.log("RESPOOOOOOOONSE: ", response);
        console.log('HELLLLOOOOOOOOOOO', response);
      // dispatch action to update state to indicate that user is authenticate
        dispatch({
          type: AUTH_USER,
        });
        browserHistory.push('/');
      // save token to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);

        return getEventsByUserId(response.data.user.id)
          .then((action) => {
            dispatch(action);
            browserHistory.push('/dashboard');
          });
      })
      .catch(() => {
        dispatch({
          type: AUTH_ERROR,
          payload: 'Invalid email or password',
        });
      });
  };
};

export const SignUpFunc = (props) => {
  const firstName = props.firstName;
  const lastName = props.lastName;
  const address = props.address;
  const phoneNumber = props.phoneNumber;
  const userName = props.userName;
  const email = props.email;
  const password = props.password;

  return (dispatch) => {
    return axios({
      method: 'POST',
      url: '/api/auth/signup',
      data: {
        firstName,
        lastName,
        address,
        phoneNumber,
        userName,
        email,
        password,
      },
    })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('id', response.data.result.id);
        dispatch({
          type: AUTH_USER,
        });
        browserHistory.push('/');
      })
      .catch((err) => {
        console.log('ERROR', err);
        dispatch({
          type: AUTH_ERROR,
        });
      });
  };
};

export const SignOutFunc = () => {
  localStorage.removeItem('token');
  return {
    type: UNAUTH_USER,
  };
};

/** ********************* CHEF DASHBOARD ***********************/

export const PastEventFunc = () => {
  // get request to db to fetch list of past events the user hosts
};

export const UpcomingEventFunc = () => {
  // get request to db to fetch list of upcoming events the user hosted
};

export const SelectedChefEvent = () => {
  // selected event in chef dash
};

/** ****************** HELPER ********************/

export const convertAddress = (address) => {
  let response;
  let coordinate;

  return axios({
    method: 'GET',
    url: 'https://maps.googleapis.com/maps/api/geocode/json',
    params: {
      address,
      key: 'AIzaSyDXLvbYh4moubEU_ChyobbXbC8b6EMSrKs',
    },
  })
    .then((payload) => {
      response = payload.data.results[0].geometry.location;
      coordinate = {
        latitude: response.lat,
        longitude: response.lng,
        address,
      };
      return {
        data: coordinate,
      };
    })
    .catch((err) => {
      console.log('ERROR ', err);
    });
};

/** ***************** EVENT FUNC ***********************/

export const getAllEvents = (locationObj) => {
  return axios.get('/api/event/location', {
    params: locationObj,
  });
};

export const getAllInRadius = (query, params) => {
  console.log('IN GETALLINRADIUS...searchParams =', params);
  console.log('IN GETALLINRADIUS...query =', query);
  return function (dispatch) {
    convertAddress(query)
      .then((response) => {
        const locationObj = {
          latitude: response.data.latitude,
          longitude: response.data.longitude,
        };
        dispatch({
          type: MAP_CENTER,
          payload: locationObj,
        });
        getAllEvents(locationObj)
          .then((events) => {
            dispatch({
              type: GET_ALL_EVENTS,
              payload: events.data,
            });
          });
      })
      .catch((err) => {
        if (err) {
          console.log('error searching location from actions searchLocation', err);
        }
      });
    browserHistory.push('home');
  };
};

export const selectEvent = (event) => {
  return {
    type: SELECT_EVENT,
    payload: event,
  };
};

export const createEvent = (props) => {
  console.log('PROOOOOPS: ', props);
  const targetAddress = props.address + props.city + props.usState;
  return convertAddress(targetAddress)
    .then((payload) => {
      const address = payload.data.address;
      const latitude = payload.data.latitude;
      const longitude = payload.data.longitude;
      const coords = {
        address,
        latitude,
        longitude,
      };
      return coords;
    }).then((coords) => {
      console.log('PIC PARAAAAAMS: ', props.picture[0]);
      const data = new FormData();
      data.append('file', props.picture[0]);
      const opts = {
        transformRequest() { return data; },
      };
      axios.post('/api/event/picture', data, opts).then((resp) => {
        const url = resp.data;
        console.log(url, 'SUPPOSED URL');
        const output = {
          address: coords.address,
          latitude: coords.latitude,
          longitude: coords.longitude,
          url };
        return output;
      }).then((output) => {
        console.log(output, 'OUUUUUUUUTPPPPPPPOUUUUUUUUT');
        const params = {
          eventName: props.eventName,
      // foodType?? glutenFree, vegetarian, vegan??
          description: props.description,
          eventPic: output.url,
          price: props.price,
          maxGuests: props.maxGuest,
      // guestDecide??
          address: output.address,
          latitude: output.latitude,
          longitude: output.longitude,
          startDatetime: props.start,
          endDatetime: props.end,
        };

        console.log('PARAMSSSSSS', params);

        const request = axios.post('/api/event/', params);
        return {
          type: 'CREATE_EVENT',
          payload: request,
        };
      })
        .then(() =>
      browserHistory.push('/')
    )
        .catch((err) => {
          console.log('ERROR', err);
    // return {
    //   type: '??????????',
    //   payload: '??????????'
    // };
        });
    });
};

/** ***********Tags*******************/

export const getAllTags = () => {
  console.log('inside getAllTags....');
  return axios.get('/api/tag')
    .then((tags) => {
      console.log('tags=====', tags);
      const restrictions = tags.data.filter(tag => tag.restriction);
      const genres = tags.data.filter(tag => !tag.restriction);
      return function (dispatch) {
        dispatch({
          type: ALL_RESTRICTIONS,
          payload: restrictions,
        });
        dispatch({
          type: ALL_GENRES,
          payload: genres,
        });
      };
    })
    .catch((err) => {
      console.log('error in getAllTags:', err);
    });
};
