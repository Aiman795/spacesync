import axios from "axios";

const client = axios.create({ baseURL: "/api" });

export const getResources = (params = {}) => client.get("/resources", { params }).then((r) => r.data);

export const getBookings = (params = {}) => client.get("/bookings", { params }).then((r) => r.data);

export const createBooking = (payload) => client.post("/bookings", payload).then((r) => r.data);

export const deleteBooking = (id) => client.delete(`/bookings/${id}`).then((r) => r.data);

export default client;
