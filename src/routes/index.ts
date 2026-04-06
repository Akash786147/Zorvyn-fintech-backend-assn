import express from "express";
import userRoutes from '@routes/users';
import recordRoutes from '@routes/records';
import dashboardRoutes from '@routes/dashboard';

const Router = express.Router();

Router.use(`/users`, userRoutes);
Router.use(`/records`, recordRoutes);
Router.use(`/dashboard`, dashboardRoutes);

export default Router;
