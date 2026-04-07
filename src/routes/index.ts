import express from "express";
import authRoutes from './auth.router';
import userRoutes from './users.router';
import recordRoutes from './records.router';
import dashboardRoutes from './dashboard.router';
// import roleRoutes from './roles.router'; // if exists
import { authenticate } from "../middleware/auth";
import { validationMiddleware } from "../middleware/validator";
import { validationSchemas } from "../validators";

const Router = express.Router();

// Apply global validation middleware
Router.use(validationMiddleware(validationSchemas));

// Public auth routes (no authentication required)
Router.use('/auth', authRoutes);

// Protected routes (require authentication)
Router.use(`/`, authenticate);
Router.use(`/users`, userRoutes);
Router.use(`/records`, recordRoutes);
Router.use(`/dashboard`, dashboardRoutes);
// Router.use('/roles', roleRoutes);

export default Router;
