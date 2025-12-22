const BASE_URL_API = 'https://traidee.onrender.com';

export const CONFIG = {
  login: BASE_URL_API + '/api/auth/login',
  getEvents: BASE_URL_API + '/api/event/allevent',
  addEvent: BASE_URL_API + '/api/event/add',
  deleteEvent: BASE_URL_API + '/api/event/deleteevent',
  addTeamEvent: BASE_URL_API + '/api/event/addevent',
  getEventsById: BASE_URL_API + '/api/event/getevent',
  updateTeamEvent: BASE_URL_API + '/api/event/updateevent',
  getTeams: BASE_URL_API + '/api/event/allteam'
  resetPassword: BASE_URL_API + '/api/users/changepassword',
};
