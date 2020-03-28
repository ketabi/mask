export const FETCH_REQUEST   = 'FETCH_REQUEST';
export const FETCH_SUCCESS   = 'FETCH_SUCCESS';
export const FETCH_ERROR   = 'FETCH_ERROR';

const fetchDataRequest = () => ({
  type: FETCH_REQUEST
});

const fetchDataSuccess = (payload) => ({
  type: FETCH_SUCCESS,
  payload
});

const fetchDataError = () => ({
  type: FETCH_ERROR
});

export function fetchData() {
  const URL = "http://185.97.116.63:8001/data/infected.json";
  return dispatch => {
    dispatch(fetchDataRequest());
    return fetch(URL)
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchDataSuccess(json));
        return json;
      })
      .catch(error => dispatch(fetchDataError(error)));
  };
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}