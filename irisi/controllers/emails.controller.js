const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const successfulPurchaseMailTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/successful-purchase.html"),
  "utf8"
);
const shippingStatusUpdateTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/shipping-status-update.html"),
  "utf8"
);

module.exports = {
  successfulPurchaseMail: async (req, res) => {
    try {
      let itemsHtml = (req.body.items ?? []).map(
        (item, index) => `
	            <tr key={${index}}>
                          <td width="70%">
                            <div class="item-name">${item.name}</div>
                            <div class="item-quantity">
                              Quantity: ${item.quantity}
                            </div>
                            ${
                              item.color &&
                              `(
                                <div class='item-quantity'>
                                  Color: ${item.quantity}
                                </div>
                              )`
                            }
                          </td>
                          <td width="30%" class="item-price">${item.price}</td>
                        </tr>`
      );
      let htmlWithData = successfulPurchaseMailTemplate
        .replace("{{customerName}}", req.body?.customerName ?? "")
        .replace("{{orderId}}", req.body?.orderId ?? "")
        .replace("{{trackingId}}", req.body?.trackingId ?? "")
        .replace("{{orderDate}}", req.body?.orderDate ?? "")
        .replace("{{total}}", req.body?.totalAmount ?? "")
        .replace("{{subtotal}}", req.body?.subtotal ?? "")
        .replace("{{shipping}}", req.body?.deliveryFee ?? "")
        .replace("{{shippingAddress}}", req.body?.shippingAddress ?? "")
        .replace("{{tax}}", 0)
        .replace(
          "{{trackingUrl}}",
          `www.irisi.store/track?id=${req?.body?.trackingId}`
        )
        .replace("{{items}}", itemsHtml);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.IRISI_GMAIL_APP_USER,
          pass: process.env.IRISI_GMAIL_APP_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.IRISI_GMAIL_APP_USER,
        to: req.body.customerEmail,
        subject: "ÌRÍSÍ - Order Successful!",
        html: htmlWithData,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log("error sending email", error);
        console.log("email sent successfully", info.response);
      });
      return res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.log("sdsd", error);
      return res.status(500).json({
        message: "Failed to send purchase email",
        error,
      });
    }
  },

  shippingStatusUpdateMail: async (req, res) => {
    try {
      // Define status configurations
      const statusConfigs = {
        processing: {
          statusColor: "#f59e0b",
          statusIcon: "⚙️",
          statusTitle: "Order Processing",
          statusMessage:
            "Your order is being prepared for shipment. We're carefully packaging your items to ensure they arrive in perfect condition.",
          progressPercentage: 25,
        },
        shipped: {
          statusColor: "#3b82f6",
          statusIcon: "📦",
          statusTitle: "Order Shipped!",
          statusMessage:
            "Great news! Your order has been shipped and is on its way to you. You can track its progress using the link below.",
          progressPercentage: 75,
        },
        delivered: {
          statusColor: "#10b981",
          statusIcon: "✅",
          statusTitle: "Order Delivered!",
          statusMessage:
            "Your order has been successfully delivered! We hope you love your new items from ÌRÍSÍ.",
          progressPercentage: 100,
        },
        cancelled: {
          statusColor: "#ef4444",
          statusIcon: "❌",
          statusTitle: "Order Cancelled",
          statusMessage:
            "Your order has been cancelled. If you have any questions, please contact our support team.",
          progressPercentage: 0,
        },
        returned: {
          statusColor: "#8b5cf6",
          statusIcon: "🔄",
          statusTitle: "Order Returned",
          statusMessage:
            "Your order has been returned. Our team will process the return and issue a refund if applicable.",
          progressPercentage: 50,
        },
      };

      const status = req.body.status?.toLowerCase();
      const config = statusConfigs[status] || statusConfigs["processing"];

      let htmlWithData = shippingStatusUpdateTemplate
        .replace(/{{statusColor}}/g, config.statusColor)
        .replace(/{{statusIcon}}/g, config.statusIcon)
        .replace(/{{statusTitle}}/g, config.statusTitle)
        .replace(/{{statusMessage}}/g, config.statusMessage)
        .replace(/{{progressPercentage}}/g, config.progressPercentage)
        .replace(/{{customerName}}/g, req.body?.customerName ?? "")
        .replace(/{{orderId}}/g, req.body?.orderId ?? "")
        .replace(/{{trackingId}}/g, req.body?.trackingId ?? "")
        .replace(/{{orderDate}}/g, req.body?.orderDate ?? "")
        .replace(/{{currentStatus}}/g, req.body?.status ?? "")
        .replace(
          /{{trackingUrl}}/g,
          `www.irisi.store/track?id=${req?.body?.trackingId}`
        );

      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.IRISI_GMAIL_APP_USER,
          pass: process.env.IRISI_GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.IRISI_GMAIL_APP_USER,
        to: req.body.customerEmail,
        subject: `ÌRÍSÍ - ${config.statusTitle}`,
        html: htmlWithData,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log("error sending email", error);
        console.log("shipping status email sent successfully", info.response);
      });

      return res
        .status(200)
        .json({ message: "Shipping status email sent successfully!" });
    } catch (error) {
      console.log("Error sending shipping status email:", error);
      return res.status(500).json({
        message: "Failed to send shipping status email",
        error,
      });
    }
  },
};
