const axios = require("axios");
const dayjs = require("dayjs");

const getWaitingForPartsJobs = async (req, res) => {
  const accessToken = req.body.accessToken;
  const isTestMode = req.body.testMode === true;
  const baseUrl = "https://api.servicefusion.com/v1/jobs";
  const customerBaseUrl = "https://api.servicefusion.com/v1/customers";
  const limit = 50;
  let page = 1;
  let allJobs = [];

  if (!accessToken) {
    return res.status(400).json({
      status: "error",
      message: "Missing accessToken in request body.",
    });
  }

  try {
    if (isTestMode) {
      const testJobs = [
        {
          id: 1001,
          number: "JOB-001",
          customer_id: 11111111,
          customer_name: "Edge Fitness Central",
          contact_first_name: "George",
          contact_last_name: "Maturan",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "George Maturan",
          status: "4. Waiting For Parts",
          sub_status: "In Transit",
          daysPending: 13,
          category: "emailOnly",
          is_requires_follow_up: true,
          tech_notes:
            "Technician verified that parts were ordered and are currently in transit. No further action until delivery is confirmed.",
          completion_notes:
            "Awaiting part arrival. Installation will be scheduled upon receipt.",
          note_to_customer:
            "Disclaimer statement of all liability with services provided to or for any manufacturers, end user, or dealer regarding product defects, operation or function. All liability to or against Premier Fitness Service as an independent provider of services or products sold are held harmless of any claim regarding product, services rendered or personal injury. All sales are final. Refunds deemed necessary shall be issued by company check and the customer hereby waives any rights to charge back purchases. Any parts or products returned or cancelled, will be subject to a 40% restocking fee and all related shipping expenses.",
        },
        {
          id: 1002,
          number: "JOB-002",
          customer_id: 22222222,
          customer_name: "Anytime Fitness West",
          contact_first_name: "George",
          contact_last_name: "Maturan",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-2222",
          contact_name: "George Maturan",
          status: "4. Waiting For Parts",
          sub_status: "On Order",
          daysPending: 17,
          category: "emailAndCall",
          is_requires_follow_up: false,
          tech_notes:
            "LABOR 1\n\nRemove & Replace necessary parts. Make required adjustments for correct operation.\n\nLife Fitness Treadmill\nSN: HHT109499\nIssue: Console displays error E49 (low voltage to motor controller). Power verified. Fault traced to motor control board (MCB). Recommended: Replace MCB and Emergency Stop.\nParts Required:\n- 1x MDB PC board\n- 1x Emergency Stop\n\nLife Fitness Recumbent Bike\nSN: HRB101425\nIssue: Right thumb control is broken. Recommended: Replace thumb control to restore functionality.\nPart Required:\n- 1x Thumb control.",
          completion_notes:
            "Pending part delivery and installation scheduling.",
          note_to_customer:
            "Disclaimer statement of all liability with services provided to or for any manufacturers, end user, or dealer regarding product defects, operation or function. All liability to or against Premier Fitness Service as an independent provider of services or products sold are held harmless of any claim regarding product, services rendered or personal injury. All sales are final. Refunds deemed necessary shall be issued by company check and the customer hereby waives any rights to charge back purchases. Any parts or products returned or cancelled, will be subject to a 40% restocking fee and all related shipping expenses.",
        },
        {
          id: 1003,
          number: "JOB-003",
          customer_id: 33333333,
          customer_name: "Mansfield Gym & Spa",
          contact_first_name: "George",
          contact_last_name: "Maturan",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-3333",
          contact_name: "George Maturan",
          status: "4. Waiting For Parts",
          sub_status: "Backorder",
          daysPending: 74,
          category: "endOfLife",
          is_requires_follow_up: true,
          tech_notes: `LABOR 1 – Remove & Replace necessary parts. Hoist Multistation Model: H-2200. The leg press cable sent was incorrect. Ordered: 147 3/4” with 1 threaded end. Needed: 160 3/4” with 2 eyelets. Took back wrong cable. Unit still non-functional.`,
          completion_notes: `3/19/2025 – Handles installed but incorrect cable prevents full function. Compressor needed for handle reattachment. Awaiting correct cable for full repair.`,
          note_to_customer:
            "This repair has been delayed over 60 days. We recommend considering a unit replacement or reaching out to our team to discuss alternative options.",
        },
      ];

      return res.json({
        status: "success",
        pagesFetched: 1,
        matched: testJobs.length,
        data: testJobs,
      });
    }

    console.log("🔁 Fetching jobs with status 'Waiting for Parts'...");

    while (true) {
      const encodedStatus = encodeURIComponent("4. Waiting For Parts");
      const fields = encodeURIComponent(
        "id,number,customer_id,customer_name,contact_first_name,contact_last_name,contact_email,status,sub_status,start_date,updated_at,note_to_customer,tech_notes,completion_notes,is_requires_follow_up"
      );

      const url = `${baseUrl}?filters[status]=${encodedStatus}&page=${page}&per-page=${limit}&fields=${fields}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const jobs = response.data.items || [];
      if (jobs.length === 0) break;

      allJobs.push(...jobs);
      page++;
      if (jobs.length < limit) break;
    }

    // 🔍 Fetch and merge customer contact info
    const enrichJobWithCustomerContact = async (job) => {
      try {
        const customerUrl = `${customerBaseUrl}/${job.customer_id}?expand=contacts.phones,contacts.emails`;
        const response = await axios.get(customerUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        const contacts = response.data.contacts || [];
        const primary = contacts.find((c) => c.is_primary) || contacts[0];

        const email = primary?.emails?.[0]?.email || null;
        const phone = primary?.phones?.[0]?.phone || null;
        const name = `${primary?.fname || ""} ${primary?.lname || ""}`.trim();

        return {
          ...job,
          contact_email: email,
          contact_phone: phone,
          contact_name: name,
        };
      } catch (error) {
        console.warn(
          `⚠️ Failed to fetch contact for customer ${job.customer_id}`
        );
        return {
          ...job,
          contact_email: null,
          contact_phone: null,
          contact_name: null,
        };
      }
    };

    // 🧠 Categorize jobs with contact enrichment
    const today = new Date();
    const categorizedJobs = {
      emailOnly: [],
      emailAndCall: [],
      endOfLife: [],
    };

    const enrichedJobs = await Promise.all(
      allJobs.map(async (job) => {
        const startDate = job.start_date || job.updated_at;
        const diffDays = Math.floor(
          Math.abs(today - new Date(startDate)) / (1000 * 60 * 60 * 24)
        );

        const enriched = await enrichJobWithCustomerContact(job);
        enriched.daysPending = diffDays;

        if (diffDays < 14) {
          categorizedJobs.emailOnly.push({
            ...enriched,
            category: "emailOnly",
          });
        } else if (diffDays < 60) {
          categorizedJobs.emailAndCall.push({
            ...enriched,
            category: "emailAndCall",
          });
        } else {
          categorizedJobs.endOfLife.push({
            ...enriched,
            category: "endOfLife",
          });
        }

        return enriched;
      })
    );

    res.json({
      status: "success",
      pagesFetched: page,
      matched: enrichedJobs.length,
      data: [
        ...categorizedJobs.emailOnly,
        ...categorizedJobs.emailAndCall,
        ...categorizedJobs.endOfLife,
      ],
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch or enrich jobs.",
      details: error.message,
    });
  }
};

function getDueDate(invoice) {
  const issueDate = dayjs(invoice.date);
  const termsRaw = invoice.terms?.toLowerCase().trim() || "net30";
  const match = termsRaw.match(/net\s*(\d+)/);

  if (match) {
    const days = parseInt(match[1], 10);
    return issueDate.add(days, "day");
  }

  if (termsRaw.includes("cod") || termsRaw.includes("receipt")) {
    return issueDate;
  }

  return issueDate.add(30, "day");
}

const getinvoice = async (req, res) => {
  const { accessToken, testMode } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required." });
  }

  // 🧪 Test data (with category)
  if (testMode) {
    const testData = [
      {
        id: 1001,
        number: 12345,
        date: "2025-04-01T00:00:00Z",
        terms: "NET30",
        dueDate: "2025-05-01",
        daysPastDue: 45,
        total: 500,
        currency: "$",
        customer: "Test Client A",
        customer_contact: "Jane Doe",
        payment_terms: "NET30",
        bill_to_customer_id: 3001,
        bill_to_customer_location_id: 3011,
        bill_to_customer_contact_id: 3021,
        bill_to_email_id: "testclienta@email.com",
        bill_to_phone_id: "(555) 111-2222",
        category: "31-60_days",
      },
      {
        id: 1002,
        number: 12346,
        date: "2025-03-01T00:00:00Z",
        terms: "NET30",
        dueDate: "2025-03-31",
        daysPastDue: 75,
        total: 750,
        currency: "$",
        customer: "Test Client B",
        customer_contact: "John Smith",
        payment_terms: "NET30",
        bill_to_customer_id: 3002,
        bill_to_customer_location_id: 3012,
        bill_to_customer_contact_id: 3022,
        bill_to_email_id: "testclientb@email.com",
        bill_to_phone_id: "(555) 333-4444",
        category: "61-90_days",
      },
      {
        id: 1003,
        number: 12347,
        date: "2024-12-01T00:00:00Z",
        terms: "NET30",
        dueDate: "2024-12-31",
        daysPastDue: 160,
        total: 1200,
        currency: "$",
        customer: "Test Client C",
        customer_contact: "Susan Lee",
        payment_terms: "NET30",
        bill_to_customer_id: 3003,
        bill_to_customer_location_id: 3013,
        bill_to_customer_contact_id: 3023,
        bill_to_email_id: "testclientc@email.com",
        bill_to_phone_id: "(555) 555-6666",
        category: "91+_days",
      },
      {
        id: 1004,
        number: 12348,
        date: "2025-06-01T00:00:00Z",
        terms: "NET30",
        dueDate: "2025-07-01",
        daysPastDue: -22,
        total: 400,
        currency: "$",
        customer: "Test Client D",
        customer_contact: "Paul Green",
        payment_terms: "NET30",
        bill_to_customer_id: 3004,
        bill_to_customer_location_id: 3014,
        bill_to_customer_contact_id: 3024,
        bill_to_email_id: "testclientd@email.com",
        bill_to_phone_id: "(555) 777-8888",
        category: "not_due_yet",
      },
      {
        id: 1005,
        number: 12349,
        date: "2025-05-20T00:00:00Z",
        terms: "NET30",
        dueDate: "2025-06-19",
        daysPastDue: 5,
        total: 600,
        currency: "$",
        customer: "Test Client E",
        customer_contact: "Emily Stone",
        payment_terms: "NET30",
        bill_to_customer_id: 3005,
        bill_to_customer_location_id: 3015,
        bill_to_customer_contact_id: 3025,
        bill_to_email_id: "testcliente@email.com",
        bill_to_phone_id: "(555) 999-0000",
        category: "0-30_days",
      },
    ];

    return res.status(200).json({
      success: true,
      testMode: true,
      count: testData.length,
      data: testData,
    });
  }

  try {
    const response = await axios.get(
      "https://api.servicefusion.com/v1/invoices",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: {
          "per-page": 50,
          sort: "-date",
        },
      }
    );

    const invoices = response.data.items || [];
    const today = dayjs();
    const results = [];

    invoices.forEach((invoice) => {
      if (invoice.is_paid || !invoice.date) return;

      const dueDate = getDueDate(invoice);
      const daysPastDue = today.diff(dueDate, "day");

      let category = null;
      if (daysPastDue < 0) {
        category = "not_due_yet";
      } else if (daysPastDue <= 30) {
        category = "0-30_days";
      } else if (daysPastDue <= 60) {
        category = "31-60_days";
      } else if (daysPastDue <= 90) {
        category = "61-90_days";
      } else {
        category = "91+_days";
      }

      results.push({
        id: invoice.id,
        number: invoice.number,
        date: invoice.date,
        terms: invoice.terms,
        dueDate: dueDate.format("YYYY-MM-DD"),
        daysPastDue,
        total: invoice.total,
        currency: invoice.currency,
        customer: invoice.customer,
        customer_contact: invoice.customer_contact,
        payment_terms: invoice.payment_terms,
        bill_to_customer_id: invoice.bill_to_customer_id,
        bill_to_customer_location_id: invoice.bill_to_customer_location_id,
        bill_to_customer_contact_id: invoice.bill_to_customer_contact_id,
        bill_to_email_id: invoice.bill_to_email_id,
        bill_to_phone_id: invoice.bill_to_phone_id,
        pay_online_url: invoice.pay_online_url,
        category,
      });
    });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch invoices from Service Fusion.",
      details: error.message,
    });
  }
};

// const getinvoice = async (req, res) => {
//   const { accessToken, testMode } = req.body;

//   if (!accessToken) {
//     return res.status(400).json({ error: "Access token is required." });
//   }

//   if (testMode) {
//     const testData = [
//       {
//         id: 1001,
//         number: 12345,
//         date: "2025-04-01T00:00:00Z",
//         terms: "NET30",
//         dueDate: "2025-05-01",
//         daysPastDue: 45,
//         total: 500,
//         currency: "$",
//         customer: "Test Client A",
//         customer_contact: "Jane Doe",
//         payment_terms: "NET30",
//         bill_to_customer_id: 3001,
//         bill_to_customer_location_id: 3011,
//         bill_to_customer_contact_id: 3021,
//         bill_to_email_id: "testclienta@email.com",
//         bill_to_phone_id: "(555) 111-2222",
//         category: "31-60_days",
//       },
//       {
//         id: 1002,
//         number: 12346,
//         date: "2025-03-01T00:00:00Z",
//         terms: "NET30",
//         dueDate: "2025-03-31",
//         daysPastDue: 75,
//         total: 750,
//         currency: "$",
//         customer: "Test Client B",
//         customer_contact: "John Smith",
//         payment_terms: "NET30",
//         bill_to_customer_id: 3002,
//         bill_to_customer_location_id: 3012,
//         bill_to_customer_contact_id: 3022,
//         bill_to_email_id: "testclientb@email.com",
//         bill_to_phone_id: "(555) 333-4444",
//         category: "61-90_days",
//       },
//       {
//         id: 1003,
//         number: 12347,
//         date: "2024-12-01T00:00:00Z",
//         terms: "NET30",
//         dueDate: "2024-12-31",
//         daysPastDue: 160,
//         total: 1200,
//         currency: "$",
//         customer: "Test Client C",
//         customer_contact: "Susan Lee",
//         payment_terms: "NET30",
//         bill_to_customer_id: 3003,
//         bill_to_customer_location_id: 3013,
//         bill_to_customer_contact_id: 3023,
//         bill_to_email_id: "testclientc@email.com",
//         bill_to_phone_id: "(555) 555-6666",
//         category: "91+_days",
//       },
//       {
//         id: 1004,
//         number: 12348,
//         date: "2025-06-01T00:00:00Z",
//         terms: "NET30",
//         dueDate: "2025-07-01",
//         daysPastDue: -22,
//         total: 400,
//         currency: "$",
//         customer: "Test Client D",
//         customer_contact: "Paul Green",
//         payment_terms: "NET30",
//         bill_to_customer_id: 3004,
//         bill_to_customer_location_id: 3014,
//         bill_to_customer_contact_id: 3024,
//         bill_to_email_id: "testclientd@email.com",
//         bill_to_phone_id: "(555) 777-8888",
//         category: "not_due_yet",
//       },
//       {
//         id: 1005,
//         number: 12349,
//         date: "2025-05-20T00:00:00Z",
//         terms: "NET30",
//         dueDate: "2025-06-19",
//         daysPastDue: 5,
//         total: 600,
//         currency: "$",
//         customer: "Test Client E",
//         customer_contact: "Emily Stone",
//         payment_terms: "NET30",
//         bill_to_customer_id: 3005,
//         bill_to_customer_location_id: 3015,
//         bill_to_customer_contact_id: 3025,
//         bill_to_email_id: "testcliente@email.com",
//         bill_to_phone_id: "(555) 999-0000",
//         category: "0-30_days",
//       },
//     ];
//     return res.status(200).json({
//       success: true,
//       testMode: true,
//       count: testData.length,
//       data: testData,
//     });
//   }

//   try {
//     const response = await axios.get(
//       "https://api.servicefusion.com/v1/invoices",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json",
//         },
//         params: {
//           "per-page": 50,
//           sort: "-date",
//         },
//       }
//     );

//     const invoices = response.data.items || [];
//     const today = dayjs();
//     const results = [];

//     for (const invoice of invoices) {
//       if (invoice.is_paid || !invoice.date) continue;

//       const dueDate = getDueDate(invoice);
//       const daysPastDue = today.diff(dueDate, "day");

//       let category = null;
//       if (daysPastDue < 0) category = "not_due_yet";
//       else if (daysPastDue <= 30) category = "0-30_days";
//       else if (daysPastDue <= 60) category = "31-60_days";
//       else if (daysPastDue <= 90) category = "61-90_days";
//       else category = "91+_days";

//       // 🔍 Fetch customer details using customer_id
//       const customerId = invoice.bill_to_customer_id;
//       let customerContactName = "N/A";
//       let customerEmail = "N/A";
//       let customerPhone = "N/A";

//       try {
//         const customerRes = await axios.get(
//           `https://api.servicefusion.com/v1/customers/${customerId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               Accept: "application/json",
//             },
//             params: {
//               expand: "contacts.phones,contacts.emails",
//             },
//           }
//         );

//         const customer = customerRes.data;
//         const primaryContact =
//           customer.contacts?.find((c) => c.is_primary) ||
//           customer.contacts?.[0];
//         customerContactName = `${primaryContact?.fname || ""} ${
//           primaryContact?.lname || ""
//         }`.trim();
//         customerEmail = primaryContact?.emails?.[0]?.email || "N/A";
//         customerPhone = primaryContact?.phones?.[0]?.phone || "N/A";
//       } catch (err) {
//         console.warn(
//           `Customer lookup failed for ID ${customerId}:`,
//           err.message
//         );
//       }

//       results.push({
//         id: invoice.id,
//         number: invoice.number,
//         date: invoice.date,
//         terms: invoice.terms,
//         dueDate: dueDate.format("YYYY-MM-DD"),
//         daysPastDue,
//         total: invoice.total,
//         currency: invoice.currency,
//         customer: invoice.customer,
//         payment_terms: invoice.payment_terms,
//         bill_to_customer_id: invoice.bill_to_customer_id,
//         bill_to_customer_location_id: invoice.bill_to_customer_location_id,
//         bill_to_customer_contact_id: invoice.bill_to_customer_contact_id,
//         bill_to_email_id: invoice.bill_to_email_id,
//         bill_to_phone_id: invoice.bill_to_phone_id,
//         category,
//         customer_contact_name: customerContactName,
//         customer_contact_email: customerEmail,
//         customer_contact_phone: customerPhone,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       count: results.length,
//       data: results,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       error: "Failed to fetch invoices or customer details.",
//       details: error.message,
//     });
//   }
// };

const getJobsByStatusName = async (req, res) => {
  const accessToken = process.env.SF_TOKEN;
  const baseUrl = "https://api.servicefusion.com/v1";
  const limit = 50;
  const targetStatusName = "Waiting for Parts";

  try {
    // Step 1: Get status ID for "Waiting for Parts"
    const statusResponse = await axios.get(
      `${baseUrl}/job-statuses?per-page=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    const statuses = statusResponse.data.items || [];
    const matchingStatus = statuses.find((status) =>
      status.name.toLowerCase().includes(targetStatusName.toLowerCase())
    );

    if (!matchingStatus) {
      return res.status(404).json({
        status: "error",
        message: `Status '${targetStatusName}' not found in job-statuses.`,
      });
    }

    const jobStatusId = matchingStatus.id;
    console.log(`🔍 Found status ID ${jobStatusId} for '${targetStatusName}'`);

    const allJobs = [];
    let currentPage = 1;
    const batchSize = 10;
    let keepGoing = true;

    const fetchPage = async (page) => {
      const url = `${baseUrl}/jobs?job_status_id=${jobStatusId}&page=${page}&per-page=${limit}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      return response.data.items || [];
    };

    while (keepGoing) {
      const pageBatch = Array.from(
        { length: batchSize },
        (_, i) => currentPage + i
      );
      console.log(`🚀 Fetching pages: ${pageBatch.join(", ")}`);

      const batchResults = await Promise.allSettled(pageBatch.map(fetchPage));

      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        const pageNumber = currentPage + i;

        if (result.status === "fulfilled") {
          const jobs = result.value;
          console.log(`📦 Page ${pageNumber}: Retrieved ${jobs.length} jobs`);

          if (jobs.length === 0) {
            keepGoing = false;
            break;
          }

          allJobs.push(...jobs);

          // Stop if fewer jobs than limit
          if (jobs.length < limit) {
            keepGoing = false;
            break;
          }
        } else {
          console.error(
            `❌ Failed to fetch page ${pageNumber}: ${result.reason.message}`
          );
          keepGoing = false;
          break;
        }
      }

      currentPage += batchSize;
    }

    console.log(
      `✅ Total jobs with status '${targetStatusName}': ${allJobs.length}`
    );

    res.json({
      status: "success",
      matched: allJobs.length,
      statusId: jobStatusId,
      data: allJobs,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs by status:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch jobs by status.",
      details: error.message,
    });
  }
};

module.exports = {
  getWaitingForPartsJobs,
  getJobsByStatusName,
  getinvoice,
};
