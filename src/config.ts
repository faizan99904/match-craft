const BASE_URL_API = 'https://traidee.onrender.com';

export const CONFIG = {
  login: BASE_URL_API + '/api/auth/login',
  getEvents: BASE_URL_API + '/api/event/allevent',
  addEvent: BASE_URL_API + '/api/event/add',
  deleteEvent: BASE_URL_API + '/api/event/deleteevent',
  addTeamEvent: '/api/event/addevent'
};
