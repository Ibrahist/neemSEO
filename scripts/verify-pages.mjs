// Script to verify that all pages load cleanly and there are no duplicate headers
import http from "node:http";

const BASE_URL = "http://localhost:3000";

async function fetchUrl(urlPath, options = {}) {
  const fullUrl = urlPath.startsWith("http") ? urlPath : `${BASE_URL}${urlPath}`;
  const response = await fetch(fullUrl, {
    redirect: "follow",
    ...options,
  });
  const text = await response.text();
  return {
    status: response.status,
    url: response.url,
    body: text,
  };
}

async function run() {
  console.log("=== neemSEO Full Page & Link Verification ===");

  // 1. Fetch homepage
  console.log("\n1. Fetching homepage http://localhost:3000/...");
  const home = await fetchUrl("/");
  if (home.status !== 200) {
    throw new Error(`Homepage returned status ${home.status}`);
  }
  console.log("   [PASS] Homepage returned HTTP 200");

  // 2. Extract all href links from homepage
  console.log("\n2. Extracting internal links from homepage...");
  const hrefRegex = /href="(\/[^"#]*)/g;
  const internalLinks = new Set();
  let match;
  while ((match = hrefRegex.exec(home.body)) !== null) {
    const link = match[1];
    if (link) internalLinks.add(link);
  }

  console.log(`   Found ${internalLinks.size} unique internal routes:`, Array.from(internalLinks));

  // 3. Test every internal route
  console.log("\n3. Testing all homepage internal links (expecting 200 OK after follow):");
  for (const link of internalLinks) {
    try {
      const res = await fetchUrl(link);
      if (res.status === 200) {
        console.log(`   [PASS] ${link} -> ${res.url} (HTTP 200)`);
      } else {
        console.error(`   [FAIL] ${link} -> HTTP ${res.status}`);
        process.exitCode = 1;
      }
    } catch (err) {
      console.error(`   [FAIL] ${link} -> Error: ${err.message}`);
      process.exitCode = 1;
    }
  }

  // 4. Test platform page /projects and check headers
  console.log("\n4. Checking http://localhost:3000/projects for duplicate headers...");
  const projectsRes = await fetchUrl("/projects");
  if (projectsRes.status !== 200) {
    throw new Error(`/projects returned status ${projectsRes.status}`);
  }
  console.log(`   Final URL after redirect: ${projectsRes.url}`);

  // Count <header tags
  const headerTagCount = (projectsRes.body.match(/<header\b/gi) || []).length;
  console.log(`   Number of <header> elements found: ${headerTagCount}`);

  if (headerTagCount === 1) {
    console.log("   [PASS] Strictly ONE <header> element found! Second header is removed.");
  } else {
    console.error(`   [FAIL] Expected 1 <header>, but found ${headerTagCount}`);
    process.exitCode = 1;
  }

  // Verify ProjectSwitcher is rendered inside sidebar
  if (
    projectsRes.body.includes("Active Project") &&
    projectsRes.body.includes("select active project")
  ) {
    console.log("   [PASS] ProjectSwitcher is properly embedded inside Sidebar.");
  } else {
    // case-insensitive check
    const hasActiveProj = /active project/i.test(projectsRes.body);
    const hasSelect = /aria-label="Select active project"/i.test(projectsRes.body);
    if (hasActiveProj && hasSelect) {
      console.log("   [PASS] ProjectSwitcher found in Sidebar.");
    } else {
      console.warn(
        "   [WARN] ProjectSwitcher elements check: active project=" +
          hasActiveProj +
          ", select=" +
          hasSelect
      );
    }
  }

  // 5. Test all core workflow direct links
  console.log("\n5. Testing all core workflow URLs directly:");
  const coreWorkflows = [
    "/docs",
    "/keywords",
    "/rank-tracking",
    "/competitors",
    "/backlinks",
    "/audits",
    "/ai-visibility",
    "/agent",
    "/settings",
    "/projects/new",
    "/api/healthz",
    "/api/mcp",
  ];

  for (const wf of coreWorkflows) {
    const res = await fetchUrl(wf);
    if (res.status === 200) {
      console.log(`   [PASS] ${wf} -> HTTP 200 (${res.url})`);
    } else {
      console.error(`   [FAIL] ${wf} -> HTTP ${res.status}`);
      process.exitCode = 1;
    }
  }

  if (process.exitCode === 1) {
    console.error("\n❌ Verification failed with errors.");
  } else {
    console.log("\n✅ All verifications passed successfully! 0 broken links, 0 duplicate headers.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
