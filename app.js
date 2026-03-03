// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const metricSelect = document.getElementById("unitsSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const year = [...new Set(chartData.map(r => r.year))];
const title = [...new Set(chartData.map(r => r.title))];

year.forEach(m => yearSelect.add(new Option(m, m)));
title.forEach(h => titleSelect.add(new Option(h, h)));

yearSelect.value = year[0]; 
titleSelect.value = title[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const title = titleSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, title, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, metric }) {
  if (type === "bar") return barByPlatform(year, metric);
  if (type === "line") return lineOverTime(title, ["unitsM", "revenueUSD"]);
  if (type === "scatter") return scatterScoreVsSales(title);
  if (type === "doughnut") return doughnutRevenueByRegion(year, title);
  if (type === "radar") return radarComparePublishers(year);
  return barByNeighbortitle(year, metric);
}

// Task A: BAR — Shows sales by platform/genre
function barByPlatform(year, metric) {
  console.log(year, metric)
  const rows = chartData.filter(r => r.year === Number(year));

  const labels = rows.map(r => r.title);
  console.log(labels)
  const values = rows.map(r => r[metric]);
  console.log (values)

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Gamesales comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Gamesales" } }
      }
    }
  };
}

// Task B: LINE — Shows sales over years
function lineOverTime(title, metrics) {
  const rows = chartData
    .filter(r => r.title === title)
    .sort((a, b) => a.year - b.year);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${title}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
}


// SCATTER — relationship between reviewScore and Sales
function scatterScoreVsSales(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));
  console.log(points)

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `reviewScore vs revenueUSD (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does reviewScore affect revenueUSD? (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "reviewScore" } },
        y: { title: { display: true, text: "revenueUSD" } }
      }
    }
  };
}

// DOUGHNUT — Shows revenue based by region
function doughnutRevenueByRegion(year, title) {
  const rows = chartData.filter(
    r => r.year === Number(year) && r.title === title
  );

  const labels = rows.map(r => r.region);
  const values = rows.map(r => r.revenueUSD);

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: `Revenue by region`,
        data: values
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Revenue share by region: ${title} (${year})` }
      }
    }
  };
}


// RADAR — compares publishers across multiple metrics in a specific year
function radarComparePublishers(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["unitsM", "revenueUSD", "priceUSD", "reviewScore"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.title,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}