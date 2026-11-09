const Base_URL =
  'http://192.168.0.93:3000/api';

export const BACKEND_URL =
  Base_URL.replace(
    /\/api\/?$/,
    ''
  );

export const WEB_URL =
  'http://192.168.0.93:5173';

export default Base_URL;