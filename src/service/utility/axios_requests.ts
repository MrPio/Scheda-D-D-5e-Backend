import axios from 'axios';

const apiBaseUrl = `http://${process.env.WEBSOCKET_CONTAINER_NAME}:${process.env.WEBSOCKET_API_PORT ?? 3000}`;

/**
 * Use AXIOS to send a POST request to the websocket container's API server.
 * @param route The route to call.
 * @param body The request body.
 * @returns The HTTP response of any occurred error.
 */
export const httpPost = async (route: string, body: object): Promise<object> =>
  axios.post(apiBaseUrl + route, body);