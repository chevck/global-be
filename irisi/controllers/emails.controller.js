const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const successfulPurchaseMailTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/successful-purchase.html"),
  "utf8"
);

module.exports = {
  successfulPurchaseMail: async (req, res) => {
    try {
      console.log("dds", req.body);
      let itemsHtml = (req.body.items ?? []).map(
        (item, index) => `
	   <tr key=${index}>
                    <td style="padding: 15px; border-bottom: 1px solid #f1f3f4">
                      <div>
                        <div
                          style="
                            color: #1a1a1a;
                            font-weight: bold;
                            margin-bottom: 5px;
                          "
                        >
                         ${item.name}
                        </div>
				${
          item.size &&
          `<div style='color: #666; font-size: 14px'>Size: ${item.size}</div>`
        }
                      </div>
                    </td>
                    <td
                      style="
                        padding: 15px;
                        text-align: center;
                        border-bottom: 1px solid #f1f3f4;
                        color: #1a1a1a;
                      "
                    >
                      ${item.quantity}
                    </td>
                    <td
                      style="
                        padding: 15px;
                        text-align: right;
                        border-bottom: 1px solid #f1f3f4;
                        color: #1a1a1a;
                        font-weight: bold;
                      "
                    >
                     ${item.price}
                    </td>
                  </tr>`
      );
      let htmlWithData = successfulPurchaseMailTemplate
        .replace("{{customerName}}", req.body?.customerName ?? "")
        .replace("{{orderId}}", req.body?.orderId ?? "")
        .replace("{{trackingId}}", req.body?.trackingId ?? "")
        .replace("{{orderDate}}", req.body?.orderDate ?? "")
        .replace("{{totalAmount}}", req.body?.totalAmount ?? "")
        .replace(
          "{{trackingUrl}}",
          `www.irisi.store/tracking?id=${req?.body?.trackingId}`
        )
        .replace(
          "{{trackingUrl}}",
          `www.irisi.store/tracking?id=${req?.body?.trackingId}`
        )
        .replace("{{items}}", itemsHtml);

      if (req.body?.shippingAddress) {
        const shippingData = `
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            "
          >
            <tr>
              <td style="padding: 30px">
                <h3
                  style="
                    color: #1a1a1a;
                    margin: 0 0 20px 0;
                    font-size: 20px;
                    font-weight: bold;
                  "
                >
                  Shipping Address
                </h3>
                <div style="color: #1a1a1a; line-height: 1.6">
                  ${req.body.customerName}
                  <br />
			${req.body.shippingAddress.street}
                  <br />
                  ${req.body.shippingAddress.city}, ${req.body.shippingAddress.state}
                  <br />
                  ${req.body.shippingAddress.country}
                </div>
              </td>
            </tr>
          </table>`;
        htmlWithData.replace("{{shippingData}}", shippingData);
      }

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
        subject: "ÌRÍSÍ says Order Successful!",
        html: htmlWithData,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log("error sending email", error);
        console.log("email sent successfully", info.response);
      });
    } catch (error) {
      console.log("sdsd", error);
    }
  },
};
