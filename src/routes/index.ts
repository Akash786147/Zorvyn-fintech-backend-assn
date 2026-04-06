import express from "express";
import userRoutes from './users';
import recordRoutes from './records';
import dashboardRoutes from './dashboard';

const Router = express.Router();

Router.use(`/users`, userRoutes);
Router.use(`/records`, recordRoutes);
Router.use(`/dashboard`, dashboardRoutes);

export default Router;
