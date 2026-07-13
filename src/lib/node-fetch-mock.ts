const fetch = typeof window !== 'undefined' ? window.fetch.bind(window) : (() => Promise.resolve(new Response()));
export default fetch;
export const Headers = typeof window !== 'undefined' ? window.Headers : null;
export const Request = typeof window !== 'undefined' ? window.Request : null;
export const Response = typeof window !== 'undefined' ? window.Response : null;
