const axios = require("axios");

const getWaitingForPartsJobs = async (req, res) => {
  const accessToken = process.env.SF_TOKEN;
  const baseUrl = "https://api.servicefusion.com/v1/jobs";
  const limit = 50;
  let page = 1;
  let allJobs = [];

  try {
    console.log("🔁 Fetching jobs with status 'Waiting for Parts'...");

    while (true) {
      const encodedStatus = encodeURIComponent("4. Waiting For Parts");
      const url = `${baseUrl}?filters[status]=${encodedStatus}&page=${page}&per-page=${limit}`;
      console.log(`📡 Requesting page ${page}: ${url}`);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      const jobs = response.data.items || [];
      console.log(`📦 Page ${page}: Retrieved ${jobs.length} jobs`);

      if (jobs.length === 0) {
        console.log("⛔ No more jobs found. Stopping.");
        break;
      }

      allJobs.push(...jobs);

      page++;
      if (jobs.length < limit) {
        console.log("✅ Reached final page.");
        break;
      }
    }

    console.log(`✅ Total 'Waiting for Parts' jobs: ${allJobs.length}`);

    res.json({
      status: "success",
      pagesFetched: page,
      matched: allJobs.length,
      data: allJobs,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch jobs from Service Fusion.",
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

module.exports = {
  getWaitingForPartsJobs,
  getJobsByStatusName,
};
