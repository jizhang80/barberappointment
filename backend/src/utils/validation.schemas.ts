import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('CUSTOMER', 'BARBER').default('CUSTOMER'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const shopSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().max(500).optional(),
  address: Joi.string().max(200).optional(),
  phone: Joi.string().optional(),
});

export const serviceSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  duration: Joi.number().integer().min(15).max(480).required(),
  price: Joi.number().positive().precision(2).required(),
  description: Joi.string().max(500).optional(),
});

export const scheduleSchema = Joi.object({
  dayOfWeek: Joi.number().integer().min(0).max(6).required(),
  openTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  closeTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
});

export const appointmentSchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  startTime: Joi.date().iso().required(),
  notes: Joi.string().max(500).optional(),
});