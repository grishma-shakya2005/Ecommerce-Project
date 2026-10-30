import nodemailer from 'nodemailer';
import type { IOrder } from '../models/Order.js';
import type { OrderStatus } from '../models/Order.js';

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const estimatedDelivery = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date.toLocaleDateString('en-US', { dateStyle: 'long' });
};

const itemsText = (order: IOrder) =>
  order.items.map((item) => `${item.productId} x ${item.quantity} - Rs. ${item.price.toFixed(2)}`).join('<br>');

const templateFor = (order: IOrder, status: OrderStatus) => {
  const tracking = `PAL-${order.orderNumber.replace(/[^A-Z0-9]/gi, '').slice(-10).toUpperCase()}`;
  const content: Record<OrderStatus, { subject: string; heading: string; body: string }> = {
    pending: {
      subject: `Order ${order.orderNumber} confirmed`,
      heading: 'Thank you for your order!',
      body: `Your order <strong>${order.orderNumber}</strong> has been placed.<br><br>${itemsText(order)}<br><br>Total: <strong>Rs. ${order.total.toFixed(2)}</strong><br>Estimated delivery: ${estimatedDelivery()}`,
    },
    payment_confirmed: {
      subject: `Payment received for ${order.orderNumber}`,
      heading: 'Payment Received',
      body: `We received your payment of <strong>Rs. ${order.total.toFixed(2)}</strong> for order ${order.orderNumber}.`,
    },
    processing: {
      subject: `Your order ${order.orderNumber} is being prepared`,
      heading: 'Your order is being prepared',
      body: `Our textile team is carefully preparing order <strong>${order.orderNumber}</strong> for dispatch.`,
    },
    shipped: {
      subject: `Your order ${order.orderNumber} has shipped`,
      heading: 'Your order has been shipped',
      body: `Order <strong>${order.orderNumber}</strong> is on its way.<br>Tracking ID: <strong>${tracking}</strong>`,
    },
    out_for_delivery: {
      subject: `Your order ${order.orderNumber} is out for delivery`,
      heading: 'Out for delivery today',
      body: `Your order <strong>${order.orderNumber}</strong> is out for delivery today. Please keep your phone nearby.`,
    },
    delivered: {
      subject: `Order ${order.orderNumber} delivered`,
      heading: 'Your order has been delivered',
      body: `Order <strong>${order.orderNumber}</strong> has been delivered — thank you for shopping with Palpali Dhaka Textiles! We'd love your review.`,
    },
  };
  return content[status];
};

export const notifyOrderStatus = async (order: IOrder, status: OrderStatus) => {
  const template = templateFor(order, status);
  // Send the full styled lifecycle email through Gmail SMTP using the app password in .env.
  await getTransporter().sendMail({
    from: `"Palpali Dhaka Textiles" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: template.subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#3d2b1f"><h1 style="color:#7b3f00">${template.heading}</h1><p>${template.body}</p><hr><p style="font-size:12px;color:#777">Palpali Dhaka Textiles</p></div>`,
  });
};
