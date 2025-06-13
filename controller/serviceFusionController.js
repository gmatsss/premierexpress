const axios = require("axios");
const dayjs = require("dayjs");

getWaitingForPartsJobs = async (req, res) => {
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
          id: 2001,
          number: "JOB-008",
          customer_id: 88888801,
          customer_name: "PowerFlex Gym East",
          contact_first_name: "Amanda",
          contact_last_name: "Lopez",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Amanda Lopez",
          status: "4. Waiting For Parts",
          sub_status: "Confirmed",
          daysPending: 12,
          category: "emailOnly",
          is_requires_follow_up: true,
          products: "Precor Elliptical SN: 456789; Handle Wire",
          notes: "Parts ordered. No ETA provided.",
        },
        {
          id: 2002,
          number: "JOB-009",
          customer_id: 88888802,
          customer_name: "GoldLine Athletics",
          contact_first_name: "Ryan",
          contact_last_name: "Kim",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Ryan Kim",
          status: "4. Waiting For Parts",
          sub_status: "On Order",
          daysPending: 16,
          category: "emailAndCall",
          is_requires_follow_up: true,
          products: "Life Fitness Bike SN: 123321; Console",
          notes: "Console replacement on order. ETA TBD.",
        },
        {
          id: 2004,
          number: "JOB-011",
          customer_id: 88888804,
          customer_name: "PulsePoint Fitness",
          contact_first_name: "Ava",
          contact_last_name: "Morales",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Ava Morales",
          status: "4. Waiting For Parts",
          sub_status: "Backorder",
          daysPending: 47,
          category: "backorder",
          is_requires_follow_up: true,
          products: "Matrix Bike SN: 447788; Pedal Crank Arm",
          notes: "Backorder confirmed. ETA 6/26/2025.",
        },
        {
          id: 2005,
          number: "JOB-012",
          customer_id: 88888805,
          customer_name: "Titan Performance Club",
          contact_first_name: "Liam",
          contact_last_name: "Reyes",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Liam Reyes",
          status: "4. Waiting For Parts",
          sub_status: "Backorder",
          daysPending: 52,
          category: "backorder",
          is_requires_follow_up: true,
          products: "Precor Treadmill SN: 667788; Control Panel",
          notes: "Backorder confirmed. ETA 6/27/2025.",
        },
        {
          id: 2006,
          number: "JOB-013",
          customer_id: 88888806,
          customer_name: "Velocity Prime Gym",
          contact_first_name: "Isabella",
          contact_last_name: "Garcia",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Isabella Garcia",
          status: "4. Waiting For Parts",
          sub_status: "Backorder",
          daysPending: 61,
          category: "backorder",
          is_requires_follow_up: true,
          products: "Life Fitness Elliptical SN: 334455; Drive Belt",
          notes: "Backorder confirmed. ETA 6/28/2025.",
        },
        {
          id: 2004,
          number: "JOB-011",
          customer_id: 88888804,
          customer_name: "FitNation Elite",
          contact_first_name: "Derek",
          contact_last_name: "Ramirez",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Derek Ramirez",
          status: "4. Waiting For Parts",
          sub_status: null,
          daysPending: 67,
          category: "endOfLife",
          is_requires_follow_up: false,
          products: "Matrix Elliptical SN: 232323; Motor",
          notes: "Unit nearing 60+ days. Flag for replacement.",
        },
        {
          id: 2005,
          number: "JOB-012",
          customer_id: 88888805,
          customer_name: "FlexCore Downtown",
          contact_first_name: "Lana",
          contact_last_name: "Bennett",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Lana Bennett",
          status: "4. Waiting For Parts",
          sub_status: "In Transit",
          daysPending: 8,
          category: "emailOnly",
          is_requires_follow_up: false,
          products: "StarTrac Treadmill SN: 111222; Belt",
          notes: "Shipping confirmed. Arrival expected this week.",
        },
        {
          id: 2006,
          number: "JOB-013",
          customer_id: 88888806,
          customer_name: "The Resistance Lab",
          contact_first_name: "Marcus",
          contact_last_name: "Chang",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "Marcus Chang",
          status: "4. Waiting For Parts",
          sub_status: "Awaiting Approval",
          daysPending: 38,
          category: "emailAndCall",
          is_requires_follow_up: true,
          products: "Torque Multistation SN: 787878; Upper Cable",
          notes: "Quote sent. Waiting for client approval.",
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
        [
          "id",
          "number",
          "customer_id",
          "customer_name",
          "contact_first_name",
          "contact_last_name",
          "status",
          "sub_status",
          "start_date",
          "updated_at",
          "note_to_customer",
          "tech_notes",
          "completion_notes",
          "is_requires_follow_up",
        ].join(",")
      );

      const expand = encodeURIComponent(
        "products,services,techs_assigned,notes"
      );

      const url =
        `${baseUrl}?filters[status]=${encodedStatus}` +
        `&page=${page}&per-page=${limit}` +
        `&fields=${fields}&expand=${expand}`;

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

    const enrichJobWithCustomerContact = async (job) => {
      try {
        const customerUrl =
          `${customerBaseUrl}/${job.customer_id}` +
          `?expand=contacts.phones,contacts.emails`;
        const resp = await axios.get(customerUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        const contacts = resp.data.contacts || [];
        const primary = contacts.find((c) => c.is_primary) || contacts[0] || {};
        const email = primary.emails?.[0]?.email || null;
        const phone = primary.phones?.[0]?.phone || null;
        const name =
          `${primary.fname || ""} ${primary.lname || ""}`.trim() || null;

        return {
          ...job,
          contact_email: email,
          contact_phone: phone,
          contact_name: name,
        };
      } catch {
        return {
          ...job,
          contact_email: null,
          contact_phone: null,
          contact_name: null,
        };
      }
    };

    const today = new Date();
    const categorizedJobs = {
      backorder: [],
      emailOnly: [],
      emailAndCall: [],
      endOfLife: [],
    };

    const enrichedJobs = await Promise.all(
      allJobs.map(async (job) => {
        const enriched = await enrichJobWithCustomerContact(job);

        const startDate = job.start_date || job.updated_at;
        enriched.daysPending = Math.floor(
          Math.abs(today - new Date(startDate)) / (1000 * 60 * 60 * 24)
        );

        enriched.notes =
          (job.notes || [])
            .map((n) => n.notes?.trim())
            .filter((txt) => txt)
            .join("\n\n") || null;

        enriched.assigned_techs =
          (job.techs_assigned || [])
            .map((t) => `${t.first_name} ${t.last_name}`.trim())
            .filter((n) => n)
            .join(", ") || null;

        // ✅ Replace product names with product descriptions
        enriched.products =
          (job.products || [])
            .map((p) => p.description)
            .filter(Boolean)
            .join(", ") || null;

        enriched.services =
          (job.services || []).map((s) => s.name).join(", ") || null;

        const sub = job.sub_status?.toLowerCase() || "";
        if (sub.includes("backorder") || sub.includes("back ordered")) {
          enriched.category = "backorder";
          categorizedJobs.backorder.push(enriched);
        } else if (enriched.daysPending < 14) {
          enriched.category = "emailOnly";
          categorizedJobs.emailOnly.push(enriched);
        } else if (enriched.daysPending < 60) {
          enriched.category = "emailAndCall";
          categorizedJobs.emailAndCall.push(enriched);
        } else {
          enriched.category = "endOfLife";
          categorizedJobs.endOfLife.push(enriched);
        }

        return enriched;
      })
    );

    res.json({
      status: "success",
      pagesFetched: page,
      matched: enrichedJobs.length,
      data: [
        ...categorizedJobs.backorder,
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

function getDueDate(invoice) {
  const issueDate = dayjs(invoice.date);
  const termsRaw = invoice.terms?.toLowerCase().trim() || "net30";
  const match = termsRaw.match(/net\s*(\d+)/);

  if (match) return issueDate.add(parseInt(match[1], 10), "day");
  if (termsRaw.includes("cod") || termsRaw.includes("receipt"))
    return issueDate;

  return issueDate.add(30, "day"); // Default fallback
}

const testInvoices = [
  {
    id: 1001580084,
    number: 78606,
    date: "2025-12-31T00:00:00+00:00",
    dueDate: "2026-03-31",
    daysPastDue: -290,
    total: 18074.93,
    is_paid: false,
    currency: "$",
    customer: "The Lorenzo",
    customer_contact: "Vlad",
    payment_terms: null,
    bill_to_customer_id: null,
    bill_to_customer_location_id: 32439987,
    bill_to_customer_contact_id: 47404013,
    bill_to_email_id: "gmaturan60@gmail.com",
    bill_to_phone_id: "(213) 626-9528",
    pay_online_url:
      "https://app.servicefusion.com/invoiceOnline?id=t2MXT9voOBhZ2JTULSae0XSUNunFNLz0U7xAoIgE2S0&key=YDBKOJeJtqiMqT4Kwa4vvwfoKsxGRd-BKnQao91pEvI",
    category: "31-60_days",
  },

  // 1. not_due_yet
  {
    id: 1031000001,
    number: 98101,
    date: "2025-07-01T00:00:00+00:00",
    dueDate: "2025-08-01",
    daysPastDue: -10,
    total: 250.0,
    is_paid: false,
    currency: "$",
    customer: "Future Property",
    customer_contact: "Alice",
    payment_terms: null,
    bill_to_customer_id: null,
    bill_to_customer_location_id: null,
    bill_to_customer_contact_id: null,
    bill_to_email_id: "gmaturan60@gmail.com",
    bill_to_phone_id: "555-1001",
    pay_online_url:
      "https://app.servicefusion.com/invoiceOnline?id=Qeb7xoAfLWHk4xvYPalQdggJEcmeEJS241b9Qrc_iIY&key=hrlgM7xWufARU9ypxJTLSH945IqRJ9CgX2XtyT6qSIE",
    category: "not_due_yet",
  },

  // 2. 0–30_days
  {
    id: 1031000002,
    number: 98102,
    date: "2025-05-01T00:00:00+00:00",
    dueDate: "2025-05-31",
    daysPastDue: 10,
    total: 500.0,
    is_paid: false,
    currency: "$",
    customer: "Quick Pay Co.",
    customer_contact: "Bob",
    payment_terms: null,
    bill_to_customer_id: null,
    bill_to_customer_location_id: null,
    bill_to_customer_contact_id: null,
    bill_to_email_id: "gmaturan60@gmail.com",
    bill_to_phone_id: "555-1002",
    pay_online_url:
      "https://app.servicefusion.com/invoiceOnline?id=tos7dtG8o_4DWjZ96vyiuzqGYDfX5jO9HSLugqHPJHQ&key=JK81suPIqG5GT1u1o7BRCPBnCTQKQYw5ueDA5sgaIjg",
    category: "0-30_days",
  },

  // 3. 61–90_days
  {
    id: 1031000003,
    number: 98103,
    date: "2025-02-01T00:00:00+00:00",
    dueDate: "2025-03-03",
    daysPastDue: 75,
    total: 750.0,
    is_paid: false,
    currency: "$",
    customer: "Medium Term LLC",
    customer_contact: "Carol",
    payment_terms: null,
    bill_to_customer_id: null,
    bill_to_customer_location_id: null,
    bill_to_customer_contact_id: null,
    bill_to_email_id: "gmaturan60@gmail.com",
    bill_to_phone_id: "555-1003",
    pay_online_url:
      "https://app.servicefusion.com/invoiceOnline?id=PqmGBwsQ0YQRq9zaFdRUuNlH2f-nFvyEtYc44wIKPkc&key=oPb0SqL1uqA-mEFdUnBiIXLJowcIfCCuDaivkx-9FOk",
    category: "61-90_days",
  },

  // 4. 91+_days
  {
    id: 1031000004,
    number: 98104,
    date: "2024-12-01T00:00:00+00:00",
    dueDate: "2025-01-01",
    daysPastDue: 120,
    total: 1000.0,
    is_paid: false,
    currency: "$",
    customer: "Long Delinquent Inc.",
    customer_contact: "Dave",
    payment_terms: null,
    bill_to_customer_id: null,
    bill_to_customer_location_id: null,
    bill_to_customer_contact_id: null,
    bill_to_email_id: "gmaturan60@gmail.com",
    bill_to_phone_id: "555-1004",
    pay_online_url:
      "https://app.servicefusion.com/invoiceOnline?id=XOFB73mVhVYjl274rCVqqeq_G8DT2ehzKKY0laPWBpI&key=sQsnzMBgcFaVbjqYk4fbbrNyThgQnFNXywum76OgPLk",
    category: "91+_days",
  },
];

const getinvoice = async (req, res) => {
  const { accessToken, testMode } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "Missing access token" });
  }

  if (testMode) {
    return res.status(200).json({
      success: true,
      allUnpaid: testInvoices.every((inv) => inv.is_paid === false),
      count: testInvoices.length,
      data: testInvoices,
    });
  }

  const baseUrl = "https://api.servicefusion.com/v1/invoices";
  const perPage = 50;
  let currentPage = 1;
  let hasMore = true;
  const today = dayjs();
  const allResults = [];

  try {
    while (hasMore) {
      console.log(`🔄 Fetching page ${currentPage} of unpaid invoices...`);

      const { data } = await axios.get(baseUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        params: {
          "per-page": perPage,
          page: currentPage,
          sort: "-date",
          "filter[is_paid]": false,
        },
      });

      const invoices = data.items || [];
      invoices.forEach((inv) => {
        // extra safety check
        if (inv.is_paid) return;

        const dueDate = getDueDate(inv);
        const daysPastDue = today.diff(dueDate, "day");
        let category = "not_due_yet";
        if (daysPastDue > 0 && daysPastDue <= 30) category = "0-30_days";
        else if (daysPastDue <= 60) category = "31-60_days";
        else if (daysPastDue <= 90) category = "61-90_days";
        else if (daysPastDue > 90) category = "91+_days";

        allResults.push({
          id: inv.id,
          number: inv.number,
          date: inv.date,
          dueDate: dueDate.format("YYYY-MM-DD"),
          daysPastDue,
          total: inv.total,
          is_paid: inv.is_paid, // ← add this
          currency: inv.currency,
          customer: inv.customer,
          customer_contact: inv.customer_contact,
          payment_terms: inv.payment_terms,
          bill_to_customer_id: inv.bill_to_customer_id,
          bill_to_customer_location_id: inv.bill_to_customer_location_id,
          bill_to_customer_contact_id: inv.bill_to_customer_contact_id,
          bill_to_email_id: inv.bill_to_email_id,
          bill_to_phone_id: inv.bill_to_phone_id,
          pay_online_url: inv.pay_online_url,
          category,
        });
      });

      console.log(
        `📦 Page ${currentPage} added ${invoices.length} unpaid invoices ` +
          `(running total: ${allResults.length})`
      );

      currentPage++;
      hasMore = currentPage <= (data._meta?.pageCount || 1);
    }

    // sanity check
    const allAreUnpaid = allResults.every((inv) => inv.is_paid === false);
    console.log(`✅ All fetched invoices unpaid? ${allAreUnpaid}`);

    return res.status(200).json({
      success: true,
      allUnpaid: allAreUnpaid, // ← tells you if any slipped through
      count: allResults.length,
      data: allResults,
    });
  } catch (error) {
    console.error("❌ Error fetching invoices:", error.message);
    return res.status(500).json({
      error: "Failed to fetch invoices from Service Fusion.",
      details: error.message,
    });
  }
};

module.exports = {
  getWaitingForPartsJobs,
  getJobsByStatusName,
  getinvoice,
};
