import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { getLast7Days } from "@/utils/features";

ChartJS.register(
  Tooltip,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  Legend
);

const labels = getLast7Days();

const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { display: false } },
  },
};

const LineChart = ({ value = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        data: value,
        label: "Messages",
        fill: true,
        backgroundColor: "rgba(147, 51, 234, 0.2)", // purple-600 light
        borderColor: "rgba(147, 51, 234, 1)", // purple-600
        tension: 0.3,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-4 rounded-2xl shadow-lg bg-neutral-100 dark:bg-neutral-950"
    >
      <Line data={data} options={lineChartOptions} />
    </motion.div>
  );
};

const doughnutChartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  cutout: 120,
};

const DoughnutChart = ({ value = [], labels = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        data: value,
        backgroundColor: [
          "rgba(147, 51, 234, 0.3)", // purple-600 light
          "rgba(249, 115, 22, 0.3)", // orange-600 light
        ],
        hoverBackgroundColor: [
          "rgba(147, 51, 234, 1)", // purple-600
          "rgba(249, 115, 22, 1)", // orange-600
        ],
        borderColor: ["rgba(147, 51, 234, 1)", "rgba(249, 115, 22, 1)"],
        offset: 30,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center p-6 rounded-2xl shadow-lg bg-neutral-100 dark:bg-neutral-950"
    >
      <Doughnut data={data} options={doughnutChartOptions} />
    </motion.div>
  );
};

export { DoughnutChart, LineChart };
