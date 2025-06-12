const axios = require("axios");
const dayjs = require("dayjs");

// const getWaitingForPartsJobs = async (req, res) => {
//   const accessToken = req.body.accessToken;
//   const isTestMode = req.body.testMode === true;
//   const baseUrl = "https://api.servicefusion.com/v1/jobs";
//   const customerBaseUrl = "https://api.servicefusion.com/v1/customers";
//   const limit = 50;
//   let page = 1;
//   let allJobs = [];

//   if (!accessToken) {
//     return res.status(400).json({
//       status: "error",
//       message: "Missing accessToken in request body.",
//     });
//   }

//   try {
//     if (isTestMode) {
//       const testJobs = [
//         {
//           id: 1001,
//           number: "JOB-001",
//           customer_id: 11111111,
//           customer_name: "Edge Fitness Central",
//           contact_first_name: "George",
//           contact_last_name: "Maturan",
//           contact_email: "gmaturan60@gmail.com",
//           contact_phone: "(555) 123-1111",
//           contact_name: "George Maturan",
//           status: "4. Waiting For Parts",
//           sub_status: "In Transit",
//           daysPending: 13,
//           category: "emailOnly",
//           is_requires_follow_up: true,
//           tech_notes:
//             "Technician verified that parts were ordered and are currently in transit. No further action until delivery is confirmed.",
//           completion_notes:
//             "Awaiting part arrival. Installation will be scheduled upon receipt.",
//           note_to_customer:
//             "Disclaimer statement of all liability with services provided to or for any manufacturers, end user, or dealer regarding product defects...",
//           services: "Repair, Shipping",
//           products:
//             "Spirit Elliptical CE850 SN: 8500451904000795; Handle Wire\n\n*All parts are warrantied for 30-days...",
//           assigned_techs: "Lee Gugler",
//           start_date: "2025-05-01",
//           updated_at: "2025-06-10T12:00:00+00:00",
//           notes:
//             "PO# 7595563:\nTracking Number: 1Z8Y85470363254117.\n\nReceived\n• 1x - Handle Wire\n• 4x - Strength Cable",
//         },
//         {
//           id: 1002,
//           number: "JOB-002",
//           customer_id: 22222222,
//           customer_name: "Anytime Fitness West",
//           contact_first_name: "George",
//           contact_last_name: "Maturan",
//           contact_email: "gmaturan60@gmail.com",
//           contact_phone: "(555) 123-2222",
//           contact_name: "George Maturan",
//           status: "4. Waiting For Parts",
//           sub_status: "On Order",
//           daysPending: 17,
//           category: "emailAndCall",
//           is_requires_follow_up: false,
//           tech_notes:
//             "LABOR 1\n\nRemove & Replace necessary parts. Make required adjustments for correct operation.\n\nLife Fitness Treadmill\nSN: HHT109499\nIssue: Console displays error E49...\nParts Required:\n- 1x MDB PC board\n- 1x Emergency Stop",
//           completion_notes:
//             "Pending part delivery and installation scheduling.",
//           note_to_customer:
//             "Disclaimer statement of all liability with services provided...",
//           services: "Repair, Shipping",
//           products:
//             "Life Fitness Treadmill SN: HHT109499; Emergency Stop, MDB Board",
//           assigned_techs: "Lee Gugler",
//           start_date: "2025-05-01",
//           updated_at: "2025-06-10T12:00:00+00:00",
//           notes:
//             "PO# 7595564:\nTracking Number: 1Z8Y85470363254118.\n\nPending arrival of MDB Board and Emergency Stop",
//         },
//         {
//           id: 1003,
//           number: "JOB-003",
//           customer_id: 33333333,
//           customer_name: "Mansfield Gym & Spa",
//           contact_first_name: "George",
//           contact_last_name: "Maturan",
//           contact_email: "gmaturan60@gmail.com",
//           contact_phone: "(555) 123-3333",
//           contact_name: "George Maturan",
//           status: "4. Waiting For Parts",
//           sub_status: "Backorder",
//           daysPending: 74,
//           category: "backorder",
//           is_requires_follow_up: true,
//           tech_notes:
//             "LABOR 1 – Remove & Replace necessary parts. Hoist Multistation Model: H-2200. The leg press cable sent was incorrect. Ordered: 147 3/4” with 1 threaded end. Needed: 160 3/4” with 2 eyelets...",
//           completion_notes:
//             "Handles installed but incorrect cable prevents full function. Awaiting correct cable for full repair.",
//           note_to_customer:
//             "This repair has been delayed over 60 days. We recommend considering a unit replacement...",
//           services: "Repair, Shipping",
//           products:
//             "Hoist Multistation SN: H-2200; Strength Cable\n\n*All parts are warrantied for 30-days...",
//           assigned_techs: "Lee Gugler",
//           start_date: "2024-12-01",
//           updated_at: "2025-06-10T12:00:00+00:00",
//           notes:
//             "PO# 7595428:\nStrength Cable Part# MX10227 on backorder. ETA 5/23",
//         },
//       ];

//       return res.json({
//         status: "success",
//         pagesFetched: 1,
//         matched: testJobs.length,
//         data: testJobs,
//       });
//     }

//     console.log("🔁 Fetching jobs with status 'Waiting for Parts'...");

//     while (true) {
//       const encodedStatus = encodeURIComponent("4. Waiting For Parts");
//       const fields = encodeURIComponent(
//         [
//           "id",
//           "number",
//           "customer_id",
//           "customer_name",
//           "contact_first_name",
//           "contact_last_name",
//           "status",
//           "sub_status",
//           "start_date",
//           "updated_at",
//           "note_to_customer",
//           "tech_notes",
//           "completion_notes",
//           "is_requires_follow_up",
//         ].join(",")
//       );

//       const expand = encodeURIComponent("products,services,techs_assigned");

//       const url = `${baseUrl}?filters[status]=${encodedStatus}&page=${page}&per-page=${limit}&fields=${fields}&expand=${expand}`;

//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json",
//         },
//       });

//       const jobs = response.data.items || [];
//       if (jobs.length === 0) break;

//       allJobs.push(...jobs);
//       page++;
//       if (jobs.length < limit) break;
//     }

//     // 🔍 Fetch and merge customer contact info
//     const enrichJobWithCustomerContact = async (job) => {
//       try {
//         const customerUrl = `${customerBaseUrl}/${job.customer_id}?expand=contacts.phones,contacts.emails`;
//         const response = await axios.get(customerUrl, {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             Accept: "application/json",
//           },
//         });

//         const contacts = response.data.contacts || [];
//         const primary = contacts.find((c) => c.is_primary) || contacts[0];

//         const email = primary?.emails?.[0]?.email || null;
//         const phone = primary?.phones?.[0]?.phone || null;
//         const name = `${primary?.fname || ""} ${primary?.lname || ""}`.trim();

//         return {
//           ...job,
//           contact_email: email,
//           contact_phone: phone,
//           contact_name: name,
//         };
//       } catch {
//         return {
//           ...job,
//           contact_email: null,
//           contact_phone: null,
//           contact_name: null,
//         };
//       }
//     };

//     // 🧠 Categorize jobs
//     const today = new Date();
//     const categorizedJobs = {
//       backorder: [],
//       emailOnly: [],
//       emailAndCall: [],
//       endOfLife: [],
//     };

//     const enrichedJobs = await Promise.all(
//       allJobs.map(async (job) => {
//         const startDate = job.start_date || job.updated_at;
//         const diffDays = Math.floor(
//           Math.abs(today - new Date(startDate)) / (1000 * 60 * 60 * 24)
//         );

//         const enriched = await enrichJobWithCustomerContact(job);
//         enriched.daysPending = diffDays;

//         // ✅ Flatten assigned techs
//         enriched.assigned_techs =
//           (job.techs_assigned || [])
//             .map((t) => `${t.first_name || ""} ${t.last_name || ""}`.trim())
//             .filter((name) => name !== "")
//             .join(", ") || null;

//         // Optional: remove original tech fields
//         delete enriched.techs_assigned;
//         delete enriched.tech_first_name;
//         delete enriched.tech_last_name;

//         // ✅ Flatten product names
//         enriched.products =
//           (job.products || []).map((p) => p.name).join(", ") || null;

//         // ✅ Flatten service names
//         enriched.services =
//           (job.services || []).map((s) => s.name).join(", ") || null;

//         // ✅ Assign "backorder" category if sub_status includes "backorder"
//         const subStatus = job.sub_status?.toLowerCase() || "";
//         if (
//           subStatus.includes("backorder") ||
//           subStatus.includes("back ordered")
//         ) {
//           enriched.category = "backorder";
//           categorizedJobs.backorder.push(enriched);
//         } else if (diffDays < 14) {
//           enriched.category = "emailOnly";
//           categorizedJobs.emailOnly.push(enriched);
//         } else if (diffDays < 60) {
//           enriched.category = "emailAndCall";
//           categorizedJobs.emailAndCall.push(enriched);
//         } else {
//           enriched.category = "endOfLife";
//           categorizedJobs.endOfLife.push(enriched);
//         }

//         return enriched;
//       })
//     );

//     res.json({
//       status: "success",
//       pagesFetched: page,
//       matched: enrichedJobs.length,
//       data: [
//         ...categorizedJobs.backorder,
//         ...categorizedJobs.emailOnly,
//         ...categorizedJobs.emailAndCall,
//         ...categorizedJobs.endOfLife,
//       ],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching jobs:", error.message);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch or enrich jobs.",
//       details: error.message,
//     });
//   }
// };

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
          id: 1055451207,
          number: "195780",
          customer_id: 54708559,
          customer_name: "HLC Windscape Gardens",
          contact_first_name: "George",
          contact_last_name: "Maturan",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-1111",
          contact_name: "George Maturan",
          status: "4. Waiting For Parts",
          sub_status: null,
          daysPending: 189,
          category: "endOfLife",
          is_requires_follow_up: false,
          tech_notes:
            "LABOR 1 \n\nRemove & Replace necessary parts. Make required adjustments for correct operation.\n\nSpirit elliptical model CE850 serial 8500451904000795 needs the handle selector cable and parts behind bearing. Manufacturer said this is still under warranty till next month but you have to call and order right there with the numbers they give you. Please call and verify what’s the deal.\n1x Handle Wire\n\nHoist H200t serial 00399 needs one of its cables replaced. I posted a photo with the cable description from the manual the manufacturer sent me.\n4x Strength Cable",
          completion_notes:
            "Batteries replaced.\n\nHoist cable was wrong but we should replace all of them\n\nSpirit elliptical model CE850 serial 8500451904000795 Selector cable was wrong",
          note_to_customer:
            "Disclaimer statement of all liability with services provided to or for any manufacturers, end user, or dealer regarding product defects, operation or function. All liability to or against Premier Fitness Service as an independent provider of services or products sold are held harmless of any claim regarding product, services rendered or personal injury. All sales are final. Refunds deemed necessary shall be issued by company check and the customer hereby waives any rights to charge back purchases. Any parts or products returned or cancelled, will be subject to a 40% restocking fee and all related shipping expenses.",
          services: "Repair, Shipping",
          products:
            "Spirit Elliptical CE850 SN: 8500451904000795; Handle Wire\n\n*All parts are warrantied for 30-days or extended to the OEM offering, whichever is greater, and is provided to correct issues of premature and direct component failure., Hoist H200T SN: 00399; Strength Cable\n\n*All parts are warrantied for 30-days or extended to the OEM offering, whichever is greater, and is provided to correct issues of premature and direct component failure., BodyCraft VR400 Row Machine SN: N/A; Cardio Battery\n\n*All parts are warrantied for 30-days or extended to the OEM offering, whichever is greater, and is provided to correct issues of premature and direct component failure.",
          assigned_techs: "Yarbin Maldonaldo",
          start_date: "2024-12-05",
          updated_at: "2025-06-11T16:51:11+00:00",
          notes:
            "Bodycraft VR400 row machine needs batteries for its monitor PN AA x3\n\nSpirit elliptical model CE850 serial 8500451904000795 needs the handle selector cable and parts behind bearing...\n\nHandle Wire: 9-99-SP0483 (Sole)\n\nHoist H200t serial 00399 needs one of its cables replaced...\n\nStrength Cable: 83-13-39002396 (FRP)...\n\nStrength Cable: 36-30-HSP2326 (NGS)\nStrength Cable: 89-10-HSP2584 (NGS)\nStrength Cable: 80-85-HSP2554 (NGS)\nStrength Cable: 62-70-HSP2466 (NGS)\n\nSelection number was wrong\nHandle Wire: 18-99-SP0485 (Sole Fitness)\n\nPamela is not working in company anymore.\n\nJob status changed to Re-approval, added additional parts on the estimate\n\nJob split to invoice successful part installed currently on Job #225214",
        },
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
            "Disclaimer statement of all liability with services provided to or for any manufacturers, end user, or dealer regarding product defects...",
          services: "Repair, Shipping",
          products:
            "Spirit Elliptical CE850 SN: 8500451904000795; Handle Wire\n\n*All parts are warrantied for 30-days...",
          assigned_techs: "Lee Gugler",
          start_date: "2025-05-01",
          updated_at: "2025-06-10T12:00:00+00:00",
          notes:
            "PO# 7595563:\nTracking Number: 1Z8Y85470363254117.\n\nReceived\n• 1x - Handle Wire\n• 4x - Strength Cable",
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
            "LABOR 1\n\nRemove & Replace necessary parts. Make required adjustments for correct operation.\n\nLife Fitness Treadmill\nSN: HHT109499\nIssue: Console displays error E49...\nParts Required:\n- 1x MDB PC board\n- 1x Emergency Stop",
          completion_notes:
            "Pending part delivery and installation scheduling.",
          note_to_customer:
            "Disclaimer statement of all liability with services provided...",
          services: "Repair, Shipping",
          products:
            "Life Fitness Treadmill SN: HHT109499; Emergency Stop, MDB Board",
          assigned_techs: "Lee Gugler",
          start_date: "2025-05-01",
          updated_at: "2025-06-10T12:00:00+00:00",
          notes:
            "PO# 7595564:\nTracking Number: 1Z8Y85470363254118.\n\nPending arrival of MDB Board and Emergency Stop",
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
          category: "backorder",
          is_requires_follow_up: true,
          tech_notes:
            "LABOR 1 – Remove & Replace necessary parts. Hoist Multistation Model: H-2200. The leg press cable sent was incorrect. Ordered: 147 3/4” with 1 threaded end. Needed: 160 3/4” with 2 eyelets...",
          completion_notes:
            "Handles installed but incorrect cable prevents full function. Awaiting correct cable for full repair.",
          note_to_customer:
            "This repair has been delayed over 60 days. We recommend considering a unit replacement...",
          services: "Repair, Shipping",
          products:
            "Hoist Multistation SN: H-2200; Strength Cable\n\n*All parts are warrantied for 30-days...",
          assigned_techs: "Lee Gugler",
          start_date: "2024-12-01",
          updated_at: "2025-06-10T12:00:00+00:00",
          notes:
            "PO# 7595428:\nStrength Cable Part# MX10227 on backorder. ETA 5/23",
        },
        {
          id: 1004,
          number: "JOB-004",
          customer_id: 44444444,
          customer_name: "City Sports Training",
          contact_first_name: "George",
          contact_last_name: "Maturan",
          contact_email: "gmaturan60@gmail.com",
          contact_phone: "(555) 123-4444",
          contact_name: "George Maturan",
          status: "4. Waiting For Parts",
          sub_status: "Awaiting Approval",
          daysPending: 33,
          category: "emailAndCall",
          is_requires_follow_up: true,
          tech_notes:
            "LABOR 1\n\nReplace frayed cable on Matrix Leg Press.\nConfirmed SN: VS-S70. Safety issue reported.\n\n1x Strength Cable required.",
          completion_notes: null,
          note_to_customer:
            "We are currently awaiting part delivery and final approval. Thank you for your patience.",
          services: "Repair, Shipping",
          products:
            "Matrix Leg Press SN: VS-S70; Strength Cable\n\n*All parts are warrantied for 30-days...",
          assigned_techs: "Chance Schilhab",
          start_date: "2025-05-10",
          updated_at: "2025-06-11T10:45:00+00:00",
          notes:
            "PO# 7595600:\nMatrix Strength Cable Part# MX10227 pending shipment.\nEstimated delivery: 6/15/2025",
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
