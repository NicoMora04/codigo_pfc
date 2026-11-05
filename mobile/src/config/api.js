const Base_URL =
  'http://192.168.1.18:3000/api';

export const BACKEND_URL =
  Base_URL.replace(
    /\/api\/?$/,
    ''
  );

export const WEB_URL =
  'http://192.168.1.18:5173';

export default Base_URL;