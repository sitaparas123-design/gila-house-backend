const Joi = require('joi');

const createOrderSchema = Joi.object({
  orderData: Joi.object({
    customer_id: Joi.number().integer().allow(null).optional(),
    user_id: Joi.number().integer().allow(null).optional(),
    table_id: Joi.number().integer().allow(null).optional(),
    order_number: Joi.string().required(),
    order_type: Joi.string().valid('dine-in', 'takeaway', 'delivery').required(),
    subtotal: Joi.number().required(),
    tax: Joi.number().required(),
    discount: Joi.number().default(0),
    serviceChargePercent: Joi.number().valid(0, 5, 10, 30).optional(),
    service_charge_percent: Joi.number().valid(0, 5, 10, 30).optional(),
    serviceChargeAmount: Joi.number().optional(),
    service_charge_amount: Joi.number().optional(),
    grand_total: Joi.number().required(),
    payment_status: Joi.string().valid('pending', 'partial', 'paid', 'refunded').optional(),
    order_status: Joi.string().valid('new', 'pending', 'cooking', 'ready', 'delivered', 'cancelled', 'Draft', 'Waiting Payment', 'Paid', 'Confirmed', 'Preparing', 'Served', 'Completed', 'Refunded').optional()
  }).required(),
  items: Joi.array().items(
    Joi.object({
      menu_item_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
      unit_price: Joi.number().required(),
      total_price: Joi.number().required()
    })
  ).min(1).required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'pending', 'cooking', 'ready', 'delivered', 'cancelled', 'Draft', 'Waiting Payment', 'Paid', 'Confirmed', 'Preparing', 'Served', 'Completed', 'Refunded').required()
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema
};
